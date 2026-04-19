# Estate Flow

A full-stack system that automates the post-agreement lifecycle of a real-estate transaction — tracking stages (earnest money, title deed, completion) and distributing the agency commission to agents according to well-defined rules.

- **Backend:** NestJS 10 + Mongoose + MongoDB Atlas
- **Frontend:** Nuxt 3 + Pinia + Tailwind CSS (white / black / pink theme, animated UI)

See [DESIGN.md](./DESIGN.md) for architecture, data model, and state-management rationale.

---

## Repository layout

```
deneme-agecny/
├── backend/     # NestJS API
├── frontend/    # Nuxt 3 app
├── DESIGN.md
└── README.md
```

---

## Live URLs

- **Frontend (Vercel):** `[Your Vercel URL Here]`
- **Backend (Render):** `[Your Render URL Here]`

---

## Prerequisites

- Node.js 18+ (LTS)
- npm 9+
- A MongoDB connection string. For production use **MongoDB Atlas**; for local dev any running `mongod` works.

---

## Backend

```bash
cd backend
cp .env.example .env        # set MONGO_URI, PORT
npm install
npm run start:dev           # http://localhost:3001/api
```

Environment variables (`backend/.env`):

| Key         | Default                                       | Notes                         |
| ----------- | --------------------------------------------- | ----------------------------- |
| `PORT`      | `3001`                                        | HTTP port                     |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/estate`            | Use your Atlas SRV URI in prod |

---

## Frontend

```bash
cd frontend
npm install
npm run dev                 # http://localhost:3000
```

Environment variables (`frontend/.env`):

| Key                    | Default                      | Notes                                  |
| ---------------------- | ---------------------------- | -------------------------------------- |
| `NUXT_PUBLIC_API_BASE` | `http://localhost:3001/api`  | Backend API URL, used by Pinia / $fetch|

---

## API Surface

**Reports**
- `GET /api/reports/summary` : Returns highest-level dashboard metrics, pipeline stage summaries, and total earnings.

**Transactions**
- `GET /api/transactions` : List all transactions (can filter by `agentId`)
- `GET /api/transactions/:id` : Get single transaction with deep breakdown and history populate.
- `POST /api/transactions` : Create new transaction in `agreement` stage.
- `POST /api/transactions/:id/advance` : Advance to next stage (calculates breakdown automatically if completed).
- `DELETE /api/transactions/:id` : Delete transaction.

**Agents**
- `GET /api/agents` : List all agents
- `GET /api/agents/:id` : Get single agent
- `POST /api/agents` : Create agent (name, email)
- `PATCH /api/agents/:id` : Update agent details
- `DELETE /api/agents/:id` : Delete agent (will trigger `Mongoose ValidationErrors` if referenced, though the system uses a soft approach with missing objects vs raw deletes depending on implementation).

---

## Latest Updates (Polish Phase)

- **UI / UX Overhaul**: 
  - Advanced **Glassmorphism** and neon Aurora visual effects integrated natively with TailwindCSS on the Dashboard layout.
  - Kanban board, Top earning agent ranks, and highly detailed data-tables with stacked agent avatars.
- **Global Currency Sync**: Replaced hardcoded legacy TRY (₺) currencies to USD ($) everywhere including frontend formats and backend dummy seeds.
- **Schema Validation Stability**: Resolved nested `Mongoose ValidationErrors` inside `HistoryEntry` and Breakdowns by properly hydrating nested schemas via `@Schema` classes rather than raw objects.
- **Developer Experience**: Solved unclosed block and Tailwind CSS linting complaints natively for VSCode.

