# TaskFlow

Plataforma de gerenciamento de projetos inspirada em Linear, Jira e Trello.

## Estrutura

```
frontend/   # React + Vite + Tailwind
backend/    # Express + Prisma + PostgreSQL + Socket.IO
packages/   # shared
```

## Getting started

```bash
npm run db:up
npm install
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
npm run db:migrate
npm run dev:backend    # http://localhost:3333
npm run dev:frontend   # http://localhost:5173
```

## Etapas entregues

1. Fundação + Auth (JWT, i18n PT/EN, tema)
2. Projetos CRUD
3. Boards Kanban + DnD
4. Tarefas ricas (prioridade, labels, checklist, assignee, datas, tempo)
5. Comentários Markdown + anexos
6. Equipes, papéis e convites
7. Dashboard + ActivityLogs
8. Calendário (mês/semana/agenda)
9. Notificações em tempo real (Socket.IO)
10. Perfil, Command Palette (Ctrl/Cmd+K), atalhos
