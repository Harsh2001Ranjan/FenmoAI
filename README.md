# FenmoAI — Expense Tracker

A full-stack personal expense tracker built with the MERN stack (MongoDB, Express, React, Node.js) and Vite.

## Project Structure

```
FenmoAI/
├── client/                  # React frontend (Vite)
│   └── src/
│       ├── components/      # ExpenseForm, ExpenseList, ExpenseFilters, ExpenseSummary
│       ├── services/        # api.js — centralised fetch calls
│       └── App.jsx
├── server/
│   ├── config/              # db.js — MongoDB connection
│   ├── controllers/         # expenseController.js
│   ├── factories/           # ExpenseFactory.js
│   ├── models/              # Expense.js (Mongoose schema)
│   ├── routes/              # expenseRoutes.js
│   ├── services/            # ExpenseService.js
│   ├── strategies/          # sortStrategies.js, filterStrategies.js
│   └── index.js
├── render.yaml
└── package.json
```

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB Atlas cluster (or local MongoDB)

### Installation

```bash
npm run install:all
```

### Development

```bash
npm run dev
```

Runs both server (`:5000`) and client (`:5173`) concurrently.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | System health status |
| POST | `/api/expenses` | Create a new expense |
| GET | `/api/expenses` | List expenses (supports `?category=food&sort=date_desc`) |

### POST /api/expenses — Request Body

```json
{
  "amount": 250.00,
  "category": "food",
  "description": "Lunch at office",
  "date": "2026-02-18",
  "idempotencyKey": "unique-client-generated-key"
}
```

## Database Choice

**MongoDB (Atlas)** was chosen because:
- Schema-flexible — expense categories and fields can evolve without migrations
- Hosted Atlas removes infrastructure overhead for a personal finance tool
- Mongoose's `Decimal128` type provides accurate money representation without floating-point errors

## Design Patterns

### Strategy Pattern
`sortStrategies.js` and `filterStrategies.js` encapsulate sort and filter behaviours as interchangeable classes. Adding a new sort order (e.g., amount ascending) requires only a new class — no changes to `ExpenseService`.

### Factory Pattern
`ExpenseFactory.create()` centralises all validation, type conversion, and normalisation for expense creation. Controllers and services never deal with raw input directly.

### SOLID Principles
- **S** — Each class/module has one job (Controller = HTTP, Service = logic, Factory = creation, Strategy = query building)
- **O** — New strategies extend behaviour without modifying existing code
- **L** — All sort/filter strategies are interchangeable via a common `apply()` interface
- **I** — Strategies expose only what they need (`apply(query)` or `apply(filters, value)`)
- **D** — Service depends on strategy abstractions, not concrete implementations

## Idempotency

The client generates a UUID `idempotencyKey` when the form mounts. On submit, the key is sent with the request. The server uses `findOneAndUpdate` with `upsert: true` on this key — so retrying the same request (network error, page reload, double-click) always returns the same expense without creating duplicates. The client generates a fresh key after each successful submission.

## Deployment (Render)

Connect the repo to [Render](https://render.com) → New → Blueprint. Render auto-detects `render.yaml`. Set `MONGO_URI` in the Render environment variables dashboard.
