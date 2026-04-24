# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

- **`artifacts/api-server`** — Express 5 API server. Routes: catalog (categories, chefs, dishes, products, search), dashboard (featured chefs, popular dishes, grocery essentials, offers), orders, payments. Mock payment endpoint: card numbers ending in even digit succeed, odd fail.
- **`artifacts/homebites`** (web, mounted at `/`) — Swiggy-inspired marketplace for home-cooked meals + groceries. React + Vite + wouter + TanStack Query + framer-motion. Cart stored in localStorage; deviceId acts as the user identity (no auth). Pages: home, chefs/:id, groceries, products/:id, search, cart, checkout (COD or simulated card), orders, orders/:id.
- **`artifacts/mockup-sandbox`** — design canvas, unused for HomeBites delivery.

## Database

PostgreSQL via Drizzle. Schemas: `categories`, `chefs`, `dishes`, `products`, `offers`, `orders` (jsonb items + address). Seed via `pnpm --filter @workspace/scripts run seed`.
