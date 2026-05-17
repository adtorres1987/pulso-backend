# Pulso Backend — Project Context

**Pulso** is a bilingual (es/en) personal finance API. It helps users track income/expenses, build saving habits, set goals, and manage group expenses — all gated behind a subscription with a configurable trial period.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js + TypeScript (`tsx` watch, NOT ts-node-dev) |
| Framework | Express |
| ORM | Prisma + PostgreSQL |
| Auth | JWT (`jsonwebtoken`) + Redis token blacklist |
| Validation | Zod |
| Infrastructure | Docker Compose (Postgres on port **5433**, Redis on **6379**) |

---

## Quick Start

```bash
# 1. Copy and fill in environment variables
cp .env.example .env

# 2. Start infrastructure
docker compose up -d

# 3. Install dependencies
npm install

# 4. Run migrations and seed
npm run prisma:migrate    # prompts for a migration name
npm run prisma:seed       # seeds roles, permissions, and AppConfig defaults

# 5. Start dev server (hot reload)
npm run dev               # listens on PORT from .env (default 3000)
```

> **DB port**: local port **5433** (not 5432) to avoid conflicts. The `DATABASE_URL` in `.env` must use 5433.

---

## Architecture

Clean Architecture, organized by feature module. Each module lives in `src/modules/<name>/` and has four layers that depend inward only:

```
domain/          → interfaces and result types — no framework imports
application/     → use cases (one class per operation) + Zod DTOs
infrastructure/  → Prisma repository implementations
presentation/    → Express routes, validators, controller
```

See `CLAUDE.md` for layer-by-layer patterns (controller shape, error handling, DI wiring).

---

## Domain Model

### Users & Auth

- `User` — core identity: email, passwordHash, language, timezone, roleId
- `Person` — profile data (firstName, lastName, phone, etc.) — 1:1 with User
- `Role` / `Permission` / `RolePermission` — RBAC. Roles: `super_admin`, `admin`, `support`, `user`
- `PasswordResetToken` — short-lived token for email-based password reset

### Subscriptions

- `SubscriptionPlan` — admin-managed plans with `priceAmount`, `currency`, `intervalDays`, `stripePriceId`
- `Subscription` — one per user (unique `userId`). Statuses: `trial → active → expired | cancelled`
  - `trialEndsAt` — set at registration from `AppConfig.trial_days`
  - `discountPercent` — group discount applied automatically (see Groups)
  - `stripeSubscriptionId` — reserved for Stripe integration
- `AppConfig` — key/value global config. Current keys:
  - `trial_days` (default `30`) — trial length for new registrations
  - `group_discount_percent` (default `10`) — discount applied when group threshold is met

### Transactions & Categories

- `Transaction` — income or expense, linked to a `User`, optional `Category`, optional `DailySnapshot`, optional `GroupExpenseShare`
- `Category` — global (`userId: null`, admin-managed) or personal (`userId` set, requires subscription)
  - Name uniqueness is enforced against globals + user's own categories (case-insensitive)

### Daily Snapshots

- `DailySnapshot` — one per user per day. Records mood, reflection, and a conscious-spending score (1–10). Transactions can be linked to a snapshot.

### Habits

- `Habit` — recurring task with frequency `daily | weekly`
- `HabitLog` — one entry per habit per day (upsert). Unique on `(habitId, date)`.

### Saving Goals & Investment Profiles

- `SavingGoal` — tracks `targetAmount` / `currentAmount` with atomic deposits
- `InvestmentProfile` — strategy (`conservative | balanced | long_term`), `monthlyAmount`, `expectedReturn`

### Groups & Group Expenses

- `Group` — created by an owner; members are tracked via `GroupMember`
- `GroupMember` — role `owner | member`. Unique on `(groupId, userId)`.
- `GroupExpense` — a shared expense paid by one member, split into shares
- `GroupExpenseShare` — one share per member per expense. Can be linked to a personal `Transaction` (one-time action via `PATCH .../shares/:shareId/include`)

