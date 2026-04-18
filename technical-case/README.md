# Technical Case

This project is organized as two separate apps under one root folder:

```text
technical-case/
  backend/
  frontend/
```

## Backend

NestJS + MongoDB API for transaction management.

Run:

```bash
cd backend
npm install
npm run start:dev
```

Backend URLs:

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/docs`

## Frontend

Nuxt 3/4-based dashboard for managing transactions.

Run:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

- App: `http://localhost:3001`

## Main Features

- Create transaction
- List transactions
- Update transaction
- Delete transaction
- View commission breakdown
- View agent earnings
- Search and filter transactions by stage
