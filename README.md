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
