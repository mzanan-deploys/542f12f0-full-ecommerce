# DB migration notes — Supabase → Drizzle + Vercel Postgres

Resumen de lo que cambió respecto al codebase NOIR original (`personal/ecommerce/supabase/migrations/`). Esto es referencia para refactorizar el código de queries/server-actions/RPCs.

## Schema (001_initial_schema.sql)

Migrado tal cual a `schema.ts`. Excepciones:

| SQL original | Drizzle equivalente |
|---|---|
| `REFERENCES auth.users(id)` | `text("user_id")` sin FK. El valor es el `userId` que devuelve Clerk (ej `user_2abc...`). |
| `admin_users.id` UUID FK auth.users | `text("id")` Clerk userId. Mirror row creado vía Clerk webhook (`src/app/api/webhooks/clerk/route.ts`, pendiente). |
| `BEFORE UPDATE` trigger sobre `updated_at` | `$onUpdate(() => new Date())` en la columna `updatedAt`. |
| `gen_random_uuid()` | `defaultRandom()` en `uuid().primaryKey().defaultRandom()`. |
| Triggers `update_*_updated_at` (12 triggers) | Eliminados. Drizzle `$onUpdate` los reemplaza. |

## RLS (002_rls_policies.sql) → app-level authz

Vercel Postgres usa Postgres estándar sin RLS. Toda authz pasa a app code con Clerk.

Helpers nuevos en `src/lib/auth/authz.ts`:
- `getCurrentUserId()` — devuelve `userId` o null.
- `requireAuth()` — throws `UNAUTHENTICATED` si no hay user.
- `isAdmin(userId)` — query a `admin_users`.
- `requireAdmin()` — throws `FORBIDDEN` si no es admin.

Patrones de migración por tabla:

| RLS policy original | Equivalente app-level |
|---|---|
| `Public can view X` | Sin check, la query corre normal. |
| `Public can view active X` (`is_active = true`) | Query filtra `where(eq(table.isActive, true))`. |
| `Admins can manage X` | Server action / API route llama `await requireAdmin()` antes de mutate. |
| `Users can view their own orders` | Query filtra `where(eq(orders.userId, await requireAuth()))`. También permite buscar por `shipping_email` matching el email del user. |
| Storage policies (`Admins can upload/view/delete files`) | API routes que manejan `@vercel/blob` `put()/del()` llaman `requireAdmin()` antes. |

## Triggers/functions/RPCs (003-008)

| Migration | Contenido | Plan post-refactor |
|---|---|---|
| 003_functions_and_triggers.sql | Functions custom + triggers de business logic | Mover a server actions / `src/lib/queries/`. Caso por caso. |
| 004_additional_rpc_functions.sql | RPC functions complejas (probablemente agregations, joins) | Re-escribir como Drizzle queries. Algunas pueden quedar como funciones SQL si performance lo justifica. |
| 005_stock_management.sql | Stock decrement post-order | Server action en `saveOrderAction` (ya existe en el codebase). Confirmar que la lógica DB-side no era el único guard. |
| 006_order_email_triggers.sql | Trigger SQL que dispara email | Eliminado. Reemplazo: en server action `saveOrderAction`, después del insert, llamar a `sendOrderConfirmationEmail()` que usa Resend. |
| 007_sync_admin_users_from_auth.sql | Sync admin_users con auth.users | Reemplazo: Clerk webhook handler en `src/app/api/webhooks/clerk/route.ts` que inserta/updatea/elimina rows en `admin_users` cuando Clerk emite `user.created`/`user.updated`/`user.deleted`. |
| 008_create_homepage_layout_orders_function.sql | RPC para batch update de homepage layout (drag-and-drop reorder) | Server action que recibe array de items + posiciones, hace transaction con múltiples updates. |

## Storage (Supabase Storage → Vercel Blob)

Cambios necesarios en el código del app:

| Supabase | Vercel Blob |
|---|---|
| `supabase.storage.from(bucket).upload(path, file)` | `put(pathname, file, { access: 'public' })` |
| `supabase.storage.from(bucket).getPublicUrl(path)` | El `put()` devuelve `{ url }` directo. |
| `supabase.storage.from(bucket).remove(paths)` | `del(urls)` con array de URLs. |
| URLs `supabase.../storage/...` | URLs `*.public.blob.vercel-storage.com/...` |

Helpers a crear: `src/lib/storage/uploadImage.ts`, `src/lib/storage/deleteImage.ts` que wrapean `@vercel/blob`.

## Edge Functions

| Supabase Edge Function | Reemplazo |
|---|---|
| `supabase/functions/send-order-confirmation` | Server action `sendOrderConfirmationEmail()` en `src/lib/email/sendOrderConfirmation.ts` usando Resend + React Email template. |
| `supabase/functions/stripe-webhook` | API route ya existe en `src/app/api/webhooks/stripe/route.ts`. Solo hay que sacar las llamadas Supabase y usar Drizzle. |

## TODO en la próxima sesión

- [ ] Bajar package-lock con `npm install`.
- [ ] Correr `npm run db:push` contra una Vercel Postgres dev DB.
- [ ] Migrar los 62 archivos que importan `@supabase/*` a usar `db` de Drizzle + `requireAuth`/`requireAdmin` de authz.
- [ ] Crear Clerk middleware (`src/middleware.ts`) y borrar la version Supabase.
- [ ] Implementar webhook Clerk para sync admin_users.
- [ ] Migrar storage calls.
- [ ] Reemplazar SQL trigger del email post-order por server action + Resend.
- [ ] Re-escribir RPCs custom (003, 004, 008) como Drizzle queries / server actions.
- [ ] Borrar `supabase/` dir (migrations + functions + config.toml).
