# TaskFlow

Plataforma de gerenciamento de projetos inspirada em Linear, Jira e Trello.

## Estrutura

```
frontend/   # React + Vite + Tailwind
backend/    # Express + Prisma + PostgreSQL
packages/   # Código compartilhado
```

## Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, TanStack Query, React Hook Form, Zod, i18next
- **Backend:** Node.js, Express, Prisma, PostgreSQL, JWT
- **Infra:** Docker Compose

## Getting started

```bash
# Start PostgreSQL (host port 5433 → container 5432)
npm run db:up

# Install dependencies
npm install

# Copy env files (if needed)
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Run migrations
npm run db:migrate

# Start backend + frontend (two terminals)
npm run dev:backend    # http://localhost:3333
npm run dev:frontend   # http://localhost:5173
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run db:up` | Start Postgres via Docker |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run dev:backend` | Start API in watch mode |
| `npm run dev:frontend` | Start Vite dev server |
# task-Flow
