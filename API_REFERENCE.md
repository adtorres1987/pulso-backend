# Pulso API Reference

Base URL: `http://localhost:3000/api/v1`

## Authentication

All endpoints (except `POST /auth/register` and `POST /auth/login`) require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <token>
```

The token is obtained from `POST /auth/login`. Use `POST /auth/refresh` to renew it before expiry and `POST /auth/logout` to invalidate it.

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
| `RoleType` | `"super_admin"` \| `"admin"` \| `"support"` \| `"user"` |

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
    token: string        // JWT — store this for all subsequent requests
    user: {
      id: string
      email: string
      language: string
      timezone: string
      role: string | null  // e.g. "admin", "user", or null if no role assigned
    }
  }
}
```

**Errors**
- `401` — invalid credentials

---

### `POST /auth/refresh`
Requires auth. Invalidates the current token and issues a new one with a fresh expiry.

**Response 200**
```ts
{
  data: {
    token: string  // new JWT — replace the old one immediately
  }
}
```

**Errors**
- `401` — token expired, invalid, or already revoked

---

### `POST /auth/logout`
Requires auth. Adds the current token to the Redis blacklist — it will be rejected on any future request.

**Response 204** — no body

**Errors**
- `401` — token invalid or already revoked

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
    createdAt: string           // ISO datetime
    person: {
      firstName: string
      lastName: string
      phone: string | null
      birthDate: string | null  // ISO datetime
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

Categories are global (not scoped per user). Soft-deleted categories are excluded from all responses.

| Action | Required role |
|--------|--------------|
| `GET` | Any authenticated user |
| `POST` / `PATCH` / `DELETE` | `admin` or `super_admin` |

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

**Errors** — `404` if not found or soft-deleted

---

### `POST /categories`
Requires `admin` or `super_admin`.

**Request body**
```ts
{
  name: string
  icon?: string
  type: "expense" | "income"
}
```

**Response 201** — created category

**Errors** — `403` if insufficient role

---

### `PATCH /categories/:id`
Requires `admin` or `super_admin`.

**Request body** — all fields optional
```ts
{
  name?: string
  icon?: string
  type?: "expense" | "income"
}
```

**Response 200** — updated category

**Errors** — `403` if insufficient role · `404` if not found

---

### `DELETE /categories/:id`
Requires `admin` or `super_admin`. Performs a **soft delete** — the category is hidden but not removed from the database.

**Response 204** — no body

**Errors** — `403` if insufficient role · `404` if not found

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
    targetAmount: string       // serialized Decimal
    currentAmount: string      // serialized Decimal
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

## Roles
Requires `admin` or `super_admin` for all operations. Soft-deleted roles are excluded from all responses.

### `GET /roles`

**Response 200**
```ts
{
  data: Array<{
    id: string
    name: "super_admin" | "admin" | "support" | "user"
    description: string | null
    createdAt: string
    permissions: string[]  // e.g. ["transactions:read", "users:write"]
  }>
}
```

---

### `GET /roles/:id`

**Response 200** — single role (same shape as above)

**Errors** — `403` if insufficient role · `404` if not found

---

### `POST /roles`

**Request body**
```ts
{
  name: "super_admin" | "admin" | "support" | "user"
  description?: string
}
```

**Response 201** — created role

**Errors** — `403` if insufficient role · `409` if name already exists

---

### `PATCH /roles/:id`

**Request body**
```ts
{
  description?: string
}
```

**Response 200** — updated role

**Errors** — `403` if insufficient role · `404` if not found

---

### `DELETE /roles/:id`
Performs a **soft delete** — the role is hidden but not removed from the database.

**Response 204** — no body

**Errors** — `403` if insufficient role · `404` if not found

---

## Common HTTP status codes

| Code | Meaning |
|------|---------|
| `200` | OK |
| `201` | Created |
| `204` | No Content (delete / logout success) |
| `401` | Unauthorized — missing/invalid/expired token, wrong password, or revoked token |
| `403` | Forbidden — authenticated but insufficient role |
| `404` | Not found (or not owned by you) |
| `409` | Conflict — e.g. snapshot for today already exists |
| `422` | Validation error — `errors` field contains field-level messages |
| `500` | Internal server error |

---

## Token lifecycle

```
POST /auth/login
  → token (JWT with jti claim, expires in JWT_EXPIRES_IN)

Every request
  → Authorization: Bearer <token>
  → Server checks: valid signature + not in Redis blacklist

POST /auth/refresh  (before token expires)
  → old token added to Redis blacklist
  → new token returned

POST /auth/logout
  → token added to Redis blacklist with TTL = remaining expiry
  → token is immediately rejected on any future request
```

---

## Notes for frontend integration

- **Decimal fields** (`amount`, `targetAmount`, `currentAmount`, `monthlyAmount`, `expectedReturn`) are returned as **strings** to preserve precision. Parse with `parseFloat()` or a decimal library as needed.
- **Date fields** are returned as ISO 8601 strings. Dates sent to the API must be `"YYYY-MM-DD"` for date-only fields and full ISO datetime (e.g. `"2026-02-19T10:30:00.000Z"`) for datetime fields.
- **`user.role` on login** — use this field to conditionally show admin UI sections without an extra API call.
- **Soft deletes** — deleted roles and categories are excluded automatically. There is no restore endpoint.
- **Ownership** — user-scoped resources return `404` (not `403`) when the resource does not belong to the authenticated user, to avoid leaking resource existence.
- **Snapshot uniqueness** — only one snapshot per calendar day (UTC). Check `GET /snapshots/today` before attempting `POST /snapshots`.
- **Habit log idempotency** — `POST /habits/:id/logs` is safe to call multiple times for the same date — it will update the existing entry.
