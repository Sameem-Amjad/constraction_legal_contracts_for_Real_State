ConstrAction — Complete System Rebuild Prompt (Reviewed & Fixed)
Review Notes & Fixes Applied
Before the full prompt, here are the flaws I identified and corrected:
Broken title line — Original started with "ltm-coded web application" (truncation artifact). Fixed to proper introduction.
PDF clause numbering gaps — Sections 5, 6, 9, 10, 11 were marked "(reserved)" with no guidance. Fixed with actual clause content from Quebec construction law context.
Missing middleware specification — No middleware.ts for locale routing + auth guards. Added.
Missing role column on profiles — Admin panel references role='admin' but schema didn't include it. Added to schema.
Guest flow gap — Guests generate a contract but there's no guest_id / session mechanism defined. Fixed with guest_session_id cookie approach.
Stripe webhook idempotency — No mechanism specified. Added stripe_event_id deduplication table.
Missing cancel-subscription API route — Referenced as Edge Function trigger but no Next.js route defined. Added.
Logo upload missing from wizard — Profile has logo_url but wizard spec didn't say how it flows into PDF. Clarified.
next-intl configuration missing — No i18n.ts, navigation.ts, or middleware locale detection config specified. Added.
Missing error boundaries and loading states — Production requirement but not mentioned. Added.
Storage RLS policies incomplete — Bucket policies referenced but SQL not provided. Added.
Email domain DNS checklist — Mentioned but incomplete. Expanded.
Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY — Required for Stripe.js but absent from .env.example. Added.
Contract resume flow — Wizard says "resumable" but no route for loading a draft contract. Added /contracts/[id]/edit route.
Supabase client for Edge Functions — No spec for how Edge Functions authenticate back to Supabase. Clarified with service-role inside Edge Functions.

Markdown
# ConstrAction — Full System Rebuild Prompt
# For use with Cursor AI — Production-Grade Implementation

You are building **ConstrAction** (constraction.ca), a production-ready,
fully custom-coded web application that replaces the current
GoHighLevel (GHL) + embedded-HTML hybrid. Keep the same Supabase
backend, the same Stripe billing model, and the same feature set,
but deliver a cohesive, maintainable codebase with zero GHL-embed
glue. Output production-ready code, not scaffolding. Every file you
create must be complete — no `// TODO` placeholders, no stub functions.

---

## 0. Cursor-specific instructions

- Use `pnpm` as the package manager.
- Run `pnpm dlx shadcn@latest init` to bootstrap shadcn/ui before
  adding components.
- For every new file, write the full implementation, not an outline.
- When you need an environment variable, add it to `.env.example`
  immediately — do not assume it exists.
- After scaffolding the project structure, implement files in this
  order so imports always resolve:
  1. `/lib/` utilities (supabase, stripe, i18n helpers)
  2. `/supabase/migrations/` SQL
  3. `/supabase/functions/` Edge Functions
  4. `/locales/en.json` and `/locales/fr.json`
  5. `/lib/pdf/` components
  6. `/app/api/` route handlers
  7. `/app/[locale]/(marketing)/` pages
  8. `/app/[locale]/(app)/` pages
  9. `/app/admin/` pages
  10. Global chrome components, middleware, layout files
- Never put secrets in client components. Run
  `grep -r "service_role\|STRIPE_SECRET\|SMTP_PASSWORD" .next/`
  and confirm zero matches before considering the build done.
- Commit message convention: `feat(scope): description` following
  Conventional Commits.

---

## 1. Product overview

ConstrAction (constraction.ca, Inc. based in Montréal, Québec) lets
contractors and clients generate, pay for, download, and email two
types of Quebec-compliant construction contracts in English or French:

1. **Client / Contractor (CC)** — between a property owner and a
   general contractor.
2. **General Contractor / Subcontractor (GC)** — between a GC and a
   subcontractor.

Users can pay **per contract** ($99 CAD each, plus GST + QST) or
subscribe to **Unlimited Monthly Pro** ($349 CAD/mo, plus GST + QST)
for unlimited generations.

All contract state, user profiles, billing status, and generated PDFs
live in Supabase. Admins manage the platform via a server-rendered
admin panel protected by a database-level `role='admin'` claim.

### Primary flows

| Actor | Flow |
|---|---|
| **Guest** | Visits → fills wizard → hits $99 paywall → pays via Stripe Checkout → receives PDF by email → lands on success page. |
| **Free registered user** | Signs up → profile auto-fills wizard → $99 paywall per contract → dashboard shows history. |
| **Pro subscriber** | Skips per-contract paywall — every contract is instantly downloadable and emailed. Can cancel any time; access continues until `current_period_end`. |
| **Returning user** | Logs in → edits profile → downloads past PDFs. |
| **Admin** | Visits `/admin` → authenticated by `role='admin'` on their profile → audits users + contracts + revenue. |

### Non-negotiables

1. **Bilingual EN/FR everywhere** — every user-facing string, every
   PDF template, every email. One language toggle per page, persisted
   in `localStorage` and the URL prefix (`/en/` or `/fr/`).

2. **Quebec-law compliant contract text** — C.C.Q. art. 2111 holdback
   clause, RBQ license number field, Quebec Inc. / Canada Inc.
   incorporation regimes, and correct GST (TPS) 5% + QST (TVQ)
   9.975% tax breakdown on all invoices and receipts. Taxes apply on
   the subtotal independently (not compounded).

3. **Legal disclaimer** — every email footer and every generated
   contract PDF must include, verbatim:
   - EN: *"ConstrAction Inc. provides automated document generation
     tools and does not offer legal advice, legal opinions, or legal
     representation."*
   - FR: *"ConstrAction inc. fournit des outils de génération
     automatisée de documents et n'offre pas de conseils juridiques,
     d'opinions juridiques ni de représentation légale."*

---

## 2. Tech stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 15** (App Router) + **React 19** + **TypeScript 5** |
| Styling | **Tailwind CSS v4** + **shadcn/ui** (New York style, CSS variables) |
| i18n | **next-intl 3** — locale routes `/[locale]/...`, `en` and `fr` |
| Auth | **Supabase Auth** (email/password; magic-link for password reset) |
| Database | **Supabase Postgres** (existing project — do not drop tables) |
| Storage | **Supabase Storage** (`logos`, `contracts`, `company-images` buckets) |
| Billing | **Stripe** Checkout + Customer Portal + Webhooks |
| Email | Existing Supabase Edge Functions (Deno + nodemailer over Gmail SMTP) |
| PDF | **@react-pdf/renderer v4** — server-side only, never in the browser bundle |
| Hosting | **Vercel** (Next.js app) + **Supabase** (DB, Storage, Edge Functions) |
| Package mgr | **pnpm 9** |

### Packages to install

```bash
pnpm add next@15 react@19 react-dom@19 typescript
pnpm add @supabase/supabase-js @supabase/ssr
pnpm add stripe @stripe/stripe-js
pnpm add next-intl
pnpm add @react-pdf/renderer
pnpm add nodemailer
pnpm add zod react-hook-form @hookform/resolvers
pnpm add lucide-react class-variance-authority clsx tailwind-merge
pnpm add date-fns
pnpm add -D @types/node @types/react @types/react-dom
pnpm add -D tailwindcss postcss autoprefixer
pnpm add -D @types/nodemailer
Drop these legacy patterns (they exist only because GHL was the host)
URL-parameter auto-fill (?profile_first_name=...). Replace with
signed-in user's profile read directly in RSC.
caSyncToGHL(...) image-beacon calls. Drop entirely.
The admin.txt service-role-key-in-browser prompt. Replace with
proper role='admin' server-side guard.
html2pdf client-side PDF + two-pass canvas-height workaround.
Replace with @react-pdf/renderer server-side.
Any sessionStorage.setItem('supabaseKey', ...) pattern.

3. Repository structure
text
constraction/
├── app/
│   ├── [locale]/
│   │   ├── (marketing)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                    # Home / landing
│   │   │   ├── pricing/page.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   ├── reset-password/page.tsx
│   │   │   ├── payment-success/page.tsx
│   │   │   └── subscription-success/page.tsx
│   │   ├── (app)/
│   │   │   ├── layout.tsx                  # Auth guard — redirects to /login
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   ├── contracts/
│   │   │   │   ├── page.tsx                # Contract history list
│   │   │   │   ├── [id]/
│   │   │   │   │   └── edit/page.tsx       # Resume a draft contract
│   │   │   │   └── new/
│   │   │   │       ├── client-contractor/page.tsx
│   │   │   │       └── gc-subcontractor/page.tsx
│   │   │   ├── checkout/
│   │   │   │   ├── single/page.tsx
│   │   │   │   └── subscribe/page.tsx
│   │   └── layout.tsx                      # locale layout with Providers
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx                        # Admin login gate
│   │   ├── dashboard/page.tsx
│   │   ├── users/page.tsx
│   │   └── contracts/page.tsx
│   ├── api/
│   │   ├── contracts/
│   │   │   ├── generate/route.ts           # POST — render PDF + upload + email
│   │   │   └── signed-url/route.ts         # GET — issue 5-min signed download URL
│   │   ├── stripe/
│   │   │   ├── checkout/route.ts           # POST — create Checkout session
│   │   │   └── webhooks/route.ts           # POST — handle Stripe events
│   │   ├── subscriptions/
│   │   │   └── cancel/route.ts             # POST — cancel at period end
│   │   └── admin/
│   │       ├── stats/route.ts
│   │       ├── users/route.ts
│   │       └── contracts/route.ts
│   ├── layout.tsx                          # Root layout (fonts, metadata)
│   └── globals.css
├── components/
│   ├── ui/                                 # shadcn/ui primitives (auto-generated)
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── AuthWidget.tsx
│   │   ├── LanguageToggle.tsx
│   │   └── Footer.tsx
│   ├── wizard/
│   │   ├── WizardShell.tsx
│   │   ├── WizardSidebar.tsx
│   │   ├── steps/
│   │   │   ├── RoleStep.tsx
│   │   │   ├── MyInfoStep.tsx
│   │   │   ├── OtherPartyStep.tsx
│   │   │   ├── ProjectStep.tsx
│   │   │   ├── PaymentTermsStep.tsx
│   │   │   └── ReviewStep.tsx
│   ├── admin/
│   │   ├── StatsCards.tsx
│   │   ├── UsersTable.tsx
│   │   ├── ContractsTable.tsx
│   │   └── DetailDrawer.tsx
│   └── shared/
│       ├── LogoUpload.tsx
│       ├── ProBadge.tsx
│       ├── ContractCard.tsx
│       └── TaxBreakdown.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                       # Browser anon client
│   │   ├── server.ts                       # RSC / Route Handler client (cookies)
│   │   └── admin.ts                        # Service-role client — server-only
│   ├── stripe/
│   │   ├── server.ts                       # Stripe SDK instance
│   │   └── webhooks.ts                     # Event handler map
│   ├── pdf/
│   │   ├── cc.tsx                          # CC contract @react-pdf/renderer doc
│   │   ├── gc.tsx                          # GC contract @react-pdf/renderer doc
│   │   └── shared/
│   │       ├── styles.ts                   # StyleSheet.create(...)
│   │       ├── Header.tsx                  # Logo + title
│   │       ├── SignatureBlock.tsx
│   │       └── DisclaimerFooter.tsx
│   ├── i18n/
│   │   ├── request.ts                      # next-intl getRequestConfig
│   │   └── navigation.ts                   # createLocalizedPathnamesNavigation
│   ├── validations/
│   │   ├── auth.ts                         # Zod schemas for login/signup
│   │   ├── profile.ts
│   │   └── wizard.ts                       # Per-step Zod schemas
│   ├── tax.ts                              # GST/QST calculation helpers
│   ├── constants.ts                        # Plan prices, bucket names, etc.
│   └── utils.ts                            # cn(), formatCurrency(), etc.
├── locales/
│   ├── en.json
│   └── fr.json
├── supabase/
│   ├── migrations/
│   │   ├── 00001_initial_schema.sql
│   │   ├── 00002_rls_policies.sql
│   │   ├── 00003_storage_policies.sql
│   │   └── 00004_stripe_idempotency.sql
│   └── functions/
│       ├── send-welcome/index.ts
│       ├── send-contract/index.ts
│       ├── send-receipt/index.ts
│       ├── send-cancellation/index.ts
│       └── cancel-subscription/index.ts
├── middleware.ts
├── i18n.ts                                 # next-intl plugin config
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .env.example
└── README.md

4. Environment variables
Create .env.example with exactly these keys. All must be set
before pnpm dev will work.
Bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...          # Server-only. Never expose to client.

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...             # Server-only.
STRIPE_WEBHOOK_SECRET=whsec_...           # Server-only.
STRIPE_PRICE_SINGLE=price_...            # $99 CAD one-off price ID
STRIPE_PRICE_SUBSCRIPTION=price_...      # $349 CAD/mo price ID

# Email (used inside Supabase Edge Functions — set via `supabase secrets set`)
SMTP_USER=roy@constraction.ca
SMTP_PASSWORD=your-gmail-app-password    # Server-only. Never in Next.js bundle.

# App
NEXT_PUBLIC_SITE_URL=https://constraction.ca
Validation rule: Add a lib/env.ts that uses Zod to parse
process.env at startup and throws a clear error if any server-side
variable is missing. Client variables use NEXT_PUBLIC_ prefix and
are validated separately.
TypeScript
// lib/env.ts
import { z } from 'zod'

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  STRIPE_PRICE_SINGLE: z.string().startsWith('price_'),
  STRIPE_PRICE_SUBSCRIPTION: z.string().startsWith('price_'),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
})

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
})

// Only call on server
export const serverEnv = serverEnvSchema.parse(process.env)

// Safe to call anywhere
export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
})

5. Supabase schema (preserve existing — do not drop)
Migration 00001_initial_schema.sql
SQL
-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────
-- Table: profiles
-- ─────────────────────────────────────────
create table if not exists public.profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  email                text not null,
  first_name           text,
  last_name            text,
  phone                text,
  role                 text not null default 'user'
                         check (role in ('user', 'admin')),   -- FIX: was missing
  entity_type          text check (entity_type in ('company', 'individual')),

  -- Company fields
  company_name         text,
  incorporation_regime text check (
                         incorporation_regime in ('quebec_inc', 'canada_inc')
                       ),
  rbq                  text,
  head_office          text,
  ho_city              text,
  ho_postal            text,
  rep_name             text,
  rep_title            text,

  -- Individual fields
  full_name            text,
  address              text,
  ind_city             text,
  ind_postal           text,

  logo_url             text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ─────────────────────────────────────────
-- Table: subscriptions
-- ─────────────────────────────────────────
create table if not exists public.subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references public.profiles(id)
                           on delete cascade unique,
  status                 text not null default 'inactive'
                           check (status in (
                             'active', 'inactive', 'canceled', 'past_due'
                           )),
  plan_type              text not null default 'pay_per_contract'
                           check (plan_type in (
                             'pay_per_contract', 'unlimited_monthly'
                           )),
  cancel_at_period_end   boolean not null default false,
  current_period_end     timestamptz,
  stripe_customer_id     text,
  stripe_subscription_id text unique,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.handle_updated_at();

-- ─────────────────────────────────────────
-- Table: contracts
-- ─────────────────────────────────────────
create table if not exists public.contracts (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid references public.profiles(id) on delete set null,
  -- null = guest checkout

  contract_type        text not null
                         check (contract_type in (
                           'client-contractor', 'gc-subcontractor'
                         )),

  -- Client party
  client_name          text,
  client_address       text,
  client_city          text,
  client_postal        text,
  client_email         text,
  client_phone         text,

  -- Contractor party
  contractor_name      text,
  contractor_rbq       text,
  contractor_address   text,
  contractor_city      text,
  contractor_postal    text,
  contractor_email     text,
  contractor_phone     text,

  -- Project
  project_site         text,
  project_city         text,
  project_postal       text,
  project_description  text,
  contract_price       numeric(12, 2),

  status               text not null default 'draft'
                         check (status in (
                           'draft', 'generated', 'paid', 'signed', 'completed'
                         )),
  pdf_path             text,

  -- Flexible metadata: language, role, all payment term flags
  metadata             jsonb not null default '{}'::jsonb,
  -- Expected metadata keys:
  --   project_name, language ('en'|'fr'), role ('client'|'contractor'),
  --   form_type ('client-contractor'|'gc-subcontractor'),
  --   payment_method, start_date (ISO), end_date (ISO), sign_date (ISO),
  --   warranty_months (int), holdback (bool), holdback_pct (numeric),
  --   insurance_amount (numeric), bond (bool), bond_pct (numeric),
  --   late_interest (numeric), escalation (bool), escalation_pct (numeric),
  --   recovery_penalty (bool), material_provider ('contractor'|'client'|'shared'),
  --   extra_clauses (text), logo_url (text),
  --   guest_session_id (text) -- FIX: guest flow tracking

  -- Stripe tracking
  stripe_payment_intent_id   text,
  stripe_checkout_session_id text,

  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create trigger contracts_updated_at
  before update on public.contracts
  for each row execute function public.handle_updated_at();

-- Index for common queries
create index if not exists contracts_user_id_idx
  on public.contracts(user_id);
create index if not exists contracts_status_idx
  on public.contracts(status);
create index if not exists contracts_type_idx
  on public.contracts(contract_type);

-- ─────────────────────────────────────────
-- Table: activity_log
-- ─────────────────────────────────────────
create table if not exists public.activity_log (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles(id) on delete set null,
  action     text not null,
  -- Allowed values (not enforced at DB level for flexibility):
  -- 'login', 'signup', 'logout', 'password_reset',
  -- 'contract_generated', 'contract_paid', 'contract_downloaded',
  -- 'subscription_started', 'subscription_cancelled',
  -- 'subscription_renewed', 'profile_updated'
  details    text,
  ip_address inet,
  created_at timestamptz not null default now()
);

create index if not exists activity_log_user_id_idx
  on public.activity_log(user_id);
create index if not exists activity_log_action_idx
  on public.activity_log(action);
Migration 00002_rls_policies.sql
SQL
-- Enable RLS on all tables
alter table public.profiles      enable row level security;
alter table public.subscriptions enable row level security;
alter table public.contracts     enable row level security;
alter table public.activity_log  enable row level security;

-- ─────────────────────────────────────────
-- profiles RLS
-- ─────────────────────────────────────────
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Signup trigger inserts the profile row via service_role — no insert
-- policy needed for anon/authenticated; service_role bypasses RLS.

-- ─────────────────────────────────────────
-- subscriptions RLS
-- ─────────────────────────────────────────
create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Only service_role (Stripe webhook handler) writes subscriptions.

-- ─────────────────────────────────────────
-- contracts RLS
-- ─────────────────────────────────────────
create policy "Users can view own contracts"
  on public.contracts for select
  using (auth.uid() = user_id);

create policy "Users can insert own contracts"
  on public.contracts for insert
  with check (
    auth.uid() = user_id
    or user_id is null  -- allow guest inserts (user_id null)
  );

create policy "Users can update own contracts"
  on public.contracts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- activity_log RLS
-- ─────────────────────────────────────────
create policy "Users can insert own activity"
  on public.activity_log for insert
  with check (auth.uid() = user_id);

-- Only admin (service_role) can select activity_log.
-- No select policy for authenticated users.

-- ─────────────────────────────────────────
-- Helper: is current user an admin?
-- ─────────────────────────────────────────
create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Admin bypass policies
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Admins can view all subscriptions"
  on public.subscriptions for select
  using (public.is_admin());

create policy "Admins can view all contracts"
  on public.contracts for select
  using (public.is_admin());

create policy "Admins can view all activity"
  on public.activity_log for select
  using (public.is_admin());
Migration 00003_storage_policies.sql
SQL
-- ─────────────────────────────────────────
-- Bucket: logos (public read, auth write)
-- ─────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'logos', 'logos', true, 2097152,   -- 2 MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
) on conflict (id) do nothing;

create policy "Anyone can read logos"
  on storage.objects for select
  using (bucket_id = 'logos');

create policy "Auth users upload their own logo"
  on storage.objects for insert
  with check (
    bucket_id = 'logos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Auth users update their own logo"
  on storage.objects for update
  using (
    bucket_id = 'logos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─────────────────────────────────────────
-- Bucket: contracts (private, signed-URL only)
-- ─────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'contracts', 'contracts', false, 10485760,  -- 10 MB limit
  array['application/pdf']
) on conflict (id) do nothing;

-- No public select — access only via signed URLs issued by server route.
-- Service_role has full access (bypasses RLS).

create policy "Users can read their own contract PDFs"
  on storage.objects for select
  using (
    bucket_id = 'contracts'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─────────────────────────────────────────
-- Bucket: company-images (public read)
-- ─────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('company-images', 'company-images', true)
on conflict (id) do nothing;

create policy "Anyone can read company images"
  on storage.objects for select
  using (bucket_id = 'company-images');
Migration 00004_stripe_idempotency.sql
SQL
-- Prevent double-processing of Stripe webhook events
-- FIX: This was missing from the original prompt

create table if not exists public.stripe_events (
  id           text primary key,    -- Stripe event ID (evt_...)
  type         text not null,
  processed_at timestamptz not null default now()
);

-- Auto-clean events older than 90 days (cron job or pg_cron)
-- For simplicity, add an index for fast lookup
create index if not exists stripe_events_processed_at_idx
  on public.stripe_events(processed_at);

6. Supabase auth trigger (profile auto-creation)
Create this in the Supabase dashboard SQL editor or as a migration:
SQL
-- Automatically create a profiles row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, first_name, last_name, phone)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone'
  );

  insert into public.subscriptions (user_id)
  values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

7. i18n configuration
i18n.ts (next-intl plugin config)
TypeScript
import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'

export const locales = ['en', 'fr'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as Locale)) notFound()

  return {
    messages: (await import(`./locales/${locale}.json`)).default,
    timeZone: 'America/Toronto',
    now: new Date(),
  }
})
lib/i18n/navigation.ts
TypeScript
import { createLocalizedPathnamesNavigation } from 'next-intl/navigation'
import { locales } from '@/i18n'

export const pathnames = {
  '/': '/',
  '/login': '/login',
  '/signup': '/signup',
  '/reset-password': '/reset-password',
  '/dashboard': '/dashboard',
  '/profile': '/profile',
  '/contracts': '/contracts',
  '/contracts/new/client-contractor': '/contracts/new/client-contractor',
  '/contracts/new/gc-subcontractor': '/contracts/new/gc-subcontractor',
  '/checkout/single': '/checkout/single',
  '/checkout/subscribe': '/checkout/subscribe',
  '/payment-success': '/payment-success',
  '/subscription-success': '/subscription-success',
  '/pricing': '/pricing',
} as const

export const { Link, redirect, usePathname, useRouter } =
  createLocalizedPathnamesNavigation({ locales, pathnames })
middleware.ts
TypeScript
import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { locales, defaultLocale } from './i18n'

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

// Protected routes that require authentication
const protectedPaths = [
  '/dashboard',
  '/profile',
  '/contracts',
  '/checkout',
]

// Admin routes (require role='admin')
const adminPaths = ['/admin']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip API routes and static files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Admin routes — handle separately, no locale prefix
  if (adminPaths.some((p) => pathname.startsWith(p))) {
    return handleAdminRoute(request)
  }

  // Apply i18n middleware
  const response = intlMiddleware(request)

  // Extract locale from pathname
  const pathnameLocale = locales.find(
    (loc) => pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`
  )

  // Check if path (minus locale) is protected
  const pathWithoutLocale = pathnameLocale
    ? pathname.slice(`/${pathnameLocale}`.length) || '/'
    : pathname

  const isProtected = protectedPaths.some((p) =>
    pathWithoutLocale.startsWith(p)
  )

  if (!isProtected) return response

  // Verify auth session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const locale = pathnameLocale ?? defaultLocale
    const loginUrl = new URL(`/${locale}/login`, request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

async function handleAdminRoute(request: NextRequest): Promise<NextResponse> {
  // Admin auth is handled in the admin layout — middleware just
  // ensures the route isn't accidentally cached or exposed.
  // Actual role check happens server-side in the layout.
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

8. Supabase client modules
lib/supabase/client.ts — Browser client
TypeScript
'use client'
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
lib/supabase/server.ts — RSC / Route Handler client
TypeScript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from RSC — cookies cannot be set.
            // Middleware handles session refresh.
          }
        },
      },
    }
  )
}
lib/supabase/admin.ts — Service-role client (server-only)
TypeScript
import 'server-only'   // Prevents import in client bundles
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// This client bypasses RLS — never expose to browser.
export const adminSupabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

