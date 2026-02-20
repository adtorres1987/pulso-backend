# Pulso API Reference

Base URL: `http://localhost:3000/api/v1`

## Authentication

All endpoints (except `/auth/*`) require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <token>
```

The token is obtained from `POST /auth/login`.

---

## Response envelope

Every response follows this shape:

```ts
// Success
{ success: true, data: T, message?: string }

// Error
{ success: false, error: string }

// Validation error (422)
{ success: false, errors: Record<string, string[]> }
```

---

## Enums

| Name | Values |
|------|--------|
| `Language` | `"es"` \| `"en"` |
| `Mood` | `"calm"` \| `"stressed"` \| `"confident"` \| `"neutral"` |
| `TransactionType` | `"expense"` \| `"income"` |
| `EmotionTag` | `"need"` \| `"impulse"` \| `"emotional"` |
| `HabitFrequency` | `"daily"` \| `"weekly"` |
| `InvestmentStrategy` | `"conservative"` \| `"balanced"` \| `"long_term"` |

---

## Health Check

### `GET /health`
No auth required.

**Response 200**
```json
{ "status": "ok", "timestamp": "2026-02-19T00:00:00.000Z" }
```

---

## Auth

### `POST /auth/register`
No auth required.

**Request body**
```ts
{
  email: string          // valid email
  password: string       // min 8 chars
  language?: "es" | "en" // default: "es"
  timezone: string       // e.g. "America/Mexico_City"
  firstName: string      // min 2 chars
  lastName: string       // min 2 chars
}
```

**Response 201**
```ts
{
  data: {
    id: string
    email: string
    language: string
    timezone: string
    person: { firstName: string; lastName: string }
  }
}
```

---

### `POST /auth/login`
No auth required.

**Request body**
```ts
{
  email: string
  password: string
}
```

**Response 200**
```ts
{
  data: {
    token: string   // JWT — store this for all subsequent requests
    user: {
      id: string
      email: string
      language: string
      timezone: string
    }
  }
}
```

---

## Me (User Profile)

### `GET /me`
Returns the authenticated user's profile.

**Response 200**
```ts
{
  data: {
    id: string
    email: string
    language: string
    timezone: string
    onboardingCompleted: boolean
    createdAt: string           // ISO date
    person: {
      firstName: string
      lastName: string
      phone: string | null
      birthDate: string | null  // ISO date
      country: string | null
      avatarUrl: string | null
    } | null
  }
}
```

---

### `PATCH /me`
Update profile fields (all optional).

**Request body**
```ts
{
  firstName?: string
  lastName?: string
  phone?: string
  birthDate?: string    // "YYYY-MM-DD"
  country?: string
  avatarUrl?: string    // valid URL
}
```

**Response 200** — same shape as `GET /me`

---

### `PATCH /me/password`

**Request body**
```ts
{
  currentPassword: string
  newPassword: string  // min 8 chars
}
```

**Response 200**
```json
{ "success": true, "data": null }
```

**Errors**
- `401` — current password is incorrect
- `404` — user not found

---

## Categories

Categories are global (not scoped per user).

### `GET /categories`

**Response 200**
```ts
{
  data: Array<{
    id: string
    name: string
    icon: string | null
    type: "expense" | "income"
    isSystem: boolean
  }>
}
```

---

### `GET /categories/:id`

**Response 200** — single category object (same shape as above)

**Errors** — `404` if not found

---

### `POST /categories`

**Request body**
```ts
{
  name: string
  icon?: string
  type: "expense" | "income"
}
```

**Response 201** — created category

---

### `PATCH /categories/:id`

**Request body** — all fields optional
```ts
{
  name?: string
  icon?: string
  type?: "expense" | "income"
}
```

**Response 200** — updated category

---

### `DELETE /categories/:id`

**Response 204** — no body

---

## Transactions

All scoped to the authenticated user.

### `GET /transactions`

**Query params** — all optional
```
type        "expense" | "income"
categoryId  UUID
emotionTag  "need" | "impulse" | "emotional"
startDate   "YYYY-MM-DD"
endDate     "YYYY-MM-DD"
```

**Response 200**
```ts
{
  data: Array<{
    id: string
    amount: string            // serialized Decimal
    type: string
    emotionTag: string | null
    note: string | null
    occurredAt: string        // ISO datetime
    createdAt: string
    category: {
      id: string
      name: string
      icon: string | null
    } | null
  }>
}
```

---

### `GET /transactions/:id`

**Response 200** — single transaction (same shape as above)

**Errors** — `404` if not found or not owned by user

---

### `POST /transactions`

**Request body**
```ts
{
  amount: number              // positive
  type: "expense" | "income"
  occurredAt: string          // ISO datetime e.g. "2026-02-19T10:00:00.000Z"
  emotionTag?: "need" | "impulse" | "emotional"
  note?: string
  categoryId?: string         // UUID
  dailySnapshotId?: string    // UUID — link to today's snapshot
}
```

**Response 201** — created transaction

---

### `PATCH /transactions/:id`

**Request body** — all optional
```ts
{
  amount?: number
  type?: "expense" | "income"
  occurredAt?: string          // ISO datetime
  emotionTag?: "need" | "impulse" | "emotional"
  note?: string
  categoryId?: string
}
```

**Response 200** — updated transaction

---

### `DELETE /transactions/:id`

**Response 204** — no body

---

## Daily Snapshots

One snapshot per user per day. Unique constraint: `(userId, date)`.

### `GET /snapshots`

**Response 200**
```ts
{
  data: Array<{
    id: string
    date: string              // ISO datetime (UTC midnight)
    mood: string | null
    reflection: string | null
    consciousScore: number | null  // 1–10
    createdAt: string
  }>
}
```

---

### `GET /snapshots/today`

Returns today's snapshot or `null`.

**Response 200**
```ts
{
  data: SnapshotObject | null
}
```

---

### `POST /snapshots`

Creates today's snapshot. Fails if one already exists for today.

**Request body** — all optional
```ts
{
  mood?: "calm" | "stressed" | "confident" | "neutral"
  reflection?: string
  consciousScore?: number  // integer 1–10
}
```

**Response 201** — created snapshot

**Errors** — `409` if a snapshot for today already exists

---

### `PATCH /snapshots/today`

Updates today's snapshot. Fails if none exists.

**Request body** — all optional (same as create)

**Response 200** — updated snapshot

**Errors** — `404` if no snapshot for today

---

## Saving Goals

All scoped to the authenticated user.

### `GET /saving-goals`

**Response 200**
```ts
{
  data: Array<{
    id: string
    name: string
    targetAmount: string   // serialized Decimal
    currentAmount: string  // serialized Decimal
    targetDate: string | null  // ISO datetime
    createdAt: string
  }>
}
```

---

### `GET /saving-goals/:id`

**Response 200** — single goal

**Errors** — `404`

---

### `POST /saving-goals`

**Request body**
```ts
{
  name: string
  targetAmount: number  // positive
  targetDate?: string   // "YYYY-MM-DD"
}
```

**Response 201** — created goal

---

### `PATCH /saving-goals/:id`

**Request body** — all optional
```ts
{
  name?: string
  targetAmount?: number
  targetDate?: string   // "YYYY-MM-DD"
}
```

**Response 200** — updated goal

---

### `PATCH /saving-goals/:id/deposit`

Adds an amount to `currentAmount` (atomic increment).

**Request body**
```ts
{
  amount: number  // positive
}
```

**Response 200** — updated goal with new `currentAmount`

---

### `DELETE /saving-goals/:id`

**Response 204** — no body

---

## Habits

All scoped to the authenticated user.

### `GET /habits`

**Query params** — optional
```
active  "true" | "false"   // filter by active status
```

**Response 200**
```ts
{
  data: Array<{
    id: string
    name: string
    frequency: "daily" | "weekly"
    active: boolean
    createdAt: string
  }>
}
```

---

### `GET /habits/:id`

**Response 200** — single habit

**Errors** — `404`

---

### `POST /habits`

**Request body**
```ts
{
  name: string
  frequency: "daily" | "weekly"
}
```

**Response 201** — created habit (`active: true` by default)

---

### `PATCH /habits/:id`

**Request body** — all optional
```ts
{
  name?: string
  frequency?: "daily" | "weekly"
  active?: boolean  // use to archive/restore
}
```

**Response 200** — updated habit

---

### `DELETE /habits/:id`

**Response 204** — no body

---

### `GET /habits/:id/logs`

**Response 200**
```ts
{
  data: Array<{
    id: string
    date: string       // ISO datetime (UTC midnight)
    completed: boolean
    createdAt: string
  }>
}
```

---

### `POST /habits/:id/logs`

Upserts a log entry for the given date (defaults to today). Idempotent — calling again for the same date updates `completed`.

**Request body**
```ts
{
  completed: boolean
  date?: string  // "YYYY-MM-DD" — defaults to today (UTC)
}
```

**Response 200** — upserted log entry

**Errors** — `404` if habit not found or not owned by user

---

## Investment Profiles

All scoped to the authenticated user.

### `GET /investment-profiles`

**Response 200**
```ts
{
  data: Array<{
    id: string
    strategy: "conservative" | "balanced" | "long_term"
    monthlyAmount: string   // serialized Decimal
    expectedReturn: string  // serialized Decimal (percentage 0–100)
    createdAt: string
  }>
}
```

---

### `GET /investment-profiles/:id`

**Response 200** — single profile

**Errors** — `404`

---

### `POST /investment-profiles`

**Request body**
```ts
{
  strategy: "conservative" | "balanced" | "long_term"
  monthlyAmount: number   // positive
  expectedReturn: number  // 0–100 (percentage)
}
```

**Response 201** — created profile

---

### `PATCH /investment-profiles/:id`

**Request body** — all optional
```ts
{
  strategy?: "conservative" | "balanced" | "long_term"
  monthlyAmount?: number
  expectedReturn?: number
}
```

**Response 200** — updated profile

---

### `DELETE /investment-profiles/:id`

**Response 204** — no body

---

## Common HTTP status codes

| Code | Meaning |
|------|---------|
| `200` | OK |
| `201` | Created |
| `204` | No Content (delete success) |
| `401` | Unauthorized — missing/invalid token, or wrong current password |
| `404` | Not found (or not owned by you) |
| `409` | Conflict — e.g. snapshot for today already exists |
| `422` | Validation error — `errors` field contains field-level messages |
| `500` | Internal server error |

---

## Notes for frontend integration

- **Decimal fields** (`amount`, `targetAmount`, `currentAmount`, `monthlyAmount`, `expectedReturn`) are returned as **strings** to preserve precision. Parse with `parseFloat()` or a decimal library as needed.
- **Date fields** are returned as ISO 8601 strings. Dates sent to the API must be `"YYYY-MM-DD"` for date-only fields and full ISO datetime (e.g. `"2026-02-19T10:30:00.000Z"`) for datetime fields.
- **Ownership**: user-scoped resources return `404` (not `403`) when the resource does not belong to the authenticated user, to avoid leaking resource existence.
- **Snapshot uniqueness**: only one snapshot per calendar day (UTC). Check `GET /snapshots/today` before attempting `POST /snapshots`.
- **Habit log idempotency**: `POST /habits/:id/logs` is safe to call multiple times for the same date — it will update the existing entry.
