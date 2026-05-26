# Pulso API Reference

Base URL (local): `http://localhost:3000/api/v1`
Base URL (production): set to your Railway deployment URL (e.g. `https://<your-app>.up.railway.app/api/v1`)

## Authentication

All endpoints (except `POST /auth/register`, `POST /auth/login`, `POST /auth/forgot-password`, and `POST /auth/reset-password`) require a Bearer token in the `Authorization` header:

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
{ success: false, fieldErrors: Record<string, string[]> }
```

---

## Pagination

All list endpoints support pagination via query params:

| Param | Type | Default | Max | Description |
|-------|------|---------|-----|-------------|
| `page` | integer | `1` | — | Page number (1-based) |
| `limit` | integer | `20` | `100` | Items per page |

**Paginated response shape:**

```ts
{
  data: {
    items: T[]     // items for the current page
    total: number  // total count across all pages
    page: number   // current page
    limit: number  // items per page used
  }
}
```

> **Exception:** `GET /categories` uses a default `limit` of `10`.

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
| `SubscriptionStatus` | `"trial"` \| `"active"` \| `"expired"` \| `"cancelled"` |
| `GroupMemberRole` | `"owner"` \| `"member"` |

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
No auth required. Creates the user, their person profile, and a trial subscription (using the first active plan and `trial_days` from AppConfig).

**Request body**
```ts
{
  email: string                                              // valid email
  password: string                                           // min 8 chars
  language?: "es" | "en"                                    // default: "es"
  timezone: string                                           // e.g. "America/Mexico_City"
  firstName: string                                          // min 2 chars
  lastName: string                                           // min 2 chars
  role?: "super_admin" | "admin" | "support" | "user"       // optional — assigns role on creation
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
    role: string | null  // assigned role, or null if none provided
    person: { firstName: string; lastName: string }
  }
}
```

**Errors**
- `409` — email already registered

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

### `POST /auth/forgot-password`
No auth required. Sends a password reset email if the address is registered.

> Always returns `200` regardless of whether the email exists — to avoid leaking account information.

**Request body**
```ts
{
  email: string  // valid email
}
```

**Response 200**
```json
{ "success": true, "data": null, "message": "If that email is registered, a reset link has been sent" }
```

---

### `POST /auth/reset-password`
No auth required. Resets the password using the token received by email.

**Request body**
```ts
{
  token: string       // reset token from the email link
  newPassword: string // min 8 chars
}
```

**Response 200**
```json
{ "success": true, "data": null, "message": "Password updated successfully" }
```

**Errors**
- `400` — token invalid or expired (tokens expire after 1 hour)
- `422` — validation error

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

### `POST /me/avatar`
Uploads a profile picture to Cloudinary and updates `person.avatarUrl`. Send as `multipart/form-data` with the file in the `image` field.

**Request** — `Content-Type: multipart/form-data`
```
image  File   // image/* only, max 5 MB
```

**Response 200** — same shape as `GET /me` (with updated `avatarUrl`)

**Errors**
- `400` — no file provided or file is not an image
- `413` — file exceeds 5 MB

---

## Subscriptions

### `GET /subscriptions/me`
Returns the authenticated user's subscription, including the linked plan.

**Response 200**
```ts
{
  data: {
    id: string
    userId: string
    planId: string
    status: "trial" | "active" | "expired" | "cancelled"
    trialEndsAt: string          // ISO datetime
    currentPeriodStart: string   // ISO datetime
    currentPeriodEnd: string     // ISO datetime
    discountPercent: string      // serialized Decimal — e.g. "10.00" (group discount applied)
    cancelledAt: string | null   // ISO datetime
    createdAt: string
    plan: {
      id: string
      name: string
      priceAmount: string        // serialized Decimal
      currency: string           // e.g. "USD"
      intervalDays: number       // billing cycle length in days
    }
  } | null
}
```

**Errors**
- `404` — no subscription found

---

### `DELETE /subscriptions/me`
Cancels the authenticated user's subscription. Sets `status` to `"cancelled"` and records `cancelledAt`.

**Response 200**
```ts
{
  data: { /* same shape as GET /subscriptions/me */ }
  message: "Subscription cancelled"
}
```

---

### `POST /subscriptions/checkout`
Creates a Stripe Checkout Session for the user to pay for a plan. If the user has no Stripe customer yet, one is created automatically.

**Request body**
```ts
{
  planId: string  // UUID — must have a stripePriceId configured
}
```

**Response 200**
```ts
{
  data: {
    checkoutUrl: string  // Stripe-hosted payment page — redirect the user here
  }
  message: "Checkout session created"
}
```

**Errors**
- `400` — plan has no `stripePriceId` configured
- `404` — plan not found

> After the user completes payment, Stripe calls `POST /webhooks/stripe`. The subscription is activated automatically via the webhook — the client does not need to call any endpoint after the redirect.

---

## Stripe Webhooks

### `POST /webhooks/stripe`
No auth required. Stripe calls this endpoint directly. The request body must be the **raw bytes** (not JSON-parsed) — this is handled automatically by the server.

**Headers** (sent by Stripe)
```
Stripe-Signature: t=...,v1=...
```

**Handled events**

| Event | Effect |
|-------|--------|
| `checkout.session.completed` | Links `stripeSubscriptionId` to the user's subscription |
| `invoice.payment_succeeded` | Sets `status: "active"`, updates `currentPeriodStart/End` |
| `invoice.payment_failed` | Sets `status: "expired"` |
| `customer.subscription.deleted` | Sets `status: "cancelled"`, records `cancelledAt` |

**Response 200**
```json
{ "received": true }
```

> To test webhooks locally, use the [Stripe CLI](https://stripe.com/docs/stripe-cli): `stripe listen --forward-to localhost:3000/webhooks/stripe`

---

## Dashboard

### `GET /dashboard`
Requires auth. Returns a monthly summary for the authenticated user: income/expense totals, net balance, paginated transaction list, expense breakdown by emotion tag, breakdown by category, and a full 12-month view of the queried year.

**Query params** — all optional
```
month  string    "YYYY-MM" — month to query (default: current UTC month)
page   integer   default: 1   page number for the transactions list
limit  integer   default: 20  transactions per page (max 100)
```

**Response 200**
```ts
{
  data: {
    month: string              // "YYYY-MM" — queried month

    totalIncome: string        // sum of income for the month (Decimal as string)
    totalExpenses: string      // sum of expenses for the month (Decimal as string)
    balance: string            // totalIncome − totalExpenses (Decimal as string)

    transactions: {
      items: Array<{
        id: string
        amount: string         // Decimal as string
        type: "expense" | "income"
        emotionTag: "need" | "impulse" | "emotional" | null
        note: string | null
        occurredAt: string     // ISO datetime
        createdAt: string
        categoryId: string | null
        category: { id: string; name: string; icon: string | null } | null
      }>
      total: number            // total transactions in the month (unpaginated count)
      page: number
      limit: number
    }

    byEmotionTag: Array<{      // expenses only (type = "expense")
      emotionTag: "need" | "impulse" | "emotional" | null  // null = no tag
      total: string            // sum of amounts (Decimal as string)
      count: number
    }>

    byCategory: Array<{        // income and expenses grouped separately by category
      categoryId: string | null   // null = uncategorised
      categoryName: string | null
      categoryIcon: string | null
      type: "expense" | "income"
      total: string            // Decimal as string
      count: number
    }>

    byMonth: Array<{           // all 12 months of the queried year (zeros for empty months)
      month: string            // "YYYY-MM"
      income: string           // Decimal as string — "0" if no transactions
      expenses: string         // Decimal as string — "0" if no transactions
      balance: string          // income − expenses
    }>
  }
}
```

**Errors**
- `400` — invalid `month` format (must be `YYYY-MM`, month 01–12)

---

## Categories

Categories can be **global** (created by admin, `userId: null`) or **personal** (created by subscribed users, `userId` is set). Soft-deleted categories are excluded from all responses.

`GET` returns both global categories and the authenticated user's own categories combined.

| Action | Required |
|--------|----------|
| `GET /categories` | Any authenticated user |
| `GET /categories/:id` | Any authenticated user |
| `POST /categories/admin` | `admin` or `super_admin` |
| `PATCH /categories/admin/:id` | `admin` or `super_admin` |
| `DELETE /categories/admin/:id` | `admin` or `super_admin` |
| `POST /categories` | Active or trial subscription |
| `PATCH /categories/:id` | Active or trial subscription (must own the category) |
| `DELETE /categories/:id` | Active or trial subscription (must own the category) |

### `GET /categories`

**Query params** — optional
```
page   integer   default: 1   page number
limit  integer   default: 10  items per page (max 100)
```

**Response 200**
```ts
{
  data: {
    items: Array<{
      id: string
      userId: string | null   // null = global; UUID = user-owned
      name: string
      icon: string | null
      type: "expense" | "income"
      isSystem: boolean
    }>
    total: number
    page: number
    limit: number
  }
}
```

---

### `GET /categories/:id`

**Response 200** — single category object (same shape as above)

**Errors** — `404` if not found or soft-deleted

---

### `POST /categories/admin`
Requires `admin` or `super_admin`. Creates a **global** category (`userId: null`).

**Request body**
```ts
{
  name: string
  icon?: string
  type: "expense" | "income"
}
```

**Response 201** — created category

**Errors**
- `403` — insufficient role
- `409` — a global category with that name already exists

---

### `PATCH /categories/admin/:id`
Requires `admin` or `super_admin`. Updates a global category.

**Request body** — all fields optional
```ts
{
  name?: string
  icon?: string
  type?: "expense" | "income"
}
```

**Response 200** — updated category

**Errors** — `403` · `404`

---

### `DELETE /categories/admin/:id`
Requires `admin` or `super_admin`. Performs a **soft delete**.

**Response 204** — no body

**Errors** — `403` · `404`

---

### `POST /categories`
Requires active or trial subscription. Creates a **personal** category scoped to the authenticated user.

**Request body**
```ts
{
  name: string   // must be unique vs. global categories AND user's own categories (case-insensitive)
  icon?: string
  type: "expense" | "income"
}
```

**Response 201** — created category

**Errors**
- `403` — no active subscription
- `409` — name conflicts with an existing global or personal category

---

### `PATCH /categories/:id`
Requires active or trial subscription. Updates the user's own category.

**Request body** — all optional
```ts
{
  name?: string
  icon?: string
  type?: "expense" | "income"
}
```

**Response 200** — updated category

**Errors** — `403` · `404` (not found or not owned by user)

---

### `DELETE /categories/:id`
Requires active or trial subscription. Soft-deletes the user's own category.

**Response 204** — no body

**Errors** — `403` · `404`

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
page        integer   default: 1
limit       integer   default: 20  (max 100)
```

