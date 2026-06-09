# CLAUDE.md — full-ecommerce

Refactor sellable del codebase NOIR (en `personal/ecommerce/`), white-label, Path C stack. Producto pago $990, self-deploy del comprador. Backlog en `~/Documents/projects/personal/personal-brain/01-Projects/04-portfolio/`.

## Stack

Next 16 · React 19 · TS · Tailwind v4 · Drizzle ORM · Neon Postgres (`@neondatabase/serverless` + `drizzle-orm/neon-http`) · Clerk · Vercel Blob · Resend + React Email · Stripe · RHF + Zod · Zustand · TanStack Query/Table · svix.

## Paths

- `src/db/{schema,index}.ts`, `src/lib/db/selectors.ts` (snake_case ↔ camelCase).
- `src/middleware.ts`, `src/lib/auth/{authz,serverAuth}.ts`.
- `src/app/api/webhooks/{clerk,stripe}/route.ts`.
- `src/lib/helpers/storageHelpers.ts` (Vercel Blob).
- `src/lib/email/sendOrderConfirmation.ts` + `src/emails/OrderConfirmation.tsx`.
- `src/config/brand.ts` (env-driven branding).
- `drizzle.config.ts`, `scripts/seed.ts`.

## Comandos

```bash
npm run dev / build / lint
npm run db:{generate,migrate,push,studio,seed}
```

## Convenciones

- Sin commits/PRs sin OK.
- Sin RLS — toda authz por `requireAuth()`/`requireAdmin()`.
- Email post-order = llamada explícita a `sendOrderConfirmationEmail()`.
- DB output keys snake_case via selectors; Drizzle internal camelCase.
- Validar stock en server action antes de insertar order.
