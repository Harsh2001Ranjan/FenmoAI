# FenmoAI — Expense Tracker

A production-quality personal expense tracker built with the **MERN stack** (MongoDB, Express, React, Node.js) and Vite. Implements SOLID principles, design patterns, strict validation, immutable records, and automated tests.

---

## Project Structure

```
FenmoAI/
├── client/                      # React frontend (Vite)
│   └── src/
│       ├── components/
│       │   ├── ExpenseForm.jsx      # Add / Edit expense form
│       │   ├── ExpenseList.jsx      # Table with Edit & Delete buttons
│       │   ├── ExpenseFilters.jsx   # Category filter & sort toggle
│       │   ├── ExpenseSummary.jsx   # Count & total display
│       │   └── CategoryChart.jsx    # Pie chart (CSS conic-gradient)
│       ├── services/
│       │   └── api.js               # Centralised fetch calls
│       ├── App.jsx
│       └── App.css                  # Green-themed responsive styles
├── server/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   └── expenseController.js
│   ├── factories/
│   │   └── ExpenseFactory.js        # Data transformation only
│   ├── middleware/
│   │   ├── rateLimiter.js           # Global + write rate limits
│   │   └── validate.js              # Zod validation middleware
│   ├── models/
│   │   └── Expense.js               # Mongoose schema (Decimal128, soft-delete, revisions)
│   ├── routes/
│   │   └── expenseRoutes.js
│   ├── services/
│   │   └── ExpenseService.js        # Business logic
│   ├── strategies/
│   │   ├── sortStrategies.js
│   │   └── filterStrategies.js
│   ├── validation/
│   │   └── expenseSchema.js         # Zod schema
│   ├── __tests__/
│   │   ├── expenseSchema.test.js    # 12 validation tests
│   │   └── expenseFactory.test.js   # 7 factory tests
│   └── index.js
├── render.yaml
└── package.json
```

---

## Features

| Feature | Details |
|---------|---------|
| **CRUD** | Create, read, edit, and delete expenses |
| **Zod Validation** | Server-side schema validation (positive amounts, valid categories, non-future dates, max 200 char descriptions) |
| **Client-Side Validation** | Mirrors Zod rules with inline field errors |
| **Immutable Records** | Edits create new revisions linked via `originalId`; deletes soft-mark `isActive: false` |
| **Idempotency** | Client-generated keys prevent duplicate entries on retries |
| **Rate Limiting** | 100 req/15min global, 20 req/15min for writes |
| **Category Pie Chart** | Pure CSS donut chart — no charting library |
| **Responsive Design** | 4 breakpoints: desktop → tablet → mobile (card layout) → small mobile |
| **Green Theme** | CSS custom properties for easy customisation |
| **Automated Tests** | 20 Jest tests covering validation and factory logic |

---

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB Atlas cluster (or local MongoDB)

### Installation

```bash
npm run install:all
```

### Environment Variables

Create `server/.env`:

```
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<dbname>
```

### Development

```bash
npm run dev
```

Runs both server (`:5000`) and client (`:5173`) concurrently.

### Run Tests