**Response 200**
```ts
{
  data: {
    items: Array<{
      id: string
      amount: string            // serialized Decimal
      type: "expense" | "income"
      emotionTag: string | null
      note: string | null
      occurredAt: string        // ISO datetime
      createdAt: string
      categoryId: string | null // UUID of the linked category
      category: {
        id: string
        name: string
        icon: string | null
      } | null
    }>
    total: number
    page: number
    limit: number
  }
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
  occurredAt?: string
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

**Query params** — optional
```
page   integer   default: 1
limit  integer   default: 20  (max 100)
```

**Response 200**
```ts
{
  data: {
    items: Array<{
      id: string
      date: string              // ISO datetime (UTC midnight)
      mood: string | null
      reflection: string | null
      consciousScore: number | null  // 1–10
      createdAt: string
    }>
    total: number
    page: number
    limit: number
  }
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

**Query params** — optional
```
page   integer   default: 1
limit  integer   default: 20  (max 100)
```

**Response 200**
```ts
{
  data: {
    items: Array<{
      id: string
      name: string
      targetAmount: string       // serialized Decimal
      currentAmount: string      // serialized Decimal
      targetDate: string | null  // ISO datetime
      createdAt: string
    }>
    total: number
    page: number
    limit: number
  }
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
page    integer             default: 1
limit   integer             default: 20  (max 100)
```

**Response 200**
```ts
{
  data: {
    items: Array<{
      id: string
      name: string
      frequency: "daily" | "weekly"
      active: boolean
      createdAt: string
    }>
    total: number
    page: number
    limit: number
  }
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

**Query params** — optional
```
page   integer   default: 1
limit  integer   default: 20  (max 100)
```

**Response 200**
```ts
{
  data: {
    items: Array<{
      id: string
      date: string       // ISO datetime (UTC midnight)
      completed: boolean
      createdAt: string
    }>
    total: number
    page: number
    limit: number
  }
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

**Query params** — optional
```
page   integer   default: 1
limit  integer   default: 20  (max 100)
```

**Response 200**
```ts
{
  data: {
    items: Array<{
      id: string
      strategy: "conservative" | "balanced" | "long_term"
      monthlyAmount: string   // serialized Decimal
      expectedReturn: string  // serialized Decimal (percentage 0–100)
      createdAt: string
    }>
    total: number
    page: number
    limit: number
  }
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

## Users

### `GET /users/lookup`
Requires auth. Looks up a user by email address. Intended for the group flow — find a user to add as a group member.

**Query params**
```
email  string  required — exact email address to search
```

**Response 200**
```ts
{
  data: {
    id: string
    email: string
    person: {
      firstName: string
      lastName: string
      avatarUrl: string | null
    } | null
  }
}
```

**Errors**
- `400` — `email` query param missing
- `404` — no user with that email

---

## Groups

All group endpoints require an active or trial subscription (`requireSubscription` middleware). Groups are scoped to members — you can only see and operate on groups you belong to.

### Group object shape
```ts
{
  id: string
  name: string
  createdBy: string    // userId of the owner
  createdAt: string    // ISO datetime
  members: Array<{
    id: string         // GroupMember id
    userId: string
    role: "owner" | "member"
    joinedAt: string   // ISO datetime
  }>
}
```

---

### `GET /groups`
Returns all groups the authenticated user belongs to.

**Query params** — optional
```
page   integer   default: 1
limit  integer   default: 20  (max 100)
```

**Response 200**
```ts
{
  data: {
    items: GroupObject[]
    total: number
    page: number
    limit: number
  }
}
```

---

### `GET /groups/:id`

**Response 200** — single group (same shape as above)

**Errors** — `404` if not found or user is not a member

---

### `POST /groups`
Creates a group. The authenticated user becomes the **owner**.

**Request body**
```ts
{
  name: string  // 1–100 chars
}
```

**Response 201**
```ts
{
  data: GroupObject
  message: "Group created"
}
```

---

### `PATCH /groups/:id`
Only the group **owner** can rename the group.

**Request body**
```ts
{
  name: string  // 1–100 chars
}
```

**Response 200**
```ts
{
  data: GroupObject
  message: "Group updated"
}
```

**Errors** — `403` if not the owner · `404`

---

### `DELETE /groups/:id`
Only the group **owner** can delete the group.

**Response 204** — no body

**Errors** — `403` if not the owner · `404`

---

### `POST /groups/:id/members`
Adds a user to the group. Only the group **owner** can add members. Adding a member recalculates the group discount across all active/trial members.

**Request body**
```ts
{
  userId: string  // UUID of the user to add
}
```

**Response 201**
```ts
{
  data: {
    id: string
    userId: string
    role: "owner" | "member"
    joinedAt: string
  }
  message: "Member added"
}
```

**Errors**
- `403` — not the owner, or user has no active subscription
- `404` — group not found
- `409` — user is already a member

---

### `DELETE /groups/:id/members/:userId`
Removes a member from the group. Only the group **owner** can remove members. Removing recalculates the group discount.

**Response 204** — no body

**Errors** — `403` if not the owner · `404`

---

### `GET /groups/:id/expenses`
Returns all expenses for the group. The authenticated user must be a member.

**Query params** — optional
```
page   integer   default: 1
limit  integer   default: 20  (max 100)
```

**Response 200**
```ts
{
  data: {
    items: Array<{
      id: string
      groupId: string
      paidById: string       // userId of who paid
      amount: string         // serialized Decimal
      description: string
      occurredAt: string     // ISO datetime
      createdAt: string
      shares: Array<{
        id: string
        groupMemberId: string
        amount: string
        includeInPersonal: boolean
        transactionId: string | null
      }>
    }>
    total: number
    page: number
    limit: number
  }
}
```

**Errors** — `404` if group not found or user is not a member

---

### `GET /groups/:id/expenses/summary`
Returns a monthly expense summary for the group: total spent, breakdown per member (who paid), and each member's percentage of the total. The authenticated user must be a member of the group.

**Query params** — optional
```
month  string   YYYY-MM format — defaults to current UTC month (e.g. 2025-05)
```

**Response 200**
```ts
{
  data: {
    month: string              // "YYYY-MM"
    total: string              // sum of all group expenses in the month (Decimal as string)
    byMember: Array<{
      userId: string
      firstName: string
      lastName: string
      avatarUrl: string | null
      total: string            // amount paid by this member (Decimal as string)
      percentage: string       // share of total, 2 decimal places (e.g. "66.67")
    }>                         // empty array if no expenses in the month
  }
}
```

**Errors** — `400` (invalid month format) · `404` (group not found or user not a member)

---

### `POST /groups/:id/expenses`
Records a shared expense. The `shares` array defines how the total is split among group members (by `groupMemberId`). The authenticated user must be a group member.

**Request body**
```ts
{
  amount: number                          // positive — total expense amount
  description: string                     // min 1 char
  occurredAt: string                      // ISO datetime
  shares: Array<{
    groupMemberId: string                 // UUID of the GroupMember record
    amount: number                        // positive — this member's share
  }>                                      // min 1 share required
}
```

**Response 201**
```ts
{
  data: {
    id: string
    groupId: string
    paidById: string       // userId of who paid
    amount: string         // serialized Decimal
    description: string
    occurredAt: string     // ISO datetime
    createdAt: string
    shares: Array<{
      id: string
      groupMemberId: string
      amount: string         // serialized Decimal
      includeInPersonal: boolean
      transactionId: string | null  // null until linked to a personal transaction
    }>
  }
  message: "Expense created"
}
```

**Errors** — `403` · `404`

---

### `PATCH /groups/:id/expenses/:expenseId`
Updates a group expense. Only the original payer (`paidById`) or a group owner may call this endpoint. All fields are optional — only the provided fields are updated. If `shares` is provided the entire set of shares is replaced.

**Request body** (all fields optional)
```ts
{
  amount?: number                         // positive
  description?: string                    // min 1 char
  occurredAt?: string                     // ISO datetime
  shares?: Array<{
    groupMemberId: string                 // UUID of the GroupMember record
    amount: number                        // positive
  }>                                      // min 1 share — replaces all existing shares
}
```

**Response 200**
```ts
{
  data: {
    id: string
    groupId: string
    paidById: string
    amount: string         // serialized Decimal
    description: string
    occurredAt: string
    createdAt: string
    shares: Array<{
      id: string
      groupMemberId: string
      amount: string
      includeInPersonal: boolean
      transactionId: string | null
    }>
  }
  message: "Expense updated"
}
```

**Errors** — `403` (not the payer or owner) · `404` (group or expense not found) · `422`

---

### `DELETE /groups/:id/expenses/:expenseId`
Deletes a group expense and all its shares. Only the original payer (`paidById`) or a group owner may call this endpoint.

**No request body required.**

**Response 204** — no body.

**Errors** — `403` · `404`

---

### `PATCH /groups/:id/expenses/:expenseId/shares/:shareId/include`
Links a group expense share to the authenticated user's personal transactions. Creates a `Transaction` record and marks `includeInPersonal: true`. Can only be done once per share (the `transactionId` becomes non-null and the endpoint returns `409` if called again).

**No request body required.**

**Response 200**
```ts
{
  data: {
    id: string
    groupMemberId: string
    amount: string
    includeInPersonal: boolean  // now true
    transactionId: string       // UUID of the created personal transaction
  }
  message: "Share linked to personal transactions"
}
```

**Errors** — `403` · `404` · `409` if already linked

---

## Roles

Requires `admin` or `super_admin` for all operations. Soft-deleted roles are excluded from all responses.

### `GET /roles`

**Query params** — optional
```
page   integer   default: 1
limit  integer   default: 20  (max 100)
```

**Response 200**
```ts
{
  data: {
    items: Array<{
      id: string
      name: "super_admin" | "admin" | "support" | "user"
      description: string | null
      createdAt: string
      permissions: string[]  // e.g. ["transactions:read", "users:write"]
    }>
    total: number
    page: number
    limit: number
  }
}
```

---

### `GET /roles/:id`

**Response 200** — single role (same shape as above)

**Errors** — `403` · `404`

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

**Errors** — `403` · `409` if name already exists

---

### `PATCH /roles/:id`

**Request body**
```ts
{
  description?: string
}
```

**Response 200** — updated role

**Errors** — `403` · `404`

---

### `DELETE /roles/:id`
Performs a **soft delete**.

**Response 204** — no body

**Errors** — `403` · `404`

---

## Permissions

### `GET /permissions`

**Query params** — optional
```
page   integer   default: 1
limit  integer   default: 20  (max 100)
```

**Response 200**
```ts
{
  data: {
    items: Array<{
      id: string
      action: string   // format: "resource:operation" e.g. "transactions:read"
      description: string | null
      createdAt: string
    }>
    total: number
    page: number
    limit: number
  }
}
```

---

### `GET /permissions/:id`

**Response 200** — single permission

**Errors** — `404`

---

### `POST /permissions`

**Request body**
```ts
{
  action: string       // "resource:operation"
  description?: string
}
```

**Response 201** — created permission

---

### `PATCH /permissions/:id`

**Request body** — all optional
```ts
{
  action?: string
  description?: string
}
```

**Response 200** — updated permission

---

### `DELETE /permissions/:id`

**Response 204** — no body

---

## Admin: Users

Requires `admin` or `super_admin` (password reset requires `super_admin`).

### `GET /admin/users`

**Query params** — optional
```
search    string       // filters by name or email (partial match)
isActive  "true" | "false"
```

**Response 200**
```ts
{
  data: Array<{
    id: string
    email: string
    isActive: boolean
    language: string
    timezone: string
    createdAt: string
    person: {
      firstName: string
      lastName: string
      phone: string | null
      country: string | null
      avatarUrl: string | null
    } | null
    role: { id: string; name: string } | null
  }>
}
```

---

### `GET /admin/users/:id`

**Response 200** — single user (same shape as above)

**Errors** — `404`

---

### `PATCH /admin/users/:id`

**Request body** — all optional
```ts
{
  isActive?: boolean
  language?: "es" | "en"
  timezone?: string
  firstName?: string
  lastName?: string
}
```

**Response 200** — updated user

---

### `PATCH /admin/users/:id/password`
Requires `super_admin`.

**Request body**
```ts
{
  newPassword: string  // min 8 chars
}
```

**Response 200**
```json
{ "success": true, "data": null, "message": "Password reset successfully" }
```

---

## Admin: App Config

Requires `admin` or `super_admin`. Manages global key/value settings.

### Known keys

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `trial_days` | integer | `30` | Trial period length for new registrations |
| `group_discount_percent` | integer | `10` | Discount applied when a group reaches the minimum member threshold |

### App Config object shape
```ts
{
  key: string           // lowercase letters, numbers, underscores
  value: string         // always stored as string, even for numeric keys
  description: string | null
  updatedAt: string     // ISO datetime
}
```

---

### `GET /admin/app-config`
Returns all config entries.

**Response 200** — `{ data: AppConfigObject[] }`

---

### `GET /admin/app-config/:key`

**Response 200** — `{ data: AppConfigObject }`

**Errors** — `404` if key does not exist

---

### `POST /admin/app-config`
Creates a new config key. Fails if the key already exists.

**Request body**
```ts
{
  key: string           // min 1 char, pattern: /^[a-z0-9_]+$/
  value: string         // min 1 char
  description?: string
}
```

**Response 201** — `{ data: AppConfigObject, message: "Config created" }`

**Errors** — `409` if key already exists · `422` validation

---

### `PATCH /admin/app-config/:key`
Updates value and/or description. At least one field is required.

**Request body**
```ts
{
  value?: string        // min 1 char
  description?: string
}
```

**Response 200** — `{ data: AppConfigObject, message: "Config updated" }`

**Errors** — `404` if key does not exist · `422` validation (neither field provided, or numeric key has invalid value)

---

### `DELETE /admin/app-config/:key`
Deletes a config key. The system keys `trial_days` and `group_discount_percent` cannot be deleted.

**Response 204** — no body

**Errors** — `403` if key is a protected system key · `404` if key does not exist

---

## Subscription Plans (public)

### `GET /plans`
Requires auth. Returns all **active** plans. Use this to populate the plan selection screen before checkout.

**Response 200**
```ts
{
  data: Array<{
    id: string
    name: string
    description: string | null
    priceAmount: string    // serialized Decimal
    currency: string
    intervalDays: number
    isActive: boolean      // always true — inactive plans are filtered out
    stripePriceId: string | null
    createdAt: string
  }>
}
```

---

## Admin: Subscription Plans

Requires `admin` or `super_admin`. The first active plan is used automatically when new users register.

### `GET /admin/subscription-plans`

**Response 200**
```ts
{
  data: Array<{
    id: string
    name: string
    description: string | null
    priceAmount: string    // serialized Decimal
    currency: string       // ISO 4217 — e.g. "USD"
    intervalDays: number   // billing cycle length in days (default: 30)
    isActive: boolean
    stripePriceId: string | null
    createdAt: string      // ISO datetime
  }>
}
```

---

### `GET /admin/subscription-plans/:id`

**Response 200** — single plan (same shape as above)

**Errors** — `404`

---

### `POST /admin/subscription-plans`

**Request body**
```ts
{
  name: string              // min 1 char
  description?: string
  priceAmount: number       // positive
  currency?: string         // 3-char ISO 4217 code — default: "USD"
  intervalDays?: number     // positive integer — default: 30
  stripePriceId?: string    // Stripe price ID for payment integration
}
```

**Response 201** — created plan (`isActive: true` by default)

---

### `PATCH /admin/subscription-plans/:id`

**Request body** — all optional
```ts
{
  name?: string
  description?: string
  priceAmount?: number
  currency?: string
  intervalDays?: number
  isActive?: boolean
  stripePriceId?: string
}
```

**Response 200** — updated plan

**Errors** — `404`

---

### `DELETE /admin/subscription-plans/:id`

**Response 204** — no body

**Errors** — `404`

---

## Common HTTP status codes

| Code | Meaning |
|------|---------|
| `200` | OK |
| `201` | Created |
| `204` | No Content (delete / logout / cancel success) |
| `400` | Bad Request — e.g. expired reset token |
| `401` | Unauthorized — missing/invalid/expired token, wrong password, or revoked token |
| `403` | Forbidden — authenticated but insufficient role or no active subscription |
| `404` | Not found (or not owned by you) |
| `409` | Conflict — e.g. snapshot for today already exists, member already in group |
| `422` | Validation error — `fieldErrors` contains field-level messages |
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

## Subscription & group discount lifecycle

```
POST /auth/register
  → trial subscription created (status: "trial", trialEndsAt = now + trial_days)

Any protected endpoint (requireSubscription middleware)
  → checks status and expiry dates
  → if trial expired → status updated to "expired" → 403 returned

POST /groups/:id/members  or  DELETE /groups/:id/members/:userId
  → recalculates discount for all group members
  → if activeMembers >= minMembers (from AppConfig): discountPercent = group_discount_percent
  → otherwise: discountPercent = 0

Effective plan price = priceAmount × (1 - discountPercent / 100)
```

---

## Notes for frontend integration

- **Paginated list responses** return `{ items, total, page, limit }` inside `data`. Use `total` and `limit` to compute `totalPages = Math.ceil(total / limit)` and determine whether a "load more" / next page is available.
- **Decimal fields** (`amount`, `targetAmount`, `currentAmount`, `monthlyAmount`, `expectedReturn`, `priceAmount`, `discountPercent`) are returned as **strings** to preserve precision. Parse with `parseFloat()` or a decimal library as needed.
- **Date fields** are returned as ISO 8601 strings. Dates sent to the API must be `"YYYY-MM-DD"` for date-only fields and full ISO datetime (e.g. `"2026-02-19T10:30:00.000Z"`) for datetime fields.
- **`user.role` on login** — use this field to conditionally show admin UI sections without an extra API call.
- **Soft deletes** — deleted roles and categories are excluded automatically. There is no restore endpoint.
- **Ownership** — user-scoped resources return `404` (not `403`) when the resource does not belong to the authenticated user, to avoid leaking resource existence.
- **Snapshot uniqueness** — only one snapshot per calendar day (UTC). Check `GET /snapshots/today` before attempting `POST /snapshots`.
- **Habit log idempotency** — `POST /habits/:id/logs` is safe to call multiple times for the same date — it will update the existing entry.
- **Category ownership** — `GET /categories` returns globals + user's own. Use `userId === null` to distinguish global from personal categories in the UI.
- **Group discount** — `discountPercent` in `GET /subscriptions/me` reflects the current applied discount. Compute effective price as `priceAmount × (1 - discountPercent / 100)`.
- **Share inclusion** — `PATCH /groups/:id/expenses/:expenseId/shares/:shareId/include` is a one-time action. Once `transactionId` is set, the endpoint returns `409`. Check `includeInPersonal` before showing the button.
- **Subscription guard** — endpoints protected by `requireSubscription` return `403` with message `"Subscription required. Your trial or plan has expired."` when the user has no active/trial subscription. Redirect to a paywall screen on this error.
- **User lookup for groups** — use `GET /users/lookup?email=...` to resolve an email to a `userId` before calling `POST /groups/:id/members`. Returns `404` if the email is not registered.
- **Dashboard year** — `byMonth` always covers all 12 months of the year derived from the `month` param (e.g. `month=2025-08` → Jan–Dec 2025). Months without transactions return `"0"` for all amounts — safe to use directly for charts without null-checks.