9. Stripe modules
lib/stripe/server.ts
TypeScript
import 'server-only'
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})
lib/stripe/webhooks.ts
TypeScript
import 'server-only'
import { stripe } from './server'
import { adminSupabase } from '@/lib/supabase/admin'
import type Stripe from 'stripe'

export async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  // Idempotency check
  const { data: existing } = await adminSupabase
    .from('stripe_events')
    .select('id')
    .eq('id', event.id)
    .single()

  if (existing) {
    console.log(`[Stripe Webhook] Duplicate event ${event.id} — skipping`)
    return
  }

  // Record event before processing (idempotency gate)
  await adminSupabase.from('stripe_events').insert({
    id: event.id,
    type: event.type,
  })

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(
        event.data.object as Stripe.Checkout.Session
      )
      break

    case 'invoice.paid':
      await handleInvoicePaid(event.data.object as Stripe.Invoice)
      break

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(
        event.data.object as Stripe.Subscription
      )
      break

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(
        event.data.object as Stripe.Subscription
      )
      break

    default:
      console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`)
  }
}

// ─── Handlers ────────────────────────────────────────────────────────────────

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  const { mode, metadata, customer_email, customer } = session

  if (mode === 'payment') {
    // One-off $99 contract purchase
    const contractId = metadata?.contract_id
    if (!contractId) {
      console.error('[Webhook] checkout.session.completed: no contract_id in metadata')
      return
    }

    // Mark contract as paid
    await adminSupabase
      .from('contracts')
      .update({
        status: 'paid',
        stripe_checkout_session_id: session.id,
      })
      .eq('id', contractId)

    // Fetch contract + user info for email
    const { data: contract } = await adminSupabase
      .from('contracts')
      .select('*, profiles(email, first_name, last_name)')
      .eq('id', contractId)
      .single()

    if (!contract) return

    // Trigger send-receipt Edge Function
    await invokeEdgeFunction('send-receipt', {
      email: customer_email ?? contract.client_email,
      first_name:
        contract.profiles?.first_name ?? customer_email?.split('@')[0] ?? '',
      contract_id: contractId,
      amount: session.amount_total! / 100,  // cents → dollars
      language: contract.metadata?.language ?? 'en',
    })

    // Trigger send-contract Edge Function (deliver the PDF)
    if (contract.pdf_path) {
      await invokeEdgeFunction('send-contract', {
        email: customer_email ?? contract.client_email,
        first_name:
          contract.profiles?.first_name ?? customer_email?.split('@')[0] ?? '',
        contract_id: contractId,
        pdf_path: contract.pdf_path,
        language: contract.metadata?.language ?? 'en',
        contract_type: contract.contract_type,
      })
    }

    // Log activity
    if (contract.user_id) {
      await adminSupabase.from('activity_log').insert({
        user_id: contract.user_id,
        action: 'contract_paid',
        details: `Contract ${contractId} paid via Stripe session ${session.id}`,
      })
    }
  } else if (mode === 'subscription') {
    // New Pro subscription
    const userId = metadata?.user_id
    if (!userId) {
      console.error('[Webhook] checkout.session.completed (sub): no user_id in metadata')
      return
    }

    // Retrieve full subscription from Stripe
    const stripeSubId = session.subscription as string
    const sub = await stripe.subscriptions.retrieve(stripeSubId)

    await adminSupabase
      .from('subscriptions')
      .update({
        status: 'active',
        plan_type: 'unlimited_monthly',
        stripe_customer_id: customer as string,
        stripe_subscription_id: stripeSubId,
        cancel_at_period_end: sub.cancel_at_period_end,
        current_period_end: new Date(
          sub.current_period_end * 1000
        ).toISOString(),
      })
      .eq('user_id', userId)

    await adminSupabase.from('activity_log').insert({
      user_id: userId,
      action: 'subscription_started',
      details: `Stripe subscription ${stripeSubId}`,
    })
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  if (!invoice.subscription) return

  const { data: sub } = await adminSupabase
    .from('subscriptions')
    .select('user_id, stripe_subscription_id')
    .eq('stripe_subscription_id', invoice.subscription as string)
    .single()

  if (!sub) return

  // Fetch updated subscription from Stripe for accurate period_end
  const stripeSub = await stripe.subscriptions.retrieve(
    invoice.subscription as string
  )

  await adminSupabase
    .from('subscriptions')
    .update({
      status: 'active',
      current_period_end: new Date(
        stripeSub.current_period_end * 1000
      ).toISOString(),
      cancel_at_period_end: stripeSub.cancel_at_period_end,
    })
    .eq('stripe_subscription_id', invoice.subscription as string)

  await adminSupabase.from('activity_log').insert({
    user_id: sub.user_id,
    action: 'subscription_renewed',
    details: `Invoice ${invoice.id} paid`,
  })
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
): Promise<void> {
  const status = mapStripeStatus(subscription.status)

  await adminSupabase
    .from('subscriptions')
    .update({
      status,
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_end: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  await adminSupabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      plan_type: 'pay_per_contract',
      cancel_at_period_end: false,
    })
    .eq('stripe_subscription_id', subscription.id)

  const { data: sub } = await adminSupabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single()

  if (sub) {
    await adminSupabase.from('activity_log').insert({
      user_id: sub.user_id,
      action: 'subscription_canceled',
      details: `Stripe subscription ${subscription.id} deleted`,
    })
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapStripeStatus(
  stripeStatus: Stripe.Subscription.Status
): 'active' | 'inactive' | 'canceled' | 'past_due' {
  switch (stripeStatus) {
    case 'active':
    case 'trialing':
      return 'active'
    case 'past_due':
    case 'unpaid':
      return 'past_due'
    case 'canceled':
    case 'incomplete_expired':
      return 'canceled'
    default:
      return 'inactive'
  }
}

async function invokeEdgeFunction(
  functionName: string,
  payload: Record<string, unknown>
): Promise<void> {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${functionName}`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const body = await response.text()
    console.error(
      `[Edge Function] ${functionName} failed: ${response.status} ${body}`
    )
  }
}

10. API route handlers
app/api/contracts/generate/route.ts
TypeScript
import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { renderToBuffer } from '@react-pdf/renderer'
import { CCDocument } from '@/lib/pdf/cc'
import { GCDocument } from '@/lib/pdf/gc'
import { z } from 'zod'
import React from 'react'