**Group discount logic**: when a member is added or removed, `syncGroupDiscounts` recounts active/trial members. If count ≥ threshold (hardcoded `3` currently), all members' `discountPercent` is set to `group_discount_percent` from AppConfig; otherwise reset to `0`.

---

## Business Rules

| Rule | Where enforced |
|------|---------------|
| Trial subscription created on register | `RegisterUserUseCase` → `CreateTrialSubscriptionUseCase` |
| Trial auto-expires on next protected request | `requireSubscription` middleware |
| Personal categories require active subscription | `requireSubscription` on `POST/PATCH/DELETE /categories` |
| Category name unique vs globals + user's own | `existsByName` in `PrismaCategoryRepository` |
| Group operations require active subscription | `requireSubscription` on all `/groups` routes |
| Only group owner can add/remove members, rename, delete group | `AddGroupMemberUseCase`, `RemoveGroupMemberUseCase`, etc. |
| Share → personal transaction is one-time | `transactionId` unique constraint on `GroupExpenseShare` |
| Discount recalculated on member add/remove | `syncGroupDiscounts` called from `Add/RemoveGroupMemberUseCase` |

---

## API Surface

Base: `/api/v1/`

| Prefix | Auth | Description |
|--------|------|-------------|
| `/auth` | public / bearer | Register, login, logout, refresh, password reset |
| `/me` | bearer | Own profile + password change |
| `/subscriptions/me` | bearer | View and cancel own subscription |
| `/categories` | bearer | List global + personal; user CRUD requires subscription |
| `/transactions` | bearer | Income/expense CRUD, filterable |
| `/snapshots` | bearer | Daily mood/spending check-in |
| `/saving-goals` | bearer | Goal CRUD + deposit |
| `/habits` | bearer | Habit CRUD + log entries |
| `/investment-profiles` | bearer | Investment strategy profiles |
| `/groups` | bearer + subscription | Group CRUD, members, shared expenses |
| `/admin/users` | admin+ | List/update/reset client users |
| `/admin/app-config` | admin+ | Read/update global config keys |
| `/admin/subscription-plans` | admin+ | Plan CRUD |
| `/roles` | admin+ | Role CRUD |
| `/permissions` | bearer | Permission CRUD |

Full request/response shapes → `API_REFERENCE.md`.

---

## Key Files

```
src/app.ts                          — route registration
src/config/prisma.ts                — singleton Prisma client
src/middlewares/auth.ts             — JWT verify + Redis blacklist → req.userId
src/middlewares/authorize.ts        — role-based guard HOF
src/middlewares/requireSubscription.ts — subscription guard (trial/active check)
src/middlewares/errorHandler.ts     — AppError class + global error handler
src/types/index.ts                  — AuthRequest (Request + userId?)
src/utils/response.ts               — sendSuccess(res, data, statusCode?, message?)
prisma/schema.prisma                — full domain schema
prisma/seed.ts                      — seeds roles, permissions, AppConfig
```

---

## Prisma Workflow

```bash
# After editing prisma/schema.prisma:
npm run prisma:migrate    # creates migration file + applies it
npm run prisma:generate   # regenerates Prisma client (needed after type changes)
npm run prisma:studio     # GUI at localhost:5555 — inspect/edit data
```

> If Postgres rejects connection with `P1010`, run `docker compose down -v` to reset the volume.

---

## Environment Variables

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | ✓ | PostgreSQL connection string (port 5433 locally) |
| `JWT_SECRET` | ✓ | Min 16 chars |
| `JWT_EXPIRES_IN` | ✓ | e.g. `7d` |
| `REDIS_URL` | ✓ | e.g. `redis://localhost:6379` |
| `CORS_ORIGIN` | ✓ | Frontend origin e.g. `http://localhost:5173` |
| `SMTP_*` | optional | Nodemailer config for password-reset emails |
| `FRONTEND_URL` | optional | Used in reset-password email link |
