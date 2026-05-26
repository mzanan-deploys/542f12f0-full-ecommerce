# CLAUDE.md — full-ecommerce

**Esto NO es NOIR.** Este repo es el **refactor sellable** del codebase NOIR, migrado a stack Path C (Vercel ecosystem) para distribuir como producto pago ($999) que el comprador deploya solo a su cuenta Vercel.

NOIR original sigue en `personal/ecommerce/` como demo público en `ecommerce.itsmatias.com`. Esto es la versión generic-template.

Contexto del producto y plan en `~/Documents/projects/personal/personal-brain/01-Projects/04-portfolio/{plan,tasks}.md`.

## Stack actual

Next 16 · React 19 · TypeScript · Tailwind v4 · **Drizzle ORM** · **Neon Postgres** (vía `@neondatabase/serverless` + `drizzle-orm/neon-http`) · **Clerk** (auth + admin webhook) · **Vercel Blob** (storage) · **Resend** + React Email (transactional) · **Stripe** (payments) · React Hook Form + Zod · Zustand · TanStack Query/Table · dnd-kit · svix (Clerk webhook signature verification).

## Estado del refactor (2026-05-25)

Migración Supabase → Path C **completa**. TS `tsc --noEmit` pasa con 0 errors.

- Schema en `src/db/schema.ts` (17 tablas + 3 enums, FK a Clerk userId vía `text`, sin RLS, `$onUpdate` en lugar de triggers).
- Auth: Clerk middleware en `src/middleware.ts`, webhook sync `admin_users` en `src/app/api/webhooks/clerk/route.ts`, helpers `requireAuth`/`requireAdmin` en `src/lib/auth/authz.ts`.
- Storage: helpers Vercel Blob en `src/lib/helpers/storageHelpers.ts`.
- Email: template React Email en `src/emails/OrderConfirmation.tsx`, sender en `src/lib/email/sendOrderConfirmation.ts`.
- Queries y server actions migradas a Drizzle. Selectors centralizados en `src/lib/db/selectors.ts` para mantener shape snake_case que el código original espera.

Branding parametrizado por env vars (`NEXT_PUBLIC_STORE_*`) — el codebase ya no tiene NOIR hardcoded.

## Lo que falta antes de lanzar

Ver `~/Documents/projects/personal/personal-brain/01-Projects/04-portfolio/tasks.md` sección "Pendientes para revisar 2026-05-26". Bloques:

- Decisiones de producto: attribution credit model, delivery mechanism al comprador, email lib final, estética visual (NOIR vs generic), free tier verification.
- Acciones de Matías: `git init` + push, reemplazar `YOUR_GITHUB_USERNAME` en el Vercel Deploy Button del README, provisión de Postgres real para correr `db:push`/`db:seed`/`build`, `npm run lint`.
- Polar dashboard cleanup post-pivot.

## Comandos

```bash
npm run dev          # dev server (turbopack)
npm run build        # production build
npm run lint         # eslint

npm run db:generate  # genera migrations desde schema
npm run db:migrate   # aplica migrations
npm run db:push      # push directo del schema (dev)
npm run db:studio    # GUI Drizzle
npm run db:seed      # 10 productos demo (Unsplash)
```

## Env vars

Ver `.env.example` para la lista completa. Grupos:

- **Vercel Postgres / Neon** (auto-provisioned por integration): `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`, `POSTGRES_PRISMA_URL`.
- **Clerk** (manual setup): `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`.
- **Vercel Blob** (auto-provisioned): `BLOB_READ_WRITE_TOKEN`.
- **Resend** (manual setup): `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `SUPPORT_EMAIL`.
- **Stripe** (manual setup): `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
- **Branding** (opcional, defaults genéricos): `NEXT_PUBLIC_STORE_NAME`, `NEXT_PUBLIC_STORE_TITLE`, etc.

## Paths críticos

- `src/db/schema.ts` — Drizzle schema.
- `src/db/index.ts` — Drizzle client (Neon HTTP).
- `src/lib/db/selectors.ts` — selectors snake_case ↔ camelCase Drizzle.
- `src/middleware.ts` — Clerk middleware.
- `src/app/api/webhooks/clerk/route.ts` — sync `admin_users`.
- `src/app/api/webhooks/stripe/route.ts` — Stripe payments.
- `src/lib/auth/{authz,serverAuth}.ts` — admin authz helpers.
- `src/lib/helpers/storageHelpers.ts` — Vercel Blob.
- `src/lib/email/sendOrderConfirmation.ts` + `src/emails/OrderConfirmation.tsx` — Resend.
- `src/config/brand.ts` — branding via env vars con fallbacks.
- `drizzle.config.ts` — Drizzle Kit config.
- `scripts/seed.ts` — demo data generator.

## Convenciones

- **No commits ni PRs sin confirmación explícita de Matías.**
- Validación de stock en server action antes de insertar order (`stockActions.ts` + `orderActions.ts`).
- RLS de Supabase ya no existe → toda authz pasa por `requireAuth()`/`requireAdmin()` en server actions y API routes.
- Triggers SQL ya no existen → email post-order es llamada explícita a `sendOrderConfirmationEmail()` en `saveOrderAction` y `updateOrderStatusAction`.
- DB output keys son snake_case (vía selectors) para minimal disruption del código consumidor; Drizzle internal usa camelCase.