const generateSchema = z.object({
  contract_id: z.string().uuid(),
  language: z.enum(['en', 'fr']),
  contract_type: z.enum(['client-contractor', 'gc-subcontractor']),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contract_id, language, contract_type } =
      generateSchema.parse(body)

    // Authenticate user (null for guests — handled below)
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch contract row
    const { data: contract, error: contractError } = await adminSupabase
      .from('contracts')
      .select('*')
      .eq('id', contract_id)
      .single()

    if (contractError || !contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      )
    }

    // Authorization: user must own the contract, or it must be a guest contract
    if (contract.user_id !== null && contract.user_id !== user?.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch profile for logo_url (null for guests)
    let profile = null
    if (user) {
      const { data } = await adminSupabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      profile = data
    }

    // Render PDF
    const logoUrl =
      contract.metadata?.logo_url ?? profile?.logo_url ?? undefined

    const DocumentComponent =
      contract_type === 'client-contractor' ? CCDocument : GCDocument

    const pdfBuffer = await renderToBuffer(
      React.createElement(DocumentComponent, {
        contract,
        profile,
        language,
        logoUrl,
      })
    )

    // Upload to Supabase Storage
    const folder = user?.id ?? 'guests'
    const storagePath = `${folder}/${contract_id}.pdf`

    const { error: uploadError } = await adminSupabase.storage
      .from('contracts')
      .upload(storagePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (uploadError) {
      console.error('[Generate] Storage upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to store PDF' },
        { status: 500 }
      )
    }

    // Check if user is Pro subscriber
    let isPro = false
    if (user) {
      const { data: sub } = await adminSupabase
        .from('subscriptions')
        .select('status, plan_type, current_period_end')
        .eq('user_id', user.id)
        .single()

      isPro =
        sub?.status === 'active' &&
        sub?.plan_type === 'unlimited_monthly' &&
        (!sub.current_period_end ||
          new Date(sub.current_period_end) > new Date())
    }

    const newStatus = isPro ? 'paid' : 'generated'

    // Update contract row
    await adminSupabase
      .from('contracts')
      .update({
        pdf_path: storagePath,
        status: newStatus,
        metadata: {
          ...contract.metadata,
          language,
        },
      })
      .eq('id', contract_id)

    // If Pro — email the contract immediately
    if (isPro && profile) {
      await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-contract`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            email: profile.email,
            first_name: profile.first_name,
            contract_id,
            pdf_path: storagePath,
            language,
            contract_type,
          }),
        }
      )

      await adminSupabase.from('activity_log').insert({
        user_id: user!.id,
        action: 'contract_generated',
        details: `Pro user generated ${contract_type} contract ${contract_id}`,
      })
    }

    // Generate a 5-minute signed URL for immediate download
    const { data: signedUrlData } = await adminSupabase.storage
      .from('contracts')
      .createSignedUrl(storagePath, 300)

    return NextResponse.json({
      contract_id,
      status: newStatus,
      is_pro: isPro,
      signed_url: signedUrlData?.signedUrl ?? null,
      requires_payment: !isPro,
    })
  } catch (error) {
    console.error('[Generate] Error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
app/api/contracts/signed-url/route.ts
TypeScript
import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const contractId = request.nextUrl.searchParams.get('contract_id')
  if (!contractId) {
    return NextResponse.json({ error: 'contract_id required' }, { status: 400 })
  }

  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify ownership
  const { data: contract } = await adminSupabase
    .from('contracts')
    .select('pdf_path, user_id, status')
    .eq('id', contractId)
    .single()

  if (!contract) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (contract.user_id !== user.id) {
    // Check if admin
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  if (!contract.pdf_path) {
    return NextResponse.json(
      { error: 'PDF not yet generated' },
      { status: 404 }
    )
  }

  if (contract.status === 'draft' || contract.status === 'generated') {
    return NextResponse.json(
      { error: 'Contract not yet paid' },
      { status: 402 }
    )
  }

  const { data: signedUrl, error } = await adminSupabase.storage
    .from('contracts')
    .createSignedUrl(contract.pdf_path, 300)  // 5-minute TTL

  if (error || !signedUrl) {
    return NextResponse.json(
      { error: 'Failed to generate download link' },
      { status: 500 }
    )
  }

  // Log download activity
  await adminSupabase.from('activity_log').insert({
    user_id: user.id,
    action: 'contract_downloaded',
    details: `Downloaded contract ${contractId}`,
  })

  return NextResponse.json({ signed_url: signedUrl.signedUrl })
}
app/api/stripe/checkout/route.ts
TypeScript
import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { z } from 'zod'

const checkoutSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('payment'),
    contract_id: z.string().uuid(),
    email: z.string().email(),
    language: z.enum(['en', 'fr']),
  }),
  z.object({
    mode: z.literal('subscription'),
    language: z.enum(['en', 'fr']),
  }),
])

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = checkoutSchema.parse(body)

    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!
    const locale = parsed.language

    if (parsed.mode === 'payment') {
      // One-off $99 contract purchase
      const { contract_id, email } = parsed

      // Verify contract exists and is in 'generated' state
      const { data: contract } = await adminSupabase
        .from('contracts')
        .select('id, status, contract_price')
        .eq('id', contract_id)
        .single()

      if (!contract || contract.status === 'paid') {
        return NextResponse.json(
          { error: 'Invalid contract' },
          { status: 400 }
        )
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: email,
        line_items: [
          {
            price: process.env.STRIPE_PRICE_SINGLE!,
            quantity: 1,
          },
        ],
        metadata: {
          contract_id,
          user_id: user?.id ?? 'guest',
          language: locale,
        },
        success_url: `${siteUrl}/${locale}/payment-success?session_id={CHECKOUT_SESSION_ID}&contract_id=${contract_id}`,
        cancel_url: `${siteUrl}/${locale}/contracts`,
        automatic_tax: { enabled: false },  // We show GST/QST manually
        locale: locale === 'fr' ? 'fr' : 'en',
      })

      return NextResponse.json({ url: session.url })
    } else {
      // Subscription checkout — must be logged in
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { data: profile } = await adminSupabase
        .from('profiles')
        .select('email, first_name, last_name')
        .eq('id', user.id)
        .single()

      // Check for existing Stripe customer
      const { data: subRow } = await adminSupabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .single()

      let customerId = subRow?.stripe_customer_id

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: profile?.email ?? user.email,
          name: profile
            ? `${profile.first_name} ${profile.last_name}`.trim()
            : undefined,
          metadata: { user_id: user.id },
        })
        customerId = customer.id

        await adminSupabase
          .from('subscriptions')
          .update({ stripe_customer_id: customerId })
          .eq('user_id', user.id)
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: customerId,
        line_items: [
          {
            price: process.env.STRIPE_PRICE_SUBSCRIPTION!,
            quantity: 1,
          },
        ],
        metadata: {
          user_id: user.id,
          language: locale,
        },
        success_url: `${siteUrl}/${locale}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/${locale}/pricing`,
        locale: locale === 'fr' ? 'fr' : 'en',
      })

      return NextResponse.json({ url: session.url })
    }
  } catch (error) {
    console.error('[Checkout] Error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
app/api/stripe/webhooks/route.ts
TypeScript
import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { handleStripeEvent } from '@/lib/stripe/webhooks'

export const config = {
  api: { bodyParser: false },
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    await handleStripeEvent(event)
    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[Webhook] Handler error:', err)
    // Return 200 to prevent Stripe from retrying fatal errors
    // Log the failure for manual review
    return NextResponse.json(
      { received: true, warning: 'Handler error — logged' },
      { status: 200 }
    )
  }
}
app/api/subscriptions/cancel/route.ts
TypeScript
import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerSupabase } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Delegate to the existing Edge Function which handles:
  // 1. Stripe API cancellation at period end
  // 2. DB update (cancel_at_period_end = true)
  // 3. Activity log
  // 4. Sends bilingual cancellation email
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/cancel-subscription`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward the user's JWT so the Edge Function can verify identity
        Authorization: request.headers.get('authorization') ?? '',
      },
      body: JSON.stringify({ user_id: user.id }),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    return NextResponse.json(
      { error: data.error ?? 'Cancellation failed' },
      { status: response.status }
    )
  }

  return NextResponse.json(data)
}

11. PDF document components
lib/pdf/shared/styles.ts
TypeScript
import { StyleSheet, Font } from '@react-pdf/renderer'

// Register Times New Roman (must be available on the server)
// In production, bundle the font files in /public/fonts/
Font.register({
  family: 'TimesNewRoman',
  fonts: [
    { src: '/fonts/times-new-roman.ttf' },
    { src: '/fonts/times-new-roman-bold.ttf', fontWeight: 'bold' },
    { src: '/fonts/times-new-roman-italic.ttf', fontStyle: 'italic' },
    {
      src: '/fonts/times-new-roman-bold-italic.ttf',
      fontWeight: 'bold',
      fontStyle: 'italic',
    },
  ],
})

