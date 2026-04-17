## 1. Problem framing (from the case)

The case identifies three pain points that shape the system:

1. **Lifecycle tracking.** After an agreement is reached, the transaction today walks through manual milestones (earnest money, title deed, completion) spread across spreadsheets and chat. The system must make that lifecycle first-class.
2. **Commission distribution.** Once the transaction is completed, the total service fee is split between the agency and the agents involved. Rules are simple to state but error-prone by hand.
3. **Traceability.** Every status change and every amount must be attributable to a decision, an agent, and a point in time.

Translated to engineering primitives, this becomes two things: **a state machine over transactions** and **a pure commission calculator** whose output is stored as an auditable breakdown.

## 2. High-level architecture

```
┌──────────────────────────┐    HTTPS / REST /api    ┌──────────────────────────┐
│   Nuxt 3  (frontend)     │ ───────────────────────▶│   NestJS  (backend)      │
│   Pinia stores           │◀─────────────────────── │   Mongoose + MongoDB     │
│   Tailwind (White/Black/ │                         │   Atlas                  │
│   Pink) + animations     │                         │                          │
└──────────────────────────┘                         └──────────────────────────┘
```

- **Monorepo** with `backend/` and `frontend/` as siblings — deployed independently (Node host for the API, JAMstack host for the UI).
- **Stateless REST** over HTTP, JSON throughout, CORS enabled, every route prefixed with `/api`.
- **Pinia** is the client-side source of truth; the backend is authoritative. The UI never mutates state without routing through an action.
- **TypeScript end-to-end** — the same shapes (agents, transactions, breakdowns) are expressed as DTOs on the backend and `types/` on the frontend.

## 3. Data-model outline

Two top-level collections and one embedded subdocument. Detailed shapes are elaborated on Day 2 (Agent) and Day 3 (Transaction, Breakdown).

- **`Agent`** — identity + contact info. A lightweight collection referenced by transactions.
- **`Transaction`** — the domain's core aggregate. Owns its property snapshot, service fee, agent refs, current stage, and history of transitions.
- **`Breakdown`** (embedded in `Transaction`) — the persisted financial report for a transaction: how much the agency earned, what each agent earned, and why.

## 4. Locking the stack on Day 1

| Concern                 | Choice                                                                 |
| ----------------------- | ---------------------------------------------------------------------- |
| Runtime                 | Node.js 18+ (LTS)                                                      |
| Language                | TypeScript                                                             |
| Backend framework       | NestJS 10 (mandatory)                                                  |
| Persistence             | MongoDB Atlas (mandatory) via Mongoose 8                               |
| Backend testing         | Jest 29                                                                |
| Frontend framework      | Nuxt 3 (mandatory)                                                     |
| Client state            | Pinia (mandatory)                                                      |
| Styling                 | Tailwind CSS (recommended) — theme: **white / black / pink**           |
| Transport               | REST over HTTP                                                         |

## 5. `Agent` data model

```ts
Agent {
  _id:        ObjectId
  name:       string            // required
  email:      string            // required, unique, lowercased, trimmed
  phone?:     string            // optional
  createdAt:  Date              // mongoose timestamp
  updatedAt:  Date              // mongoose timestamp
}
```

The unique index on `email` is declared exactly once (on the schema `@Prop`) to avoid the Mongoose duplicate-index warning at boot. Duplicate emails on `POST /api/agents` surface as **HTTP 409 Conflict**, not a raw Mongo error.

## 6. Commission policy (directly from the case)

- **50%** of `serviceFeeAmount` → **agency**.
- **50%** → **agent pool**.
  - **Scenario 1** — listing agent and selling agent are the **same** person: that single agent receives **100% of the pool** (i.e. 50% of the total). Role stored as `'listing+selling'`.
  - **Scenario 2** — listing agent and selling agent are **different** people: each receives **50% of the pool** (i.e. 25% of the total each). Roles stored as `'listing'` and `'selling'`.

## 7. Why the commission service is **pure**

`CommissionService.compute(serviceFeeAmount, listingAgent, sellingAgent): Breakdown` has **no Mongoose, no Nest HTTP, no IO**. It's a `@Injectable()` only for dependency-injection convenience — inside it's a pure function.

Consequences:

- **Unit tests are trivial.** Plain input → plain output. No mocks, no DB, no Nest testing harness beyond what Jest gives you.
- **The rule lives in one place.** Both `create` and `advance` in the transactions service call into the same function. No duplicated arithmetic.
- **Swappable policy.** If a future tiered-split rule is introduced, only this module changes; the rest of the codebase is unaware.

## 8. Rounding policy

Money is stored as a `number` with 2-decimal precision. To avoid floating-point drift:

1. Every share is computed in cents: `Math.round(x * 100) / 100`.
2. After rounding, the three shares (agency + up to two agent shares) might be off by ±1 cent relative to the input fee. The **residual cent is added to the agency share** so that `agencyAmount + Σ agentShares.amount === serviceFeeAmount` exactly.

The residual going to the agency is a deliberate, conservative default (non-advantageous to staff, deterministic). Flipping it requires a single change in one pure function.

## 9. Agents API surface

```
GET    /api/agents              list
POST   /api/agents              create     { name, email, phone? }
GET    /api/agents/:id          detail
PATCH  /api/agents/:id          update
DELETE /api/agents/:id          remove
```

All payloads are validated with `class-validator` DTOs under a global `ValidationPipe({ whitelist: true, transform: true })`.

## 10. Global Error Handling

NestJS is configured with a global `HttpExceptionFilter` that intercepts all exceptions. It maps the error to a consistent JSON envelope to prevent inconsistent API behaviors for the frontend:
```json
{
  "statusCode": 409,
  "message": "Email already exists",
  "error": "Conflict",
  "timestamp": "2026-04-17T12:00:00.000Z",
  "path": "/api/agents"
}
```

## 11. Frontend Theme & UI Strategy

The Nuxt 3 setup leverages Tailwind CSS for utility-first styling with a specific aesthetic strategy:
- **Brand Tokens**: We've hooked custom colors (`brand-pink`, `brand-ink`, `brand-graphite`, `brand-mist`) directly into Tailwind's theme object to enforce consistency.
- **Micro-interactions**: Defined base classes (`.btn-primary`, `.glass-card`, `.stage-dot`) in `main.css` using `@apply` with predefined animations `shimmer`, `fade-in-up`, and `pulse-glow` for immediate developer use.
- **Transitions**: Native Vue `<Transition>` hooks applied to `page` and `layout` configured in `nuxt.config.ts` to make stage changes fluid without heavy JS overhead.