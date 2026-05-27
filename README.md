# Full Ecommerce — Production-ready Next.js template

A complete ecommerce starter with admin panel, real-time stock, orders, and email notifications. Built on the Vercel ecosystem — one-click deploy, no server to manage.

## Stack

- **Next.js 16** + React 19 + TypeScript + Tailwind v4
- **Neon Postgres** (via Vercel integration) + **Drizzle ORM**
- **Clerk** for admin authentication
- **Vercel Blob** for image storage
- **Resend** + **React Email** for transactional emails
- **Stripe** for payments
- **shadcn/ui** + dnd-kit + TanStack Query/Table

---

## How you got this code

You purchased access via [itsmatias.com](https://itsmatias.com). You should have:

1. **Created your own repo from this template.** On this repo's GitHub page, click **"Use this template" → "Create a new repository"** to make `your-username/my-store` (or whatever name you want). Your repo, your code, no shared history.
2. **Or cloned directly** if you prefer: `git clone <this-repo-url> my-store && cd my-store && rm -rf .git && git init`.

From here on, the README assumes you're working in your own copy.

## One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmzanan%2Ffull-ecommerce&project-name=my-store&repository-name=my-store&stores=%5B%7B%22type%22%3A%22postgres%22%7D%2C%7B%22type%22%3A%22blob%22%7D%5D&integration-ids=oac_jUduyjQgOyzev1fjrW83NYOv,oac_VqOgBHqhEoFTPzGkPd7L0iH6)

> Replace `mzanan` in the button URL above with your GitHub username after you create your own copy (or Vercel will clone the original).

The button provisions:
- A Neon Postgres database (auto-fills `POSTGRES_URL`)
- A Vercel Blob store (auto-fills `BLOB_READ_WRITE_TOKEN`)
- The Clerk integration (prompts for sign-in)
- The Resend integration (prompts for sign-in)

You still need to:
- Set up Stripe manually (see step 3 below)
- Run the initial database migration (see step 4)
- Configure the Clerk webhook (see step 1)

## Edit with v0

[v0.dev](https://v0.dev) can iterate on the UI with AI. Open v0, paste your repo URL, ask for changes ("change the hero to a fullscreen video", "swap the product grid to a mosaic"). It commits back to your repo as a PR. Works on any component file under `src/components/`.

---

## Local setup

```bash
git clone <your-fork-url>
cd full-ecommerce
npm install
cp .env.example .env.local
```

Fill in `.env.local` with the values listed in [Manual setup](#manual-setup) below.

### Database migrations

```bash
npm run db:push      # apply schema to the database
npm run db:seed      # populate with 10 demo products
npm run db:studio    # GUI to inspect the database
```

### Development

```bash
npm run dev          # start dev server on localhost:3000
npm run build        # production build
npm run lint
```

---

## Manual setup

### 1. Clerk

1. Create an application at [clerk.com](https://clerk.com).
2. Copy the **Publishable key** to `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and the **Secret key** to `CLERK_SECRET_KEY`.
3. Under **Webhooks**, add an endpoint pointing to `https://YOUR_DOMAIN/api/webhooks/clerk` with events `user.created`, `user.updated`, `user.deleted`. Copy the **Signing secret** to `CLERK_WEBHOOK_SECRET`.
4. Under **User & Authentication → Restrictions**, disable public sign-ups so only invited admins can register.

Every Clerk user is mirrored to the `admin_users` table by the webhook. There is no separate admin role — being in Clerk = being an admin. Lock down sign-ups in step 4.

### 2. Resend

1. Create an account at [resend.com](https://resend.com) and verify a sending domain.
2. Generate an API key and set `RESEND_API_KEY`.
3. Set `RESEND_FROM_EMAIL` to a verified address (e.g. `orders@yourdomain.com`).
4. Optionally set `SUPPORT_EMAIL` — appears in the order confirmation email.

### 3. Stripe

1. Create an account at [stripe.com](https://stripe.com). If your country does not support Stripe directly, [Stripe Atlas](https://stripe.com/atlas) lets you incorporate a US LLC remotely.
2. Copy keys from the dashboard:
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY`
3. Set up a webhook endpoint at `https://YOUR_DOMAIN/api/webhooks/stripe` listening for `payment_intent.succeeded`, `payment_intent.payment_failed`. Copy the signing secret to `STRIPE_WEBHOOK_SECRET`.
4. Sync your products to Stripe from the admin panel (Settings → Stripe Sync) once you've added products.

### 4. Database

After deploy:

```bash
npx vercel env pull .env.local   # fetch Postgres URL locally
npm run db:push                  # apply schema
npm run db:seed                  # (optional) demo data
```

### 5. Customize branding

Set the `NEXT_PUBLIC_STORE_*` env vars to change the store name, title, description, contact, and category labels. No code changes needed.

If you want to dig deeper into the look (colors, fonts, hero copy), edit:
- `src/app/global.css` — Tailwind theme variables
- `src/config/brand.ts` — defaults if you don't want env vars
- `src/components/ecommerce/home/Home/Home.tsx` — homepage layout

---

## What's in the box

- **Public store** — product listing, sets/collections, product detail, cart, checkout
- **Admin panel** — products CRUD, categories, sets, hero, page components, homepage layout, size guides, country shipping prices, dashboard with orders
- **Stock management** — real-time stock checks at add-to-cart and checkout
- **Country-based shipping** — set prices per country with delivery estimates
- **Stripe integration** — payment intents, webhooks, automatic order creation, product sync
- **Order emails** — automated confirmation email on order placed, status updates on shipping
- **SEO** — generated metadata, OpenGraph images, structured data

## Project structure

```
src/
  app/                # Next.js App Router
    (main)/           # Public store routes
    admin/            # Admin panel routes
    api/              # API routes + webhooks
  components/         # React components
  db/                 # Drizzle schema + client
  lib/
    actions/          # Server actions
    auth/             # Clerk integration helpers
    db/               # DB selectors (snake_case mapping)
    email/            # Resend + React Email templates
    helpers/          # Storage, product, shipping helpers
    queries/          # Read queries (server)
    schemas/          # Zod validation schemas
  emails/             # React Email templates
  middleware.ts       # Clerk middleware
scripts/
  seed.ts             # Demo data generator
drizzle.config.ts     # Drizzle Kit config
```

## License

Commercial license — see [LICENSE](./LICENSE) and the full terms at [itsmatias.com/terms](https://itsmatias.com/terms).

Quick version: you can use, modify, and deploy this on unlimited projects you own. You cannot resell or redistribute the source code as a stand-alone product. The footer attribution "Built by Matias Zanan" stays unless you buy the [Remove Attribution add-on](https://buy.polar.sh/polar_cl_mK3kO9gASJE62I0Udu2QOgaBFpvHK2wERyVOP43h2YW). See the [Attribution section in LICENSE](./LICENSE) for the full clause and the consequences of removing it without the add-on.