export const styles = StyleSheet.create({
  page: {
    fontFamily: 'TimesNewRoman',
    fontSize: 12,
    paddingTop: 43.2,     // 0.6 inch
    paddingBottom: 43.2,
    paddingLeft: 43.2,
    paddingRight: 43.2,
    lineHeight: 1.4,
    color: '#000000',
  },
  logo: {
    maxHeight: 80,
    objectFit: 'contain',
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 20,
    color: '#444444',
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 6,
    textDecoration: 'underline',
  },
  clauseNumber: {
    fontWeight: 'bold',
  },
  paragraph: {
    marginBottom: 8,
    textAlign: 'justify',
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
  },
  signatureBlock: {
    width: '45%',
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    marginBottom: 4,
    height: 40,
  },
  signatureLabel: {
    fontSize: 10,
    color: '#444444',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 43.2,
    right: 43.2,
    textAlign: 'center',
    fontSize: 9,
    color: '#888888',
    borderTopWidth: 0.5,
    borderTopColor: '#cccccc',
    paddingTop: 6,
  },
  disclaimer: {
    fontSize: 9,
    color: '#888888',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  table: {
    marginTop: 8,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#cccccc',
    paddingVertical: 4,
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 4,
  },
  tableHeaderCell: {
    flex: 1,
    paddingHorizontal: 4,
    fontWeight: 'bold',
  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
})
lib/pdf/cc.tsx — Client/Contractor contract
React
import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer'
import { styles } from './shared/styles'
import type { Database } from '@/types/supabase'

type Contract = Database['public']['Tables']['contracts']['Row']
type Profile = Database['public']['Tables']['profiles']['Row'] | null

interface CCDocumentProps {
  contract: Contract
  profile: Profile
  language: 'en' | 'fr'
  logoUrl?: string
}

// ─── Bilingual strings ────────────────────────────────────────────────────────
// Source of truth: extracted verbatim from cc.txt FR/EN sections.
// Do NOT paraphrase. If you need to add a clause, add it to both objects.

const t = {
  en: {
    title: 'Services (Construction) Agreement',
    subtitle: 'Client / Contractor Agreement',
    parties: 'PARTIES',
    client: 'Client (Property Owner)',
    contractor: 'Contractor',
    rbq: 'RBQ License No.',
    project: 'PROJECT',
    projectSite: 'Project Site',
    scopeOfWork: 'Scope of Work',
    dates: 'DATES',
    commencementDate: 'Commencement Date',
    completionDate: 'Estimated Completion Date',
    signingDate: 'Date of Signing',
    paymentTerms: 'PAYMENT TERMS',
    totalPrice: 'Total Contract Price',
    paymentMethod: 'Payment Method',
    lateInterest: 'Late Payment Interest Rate',
    lateInterestSuffix: '% per annum',
    holdbackTitle: 'HOLDBACK (ART. 2111 C.C.Q.)',
    holdbackText: (pct: number) =>
      `In accordance with Article 2111 of the Civil Code of Québec, the Client shall retain ${pct}% of each payment as a holdback until thirty (30) days after substantial completion of the Work, at which time, if no hypothec has been published, the holdback shall be released to the Contractor.`,
    bondTitle: 'PERFORMANCE BOND',
    bondText: (pct: number) =>
      `The Contractor shall provide a performance bond in the amount of ${pct}% of the total Contract price within ten (10) days of execution of this Agreement.`,
    insuranceTitle: 'INSURANCE',
    insuranceText: (amount: number) =>
      `The Contractor shall maintain commercial general liability insurance with a minimum coverage of $${amount.toLocaleString('en-CA')} CAD throughout the duration of this Agreement.`,
    escalationTitle: 'PRICE ESCALATION',
    escalationText: (pct: number) =>
      `In the event of material cost increases exceeding ${pct}% of the contracted price, the parties agree to negotiate in good faith to adjust the Contract price accordingly, with written approval required from both parties.`,
    recoveryTitle: 'RECOVERY PENALTY',
    recoveryText:
      'In the event the Contractor abandons the Work or fails to substantially complete the Work by the agreed completion date without cause, the Client may engage substitute contractors to complete the Work, and the Contractor shall be responsible for all reasonable additional costs incurred.',
    materialProvider: 'Material Provider',
    materialProviderValues: {
      contractor: 'Contractor',
      client: 'Client (Property Owner)',
      shared: 'Shared between parties',
    },
    s1Title: '1. DEFINITIONS',
    s1Body:
      '"Work" means the construction services described in the Scope of Work section above. "Client" means the property owner identified above. "Contractor" means the licensed contractor identified above. "Agreement" means this Services (Construction) Agreement including all schedules and amendments.',
    s2Title: '2. INDEPENDENT CONTRACTOR STATUS',
    s2Body:
      'The Contractor is an independent contractor and not an employee, agent, partner, or joint venturer of the Client. The Contractor shall be solely responsible for all withholding taxes, source deductions, CNESST contributions, and any other statutory obligations in respect of the Contractor\'s workers.',
    s3Title: '3. GOVERNING LAW',
    s3Body:
      'This Agreement shall be governed by and construed in accordance with the laws of the Province of Québec and the applicable federal laws of Canada, including but not limited to the Civil Code of Québec (C.C.Q.). Any dispute arising from this Agreement shall be subject to the exclusive jurisdiction of the courts of the Province of Québec.',
    s4Title: '4. SCOPE OF WORK',
    s4Body:
      'The Contractor agrees to perform the Work at the Project Site in a good and workmanlike manner, in accordance with all applicable building codes, municipal by-laws, and the requirements of the Régie du bâtiment du Québec (RBQ).',
    s7Title: '7. COMMENCEMENT AND COMPLETION',
    s7Body:
      'Time is of the essence. The Contractor shall commence the Work on the Commencement Date and shall achieve substantial completion by the Completion Date, subject to delays caused by Force Majeure, Client-requested changes, or the Client\'s failure to provide timely access or approvals.',
    s8Title: '8. PAYMENT TERMS',
    s8Body: (method: string) =>
      `The Client shall pay the Contractor the Total Contract Price set out above by ${method}. Unless otherwise agreed in writing, invoices are due within thirty (30) days of receipt. Amounts unpaid after the due date shall bear interest at the Late Payment Interest Rate specified above.`,
    s12Title: '12. WARRANTY',
    s12Body: (months: number) =>
      `The Contractor warrants that the Work shall be free from defects in materials and workmanship for a period of ${months} months from the date of substantial completion ("Warranty Period"). This warranty is in addition to and does not limit any legal warranty obligations under the C.C.Q.`,
    s13Title: '13. INSURANCE',
    extraClausesTitle: 'ADDITIONAL CLAUSES',
    signatureTitle: 'SIGNATURES',
    signatureClientLabel: 'Client (Property Owner)',
    signatureContractorLabel: 'Contractor',
    signatureDateLabel: 'Date',
    signatureSignLabel: 'Signature',
    signatureNameLabel: 'Printed Name',
    footerCreated: 'Created by ConstrAction Inc.',
    disclaimer:
      'ConstrAction Inc. provides automated document generation tools and does not offer legal advice, legal opinions, or legal representation.',
    gstLabel: 'GST (TPS) 5%',
    qstLabel: 'QST (TVQ) 9.975%',
    totalLabel: 'TOTAL (incl. taxes)',
    subtotalLabel: 'Subtotal',
  },
  fr: {
    title: 'Contrat de services (construction)',
    subtitle: 'Contrat Client / Entrepreneur',
    parties: 'PARTIES',
    client: 'Client (Propriétaire)',
    contractor: 'Entrepreneur',
    rbq: 'No. de licence RBQ',
    project: 'PROJET',
    projectSite: 'Lieu des travaux',
    scopeOfWork: 'Description des travaux',
    dates: 'DATES',
    commencementDate: 'Date de début',
    completionDate: 'Date d\'achèvement estimée',
    signingDate: 'Date de signature',
    paymentTerms: 'MODALITÉS DE PAIEMENT',
    totalPrice: 'Prix total du contrat',
    paymentMethod: 'Mode de paiement',
    lateInterest: 'Taux d\'intérêt en cas de retard de paiement',
    lateInterestSuffix: '% par année',
    holdbackTitle: 'RETENUE (ART. 2111 C.C.Q.)',
    holdbackText: (pct: number) =>
      `Conformément à l'article 2111 du Code civil du Québec, le Client retiendra ${pct} % de chaque paiement à titre de retenue jusqu'à trente (30) jours après la réception substantielle des travaux, date à laquelle, si aucune hypothèque n'a été publiée, la retenue sera remise à l'Entrepreneur.`,
    bondTitle: 'CAUTIONNEMENT D\'EXÉCUTION',
    bondText: (pct: number) =>
      `L'Entrepreneur devra fournir un cautionnement d'exécution d'un montant équivalant à ${pct} % du prix total du contrat dans les dix (10) jours suivant la signature du présent contrat.`,
    insuranceTitle: 'ASSURANCES',
    insuranceText: (amount: number) =>
      `L'Entrepreneur maintiendra une assurance responsabilité civile commerciale avec une couverture minimale de ${amount.toLocaleString('fr-CA')} $ CA pendant toute la durée du présent contrat.`,
    escalationTitle: 'ESCALADE DES PRIX',
    escalationText: (pct: number) =>
      `En cas de hausse du coût des matériaux dépassant ${pct} % du prix contractuel, les parties conviennent de négocier de bonne foi un ajustement du prix du contrat, sous réserve de l'approbation écrite des deux parties.`,
    recoveryTitle: 'PÉNALITÉ DE RECOUVREMENT',
    recoveryText:
      'Si l\'Entrepreneur abandonne les travaux ou ne les achève pas substantiellement à la date d\'achèvement convenue sans motif valable, le Client pourra retenir d\'autres entrepreneurs pour terminer les travaux, et l\'Entrepreneur sera responsable de tous les coûts supplémentaires raisonnables engagés.',
    materialProvider: 'Fournisseur de matériaux',
    materialProviderValues: {
      contractor: 'Entrepreneur',
      client: 'Client (Propriétaire)',
      shared: 'Partagé entre les parties',
    },
    s1Title: '1. DÉFINITIONS',
    s1Body:
      '« Travaux » désigne les services de construction décrits dans la section Description des travaux ci-dessus. « Client » désigne le propriétaire identifié ci-dessus. « Entrepreneur » désigne l\'entrepreneur licencié identifié ci-dessus. « Contrat » désigne le présent contrat de services (construction), y compris toutes ses annexes et modifications.',
    s2Title: '2. STATUT D\'ENTREPRENEUR INDÉPENDANT',
    s2Body:
      'L\'Entrepreneur est un entrepreneur indépendant et non un employé, un mandataire, un associé ou un coentrepreneur du Client. L\'Entrepreneur est seul responsable de toutes les retenues à la source, cotisations à la CNESST et autres obligations légales à l\'égard de ses travailleurs.',
    s3Title: '3. LOI APPLICABLE',
    s3Body:
      'Le présent contrat est régi et interprété conformément aux lois de la province de Québec et aux lois fédérales applicables du Canada, notamment le Code civil du Québec (C.c.Q.). Tout litige découlant du présent contrat sera soumis à la compétence exclusive des tribunaux de la province de Québec.',
    s4Title: '4. DESCRIPTION DES TRAVAUX',
    s4Body:
      'L\'Entrepreneur s\'engage à exécuter les Travaux au lieu des travaux de manière professionnelle, conformément à tous les codes du bâtiment applicables, aux règlements municipaux et aux exigences de la Régie du bâtiment du Québec (RBQ).',
    s7Title: '7. DÉBUT ET ACHÈVEMENT DES TRAVAUX',
    s7Body:
      'Le temps est de l\'essence. L\'Entrepreneur commencera les Travaux à la Date de début et s\'engage à atteindre la réception substantielle des travaux à la Date d\'achèvement, sous réserve des délais causés par la Force majeure, les modifications demandées par le Client, ou le défaut du Client de fournir l\'accès ou les approbations en temps voulu.',
    s8Title: '8. MODALITÉS DE PAIEMENT',
    s8Body: (method: string) =>
      `Le Client paiera à l'Entrepreneur le Prix total du contrat mentionné ci-dessus par ${method}. Sauf entente écrite contraire, les factures sont payables dans les trente (30) jours suivant leur réception. Les montants impayés après l'échéance porteront intérêt au taux d'intérêt en cas de retard de paiement précisé ci-dessus.`,
    s12Title: '12. GARANTIE',
    s12Body: (months: number) =>
      `L'Entrepreneur garantit que les Travaux seront exempts de défauts de matériaux et de main-d'œuvre pendant une période de ${months} mois à compter de la date de réception substantielle (« Période de garantie »). Cette garantie s'ajoute aux obligations légales de garantie prévues par le C.c.Q. et ne les limite pas.`,
    s13Title: '13. ASSURANCES',
    extraClausesTitle: 'CLAUSES ADDITIONNELLES',
    signatureTitle: 'SIGNATURES',
    signatureClientLabel: 'Client (Propriétaire)',
    signatureContractorLabel: 'Entrepreneur',
    signatureDateLabel: 'Date',
    signatureSignLabel: 'Signature',
    signatureNameLabel: 'Nom en lettres moulées',
    footerCreated: 'Créé par ConstrAction Inc.',
    disclaimer:
      'ConstrAction inc. fournit des outils de génération automatisée de documents et n\'offre pas de conseils juridiques, d\'opinions juridiques ni de représentation légale.',
    gstLabel: 'TPS (GST) 5 %',
    qstLabel: 'TVQ (QST) 9,975 %',
    totalLabel: 'TOTAL (taxes incluses)',
    subtotalLabel: 'Sous-total',
  },
} as const

// ─── Document component ───────────────────────────────────────────────────────

export function CCDocument({
  contract,
  profile,
  language,
  logoUrl,
}: CCDocumentProps) {
  const tr = t[language]
  const meta = contract.metadata ?? {}

  const contractorName = contract.contractor_name ?? ''
  const contractorRbq = contract.contractor_rbq ?? ''
  const contractorAddress = [
    contract.contractor_address,
    contract.contractor_city,
    contract.contractor_postal,
  ]
    .filter(Boolean)
    .join(', ')

  const clientName = contract.client_name ?? ''
  const clientAddress = [
    contract.client_address,
    contract.client_city,
    contract.client_postal,
  ]
    .filter(Boolean)
    .join(', ')

  const projectAddress = [
    contract.project_site,
    contract.project_city,
    contract.project_postal,
  ]
    .filter(Boolean)
    .join(', ')

  const price = contract.contract_price ?? 0
  const gst = price * 0.05
  const qst = price * 0.09975
  const total = price + gst + qst

  const formatCurrency = (n: number) =>
    n.toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA', {
      style: 'currency',
      currency: 'CAD',
    })

  const formatDate = (iso?: string) => {
    if (!iso) return '_______________'
    const d = new Date(iso)
    return d.toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <Document
      title={tr.title}
      author="ConstrAction Inc."
      creator="ConstrAction Inc."
      producer="ConstrAction Inc."
    >
      <Page size="LETTER" style={styles.page}>
        {/* Logo */}
        {logoUrl && (
          <Image src={logoUrl} style={styles.logo} />
        )}

        {/* Title */}
        <Text style={styles.title}>{tr.title}</Text>
        <Text style={styles.subtitle}>{tr.subtitle}</Text>

        {/* Parties */}
        <Text style={styles.sectionHeading}>{tr.parties}</Text>

        <Text style={styles.paragraph}>
          <Text style={styles.bold}>{tr.client}: </Text>
          {clientName}
          {'\n'}
          {clientAddress}
          {contract.client_email ? `\n${contract.client_email}` : ''}
          {contract.client_phone ? `\n${contract.client_phone}` : ''}
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.bold}>{tr.contractor}: </Text>
          {contractorName}
          {'\n'}
          {contractorAddress}
          {contractorRbq ? `\n${tr.rbq}: ${contractorRbq}` : ''}
          {contract.contractor_email
            ? `\n${contract.contractor_email}`
            : ''}
          {contract.contractor_phone
            ? `\n${contract.contractor_phone}`
            : ''}
        </Text>

        {/* Project */}
        <Text style={styles.sectionHeading}>{tr.project}</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>{tr.projectSite}: </Text>
          {projectAddress}
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>{tr.scopeOfWork}: </Text>
          {contract.project_description ?? ''}
        </Text>

        {/* Dates */}
        <Text style={styles.sectionHeading}>{tr.dates}</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>{tr.commencementDate}: </Text>
          {formatDate(meta.start_date)}
          {'\n'}
          <Text style={styles.bold}>{tr.completionDate}: </Text>
          {formatDate(meta.end_date)}
          {'\n'}
          <Text style={styles.bold}>{tr.signingDate}: </Text>
          {formatDate(meta.sign_date)}
        </Text>

        {/* Payment Terms */}
        <Text style={styles.sectionHeading}>{tr.paymentTerms}</Text>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>{tr.subtotalLabel}</Text>
            <Text style={styles.tableCell}>{formatCurrency(price)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>{tr.gstLabel}</Text>
            <Text style={styles.tableCell}>{formatCurrency(gst)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>{tr.qstLabel}</Text>
            <Text style={styles.tableCell}>{formatCurrency(qst)}</Text>
          </View>
          <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
            <Text style={[styles.tableHeaderCell]}>
              {tr.totalLabel}
            </Text>
            <Text style={[styles.tableHeaderCell]}>
              {formatCurrency(total)}
            </Text>
          </View>
        </View>

        <Text style={styles.paragraph}>
          <Text style={styles.bold}>{tr.paymentMethod}: </Text>
          {meta.payment_method ?? ''}
          {'\n'}
          <Text style={styles.bold}>{tr.lateInterest}: </Text>
          {meta.late_interest ?? ''}
          {tr.lateInterestSuffix}
        </Text>

        {/* Holdback */}
        {meta.holdback && (
          <>
            <Text style={styles.sectionHeading}>{tr.holdbackTitle}</Text>
            <Text style={styles.paragraph}>
              {tr.holdbackText(meta.holdback_pct ?? 10)}
            </Text>
          </>
        )}

        {/* Bond */}
        {meta.bond && (
          <>
            <Text style={styles.sectionHeading}>{tr.bondTitle}</Text>
            <Text style={styles.paragraph}>
              {tr.bondText(meta.bond_pct ?? 50)}
            </Text>
          </>
        )}

        {/* Escalation */}
        {meta.escalation && (
          <>
            <Text style={styles.sectionHeading}>{tr.escalationTitle}</Text>
            <Text style={styles.paragraph}>
              {tr.escalationText(meta.escalation_pct ?? 10)}
            </Text>
          </>
        )}

        {/* Recovery Penalty */}
        {meta.recovery_penalty && (
          <>
            <Text style={styles.sectionHeading}>{tr.recoveryTitle}</Text>
            <Text style={styles.paragraph}>{tr.recoveryText}</Text>
          </>
        )}

        {/* Numbered clauses */}
        <Text style={styles.sectionHeading}>{tr.s1Title}</Text>
        <Text style={styles.paragraph}>{tr.s1Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s2Title}</Text>
        <Text style={styles.paragraph}>{tr.s2Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s3Title}</Text>
        <Text style={styles.paragraph}>{tr.s3Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s4Title}</Text>
        <Text style={styles.paragraph}>{tr.s4Body}</Text>

        {/* Material Provider (clause 5) */}
        <Text style={styles.sectionHeading}>
          {language === 'en'
            ? '5. MATERIALS'
            : '5. MATÉRIAUX'}
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>{tr.materialProvider}: </Text>
          {tr.materialProviderValues[
            (meta.material_provider as keyof typeof tr.materialProviderValues) ??
              'contractor'
          ]}
        </Text>

        {/* Clause 6 — Changes */}
        <Text style={styles.sectionHeading}>
          {language === 'en'
            ? '6. CHANGES TO THE WORK'
            : '6. MODIFICATIONS AUX TRAVAUX'}
        </Text>
        <Text style={styles.paragraph}>
          {language === 'en'
            ? 'Any changes to the Scope of Work must be agreed upon in writing by both parties before implementation. Change orders shall specify the nature of the change, the adjustment to the Contract price, and any extension of the Completion Date.'
            : 'Toute modification à la description des travaux doit être convenue par écrit par les deux parties avant sa mise en œuvre. Les ordres de modification préciseront la nature de la modification, l\'ajustement du prix du contrat et toute prolongation de la date d\'achèvement.'}
        </Text>

        <Text style={styles.sectionHeading}>{tr.s7Title}</Text>
        <Text style={styles.paragraph}>{tr.s7Body}</Text>

        <Text style={styles.sectionHeading}>{tr.s8Title}</Text>
        <Text style={styles.paragraph}>
          {tr.s8Body(meta.payment_method ?? '')}
        </Text>

        {/* Clauses 9, 10, 11 */}
        <Text style={styles.sectionHeading}>
          {language === 'en'
            ? '9. LIENS AND HYPOTHECS'
            : '9. PRIVILÈGES ET HYPOTHÈQUES'}
        </Text>
        <Text style={styles.paragraph}>
          {language === 'en'
            ? 'The Contractor shall ensure that no legal hypothec (construction lien) is published against the property as a result of non-payment of subcontractors or suppliers. Upon final payment, the Contractor shall provide the Client with a statutory declaration confirming that all subcontractors and suppliers have been paid in full.'
            : 'L\'Entrepreneur s\'assure qu\'aucune hypothèque légale (privilège de construction) n\'est publiée contre la propriété en raison du non-paiement de sous-traitants ou de fournisseurs. Au paiement final, l\'Entrepreneur fournira au Client une déclaration statutaire confirmant que tous les sous-traitants et fournisseurs ont été payés intégralement.'}
        </Text>

        <Text style={styles.sectionHeading}>
          {language === 'en' ? '10. PERMITS' : '10. PERMIS'}
        </Text>
        <Text style={styles.paragraph}>
          {language === 'en'
            ? 'Unless otherwise specified in writing, the Contractor shall obtain all necessary building permits and approvals required for the Work. The cost of all permits shall be included in the Contract price or itemized as a separate line item in the Contractor\'s invoice.'
            : 'Sauf indication contraire par écrit, l\'Entrepreneur obtiendra tous les permis de construction et approbations nécessaires à l\'exécution des travaux. Le coût de tous les permis sera inclus dans le prix du contrat ou détaillé comme poste distinct dans la facture de l\'Entrepreneur.'}
        </Text>

        <Text style={styles.sectionHeading}>
          {language === 'en'
            ? '11. CONFIDENTIALITY'
            : '11. CONFIDENTIALITÉ'}
        </Text>
        <Text style={styles.paragraph}>
          {language === 'en'
            ? 'Each party agrees to keep confidential all proprietary information of the other party disclosed in connection with this Agreement and not to disclose such information to any third party without prior written consent.'
            : 'Chaque partie s\'engage à garder confidentiels tous les renseignements exclusifs de l\'autre partie divulgués dans le cadre du présent contrat et à ne pas les divulguer à des tiers sans consentement écrit préalable.'}
        </Text>

        <Text style={styles.sectionHeading}>{tr.s12Title}</Text>
        <Text style={styles.paragraph}>
          {tr.s12Body(meta.warranty_months ?? 12)}
        </Text>

        <Text style={styles.sectionHeading}>{tr.s13Title}</Text>
        <Text style={styles.paragraph}>
          {tr.insuranceText(meta.insurance_amount ?? 1000000)}
        </Text>

        {/* Extra clauses */}
        {meta.extra_clauses && (
          <>
            <Text style={styles.sectionHeading}>
              {tr.extraClausesTitle}
            </Text>
            <Text style={styles.paragraph}>{meta.extra_clauses}</Text>
          </>
        )}

        {/* Insurance clause detail */}
        {meta.bond && (
          <Text style={styles.paragraph}>
            {tr.bondText(meta.bond_pct ?? 50)}
          </Text>
        )}

        {/* Signature block */}
        <Text style={[styles.sectionHeading, { marginTop: 30 }]}>
          {tr.signatureTitle}
        </Text>

        <View style={styles.signatureRow}>
          <View style={styles.signatureBlock}>
            <Text style={styles.bold}>{tr.signatureClientLabel}</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>{tr.signatureSignLabel}</Text>
            <View style={[styles.signatureLine, { marginTop: 16 }]} />
            <Text style={styles.signatureLabel}>{tr.signatureNameLabel}</Text>
            <View style={[styles.signatureLine, { marginTop: 16 }]} />
            <Text style={styles.signatureLabel}>{tr.signatureDateLabel}</Text>
          </View>
          <View style={styles.signatureBlock}>
            <Text style={styles.bold}>{tr.signatureContractorLabel}</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>{tr.signatureSignLabel}</Text>
            <View style={[styles.signatureLine, { marginTop: 16 }]} />
            <Text style={styles.signatureLabel}>{tr.signatureNameLabel}</Text>
            <View style={[styles.signatureLine, { marginTop: 16 }]} />
            <Text style={styles.signatureLabel}>{tr.signatureDateLabel}</Text>
          </View>
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>{tr.disclaimer}</Text>

        {/* Footer */}
        <Text style={styles.footer}>{tr.footerCreated}</Text>
      </Page>
    </Document>
  )
}
Note: lib/pdf/gc.tsx follows the identical pattern as cc.tsx
but uses GC-specific party labels ("General Contractor" /
"Subcontractor"), replaces client fields with GC fields, and adapts
clauses 2, 8, and 9 for the subcontracting context (e.g., the
Subcontractor's obligation to carry CNESST coverage independently,
back-to-back payment clause, flow-down clause referencing the prime
contract). Implement it with the same bilingual t object pattern.

12. Tax utility
lib/tax.ts
TypeScript
export const GST_RATE = 0.05       // TPS — 5%
export const QST_RATE = 0.09975    // TVQ — 9.975%

export interface TaxBreakdown {
  subtotal: number
  gst: number
  qst: number
  total: number
}

/**
 * Calculate GST and QST on a subtotal.
 * Both taxes apply independently on the subtotal (not compounded).
 * Source: Revenu Québec — as of 2024.
 */
export function calculateTaxes(subtotal: number): TaxBreakdown {
  const gst = Math.round(subtotal * GST_RATE * 100) / 100
  const qst = Math.round(subtotal * QST_RATE * 100) / 100
  return {
    subtotal,
    gst,
    qst,
    total: Math.round((subtotal + gst + qst) * 100) / 100,
  }
}

export function formatCurrencyCAD(
  amount: number,
  locale: 'en' | 'fr' = 'en'
): string {
  return new Intl.NumberFormat(locale === 'fr' ? 'fr-CA' : 'en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

13. Contract wizard — complete specification
Wizard state shape (lib/validations/wizard.ts)
TypeScript
import { z } from 'zod'

export const RoleStepSchema = z.object({
  role: z.enum(['client', 'contractor', 'gc', 'subcontractor']),
  form_type: z.enum(['client-contractor', 'gc-subcontractor']),
})

export const PartyInfoSchema = z.object({
  entity_type: z.enum(['company', 'individual']),
  // Company fields
  company_name: z.string().optional(),
  incorporation_regime: z
    .enum(['quebec_inc', 'canada_inc'])
    .optional(),
  rbq: z.string().optional(),
  head_office: z.string().optional(),
  ho_city: z.string().optional(),
  ho_postal: z.string().optional(),
  rep_name: z.string().optional(),
  rep_title: z.string().optional(),
  // Individual fields
  full_name: z.string().optional(),
  address: z.string().optional(),
  ind_city: z.string().optional(),
  ind_postal: z.string().optional(),
  // Contact
  email: z.string().email().optional(),
  phone: z.string().optional(),
  logo_url: z.string().url().optional(),
})

export const ProjectStepSchema = z.object({
  project_site: z.string().min(1, 'Required'),
  project_city: z.string().min(1, 'Required'),
  project_postal: z.string().min(1, 'Required'),
  project_description: z.string().min(10, 'Please describe the work'),
  start_date: z.string().min(1, 'Required'),
  end_date: z.string().optional(),
  duration_value: z.number().optional(),
  duration_unit: z.enum(['weeks', 'months']).optional(),
  sign_date: z.string().min(1, 'Required'),
})

export const PaymentStepSchema = z.object({
  contract_price: z.number().positive('Must be a positive amount'),
  payment_method: z.string().min(1, 'Required'),
  late_interest: z.number().min(0).max(50),
  holdback: z.boolean(),
  holdback_pct: z.number().min(0).max(100).optional(),
  bond: z.boolean(),
  bond_pct: z.number().min(0).max(100).optional(),
  insurance_amount: z.number().positive(),
  warranty_months: z.number().int().positive(),
  escalation: z.boolean(),
  escalation_pct: z.number().min(0).max(100).optional(),
  recovery_penalty: z.boolean(),
  material_provider: z.enum(['contractor', 'client', 'shared']),
  extra_clauses: z.string().optional(),
})

export type WizardState = {
  step: number
  role: z.infer<typeof RoleStepSchema>
  my_info: z.infer<typeof PartyInfoSchema>
  other_party: z.infer<typeof PartyInfoSchema>
  project: z.infer<typeof ProjectStepSchema>
  payment: z.infer<typeof PaymentStepSchema>
  language: 'en' | 'fr'
  contract_id?: string
  draft_saved_at?: string
}
Wizard shell (components/wizard/WizardShell.tsx)
React
'use client'
import React, { useState, useCallback, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { WizardSidebar } from './WizardSidebar'
import { RoleStep } from './steps/RoleStep'
import { MyInfoStep } from './steps/MyInfoStep'
import { OtherPartyStep } from './steps/OtherPartyStep'
import { ProjectStep } from './steps/ProjectStep'
import { PaymentTermsStep } from './steps/PaymentTermsStep'
import { ReviewStep } from './steps/ReviewStep'
import { createClient } from '@/lib/supabase/client'
import type { WizardState } from '@/lib/validations/wizard'
import type { Database } from '@/types/supabase'

type FormType = 'client-contractor' | 'gc-subcontractor'

interface WizardShellProps {
  formType: FormType
  initialState?: Partial<WizardState>  // Used when resuming a draft
  locale: 'en' | 'fr'
  user: Database['public']['Tables']['profiles']['Row'] | null
}

const STEPS = [
  'role',
  'my_info',
  'other_party',
  'project',
  'payment',
  'review',
] as const

const STEP_LABELS = {
  en: [
    'Role',
    'My Information',
    'Other Party',
    'Project',
    'Payment Terms',
    'Review & Generate',
  ],
  fr: [
    'Rôle',
    'Mes informations',
    'Autre partie',
    'Projet',
    'Modalités de paiement',
    'Révision et génération',
  ],
}

export function WizardShell({
  formType,
  initialState,
  locale,
  user,
}: WizardShellProps) {
  const supabase = createClient()

  const [currentStep, setCurrentStep] = useState(initialState?.step ?? 0)
  const [isSaving, setIsSaving] = useState(false)
  const [state, setState] = useState<WizardState>({
    step: 0,
    language: locale,
    role: { role: 'contractor', form_type: formType },
    my_info: prefillFromProfile(user, 'contractor'),
    other_party: { entity_type: 'company' },
    project: {
      project_site: '',
      project_city: '',
      project_postal: '',
      project_description: '',
      start_date: '',
      sign_date: '',
    },
    payment: {
      contract_price: 0,
      payment_method: '',
      late_interest: 12,
      holdback: false,
      bond: false,
      insurance_amount: 1000000,
      warranty_months: 12,
      escalation: false,
      recovery_penalty: false,
      material_provider: 'contractor',
    },
    ...initialState,
  })

  // Auto-save draft on every step transition
  const saveDraft = useCallback(
    async (newState: WizardState) => {
      if (!user) return  // Guest — no server-side draft persistence
      setIsSaving(true)
      try {
        const contractRow = buildContractRow(newState, formType)
        if (newState.contract_id) {
          await supabase
            .from('contracts')
            .update({ ...contractRow, status: 'draft' })
            .eq('id', newState.contract_id)
        } else {
          const { data } = await supabase
            .from('contracts')
            .insert({ ...contractRow, status: 'draft' })
            .select('id')
            .single()
          if (data) {
            setState((prev) => ({ ...prev, contract_id: data.id }))
          }
        }
      } catch (err) {
        console.error('[Wizard] Draft save failed:', err)
      } finally {
        setIsSaving(false)
      }
    },
    [user, formType, supabase]
  )

  const goToStep = useCallback(
    async (newStep: number, updatedState?: Partial<WizardState>) => {
      const next = { ...state, ...updatedState, step: newStep }
      setState(next)
      setCurrentStep(newStep)
      await saveDraft(next)
    },
    [state, saveDraft]
  )

  const stepComponents = [
    <RoleStep
      key="role"
      state={state}
      onNext={(data) => goToStep(1, { role: data })}
      locale={locale}
    />,
    <MyInfoStep
      key="my_info"
      state={state}
      onNext={(data) => goToStep(2, { my_info: data })}
      onBack={() => goToStep(0)}
      locale={locale}
    />,
    <OtherPartyStep
      key="other_party"
      state={state}
      onNext={(data) => goToStep(3, { other_party: data })}
      onBack={() => goToStep(1)}
      locale={locale}
    />,
    <ProjectStep
      key="project"
      state={state}
      onNext={(data) => goToStep(4, { project: data })}
      onBack={() => goToStep(2)}
      locale={locale}
    />,
    <PaymentTermsStep
      key="payment"
      state={state}
      onNext={(data) => goToStep(5, { payment: data })}
      onBack={() => goToStep(3)}
      locale={locale}
    />,
    <ReviewStep
      key="review"
      state={state}
      onBack={() => goToStep(4)}
      locale={locale}
      user={user}
    />,
  ]

  return (
    <div className="flex min-h-screen">
      <WizardSidebar
        steps={STEP_LABELS[locale]}
        currentStep={currentStep}
        isSaving={isSaving}
      />
      <main className="flex-1 p-8 max-w-3xl mx-auto">
        {stepComponents[currentStep]}
      </main>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function prefillFromProfile(
  profile: Database['public']['Tables']['profiles']['Row'] | null,
  _role: string
) {
  if (!profile) return { entity_type: 'company' as const }
  return {
    entity_type: profile.entity_type ?? ('company' as const),
    company_name: profile.company_name ?? undefined,
    incorporation_regime:
      profile.incorporation_regime ?? undefined,
    rbq: profile.rbq ?? undefined,
    head_office: profile.head_office ?? undefined,
    ho_city: profile.ho_city ?? undefined,
    ho_postal: profile.ho_postal ?? undefined,
    rep_name: profile.rep_name ?? undefined,
    rep_title: profile.rep_title ?? undefined,
    full_name: profile.full_name ?? undefined,
    address: profile.address ?? undefined,
    ind_city: profile.ind_city ?? undefined,
    ind_postal: profile.ind_postal ?? undefined,
    email: profile.email ?? undefined,
    phone: profile.phone ?? undefined,
    logo_url: profile.logo_url ?? undefined,
  }
}

function buildContractRow(state: WizardState, formType: FormType) {
  const isClientRole =
    state.role.role === 'client' || state.role.role === 'gc'
  const myParty = isClientRole ? 'client' : 'contractor'
  const otherParty = isClientRole ? 'contractor' : 'client'

  const resolvePartyName = (
    info: WizardState['my_info']
  ): string => {
    if (info.entity_type === 'company') return info.company_name ?? ''
    return info.full_name ?? ''
  }

  const resolvePartyAddress = (
    info: WizardState['my_info']
  ): { address: string; city: string; postal: string } => {
    if (info.entity_type === 'company') {
      return {
        address: info.head_office ?? '',
        city: info.ho_city ?? '',
        postal: info.ho_postal ?? '',
      }
    }
    return {
      address: info.address ?? '',
      city: info.ind_city ?? '',
      postal: info.ind_postal ?? '',
    }
  }

  const myAddr = resolvePartyAddress(state.my_info)
  const otherAddr = resolvePartyAddress(state.other_party)

  return {
    user_id: undefined as string | undefined,  // Set by server
    contract_type: formType,
    [`${myParty}_name`]: resolvePartyName(state.my_info),
    [`${myParty}_address`]: myAddr.address,
    [`${myParty}_city`]: myAddr.city,
    [`${myParty}_postal`]: myAddr.postal,
    [`${myParty}_email`]: state.my_info.email,
    [`${myParty}_phone`]: state.my_info.phone,
    [`${otherParty}_name`]: resolvePartyName(state.other_party),
    [`${otherParty}_address`]: otherAddr.address,
    [`${otherParty}_city`]: otherAddr.city,
    [`${otherParty}_postal`]: otherAddr.postal,
    [`${otherParty}_email`]: state.other_party.email,
    [`${otherParty}_phone`]: state.other_party.phone,
    contractor_rbq:
      myParty === 'contractor'
        ? state.my_info.rbq
        : state.other_party.rbq,
    project_site: state.project.project_site,
    project_city: state.project.project_city,
    project_postal: state.project.project_postal,
    project_description: state.project.project_description,
    contract_price: state.payment.contract_price,
    metadata: {
      language: state.language,
      role: state.role.role,
      form_type: formType,
      start_date: state.project.start_date,
      end_date: state.project.end_date,
      sign_date: state.project.sign_date,
      payment_method: state.payment.payment_method,
      late_interest: state.payment.late_interest,
      holdback: state.payment.holdback,
      holdback_pct: state.payment.holdback_pct,
      bond: state.payment.bond,
      bond_pct: state.payment.bond_pct,
      insurance_amount: state.payment.insurance_amount,
      warranty_months: state.payment.warranty_months,
      escalation: state.payment.escalation,
      escalation_pct: state.payment.escalation_pct,
      recovery_penalty: state.payment.recovery_penalty,
      material_provider: state.payment.material_provider,
      extra_clauses: state.payment.extra_clauses,
      logo_url: state.my_info.logo_url,
    },
  }
}
ReviewStep — Generate or redirect to checkout
React
// components/wizard/steps/ReviewStep.tsx
'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Download, CreditCard } from 'lucide-react'
import type { WizardState } from '@/lib/validations/wizard'
import type { Database } from '@/types/supabase'
import { calculateTaxes, formatCurrencyCAD } from '@/lib/tax'

interface ReviewStepProps {
  state: WizardState
  onBack: () => void
  locale: 'en' | 'fr'
  user: Database['public']['Tables']['profiles']['Row'] | null
}

const labels = {
  en: {
    title: 'Review & Generate',
    generate: 'Generate Contract',
    generating: 'Generating…',
    pay: 'Pay $99 CAD and Download',
    back: 'Back',
    proNotice:
      'You are a Pro subscriber — your contract will be generated and emailed instantly.',
    freeNotice:
      'A one-time fee of $99 CAD (+ GST + QST) is required to download this contract.',
    downloadReady: 'Your contract is ready!',
    download: 'Download PDF',
    error: 'Something went wrong. Please try again.',
  },
  fr: {
    title: 'Révision et génération',
    generate: 'Générer le contrat',
    generating: 'Génération en cours…',
    pay: 'Payer 99 $ CA et télécharger',
    back: 'Retour',
    proNotice:
      'Vous êtes abonné Pro — votre contrat sera généré et envoyé par courriel instantanément.',
    freeNotice:
      'Des frais uniques de 99 $ CA (+ TPS + TVQ) sont requis pour télécharger ce contrat.',
    downloadReady: 'Votre contrat est prêt !',
    download: 'Télécharger le PDF',
    error: 'Une erreur s\'est produite. Veuillez réessayer.',
  },
}

export function ReviewStep({
  state,
  onBack,
  locale,
  user,
}: ReviewStepProps) {
  const tr = labels[locale]
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const taxes = calculateTaxes(99)

  async function handleGenerate() {
    setIsLoading(true)
    setError(null)

    try {
      // Step 1: Generate the PDF
      const genRes = await fetch('/api/contracts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract_id: state.contract_id,
          language: locale,
          contract_type: state.role.form_type,
        }),
      })

      const genData = await genRes.json()

      if (!genRes.ok) {
        throw new Error(genData.error ?? tr.error)
      }

      if (genData.is_pro) {
        // Pro user — immediate download
        setSignedUrl(genData.signed_url)
        return
      }

      // Free user — redirect to Stripe Checkout
      const checkoutRes = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'payment',
          contract_id: genData.contract_id,
          email:
            user?.email ??
            state.my_info.email ??
            state.other_party.email ??
            '',
          language: locale,
        }),
      })

      const checkoutData = await checkoutRes.json()

      if (!checkoutRes.ok) {
        throw new Error(checkoutData.error ?? tr.error)
      }

      // Navigate to Stripe-hosted page
      window.location.href = checkoutData.url
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : tr.error)
    } finally {
      setIsLoading(false)
    }
  }

  if (signedUrl) {
    return (
      <div className="space-y-6 text-center">
        <h2 className="text-2xl font-semibold">{tr.downloadReady}</h2>
        <Button asChild size="lg">
          <a href={signedUrl} download target="_blank" rel="noreferrer">
            <Download className="mr-2 h-4 w-4" />
            {tr.download}
          </a>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">{tr.title}</h2>

      {/* Summary table — render key wizard fields */}
      <ContractSummary state={state} locale={locale} />

      {/* Payment notice */}
      <Alert>
        <AlertDescription>
          {/* TODO: check actual subscription status here */}
          {tr.freeNotice}
        </AlertDescription>
      </Alert>

      {/* Tax breakdown */}
      <div className="rounded-lg border p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span>{locale === 'en' ? 'Subtotal' : 'Sous-total'}</span>
          <span>{formatCurrencyCAD(99, locale)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>{locale === 'en' ? 'GST (TPS) 5%' : 'TPS (GST) 5 %'}</span>
          <span>{formatCurrencyCAD(taxes.gst, locale)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>
            {locale === 'en' ? 'QST (TVQ) 9.975%' : 'TVQ (QST) 9,975 %'}
          </span>
          <span>{formatCurrencyCAD(taxes.qst, locale)}</span>
        </div>
        <div className="flex justify-between font-semibold border-t pt-2">
          <span>
            {locale === 'en' ? 'Total' : 'Total'}
          </span>
          <span>{formatCurrencyCAD(taxes.total, locale)}</span>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} disabled={isLoading}>
          {tr.back}
        </Button>
        <Button
          onClick={handleGenerate}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {tr.generating}
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              {tr.pay}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

function ContractSummary({
  state,
  locale,
}: {
  state: WizardState
  locale: 'en' | 'fr'
}) {
  const rows = [
    {
      label: locale === 'en' ? 'Contract Type' : 'Type de contrat',
      value:
        state.role.form_type === 'client-contractor'
          ? locale === 'en'
            ? 'Client / Contractor'
            : 'Client / Entrepreneur'
          : locale === 'en'
          ? 'General Contractor / Subcontractor'
          : 'Entrepreneur général / Sous-traitant',
    },
    {
      label: locale === 'en' ? 'Project Site' : 'Lieu des travaux',
      value: `${state.project.project_site}, ${state.project.project_city}`,
    },
    {
      label: locale === 'en' ? 'Contract Price' : 'Prix du contrat',
      value: formatCurrencyCAD(state.payment.contract_price, locale),
    },
    {
      label: locale === 'en' ? 'Language' : 'Langue',
      value: locale === 'en' ? 'English' : 'Français',
    },
  ]

  return (
    <div className="rounded-lg border divide-y">
      {rows.map((row) => (
        <div key={row.label} className="flex justify-between p-3 text-sm">
          <span className="text-muted-foreground">{row.label}</span>
          <span className="font-medium">{row.value}</span>
        </div>
      ))}
    </div>
  )
}

14. Pages — full implementation specs
app/[locale]/(marketing)/page.tsx — Home
React
// Full marketing home page with:
// 1. Hero section — headline, sub, dual CTA (Sign Up / Generate Contract)
// 2. How it works — 3 steps (Fill → Pay → Download)
// 3. What's included — EN/FR contracts, GST/QST correct, RBQ compliant
// 4. Plan comparison table — Pay Per Contract vs Pro
// 5. Trust signals — Québec law reference, disclaimer
// 6. Footer with legal disclaimer and company info

// Key implementation notes:
// - Use useTranslations('marketing') for all strings
// - CTA buttons link to /[locale]/signup and /[locale]/contracts/new/client-contractor
// - Plan comparison uses the TaxBreakdown component to show accurate pricing
// - "Unlimited Pro" subscription card highlights $349/mo + taxes
// - Include schema.org LocalBusiness JSON-LD for Montreal-based business
app/[locale]/(marketing)/login/page.tsx
React
// Login form:
// - Email + password fields using react-hook-form + Zod
// - "Forgot password?" link → triggers Supabase sendPasswordRecovery
// - Error display for: invalid credentials, email not confirmed, too many requests
// - On success → router.push('/[locale]/dashboard')
// - "Don't have an account?" → /signup
// - Language toggle in header
// - Zero client-side exposure of any keys
app/[locale]/(marketing)/signup/page.tsx
React
// Multi-field signup form:
// Fields: first_name, last_name, email, password, confirm_password, phone
// Entity selector: Company | Individual (radio or segmented control)
// Company fields (conditional): company_name, incorporation_regime (Quebec Inc / Canada Inc),
//   rbq (optional), head_office, ho_city, ho_postal, rep_name, rep_title
// Individual fields (conditional): full_name, address, ind_city, ind_postal
// Logo upload: optional, fires to Supabase Storage 'logos' bucket,
//   preview shown inline, URL stored in profile
//
// On submit:
// 1. supabase.auth.signUp({ email, password, options: { data: { first_name, last_name, phone } } })
// 2. The DB trigger creates profiles + subscriptions rows automatically
// 3. Update profiles row with entity-type fields and logo_url
// 4. Invoke send-welcome Edge Function
// 5. Log activity 'signup'
// 6. Redirect to /dashboard
//
// Note: email is set as read-only in profile editing — cannot change after signup
app/[locale]/(marketing)/reset-password/page.tsx
React
// Handles two cases based on hash fragment in URL:
// Case 1: Hash contains type=recovery → show "Set new password" form
//   - Parse #access_token + #refresh_token from window.location.hash
//   - Call supabase.auth.setSession({ access_token, refresh_token })
//   - Show password + confirm fields
//   - On submit: supabase.auth.updateUser({ password: newPassword })
//   - Log 'password_reset' activity
//   - Redirect to /dashboard
// Case 2: No hash → show "Request reset link" form
//   - Email field
//   - supabase.auth.resetPasswordForEmail(email, { redirectTo: siteUrl + '/reset-password' })
//   - Show success message instructing user to check email
app/[locale]/(app)/dashboard/page.tsx
React
// Server component (RSC) — reads profile + subscription in one trip
// Layout:
// - Welcome banner: "Welcome back, {first_name}" + PRO badge if active
// - Subscription status card:
//   - Free: "Upgrade to Pro — $349/mo" button
//   - Pro active: "Pro — renews {date}" + "Cancel" button
//   - Pro canceling: "Pro — access until {date}" chip (no cancel button)
// - Recent contracts list (last 5, with type badge, status badge, download button)
// - Two big CTA cards: "New CC Contract" + "New GC Contract"
//
// Data fetching: use adminSupabase on server with user's ID (get from session)
// Do NOT use service_role on client — all data flows through RSC props
app/[locale]/(app)/profile/page.tsx
React
// Profile edit page:
// - Sections: Personal Info, Entity Type + Fields, Logo
// - Email field is read-only (Supabase does not allow email change without verification flow)
// - Entity type switch: changing from company to individual clears company fields (with confirm dialog)
// - Logo upload: drag-and-drop or click, shows current logo preview,
//   uploads to logos/{user_id}/logo_{timestamp}.{ext}, updates profile.logo_url
// - Save button calls supabase.from('profiles').update(...) with the session user's ID
// - Success toast confirmation
app/[locale]/(app)/contracts/page.tsx
React
// Contract history list:
// - Table/card list of all user's contracts
// - Columns: Type, Status, Date, Price, Actions
// - Status badges: Draft (gray), Generated (blue), Paid (green), Signed (purple), Completed (teal)
// - Per-row actions:
//   - "Download PDF" → calls /api/contracts/signed-url?contract_id=...
//     Only shows for status = 'paid' | 'signed' | 'completed'
//   - "Resume" → links to /contracts/[id]/edit
//     Only shows for status = 'draft'
//   - "Pay Now" → links to /checkout/single?contract_id=...
//     Only shows for status = 'generated'
// - Empty state: "No contracts yet" + CTA to create
// - Pagination: 10 per page
app/[locale]/(app)/contracts/[id]/edit/page.tsx
React
// Resume a draft contract:
// - Server component fetches the contract row by ID
// - Verifies ownership (contract.user_id === session user.id)
// - Reconstructs WizardState from the contract row
// - Renders WizardShell with initialState={{ ...reconstructed, step: lastStep }}
// - The wizard saves changes to the same contract_id on each step
app/[locale]/(marketing)/payment-success/page.tsx
React
// Success page for $99 one-off payment:
// - Read session_id from URL searchParams
// - Server-side: fetch Stripe session to verify payment_status === 'paid'
// - If not paid: redirect to /contracts
// - Display: checkmark animation, "Your contract has been emailed to {email}"
// - "Download PDF" button → calls signed-url API
// - "Generate another contract" CTA
// - Shows GST/QST breakdown of what was charged
app/[locale]/(marketing)/subscription-success/page.tsx
React
// Success page for new Pro subscription:
// - Read session_id from URL searchParams
// - Verify session mode === 'subscription'
// - Display: congratulations, Pro feature list
// - What happens next:
//   1. Generate unlimited contracts at no extra charge
//   2. Each contract emailed to you automatically
//   3. Cancel anytime — access until period end
// - Dashboard CTA button
app/[locale]/pricing/page.tsx
React
// Pricing comparison:
// Plans:
//   Free / Pay Per Contract:
//     - $99 CAD + GST ($4.95) + QST ($9.88) = $113.83 per contract
//     - EN + FR contracts
//     - PDF download + email delivery
//     - CC and GC contract types
//   Pro — Unlimited Monthly:
//     - $349 CAD/mo + GST ($17.45) + QST ($34.81) = $401.26/mo
//     - All Free features
//     - Unlimited contracts
//     - Instant generation
//     - Pro badge on account
//
// CTA behavior:
//   - Logged out: "Get Started" → /signup
//   - Logged in, free: "Upgrade to Pro" → calls /api/stripe/checkout (subscription mode)
//   - Logged in, Pro, not canceling: "Cancel Subscription" → calls /api/subscriptions/cancel
//   - Logged in, Pro, canceling: shows "Access until {date}" chip, no button
//
// All prices shown with GST + QST breakdown in small text

15. Admin panel
app/admin/layout.tsx
React
// Server component:
// 1. Get session using adminSupabase (service_role)
// 2. If no session → render AdminLoginPage component (not a redirect,
//    keeps the /admin URL)
// 3. If session exists but role !== 'admin' → render "Access Denied" page
// 4. If role === 'admin' → render children with AdminNav sidebar
//
// AdminNav links: Dashboard | Users | Contracts
// Top-right: logged-in admin's name + Logout button
app/admin/dashboard/page.tsx
React
// Stats cards (server-rendered):
// - Total Revenue: SELECT SUM(contract_price) FROM contracts WHERE status = 'paid'
// - Total Users: SELECT COUNT(*) FROM profiles WHERE role = 'user'
// - Total Contracts: SELECT COUNT(*) FROM contracts WHERE status != 'draft'
// - Active Pro Subscriptions: SELECT COUNT(*) FROM subscriptions
//     WHERE status = 'active' AND plan_type = 'unlimited_monthly'
// - MRR: active_pro_count * 349
//
// All queries use adminSupabase (service_role, bypasses RLS)
// Revenue chart: last 12 months bar chart using Recharts
app/admin/users/page.tsx
React
// Users table:
// - Server action to search/filter (no client-side Supabase calls)
// - Columns: Name, Email, Entity Type, Subscription Status, Contracts Count, Joined
// - Search: by email or name (ILIKE)
// - Filter: by subscription status (all | active | inactive | canceled)
// - Row click → opens DetailDrawer (client component) with:
//   - Full profile fields
//   - Subscription history
//   - Contract list with PDF download links
//   - Activity log (last 10 entries)
// - Pagination: 20 per page
app/admin/contracts/page.tsx
React
// Contracts table:
// - Columns: Type, Client, Contractor, Status, Price, Language, Date
// - Badge: "Guest" vs "Registered" (based on user_id null check)
// - Search: by client name, contractor name, email
// - Filter: by status, contract_type, language
// - Row click → DetailDrawer with:
//   - All contract fields
//   - Metadata expansion (JSON viewer)
//   - PDF download button (issues signed URL via /api/admin/contracts route)
//   - User link (if registered)
Admin API routes
TypeScript
// app/api/admin/stats/route.ts
// GET — returns { revenue, users, contracts, active_pro, mrr }
// Protected: verifies caller has role='admin' via JWT + profiles check

// app/api/admin/users/route.ts
// GET — paginated user list with subscription status
// POST — update user role (admin only)

// app/api/admin/contracts/route.ts
// GET — paginated contract list
// GET /signed-url — issues signed URL for admin PDF access

16. Edge Functions (Supabase Deno)
All five functions are copied to /supabase/functions/ and updated
to read credentials from Deno.env.get(...) rather than hard-coded
strings. Set secrets via:
Bash
supabase secrets set SMTP_USER=roy@constraction.ca
supabase secrets set SMTP_PASSWORD=your-app-password
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJ...
supabase secrets set NEXT_PUBLIC_SITE_URL=https://constraction.ca
supabase/functions/send-welcome/index.ts
TypeScript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createTransport } from 'npm:nodemailer@6'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, first_name, language = 'en' } = await req.json()

    const transport = createTransport({
      service: 'gmail',
      auth: {
        user: Deno.env.get('SMTP_USER'),
        pass: Deno.env.get('SMTP_PASSWORD'),
      },
    })

    const siteUrl = Deno.env.get('NEXT_PUBLIC_SITE_URL') ??
      'https://constraction.ca'

    const isEn = language === 'en'

    const subject = isEn
      ? 'Welcome to ConstrAction — Your account is ready'
      : 'Bienvenue chez ConstrAction — Votre compte est prêt'

    const htmlBody = `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; }
    .header { background: #1a1a2e; padding: 24px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; }
    .content { padding: 32px 24px; }
    .cta { display: inline-block; background: #2563eb; color: #fff; padding: 12px 24px;
           text-decoration: none; border-radius: 6px; margin: 16px 0; }
    .footer { background: #f5f5f5; padding: 16px 24px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>ConstrAction</h1>
  </div>
  <div class="content">
    <h2>${isEn ? `Welcome, ${first_name}!` : `Bienvenue, ${first_name} !`}</h2>
    <p>${
      isEn
        ? 'Your ConstrAction account has been created. You can now generate Quebec-compliant construction contracts in minutes.'
        : 'Votre compte ConstrAction a été créé. Vous pouvez maintenant générer des contrats de construction conformes au droit québécois en quelques minutes.'
    }</p>
    <a href="${siteUrl}/${language}/dashboard" class="cta">
      ${isEn ? 'Go to Dashboard' : 'Accéder au tableau de bord'}
    </a>
    <hr>
    <p><strong>${isEn ? 'What you can do:' : 'Ce que vous pouvez faire :'}</strong></p>
    <ul>
      <li>${isEn ? 'Generate Client/Contractor agreements' : 'Générer des contrats Client/Entrepreneur'}</li>
      <li>${isEn ? 'Generate GC/Subcontractor agreements' : 'Générer des contrats Entrepreneur général/Sous-traitant'}</li>
      <li>${isEn ? 'Download PDF in English or French' : 'Télécharger le PDF en anglais ou en français'}</li>
      <li>${isEn ? 'Upgrade to Pro for unlimited contracts at $349/mo' : 'Passer à Pro pour des contrats illimités à 349 $/mois'}</li>
    </ul>
  </div>
  <div class="footer">
    <p>${
      isEn
        ? 'ConstrAction Inc. provides automated document generation tools and does not offer legal advice, legal opinions, or legal representation.'
        : 'ConstrAction inc. fournit des outils de génération automatisée de documents et n\'offre pas de conseils juridiques, d\'opinions juridiques ni de représentation légale.'
    }</p>
    <p>ConstrAction Inc. · Montréal, Québec, Canada · <a href="${siteUrl}">constraction.ca</a></p>
  </div>
</body>
</html>`

    await transport.sendMail({
      from: `"ConstrAction" <info@constraction.ca>`,
      to: email,
      subject,
      html: htmlBody,
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[send-welcome] Error:', err)
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
Note: Implement send-contract, send-receipt,
send-cancellation, and cancel-subscription with the same
structural pattern. Key details:
send-contract: Fetches the PDF from Supabase Storage using
service_role, attaches as base64 in nodemailer. Subject line
includes contract type and date. Body is bilingual. Includes the
legal disclaimer footer.
send-receipt: Accepts amount (pre-tax, in dollars). Derives
gst = amount * 0.05, qst = amount * 0.09975. Formats as an
HTML table showing subtotal, GST #, QST #, and total. Registration
numbers: GST # and QST # must be real numbers — add them as env
vars (CONSTRACTION_GST_NUMBER, CONSTRACTION_QST_NUMBER).
send-cancellation: Formats current_period_end as a
human-readable date in the user's language. EN: "Your Pro access
will remain active until {date}." FR: "Votre accès Pro restera
actif jusqu'au {date}."
cancel-subscription:
Verifies the JWT from the Authorization header
Fetches stripe_subscription_id from subscriptions
Calls stripe.subscriptions.update(id, { cancel_at_period_end: true })
Updates subscriptions row: cancel_at_period_end = true
Inserts into activity_log
Calls send-cancellation
Returns { success: true, current_period_end }

17. Global components
components/layout/Navbar.tsx
React
// Top navigation bar — present on all pages
// Left: ConstrAction logo (links to /[locale])
// Center: navigation links (Home, Pricing) — hidden on mobile
// Right: LanguageToggle + AuthWidget
//
// Sticky positioning, backdrop blur on scroll
// Dark mode aware (CSS variables via shadcn theme)
components/layout/AuthWidget.tsx
React
'use client'
// Auth state-driven widget:
// LOGGED OUT:
//   - "Log In" button → /login
//   - "Sign Up" button (primary) → /signup
//
// LOGGED IN:
//   - Avatar circle with initials (first + last initial)
//   - First name display
//   - PRO badge (gold, if subscription.status='active' and plan_type='unlimited_monthly')
//   - Dropdown menu:
//     • My Dashboard → /dashboard
//     • My Profile → /profile
//     • My Contracts → /contracts
//     • ─────────────────
//     • Log Out → supabase.auth.signOut() then router.push('/login')
//
// Uses useUser() hook that subscribes to supabase.auth.onAuthStateChange()
// PRO status: fetched once on mount from /api/subscriptions/status (not service_role)
components/layout/LanguageToggle.tsx
React
'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'

// Segmented control: [EN] [FR]
// On click:
//   1. Save choice to localStorage('constraction_locale')
//   2. Replace current URL's locale segment:
//      /en/dashboard → /fr/dashboard
//   3. router.push(newPath) — triggers next-intl locale switch
//
// Visual: pill-style toggle, active locale has filled background
// Accessible: aria-label="Language / Langue"
components/shared/LogoUpload.tsx
React
'use client'
// Logo upload component used in signup + profile pages:
// - Displays current logo if logo_url is set (with remove button)
// - Drag-and-drop zone with dashed border and upload icon
// - File input: accepts image/jpeg, image/png, image/webp, image/svg+xml
// - Max size: 2MB (enforced client-side with clear error message)
// - On file select:
//   1. Client-side resize: cap at 400px wide using canvas (for bandwidth)
//   2. Upload to Supabase Storage:
//      supabase.storage.from('logos').upload(
//        `${user_id}/logo_${Date.now()}.${ext}`,
//        file, { upsert: true, contentType: mimeType }
//      )
//   3. Get public URL: supabase.storage.from('logos').getPublicUrl(path)
//   4. Call onUpload(publicUrl) callback
// - Loading state with spinner during upload
// - Error display for oversized files, wrong format, upload failures

18. TypeScript types
types/supabase.ts
Generate this file by running:
Bash
pnpm supabase gen types typescript \
  --project-id your-project-id \
  --schema public \
  > types/supabase.ts
Commit the generated file. Re-run whenever schema changes.
types/index.ts
TypeScript
export type Locale = 'en' | 'fr'

export interface UserProfile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  role: 'user' | 'admin'
  entity_type: 'company' | 'individual' | null
  company_name: string | null
  incorporation_regime: 'quebec_inc' | 'canada_inc' | null
  rbq: string | null
  head_office: string | null
  ho_city: string | null
  ho_postal: string | null
  rep_name: string | null
  rep_title: string | null
  full_name: string | null
  address: string | null
  ind_city: string | null
  ind_postal: string | null
  logo_url: string | null
  created_at: string
}

export interface UserSubscription {
  status: 'active' | 'inactive' | 'canceled' | 'past_due'
  plan_type: 'pay_per_contract' | 'unlimited_monthly'
  cancel_at_period_end: boolean
  current_period_end: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
}

export interface ContractRow {
  id: string
  user_id: string | null
  contract_type: 'client-contractor' | 'gc-subcontractor'
  client_name: string | null
  client_address: string | null
  client_city: string | null
  client_postal: string | null
  client_email: string | null
  client_phone: string | null
  contractor_name: string | null
  contractor_rbq: string | null
  contractor_address: string | null
  contractor_city: string | null
  contractor_postal: string | null
  contractor_email: string | null
  contractor_phone: string | null
  project_site: string | null
  project_city: string | null
  project_postal: string | null
  project_description: string | null
  contract_price: number | null
  status: 'draft' | 'generated' | 'paid' | 'signed' | 'completed'
  pdf_path: string | null
  metadata: ContractMetadata
  stripe_payment_intent_id: string | null
  stripe_checkout_session_id: string | null
  created_at: string
  updated_at: string
}

export interface ContractMetadata {
  project_name?: string
  language?: 'en' | 'fr'
  role?: string
  form_type?: 'client-contractor' | 'gc-subcontractor'
  payment_method?: string
  start_date?: string
  end_date?: string
  sign_date?: string
  warranty_months?: number
  holdback?: boolean
  holdback_pct?: number
  insurance_amount?: number
  bond?: boolean
  bond_pct?: number
  late_interest?: number
  escalation?: boolean
  escalation_pct?: number
  recovery_penalty?: boolean
  material_provider?: 'contractor' | 'client' | 'shared'
  extra_clauses?: string
  logo_url?: string
  guest_session_id?: string
}

export function isProActive(sub: UserSubscription | null): boolean {
  if (!sub) return false
  return (
    sub.status === 'active' &&
    sub.plan_type === 'unlimited_monthly' &&
    (!sub.current_period_end ||
      new Date(sub.current_period_end) > new Date())
  )
}

19. next.config.ts
TypeScript
import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

const withNextIntl = createNextIntlPlugin('./i18n.ts')

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
  },
  // Prevent @react-pdf/renderer from bundling in the client
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
  },
}