```bash
cd server && npm test
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | System health status |
| POST | `/api/expenses` | Create a new expense |
| GET | `/api/expenses` | List active expenses (`?category=food&sort=date_desc`) |
| PUT | `/api/expenses/:id` | Edit expense (creates a new revision) |
| DELETE | `/api/expenses/:id` | Delete expense (soft-delete) |

### POST / PUT — Request Body

```json
{
  "amount": 250.00,
  "category": "food",
  "description": "Lunch at office",
  "date": "2026-02-18",
  "idempotencyKey": "unique-client-generated-key"
}
```

### Validation Errors (400)

```json
{
  "error": "Validation failed",
  "details": [
    { "field": "amount", "message": "Amount must be greater than zero" },
    { "field": "date", "message": "Future dates are not allowed" }
  ]
}
```

### Categories

`food` · `transport` · `utilities` · `entertainment` · `health` · `shopping` · `other`

---

## Database Choice

**MongoDB (Atlas)** was chosen because:
- Schema-flexible — expense categories and fields can evolve without migrations
- Hosted Atlas removes infrastructure overhead for a personal finance tool
- Mongoose's `Decimal128` type provides accurate money representation without floating-point errors

---

## Design Patterns

### Strategy Pattern
`sortStrategies.js` and `filterStrategies.js` encapsulate sort and filter behaviours as interchangeable classes. Adding a new sort order (e.g., amount ascending) requires only a new class — no changes to `ExpenseService`.

### Factory Pattern
`ExpenseFactory.create()` centralises all data transformation (Decimal128 conversion, category normalisation). Validation is handled upstream by Zod middleware — the factory never touches raw user input.

### SOLID Principles
- **S** — Each class/module has one job (Controller = HTTP, Service = logic, Factory = creation, Strategy = query building, Middleware = validation)
- **O** — New strategies extend behaviour without modifying existing code
- **L** — All sort/filter strategies are interchangeable via a common `apply()` interface
- **I** — Strategies expose only what they need (`apply(query)` or `apply(filters, value)`)
- **D** — Service depends on strategy abstractions, not concrete implementations

---

## Validation (Zod)

All POST and PUT requests pass through Zod middleware before reaching the controller:

| Field | Rules |
|-------|-------|
| `amount` | Must be a number, positive (> 0), max 2 decimal places |
| `category` | Must be one of the 7 allowed values |
| `description` | Non-empty, trimmed, 1–200 characters |
| `date` | Valid date string, must not be in the future |
| `idempotencyKey` | Optional string |

Edge cases explicitly handled: zero amounts, negative values, extra decimal places, future dates, empty strings, SQL-injection-length strings.

---

## Immutable Records (Revision System)

Expense records are never modified or destroyed:

- **Edit** → The original record is marked `isActive: false`. A new document is created with `revision: old.revision + 1` and `originalId: old._id`.
- **Delete** → The record is marked `isActive: false`. It remains in the database for audit purposes.
- **Read** → Only `isActive: true` records are returned.

This provides a complete audit trail of all changes.

---

## Idempotency

The client generates a UUID `idempotencyKey` when the form mounts. On submit, the key is sent with the request. The server uses `findOneAndUpdate` with `upsert: true` on this key — so retrying the same request (network error, page reload, double-click) always returns the same expense without creating duplicates. The client generates a fresh key after each successful submission.

---

## Rate Limiting

| Scope | Limit | Window |
|-------|-------|--------|
| Global (all routes) | 100 requests | 15 minutes |
| Write operations (POST, PUT, DELETE) | 20 requests | 15 minutes |

Exceeding limits returns a JSON `{ "error": "Too many requests..." }` with status `429`.

---

## Testing

**20 automated tests** across 2 suites:

### `expenseSchema.test.js` (12 tests)
- Valid data acceptance
- Zero, negative, and string amounts rejected
- Decimal precision enforcement (> 2 places rejected)
- Invalid category rejection
- Empty and overlong description rejection
- Future date rejection
- Invalid date string rejection
- Whitespace trimming
- Optional idempotency key handling

### `expenseFactory.test.js` (7 tests)
- Decimal128 conversion
- Category normalisation (lowercase + trim)
- Description trimming
- Date string → Date object
- Idempotency key pass-through
- Amount rounding to 2 decimal places

---

## Deployment (Render)

1. Connect the repo to [Render](https://render.com) → New → Blueprint
2. Render auto-detects `render.yaml`
3. Set `MONGO_URI` in the Render environment variables dashboard
4. **Important**: In MongoDB Atlas → Network Access → Add IP Address → **Allow Access From Anywhere** (`0.0.0.0/0`) since Render uses dynamic IPs

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 6 |
| Backend | Node.js, Express 4 |
| Database | MongoDB Atlas (Mongoose 9) |
| Validation | Zod 4 |
| Testing | Jest 30 |
| Rate Limiting | express-rate-limit |
| Deployment | Render |

---

*Developed by Harsh Ranjan @2026*
