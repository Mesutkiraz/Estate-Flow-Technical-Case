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