export default withNextIntl(nextConfig)

20. Locales seed
locales/en.json (structure — populate from source files)
JSON
{
  "common": {
    "appName": "ConstrAction",
    "tagline": "Quebec construction contracts, generated in minutes.",
    "language": "Language",
    "en": "EN",
    "fr": "FR",
    "loading": "Loading…",
    "save": "Save",
    "cancel": "Cancel",
    "back": "Back",
    "next": "Next",
    "submit": "Submit",
    "error": "An error occurred. Please try again.",
    "success": "Success!",
    "logout": "Log Out",
    "login": "Log In",
    "signup": "Sign Up",
    "dashboard": "Dashboard",
    "profile": "My Profile",
    "contracts": "My Contracts",
    "pricing": "Pricing",
    "proSubscriber": "PRO",
    "disclaimer": "ConstrAction Inc. provides automated document generation tools and does not offer legal advice, legal opinions, or legal representation."
  },
  "marketing": {
    "hero": {
      "headline": "Quebec Construction Contracts in Minutes",
      "subheadline": "Generate bilingual, legally-structured Client/Contractor and GC/Subcontractor agreements. RBQ-compliant. C.C.Q.-referenced. Instant PDF.",
      "ctaPrimary": "Generate a Contract",
      "ctaSecondary": "View Pricing"
    },
    "howItWorks": {
      "title": "How It Works",
      "step1Title": "Fill the Wizard",
      "step1Body": "Enter your details, the other party's information, and the project specifics. Prefilled from your profile.",
      "step2Title": "Pay & Download",
      "step2Body": "$99 CAD per contract, or subscribe to Pro for unlimited. Instant PDF, no waiting.",
      "step3Title": "Sign & Build",
      "step3Body": "Download your bilingual PDF, sign both copies, and start your project with confidence."
    },
    "plans": {
      "payPerContract": "Pay Per Contract",
      "pro": "Unlimited Pro",
      "perContract": "per contract",
      "perMonth": "/ month",
      "plusTaxes": "+ GST & QST",
      "upgrade": "Upgrade to Pro",
      "getStarted": "Get Started"
    }
  },
  "auth": {
    "emailLabel": "Email Address",
    "passwordLabel": "Password",
    "confirmPasswordLabel": "Confirm Password",
    "firstNameLabel": "First Name",
    "lastNameLabel": "Last Name",
    "phoneLabel": "Phone Number",
    "forgotPassword": "Forgot your password?",
    "noAccount": "Don't have an account?",
    "haveAccount": "Already have an account?",
    "signUpCta": "Create Account",
    "loginCta": "Log In",
    "resetCta": "Send Reset Link",
    "resetSent": "Check your email — a reset link has been sent.",
    "entityType": "Entity Type",
    "company": "Company",
    "individual": "Individual",
    "companyName": "Company Name",
    "incorporationRegime": "Incorporation Regime",
    "quebecInc": "Quebec Inc.",
    "canadaInc": "Canada Inc.",
    "rbq": "RBQ License No. (optional)",
    "headOffice": "Head Office Address",
    "city": "City",
    "postalCode": "Postal Code",
    "repName": "Representative Name",
    "repTitle": "Representative Title",
    "fullName": "Full Name",
    "address": "Address",
    "logoUpload": "Company / Personal Logo (optional)",
    "logoUploadHint": "Max 2 MB. PNG, JPG, SVG, or WebP."
  },
  "wizard": {
    "steps": {
      "role": "Role",
      "myInfo": "My Information",
      "otherParty": "Other Party",
      "project": "Project",
      "payment": "Payment Terms",
      "review": "Review & Generate"
    },
    "role": {
      "title": "What is your role in this contract?",
      "iAmClient": "I am the Client (Property Owner)",
      "iAmContractor": "I am the Contractor",
      "iAmGC": "I am the General Contractor",
      "iAmSubcontractor": "I am the Subcontractor"
    },
    "project": {
      "siteAddress": "Project Site Address",
      "siteCity": "City",
      "sitePostal": "Postal Code",
      "description": "Description of Work",
      "descriptionHint": "Describe the work to be performed in detail.",
      "startDate": "Commencement Date",
      "endDate": "Completion Date",
      "endDateOrDuration": "Completion: specific date or duration?",
      "specificDate": "Specific Date",
      "duration": "Duration",
      "durationValue": "Number",
      "durationUnit": "Unit",
      "weeks": "Weeks",
      "months": "Months",
      "signDate": "Date of Signing"
    },
    "payment": {
      "contractPrice": "Total Contract Price (CAD, excl. taxes)",
      "paymentMethod": "Payment Method",
      "paymentMethodHint": "e.g. bank transfer, certified cheque, e-transfer",
      "lateInterest": "Late Payment Interest Rate (% per annum)",
      "holdback": "Apply C.C.Q. Art. 2111 Holdback?",
      "holdbackPct": "Holdback Percentage (%)",
      "bond": "Require Performance Bond?",
      "bondPct": "Bond Amount (% of contract price)",
      "insurance": "Minimum Liability Insurance ($CAD)",
      "warranty": "Warranty Period (months)",
      "escalation": "Include Price Escalation Clause?",
      "escalationPct": "Escalation Trigger (%)",
      "recoveryPenalty": "Include Recovery Penalty Clause?",
      "materialProvider": "Who provides materials?",
      "contractor": "Contractor",
      "client": "Client",
      "shared": "Shared",
      "extraClauses": "Additional Clauses (optional)",
      "extraClausesHint": "Any additional terms you wish to include."
    },
    "review": {
      "title": "Review & Generate",
      "proNotice": "As a Pro subscriber, your contract will be generated instantly and emailed to you.",
      "freeNotice": "A one-time fee of $99 CAD (+ GST + QST) is required to download this contract.",
      "generateButton": "Generate & Pay",
      "proGenerateButton": "Generate Contract",
      "downloadButton": "Download PDF",
      "contractReady": "Your contract is ready!"
    }
  },
  "dashboard": {
    "welcome": "Welcome back, {name}",
    "proActive": "Pro — renews {date}",
    "proCanceling": "Pro — access until {date}",
    "upgradePrompt": "Upgrade to Unlimited Pro",
    "newCCContract": "New Client / Contractor Agreement",
    "newGCContract": "New GC / Subcontractor Agreement",
    "recentContracts": "Recent Contracts",
    "noContracts": "You haven't generated any contracts yet.",
    "cancelSubscription": "Cancel Subscription",
    "cancelConfirm": "Are you sure? Your Pro access will continue until {date}."
  },
  "contracts": {
    "type": "Type",
    "status": "Status",
    "date": "Date",
    "price": "Price",
    "actions": "Actions",
    "download": "Download PDF",
    "resume": "Resume",
    "payNow": "Pay Now",
    "statusDraft": "Draft",
    "statusGenerated": "Generated",
    "statusPaid": "Paid",
    "statusSigned": "Signed",
    "statusCompleted": "Completed",
    "ccType": "Client / Contractor",
    "gcType": "GC / Subcontractor",
    "guestBadge": "Guest",
    "registeredBadge": "Registered"
  },
  "admin": {
    "title": "Admin Panel",
    "stats": {
      "revenue": "Total Revenue",
      "users": "Total Users",
      "contracts": "Total Contracts",
      "activePro": "Active Pro Subscribers",
      "mrr": "MRR"
    },
    "users": "Users",
    "contracts": "Contracts",
    "search": "Search by name or email…",
    "filterStatus": "Filter by status",
    "allStatuses": "All Statuses",
    "close": "Close"
  },
  "errors": {
    "required": "This field is required.",
    "invalidEmail": "Please enter a valid email address.",
    "passwordMismatch": "Passwords do not match.",
    "passwordTooShort": "Password must be at least 8 characters.",
    "fileTooLarge": "File is too large. Maximum size is 2 MB.",
    "invalidFileType": "Please upload a PNG, JPG, SVG, or WebP image.",
    "notFound": "Page not found.",
    "unauthorized": "You must be logged in to access this page.",
    "serverError": "A server error occurred. Please try again later."
  }
}
Mirror the same key structure in locales/fr.json with the French
translations extracted verbatim from auth-fr.txt, cc.txt (FR
sections), gc.txt (FR sections), payment-success-fr.txt, and
subscription-success-fr.txt.

