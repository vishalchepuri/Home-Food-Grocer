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

## Auth (Clerk)

- Provider: Clerk (Replit-managed). Required env vars: `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY` (and optionally `VITE_CLERK_PROXY_URL`).
- API server: `clerkMiddleware()` populates `req.auth`. `loadUser` middleware in `artifacts/api-server/src/middlewares/auth.ts` resolves the Clerk user and sets `req.userId` + `req.isAdmin` (admin = `publicMetadata.role === "admin"` OR email in `ADMIN_EMAILS` env var).
- Frontend: `<ClerkProvider>` with shadcn theme + warm-orange variables. Routes: `/sign-in/*?`, `/sign-up/*?`. Wouter `routerPush`/`routerReplace` strip the artifact base path.
- Admin bootstrap: when no admin exists yet, the first signed-in user can claim admin via `POST /api/me/claim-admin` (UI button on `/admin` gate page).
- Orders: `userId` column is nullable; anonymous checkout still works via `deviceId`. When signed in, both ids are stored and `GET /api/orders` returns orders matching either.

## Artifacts

- **`artifacts/api-server`** — Express 5 API server. Routes: catalog, dashboard, orders, payments, `/me`, `/me/claim-admin`, `/admin/*` (stats, orders + status, chef CRUD, product CRUD). Clerk middleware mounted before `/api`. Mock payment endpoint: even-last-digit cards succeed, odd fail.
- **`artifacts/homebites`** (web, mounted at `/`) — Swiggy-inspired marketplace for home-cooked meals + groceries. React + Vite + wouter + TanStack Query + framer-motion + Clerk. Cart in localStorage (deviceId). Storefront pages: home, chefs/:id, groceries, products/:id, search, cart, checkout (COD or simulated card, with promo codes), orders, orders/:id (with reorder), favorites. Auth pages: `/sign-in`, `/sign-up`. Admin portal: `/admin` (dashboard, orders, chefs, products) — gated on `me.isAdmin`.
- City picker: `LocationProvider`/`useLocationCity` (`use-location.tsx`) backs the header city dropdown with localStorage key `homebites:city` (default Hyderabad).
- Favorites: `FavoritesProvider`/`useFavorites` (`use-favorites.tsx`) persists to `homebites:favorites`. `<FavoriteButton />` appears on chef/dish/product cards. `/favorites` page lets users re-add items to cart.
- Promo codes: `POST /api/promos/validate` validates against the cart and returns `{valid, code, label, discount, message}`. Codes: `WELCOME50` (50% off, max ₹100), `FREESHIP` (free delivery if subtotal ≥ ₹299), `HOMECHEF75` (₹75 off if has dish AND subtotal ≥ ₹399). Checkout applies the discount; the order persists `discount` and `promoCode` columns.
- **`artifacts/mockup-sandbox`** — design canvas, unused for HomeBites delivery.

## Database

PostgreSQL via Drizzle. Schemas: `categories`, `chefs`, `dishes`, `products`, `offers`, `orders` (jsonb items + address). Seed via `pnpm --filter @workspace/scripts run seed`.
