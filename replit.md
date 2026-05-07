# Imparables SA

Sistema web completo para la empresa Imparables SA — distribución de productos naturistas. Incluye landing page pública y sistema de gestión interno (vendedores, clientes, productos, ventas).

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/imparables run dev` — run the frontend (port 18770)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui + Wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/` — DB schema: vendedores.ts, clientes.ts, productos.ts, ventas.ts
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/imparables/src/pages/` — React pages: landing, dashboard, registrar, listas, editar
- `artifacts/imparables/src/components/layout.tsx` — Sidebar/Layout component
- `vercel.json` — Vercel SPA deploy config (root level)

## Architecture decisions

- OpenAPI-first: spec gates codegen → typed React Query hooks + Zod validation schemas
- Drizzle ORM with PostgreSQL for type-safe DB access
- Client-side routing (Wouter) with Vercel SPA rewrites for clean URLs on deploy
- All routes under `/api` prefix handled by the shared Express API server
- `lib/api-zod/src/index.ts` exports only from `./generated/api` (not `./generated/types`) to avoid duplicate export conflicts

## Product

- **Landing page** (`/`): Public face of Imparables SA with hero, products, and CTA to the system
- **Dashboard** (`/dashboard`): Resumen general — totales de vendedores, clientes, productos, ventas, monto del mes
- **Registrar** (`/registrar`): 4 subforms — Vendedor, Cliente+Dirección, Producto, Venta
- **Listas** (`/listas`): Datos (clientes, vendedores, productos, ventas) + Reportes por rango de fechas
- **Editar** (`/editar`): Modificar y Eliminar — Clientes, Vendedores, Productos, Ventas

## Brand colors

- `#2D4654` — Azul profundo (primary dark)
- `#24958C` — Verde teal (primary accent)
- `#EDC665` — Dorado (CTA/highlight)
- `#F1A36A` — Naranja cálido (secondary accent)
- `#E6745A` — Coral (danger/alert)

## User preferences

- Siempre crear `vercel.json` en la raíz para SPA con Vite (`framework: "vite"`, `outputDirectory: "dist/public"`, rewrite `/(.*) → /index.html`)
- Idioma: Español

## Gotchas

- After `pnpm --filter @workspace/api-spec run codegen`, manually fix `lib/api-zod/src/index.ts` to only export `./generated/api` (orval regenerates it with both exports causing TS2308 conflicts)
- Always run codegen before building backend routes (Zod schema names come from codegen output)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