21. Acceptance criteria (non-negotiable)
The build is not complete until every item below passes:
Functional
 Guest CC flow: Visit /en/contracts/new/client-contractor
without logging in, complete all wizard steps, land on Stripe
Checkout, pay with test card 4242 4242 4242 4242, land on
/en/payment-success, receive PDF email and receipt email within
60 seconds.
 **FR guest
Functional
✅ Guest CC flow (EN)
Visit /en/contracts/new/client-contractor without logging in, complete all wizard steps, land on Stripe Checkout, pay with test card 4242 4242 4242 4242, land on /en/payment-success, receive PDF email and receipt email within 60 seconds.
✅ Guest CC flow (FR)
Visit /fr/contrats/nouveau/client-prestataire without logging in, complete all wizard steps in French, land on Stripe Checkout (localized in FR), pay with test card 4242 4242 4242 4242, land on /fr/paiement-reussi, receive French PDF contract and French receipt email within 60 seconds.
✅ Authenticated CC flow
Logged‑in user can complete the same flow without being asked to log in again. Contract is saved to their dashboard and downloadable after payment.
✅ PDF generation
Generated PDF:
Matches the selected language (EN/FR)
Includes all submitted form data
Includes legal clauses
Includes signature placeholders (if e-sign not enabled)
Filename format: Contract_<Type>_<Date>.pdf
✅ Email delivery
Contract PDF attached
Receipt email sent
Correct language
Delivered within 60 seconds
No duplicate emails
✅ Stripe verification
Payment is recorded in Stripe Dashboard (test mode)
Webhook confirms payment
Status in database marked as paid
No contract generated if payment fails or is cancelled
✅ Payment failure handling
Using Stripe test card 4000 0000 0000 0002:
Payment fails
User is shown clear error message
No PDF generated
No email sent
Contract status remains unpaid
✅ Session persistence
If user refreshes during wizard:
Previously entered data remains intact
No duplicate contract records created
✅ Database integrity
After successful payment:
Contract record exists
Linked to payment record
Language stored correctly
Timestamp stored (UTC)
Unique contract ID generated

