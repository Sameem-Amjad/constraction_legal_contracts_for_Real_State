# ConstrAction

Production rebuild of constraction.ca — bilingual (EN/FR) Quebec construction
contract generator. Replaces the old GHL + embedded-HTML hybrid with a fully
custom Next.js 15 + Supabase + Stripe codebase.

## Stack

- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript 5
- **Styling**: Tailwind CSS + shadcn/ui (New York, CSS variables)
- **i18n**: next-intl (`/en/...`, `/fr/...`)
- **Auth + DB + Storage**: Supabase
- **Billing**: Stripe Checkout + Customer Portal + Webhooks
- **PDF**: `@react-pdf/renderer` (server-only)
- **Email**: Supabase Edge Functions (Deno + nodemailer over Gmail SMTP)

## Getting started

### 1. Install

```bash
pnpm install
```

### 2. Configure environment

Copy `.env.example` → `.env.local` and fill in real values:

```bash
cp .env.example .env.local
```

Required keys are listed in `.env.local` with inline notes.

### 3. Apply Supabase migrations

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

This runs the four migrations under `supabase/migrations/` in order:

1. `00001_initial_schema.sql` — tables, indexes, auth trigger
2. `00002_rls_policies.sql` — row-level security
3. `00003_storage_policies.sql` — `logos`, `contracts`, `company-images` buckets
4. `00004_stripe_idempotency.sql` — webhook dedup table

### 4. Set Edge Function secrets

```bash
supabase secrets set \
  SMTP_USER=roy@constraction.ca \
  SMTP_PASSWORD=<gmail-app-password> \
  SUPABASE_SERVICE_ROLE_KEY=<service-role> \
  STRIPE_SECRET_KEY=<stripe-secret> \
  NEXT_PUBLIC_SITE_URL=https://constraction.ca \
  CONSTRACTION_GST_NUMBER=<your-gst-number> \
  CONSTRACTION_QST_NUMBER=<your-qst-number>
```

### 5. Deploy Edge Functions

```bash
supabase functions deploy construction-send-welcome
supabase functions deploy construction-send-contract
supabase functions deploy construction-send-receipt
supabase functions deploy construction-send-cancellation
supabase functions deploy construction-cancel-subscription
```

### 6. Run dev server

```bash
pnpm dev
```

Open <http://localhost:3000> — it redirects to `/en` by default.

### 7. Forward Stripe webhooks (local)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhooks
```

Copy the printed `whsec_...` into `.env.local` as `STRIPE_WEBHOOK_SECRET`.

### 8. Generate Supabase types (after migrations)

```bash
pnpm supabase:gen-types
```

## Project layout

```
app/                  Next.js App Router
  [locale]/           Localized public + auth-gated routes
    (marketing)/      Public pages (home, pricing, login, signup, …)
    (app)/            Auth-gated (dashboard, profile, contracts, checkout)
  admin/              Admin panel (no locale prefix; role='admin' guarded)
  api/                Route handlers
components/           shadcn/ui + layout + shared + wizard + admin
lib/
  supabase/           Browser, server (RSC), service-role clients
  stripe/             SDK + webhook handler
  pdf/                @react-pdf/renderer documents (CC, GC)
  validations/        Zod schemas (auth, profile, wizard)
  i18n/               next-intl helpers
  tax.ts              GST/QST math
  utils.ts            cn(), formatCurrency(), formatDate()
locales/              en.json, fr.json
supabase/
  migrations/         SQL migrations (4 files)
  functions/          Deno Edge Functions (5 senders)
middleware.ts         next-intl + auth guard
i18n.ts               next-intl request config
```

## Acceptance criteria

See section 21 of `development.md` for the full checklist. The build is not
considered complete until every item passes — guest EN flow, guest FR flow,
authenticated flows, payment failure handling, webhook idempotency, FR/EN PDF
generation, etc.

## Disclaimer

ConstrAction Inc. provides automated document generation tools and does not
offer legal advice, legal opinions, or legal representation.
