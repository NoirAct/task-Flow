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

## Demo e deploy

A demo pública funciona em modo somente leitura. Com `DEMO_MODE=true`, cadastro,
recuperação de senha e mutações autenticadas são bloqueados. Anexos ficam
indisponíveis porque não é seguro persistir arquivos no filesystem efêmero.

Credenciais fictícias:

```text
E-mail: demo@taskflow.dev
Senha: DemoTaskFlow2026!
```

### Banco, migrations e seed

```bash
npm run db:generate
npm run db:deploy
npm run db:seed
```

As migrations existentes formam o histórico completo. O seed é idempotente e
cria a conta, o projeto, o board, colunas e tarefas demonstrativas.

### Backend no Render

O `render.yaml` cria um serviço Node persistente, necessário para Socket.IO. O
health check é `/health`. No plano gratuito, o start executa migrations e o seed
idempotente antes de iniciar a API; `preDeployCommand` é reservado aos serviços
pagos. Cadastre `DATABASE_URL` e `CLIENT_URL`; gere segredos JWT
fortes. Para HTTP por rewrite da Vercel, use `COOKIE_PATH=/api/auth`.

### Frontend na Vercel

Use `frontend` como Root Directory, `npm run build` como Build Command e `dist`
como Output Directory. Antes do deploy, substitua `REPLACE_WITH_TASKFLOW_BACKEND`
em `frontend/vercel.json` pelo hostname real do Render.

Variáveis do frontend em produção:

```text
VITE_API_URL=/api
VITE_SOCKET_URL=https://HOST-REAL-DO-BACKEND.onrender.com
VITE_DEMO_MODE=true
```

O HTTP passa pelo rewrite same-origin. Socket.IO conecta diretamente ao backend,
pois precisa manter WebSocket/polling em um processo persistente.

### Variáveis do backend

`DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`,
`JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`, `PORT`, `CLIENT_URL`,
`NODE_ENV`, `COOKIE_PATH` e `DEMO_MODE`.

### Limitações da demo

- Projetos, boards, tarefas, equipes e perfil podem ser consultados, mas não alterados.
- Cadastro e recuperação de senha ficam desabilitados.
- Upload e remoção de anexos ficam desabilitados.
- A primeira conexão pode demorar quando o serviço estiver em cold start.