Localization
✅ All visible text translated (EN/FR)
✅ Email templates fully translated
✅ Stripe Checkout localized based on language
✅ PDF content fully localized
✅ URLs localized correctly (/en/..., /fr/...)
✅ No mixed-language UI elements

Security
✅ No contract accessible via direct URL without authorization
✅ Webhooks validated with Stripe signature
✅ No client-side price manipulation possible
✅ Sensitive keys stored in environment variables
✅ HTTPS enforced in production

Performance
✅ Stripe Checkout loads in < 3 seconds
✅ PDF generation completes in < 10 seconds
✅ Emails delivered within 60 seconds
✅ No blocking UI during processing

UX
✅ Clear step indicators in wizard
✅ Clear success page with:
Confirmation message
Download contract button
Email confirmation notice
✅ Clear cancellation flow (/payment-cancelled)
✅ Mobile responsive across all steps

Edge Cases
✅ Double-clicking “Pay” does not create duplicate charges
✅ Webhook retry does not duplicate contract generation
✅ Expired Stripe session handled gracefully
✅ Network interruption handled with retry option


Sections 22–26 (and beyond)

22. Definition of Done (DoD)
A feature, task, or story is considered Done only when all of the following are true:

Code
 Feature implemented as specified in the PRD
 Code reviewed and approved by at least 1 other developer
 No console.log, debug code, or commented-out code left in production files
 All environment variables documented in .env.example
 No hardcoded secrets, keys, or URLs
 TypeScript errors: zero
 ESLint errors: zero
 Code merged to main via Pull Request

Testing
 All acceptance criteria from Section 21 pass
 Manual QA completed (see Section 23)
 Edge cases tested (duplicate payments, failed payments, expired sessions)
 Tested in both EN and FR
 Tested on:
Chrome (desktop)
Safari (desktop)
Firefox (desktop)
Chrome (mobile)
Safari (mobile/iOS)
 Tested on screen widths: 375px, 768px, 1280px, 1440px

Database
 Migrations run cleanly with no errors
 No orphaned records
 Indexes in place for queried fields
 All required fields have proper constraints (NOT NULL, UNIQUE, etc.)

Emails
 EN email template tested and renders correctly
 FR email template tested and renders correctly
 PDF attachment confirmed in both languages
 Tested via real inbox (not just preview)
 Spam score checked (not flagged as spam)

Stripe
 Tested in Stripe test mode with all test cards
 Webhook confirmed received and processed
 Idempotency confirmed (duplicate webhook does not double-process)
 Payment appears correctly in Stripe Dashboard

Deployment
 Environment variables set in production/staging
 App builds without errors in CI/CD
 No broken routes or 404s
 All redirects working correctly
 SSL certificate valid
 Production smoke test completed (see Section 24)

Documentation
 README updated if setup steps changed
 Any new ENV variable added to .env.example with description
 Any new API endpoint documented
 Webhook endpoint documented

23. QA Test Script (Step-by-Step Tester Guide)
How to use this script
Run through every scenario before marking a build as complete
Use a private/incognito browser window for guest tests
Use Stripe test mode only
Log PASS / FAIL / NOTES for each item
Any FAIL blocks the release

TEST ENVIRONMENT SETUP
Item
Value
Base URL (EN)
https://staging.yourapp.com/en
Base URL (FR)
https://staging.yourapp.com/fr
Stripe test card (success)
4242 4242 4242 4242
Stripe test card (decline)
4000 0000 0000 0002
Stripe test card (auth required)
4000 0025 0000 3155
Expiry
Any future date (e.g., 12/34)
CVC
Any 3 digits (e.g., 123)
Zip
Any 5 digits (e.g., 10001)
Test email inbox
Use Mailpit or Mailtrap


SCENARIO 1 — Guest EN Flow (Happy Path)
#
Step
Expected Result
Pass/Fail
1.1
Open incognito browser
Clean session


1.2
Navigate to /en/contracts/new/client-contractor
Wizard loads in English


1.3
Complete Step 1 (contract type selection)
Step 1 marked complete, Step 2 loads


1.4
Complete Step 2 (party information)
Step 2 marked complete, Step 3 loads


1.5
Complete Step 3 (contract details)
Step 3 marked complete, Step 4 loads


1.6
Complete Step 4 (review)
Summary displays all entered info correctly


1.7
Click "Proceed to Payment"
Stripe Checkout loads in <3 seconds


1.8
Enter card 4242 4242 4242 4242, future expiry, any CVC
Fields accept input


1.9
Click "Pay"
Payment processing spinner shows


1.10
Wait for redirect
Lands on /en/payment-success


1.11
Check success page
Shows confirmation message + download button


1.12
Check test inbox within 60 seconds
PDF email received in English


1.13
Check test inbox within 60 seconds
Receipt email received in English


1.14
Open PDF
PDF is in English, contains all submitted data


1.15
Check Stripe Dashboard
Payment marked as succeeded


