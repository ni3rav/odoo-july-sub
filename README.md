# TransitOps

Smart transport operations platform for managing fleet assets, driver compliance, trip dispatch, maintenance, fuel and expense tracking, and operational analytics.

Built for logistics teams that need a single place to register vehicles, assign trips, enforce business rules (capacity limits, license expiry, status transitions), and monitor KPIs — replacing spreadsheets and manual logbooks.

## Features

- **Authentication** — email/password via Better Auth, with demo sandbox sign-in per role
- **RBAC** — four roles (Fleet Manager, Dispatcher, Safety Officer, Financial Analyst) with a module × action permission matrix
- **Fleet registry** — vehicle CRUD with status tracking (`Available`, `OnTrip`, `InShop`, `Retired`)
- **Driver management** — profiles, license details, safety scores
- **Trip dispatch** — five-state lifecycle (`Draft` → `Dispatched` → `InTransit` → `Completed` / `Cancelled`) with server-side validation
- **Maintenance** — service records with automatic vehicle status transitions
- **Fuel & expenses** — operational cost logging and inventory tracking
- **Dashboard & analytics** — fleet KPIs, charts, CSV export
- **Settings** — profile management and RBAC matrix editor

See [docs/prd.md](docs/prd.md) for the full product spec and [docs/plan.md](docs/plan.md) for the implementation plan.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16, React 19 |
| API | Elysia + Eden Treaty |
| Auth | Better Auth (email/password) |
| Database | Drizzle ORM + PostgreSQL (Docker) |
| UI | shadcn/ui, Tailwind CSS, TanStack Query |
| Validation | Zod, react-hook-form |

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/) (for PostgreSQL)
- [Bun](https://bun.sh/) (for `pnpm db:seed` only)

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/ni3rav/odoo-july-sub
xcd odoo-july-sub
pnpm install
```

### 2. Environment variables

Copy the example env file and adjust if needed:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `development` |
| `DATABASE_URL` | Postgres connection string (default: `postgresql://user:password@localhost:54321/next_template`) |
| `BETTER_AUTH_SECRET` | Random secret for session signing |
| `BETTER_AUTH_URL` | App URL (default: `http://localhost:3000`) |
| `NEXT_PUBLIC_APP_URL` | Same as `BETTER_AUTH_URL` for client-side API calls |

### 3. Start PostgreSQL

```bash
pnpm db:up
```

Postgres runs on port **54321** via Docker Compose.

### 4. Apply schema

```bash
pnpm db:push
```

Or generate and run migrations:

```bash
pnpm db:generate
pnpm db:migrate
```

### 5. Seed roles, permissions, and demo data

```bash
pnpm db:seed
```

This seeds four RBAC roles, the default permission matrix, and demo fleet data (Van-05, driver Alex).

### 6. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### 7. Sign in

Use the **Quick Sandbox Sign-In** buttons on the sign-in page, or sign in manually:

| Role | Email | Password |
|------|-------|----------|
| Fleet Manager | `fleetmanager@transitops.com` | `password123` |
| Dispatcher | `dispatcher@transitops.com` | `password123` |
| Safety Officer | `safetyofficer@transitops.com` | `password123` |
| Financial Analyst | `financialanalyst@transitops.com` | `password123` |

Demo users are created via `POST /api/auth/demo-setup` and assigned the correct `roleId` automatically.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Production build |
| `pnpm typecheck` | TypeScript check |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier |
| `pnpm db:up` | Start Postgres container |
| `pnpm db:down` | Stop Postgres container |
| `pnpm db:push` | Push Drizzle schema to database |
| `pnpm db:generate` | Generate SQL migrations |
| `pnpm db:migrate` | Run migrations |
| `pnpm db:seed` | Seed roles, permissions, demo data (requires Bun) |
| `pnpm db:studio` | Open Drizzle Studio |

## Project Structure

```
app/
├── (app)/                  # Authenticated pages (sidebar layout)
│   ├── dashboard/
│   ├── fleet/
│   ├── drivers/
│   ├── trips/
│   ├── maintenance/
│   ├── fuel/
│   ├── analytics/
│   └── settings/
├── sign-in/                # Auth pages
├── sign-up/
└── api/[[...slugs]]/       # Elysia API catch-all

modules/                    # Feature modules
├── auth/
├── rbac/
├── fleet/
├── trips/
├── operations/
├── reports/
└── profile/

db/
├── schema/                 # Drizzle tables, enums, constants
├── seed.ts                 # Database seeder
└── index.ts

middleware/                 # Elysia auth + RBAC guards
docs/                       # PRD, plan, ADRs, agent config
.scratch/transitops/        # Local issue tracker + spec
```

## API Overview

All routes are mounted under `/api`:

| Prefix | Module |
|--------|--------|
| `/api/auth/*` | Better Auth + demo setup |
| `/api/profile` | User profile |
| `/api/rbac` | Roles and permission matrix |
| `/api/fleet` | Vehicle registry |
| `/api/trips` | Trip lifecycle |
| `/api/maintenance` | Maintenance records |
| `/api/operations` | Fuel, expenses, inventory |
| `/api/reports` | Dashboard KPIs and analytics |
| `/api/health` | Health check |

Protected routes require a valid session cookie and the appropriate RBAC permission.

## Agent Instructions

Before making changes, read [AGENTS.md](AGENTS.md) for coding conventions. Domain language lives in [CONTEXT.md](CONTEXT.md); architectural decisions in [docs/adr/](docs/adr/).