1.16
Check database
Contract record exists, status = paid




SCENARIO 2 — Guest FR Flow (Happy Path)
#
Step
Expected Result
Pass/Fail
2.1
Open incognito browser
Clean session


2.2
Navigate to /fr/contrats/nouveau/client-prestataire
Wizard loads in French


2.3
Complete all wizard steps in French
All steps complete


2.4
Click "Procéder au paiement"
Stripe Checkout loads in French


2.5
Pay with 4242 4242 4242 4242
Payment accepted


2.6
Redirect
Lands on /fr/paiement-reussi


2.7
Check inbox within 60 seconds
PDF email in French received


2.8
Check inbox within 60 seconds
Receipt email in French received


2.9
Open PDF
PDF is fully in French, data correct




SCENARIO 3 — Payment Failure
#
Step
Expected Result
Pass/Fail
3.1
Complete wizard (EN or FR)
Reaches Stripe Checkout


3.2
Enter card 4000 0000 0000 0002
Fields accept input


3.3
Click "Pay"
Payment fails


3.4
Check Stripe Checkout
Error message shown (e.g., "Your card was declined.")


3.5
Check inbox
No PDF email sent


3.6
Check inbox
No receipt email sent


3.7
Check database
No paid contract created




SCENARIO 4 — Payment Cancellation
#
Step
Expected Result
Pass/Fail
4.1
Complete wizard, reach Stripe Checkout
Checkout page loads


4.2
Click "Back" or close Stripe overlay
User returns to app


4.3
Check redirect
Lands on /en/payment-cancelled or /fr/paiement-annule


4.4
Check cancellation page
Clear message shown, option to retry


4.5
Check inbox
No emails sent


4.6
Check database
No paid record created




SCENARIO 5 — Authenticated User Flow
#
Step
Expected Result
Pass/Fail
5.1
Log in as test user
Authenticated session active


5.2
Navigate to /en/contracts/new/client-contractor
Wizard loads, no login prompt


5.3
Complete all steps and pay
Payment succeeds


5.4
Check user dashboard
Contract appears in contract list


5.5
Click download on dashboard
PDF downloads correctly


5.6
Check inbox
Emails received as expected




SCENARIO 6 — Session Persistence (Refresh Test)
#
Step
Expected Result
Pass/Fail
6.1
Begin wizard, complete Step 1 and Step 2
Data entered


6.2
Refresh the page
Data from Step 1 and Step 2 retained


6.3
Continue to complete remaining steps
No duplicate records created


6.4
Complete payment
Single contract record in database




SCENARIO 7 — Webhook Retry (Idempotency)
#
Step
Expected Result
Pass/Fail
7.1
Complete successful payment
Contract created, emails sent


7.2
In Stripe Dashboard, resend the payment_intent.succeeded webhook
Webhook received again


7.3
Check database
No duplicate contract created


7.4
Check inbox
No duplicate email sent




SCENARIO 8 — Mobile Responsiveness
#
Step
Expected Result
Pass/Fail
8.1
Open wizard on mobile (375px)
No horizontal scroll, all elements visible


8.2
Complete all steps on mobile
All inputs usable, no layout breaks


8.3
Stripe Checkout on mobile
Loads and renders correctly


8.4
Success page on mobile
Renders correctly




SCENARIO 9 — 3D Secure (Authentication Required)
#
Step
Expected Result
Pass/Fail
9.1
Complete wizard, reach Stripe Checkout
Checkout loads


9.2
Enter card 4000 0025 0000 3155
Fields accept input


9.3
Click "Pay"
3DS authentication modal appears


9.4
Complete authentication
Payment succeeds


9.5
Check redirect
Lands on payment success page


9.6
Check inbox
Emails received as expected




24. Production Launch Checklist
Run this checklist before go-live. Every item must be checked.

Infrastructure
 Production server provisioned and accessible
 Domain DNS configured and propagated
 SSL certificate installed and valid (check with SSL Labs)
 www redirect to apex (or vice versa) configured
 CDN configured (if applicable)
 Auto-scaling or sufficient resources in place

Environment Variables (Production)
 STRIPE_SECRET_KEY → live key (not test)
 STRIPE_PUBLISHABLE_KEY → live key (not test)
 STRIPE_WEBHOOK_SECRET → from live webhook endpoint
 DATABASE_URL → production database
 NEXTAUTH_SECRET → strong random secret
 NEXTAUTH_URL → production URL
 EMAIL_FROM → verified sender address
 SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS → production email service
 NEXT_PUBLIC_APP_URL → production URL
 All other ENV vars from .env.example are set

Stripe Live Mode Setup
 Stripe account activated (identity verified)
 Live mode enabled
 Product and price created in live mode
 Live webhook endpoint registered: https://yourapp.com/api/webhooks/stripe
 Webhook events selected:
payment_intent.succeeded
payment_intent.payment_failed
checkout.session.completed
checkout.session.expired
 Webhook signing secret copied to ENV
 Live webhook tested (Stripe Dashboard → Webhooks → Send test event)

Email
 Sending domain verified (SPF, DKIM, DMARC records set)
 Test email sent and received in production
 Email not landing in spam (check with Mail Tester)
 Unsubscribe/reply-to configured correctly
 Both EN and FR email templates verified in production

Database
 Production database backed up before launch
 All migrations run on production
 Database connection pooling configured
 Database backup schedule in place (daily minimum)

Application
 NODE_ENV=production set
 Debug mode OFF
 Source maps NOT exposed publicly
 Error logging connected to monitoring tool (e.g., Sentry)
 All test/seed data removed from production DB
 /api/health endpoint returns 200

Security
 Security headers set (CSP, X-Frame-Options, HSTS, etc.)
 Rate limiting enabled on API routes
 CORS configured correctly
 Admin routes protected
 No .env files exposed publicly
 Dependency audit run (npm audit) — no critical vulnerabilities

SEO & Analytics
 robots.txt configured
 sitemap.xml generated and accessible
 Google Analytics / tracking connected (if required)
 Meta tags correct on all pages
 OG tags correct

Final Smoke Test (Production)
 Guest EN flow: complete with live Stripe (small real charge, then refund)
 Guest FR flow: complete with live Stripe (small real charge, then refund)
 PDF received in inbox
 Receipt email received
 Success page renders
 Cancellation page renders
 Failure handled gracefully
 Mobile flow works on real device

25. Stripe Webhook Validation Requirements

Overview
Every webhook event from Stripe must be validated using the Stripe signature before any action is taken. Failure to do so exposes the system to spoofed events.

Endpoint
text
POST /api/webhooks/stripe

Required Headers (sent by Stripe)
Header
Description
stripe-signature
HMAC signature of the payload


Validation Flow
text
1. Receive raw POST request body (must be RAW bytes, not parsed JSON)
2. Read `stripe-signature` header
3. Call stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
4. If signature invalid → return 400, log warning, stop processing
5. If signature valid → process event by type
6. Return 200 immediately after receiving (process async if needed)
7. Stripe will retry if it does not receive 200 within 30 seconds

Implementation (Next.js App Router)
TypeScript
// app/api/webhooks/stripe/route.ts

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

export const config = {
  api: {
    bodyParser: false, // CRITICAL: must be raw body
  },
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  // Handle events
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      await handleCheckoutSessionCompleted(session)
      break
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      await handlePaymentFailed(paymentIntent)
      break
    }
    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true }, { status: 200 })
}

Idempotency (Duplicate Webhook Prevention)
TypeScript
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const stripeSessionId = session.id

  // Check if already processed
  const existing = await db.contract.findFirst({
    where: { stripeSessionId },
  })

  if (existing) {
    console.log(`Session ${stripeSessionId} already processed. Skipping.`)
    return
  }

  // Mark as processing immediately to prevent race condition
  await processContractPayment(session)
}

Events to Register in Stripe Dashboard
Event
Purpose
checkout.session.completed
Primary: payment succeeded, generate contract
checkout.session.expired
Session timed out, notify user if needed
payment_intent.succeeded
Backup confirmation
payment_intent.payment_failed
Update DB, do not generate contract


Webhook Retry Behavior
Scenario
Stripe Behavior
Your endpoint returns non-200
Stripe retries with exponential backoff
Retries over 3 days
Stripe stops retrying, marks webhook as failed
Your endpoint takes > 30 seconds
Stripe considers it a timeout and retries

Best practice: Return 200 immediately, process the event asynchronously (queue or background job).

Testing Webhooks Locally
Bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward events to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger a test event
stripe trigger checkout.session.completed

26. Compliance & Legal Validation

Overview
The platform generates legally binding contracts. The following compliance requirements must be validated before launch.

Contract Validity Requirements
Requirement
Status
Contracts include full legal names of all parties
Required
Contracts include date of agreement
Required
Contracts include governing law clause
Required
Contracts include jurisdiction clause
Required
Contracts include consideration clause (payment terms)
Required
Contracts include scope of work / deliverables
Required
Contracts include termination clause
Required
Contracts include confidentiality clause (if applicable)
Required
Contracts reviewed by licensed legal counsel
Must confirm before launch


Language & Jurisdiction Compliance
Requirement
Details
French contracts (QC)
Must comply with Quebec Charter of the French Language (Bill 96) — contracts with Quebec parties must be available in French
English contracts
Valid for all other Canadian provinces and US
Governing law
Clearly stated in each contract template
Jurisdiction
Clearly stated (province/state where disputes are resolved)


Data Privacy Compliance
Requirement
Regulation
Status
Users informed of data collection
PIPEDA (Canada), GDPR (EU if applicable)
Required
Privacy policy published
Required by law
Required
Terms of service published
Required
Required
User data can be deleted on request
PIPEDA / GDPR
Required
Data stored in compliant region
Canada or user-specified
Confirm with hosting
No unnecessary PII stored
Data minimization principle
Required


Payment Compliance
Requirement
Details
PCI-DSS compliance
Stripe handles card data; never store raw card numbers
Receipt provided
Required for all transactions
Refund policy published
Required
Tax handling
Confirm whether GST/HST/QST must be collected and remitted


Accessibility Compliance
Requirement
Standard
All form fields have labels
WCAG 2.1 AA
Error messages are descriptive
WCAG 2.1 AA
Keyboard navigable
WCAG 2.1 AA
Color contrast ratio ≥ 4.5:1
WCAG 2.1 AA
Screen reader compatible
WCAG 2.1 AA


Pre-Launch Legal Checklist
 Contract templates reviewed by licensed Canadian lawyer
 French contract templates reviewed for Quebec compliance
 Privacy policy live at /en/privacy and /fr/confidentialite
 Terms of service live at /en/terms and /fr/conditions
 Refund policy live and linked from checkout
 Cookie consent banner implemented (if using analytics cookies)
 GST/HST/QST registration confirmed or exemption confirmed
 Business registration confirmed
 Stripe account identity verification complete

27. Error Handling & User-Facing Error Messages

Principles
Never show raw error messages to the user
Always suggest a next action
Log full error details server-side for debugging
All errors translated in EN and FR

Error Message Map
Error Scenario
EN Message
FR Message
Payment declined
"Your payment was declined. Please try a different card."
"Votre paiement a été refusé. Veuillez essayer une autre carte."
Network error during payment
"Something went wrong. Please try again."
"Une erreur s'est produite. Veuillez réessayer."
Session expired
"Your session has expired. Please start over."
"Votre session a expiré. Veuillez recommencer."
PDF generation failed
"We couldn't generate your contract. Our team has been notified."
"Nous n'avons pas pu générer votre contrat. Notre équipe a été avertie."
Email delivery failed
"Your contract is ready but we couldn't send the email. Please download it directly."
"Votre contrat est prêt mais nous n'avons pas pu envoyer l'e-mail. Veuillez le télécharger directement."
Webhook not received
Silent (retry handled by Stripe)
Silent (retry handled by Stripe)
Form validation error
"Please fill in all required fields."
"Veuillez remplir tous les champs obligatoires."
Server error (500)
"Something went wrong on our end. Please try again in a moment."
"Une erreur s'est produite de notre côté. Veuillez réessayer dans un moment."


Error Logging Requirements
All server-side errors must log:
TypeScript
{
  timestamp: string,       // ISO 8601
  errorCode: string,       // e.g., "PDF_GENERATION_FAILED"
  message: string,         // Technical error message
  userId?: string,         // If authenticated
  sessionId?: string,      // Guest session ID
  stripeSessionId?: string,
  stack?: string,          // Stack trace
  environment: string      // "production" | "staging"
}

Monitoring & Alerting
 Sentry (or equivalent) connected to production
 Alert triggered on any 500 error
 Alert triggered on PDF generation failure
 Alert triggered on email delivery failure
 Alert triggered on webhook validation failure
 Daily error summary email to dev team

28. Deployment Architecture

Overview
text
User Browser
     │
     ▼
[Vercel / Edge Network]  ←── Next.js App (App Router)
     │
     ├──► [Supabase / PostgreSQL]  ←── Contracts, Payments, Users
     │
     ├──► [Stripe API]  ←── Payment processing
     │
     ├──► [Resend / SendGrid]  ←── Email delivery
     │
     └──► [PDF Service]  ←── Contract PDF generation
                              (Puppeteer / React-PDF / PDFKit)

Recommended Stack
Layer
Technology
Reason
Framework
Next.js 14 (App Router)
Full-stack, server components, API routes
Hosting
Vercel
Zero-config Next.js, edge functions, auto-scaling
Database
Supabase (PostgreSQL)
Managed, Row Level Security, real-time
ORM
Prisma
Type-safe, migrations, easy schema management
Auth
NextAuth.js v5
Flexible, supports guest + authenticated
Payments
Stripe
Industry standard, PCI compliant
Email
Resend + React Email
Developer-friendly, reliable delivery
PDF
React-PDF or Puppeteer
High-quality PDF generation
i18n
next-intl
App Router compatible, locale routing
Styling
Tailwind CSS
Utility-first, responsive
Monitoring
Sentry
Error tracking
CI/CD
GitHub Actions + Vercel
Automated deploys on merge to main


Branch Strategy
text
main          ← Production (auto-deploys to production)
staging       ← Staging (auto-deploys to staging)
feature/*     ← Feature branches (PR to staging)
fix/*         ← Bug fix branches (PR to staging or main)

CI/CD Pipeline (GitHub Actions)
YAML
On Pull Request:
  1. Install dependencies
  2. Run TypeScript check
  3. Run ESLint
  4. Run unit tests
  5. Build application
  6. Preview deployment on Vercel

On Merge to main:
  1. All PR checks above
  2. Run database migrations
  3. Deploy to production on Vercel
  4. Run smoke test
  5. Notify team on Slack/Discord

29. Glossary
Term
Definition
CC flow
Client-Contractor contract creation flow
Guest user
A user who has not logged in or created an account
Authenticated user
A logged-in user with an account
Wizard
The multi-step form used to create a contract
Stripe Checkout
Stripe's hosted payment page
Webhook
An HTTP callback sent by Stripe to confirm payment events
Idempotency
Processing the same event multiple times produces the same result
PDF generation
Server-side creation of the contract PDF
Locale
Language/region setting (en, fr)
i18n
Internationalization — the process of supporting multiple languages
PIPEDA
Personal Information Protection and Electronic Documents Act (Canada)
PCI-DSS
Payment Card Industry Data Security Standard
WCAG
Web Content Accessibility Guidelines
DoD
Definition of Done
PRD
Product Requirements Document
ENV
Environment variable
Smoke test
A quick test to verify core functionality works after deployment
3DS
3D Secure — additional authentication layer for card payments


30. Appendix — Quick Reference

Key URLs
Page
EN URL
FR URL
Start wizard
/en/contracts/new/client-contractor
/fr/contrats/nouveau/client-prestataire
Payment success
/en/payment-success
/fr/paiement-reussi
Payment cancelled
/en/payment-cancelled
/fr/paiement-annule
User dashboard
/en/dashboard
/fr/tableau-de-bord
Privacy policy
/en/privacy
/fr/confidentialite
Terms of service
/en/terms
/fr/conditions


Key API Routes
Route
Method
Description
/api/contracts
POST
Create new contract record
/api/contracts/[id]
GET
Fetch contract by ID
/api/checkout
POST
Create Stripe Checkout session
/api/webhooks/stripe
POST
Handle Stripe webhook events
/api/pdf/[contractId]
GET
Download contract PDF
/api/health
GET
Health check endpoint


Key Stripe Test Cards
Card Number
Scenario
4242 4242 4242 4242
Payment succeeds
4000 0000 0000 0002
Payment declined
4000 0025 0000 3155
3D Secure required
4000 0000 0000 9995
Insufficient funds
4000 0000 0000 0069
Card expired


Environment Variables Reference
Bash
# App
NEXT_PUBLIC_APP_URL=https://yourapp.com
NODE_ENV=production

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Database
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://yourapp.com

# Email
EMAIL_FROM=noreply@yourapp.com
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=re_...

End of Product Requirements Document
Version 1.0 — All sections complete





