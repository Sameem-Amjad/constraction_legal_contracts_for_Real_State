-- =============================================================================
-- ConstrAction — shared-hub schema (`construction`)
--
-- Self-contained and re-runnable. Consolidates supabase/migrations/00001-00005
-- into the `construction` schema of the shared Supabase project. auth.users and
-- Storage are shared with other apps, so:
--   * the auth trigger only acts on users tagged raw_user_meta_data.app = 'construction'
--   * buckets are prefixed `construction-` and storage policies `construction_`
--
-- Run as `postgres`:  psql "$HUB_DB_URL" -v ON_ERROR_STOP=1 -f supabase/hub/schema.sql
-- WARNING: drops and recreates the whole `construction` schema (all app data).
-- =============================================================================

begin;

drop schema if exists construction cascade;
create schema construction;

-- ─────────────────────────────────────────
-- Helper trigger function: keep updated_at fresh
-- ─────────────────────────────────────────
create or replace function construction.handle_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─────────────────────────────────────────
-- Table: profiles
-- ─────────────────────────────────────────
create table construction.profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  email                text not null,
  first_name           text,
  last_name            text,
  phone                text,
  role                 text not null default 'user'
                         check (role in ('user', 'admin')),
  entity_type          text check (entity_type in ('company', 'individual')),
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
  full_name            text,
  address              text,
  ind_city             text,
  ind_postal           text,
  logo_url             text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on construction.profiles
  for each row execute function construction.handle_updated_at();

-- Hub hardening (not in the original migrations): the "update own profile"
-- policy would otherwise let a signed-in user promote themselves to admin.
-- Only service_role / postgres (admin API, seed, SQL editor) may change role.
create or replace function construction.protect_profile_role()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
     and current_user in ('anon', 'authenticated') then
    raise exception 'profiles.role can only be changed by an administrator'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger profiles_protect_role
  before update on construction.profiles
  for each row execute function construction.protect_profile_role();

-- ─────────────────────────────────────────
-- Table: subscriptions
-- ─────────────────────────────────────────
create table construction.subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references construction.profiles(id)
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
  before update on construction.subscriptions
  for each row execute function construction.handle_updated_at();

-- ─────────────────────────────────────────
-- Table: contracts
-- ─────────────────────────────────────────
create table construction.contracts (
  id                         uuid primary key default gen_random_uuid(),
  user_id                    uuid references construction.profiles(id) on delete set null,

  contract_type              text not null
                               check (contract_type in (
                                 'client-contractor', 'gc-subcontractor'
                               )),

  client_name                text,
  client_address             text,
  client_city                text,
  client_postal              text,
  client_email               text,
  client_phone               text,

  contractor_name            text,
  contractor_rbq             text,
  contractor_address         text,
  contractor_city            text,
  contractor_postal          text,
  contractor_email           text,
  contractor_phone           text,

  project_site               text,
  project_city               text,
  project_postal             text,
  project_description        text,
  contract_price             numeric(12, 2),

  status                     text not null default 'draft'
                               check (status in (
                                 'draft', 'generated', 'paid', 'signed', 'completed'
                               )),
  pdf_path                   text,

  metadata                   jsonb not null default '{}'::jsonb,

  stripe_payment_intent_id   text,
  stripe_checkout_session_id text,

  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now()
);

create trigger contracts_updated_at
  before update on construction.contracts
  for each row execute function construction.handle_updated_at();

create index contracts_user_id_idx    on construction.contracts(user_id);
create index contracts_status_idx     on construction.contracts(status);
create index contracts_type_idx       on construction.contracts(contract_type);
create index contracts_created_at_idx on construction.contracts(created_at desc);

-- ─────────────────────────────────────────
-- Table: activity_log
-- ─────────────────────────────────────────
create table construction.activity_log (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references construction.profiles(id) on delete set null,
  action     text not null,
  details    text,
  ip_address inet,
  created_at timestamptz not null default now()
);

create index activity_log_user_id_idx    on construction.activity_log(user_id);
create index activity_log_action_idx     on construction.activity_log(action);
create index activity_log_created_at_idx on construction.activity_log(created_at desc);

-- ─────────────────────────────────────────
-- Table: stripe_events (webhook idempotency; service_role only)
-- ─────────────────────────────────────────
create table construction.stripe_events (
  id           text primary key,           -- Stripe event ID (evt_...)
  type         text not null,
  processed_at timestamptz not null default now()
);

create index stripe_events_processed_at_idx on construction.stripe_events(processed_at);
create index stripe_events_type_idx         on construction.stripe_events(type);

-- ─────────────────────────────────────────
-- Table: deleted_users (GDPR / Quebec Law 25 erasure log; service_role only)
-- ─────────────────────────────────────────
create table construction.deleted_users (
  email                  text primary key,
  deleted_at             timestamptz not null default now(),
  reason                 text,
  deleted_contract_count integer not null default 0,
  deleted_by             text,           -- 'self' | 'admin:<admin_email>'
  notes                  text
);

create index deleted_users_deleted_at_idx on construction.deleted_users(deleted_at desc);

-- ─────────────────────────────────────────
-- Auth trigger: create profile + subscription for new ConstrAction users only
-- ─────────────────────────────────────────
create or replace function construction.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(new.raw_user_meta_data->>'app', '') <> 'construction' then
    return new;
  end if;

  insert into construction.profiles (id, email, first_name, last_name, phone)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do nothing;

  insert into construction.subscriptions (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_construction on auth.users;
create trigger on_auth_user_created_construction
  after insert on auth.users
  for each row execute function construction.handle_new_user();

-- ─────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────
alter table construction.profiles      enable row level security;
alter table construction.subscriptions enable row level security;
alter table construction.contracts     enable row level security;
alter table construction.activity_log  enable row level security;
alter table construction.stripe_events enable row level security;
alter table construction.deleted_users enable row level security;
-- stripe_events / deleted_users: no policies — service_role only.

-- Helper: is the calling user a ConstrAction admin?
create or replace function construction.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from construction.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- profiles
create policy "Users can view own profile"
  on construction.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on construction.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admins can view all profiles"
  on construction.profiles for select
  using (construction.is_admin());

-- subscriptions
create policy "Users can view own subscription"
  on construction.subscriptions for select
  using (auth.uid() = user_id);

create policy "Admins can view all subscriptions"
  on construction.subscriptions for select
  using (construction.is_admin());

-- contracts
create policy "Users can view own contracts"
  on construction.contracts for select
  using (auth.uid() = user_id);

create policy "Users can insert own contracts"
  on construction.contracts for insert
  with check (
    auth.uid() = user_id
    or user_id is null
  );

create policy "Users can update own contracts"
  on construction.contracts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins can view all contracts"
  on construction.contracts for select
  using (construction.is_admin());

-- activity_log
create policy "Users can insert own activity"
  on construction.activity_log for insert
  with check (auth.uid() = user_id);

create policy "Admins can view all activity"
  on construction.activity_log for select
  using (construction.is_admin());

-- ─────────────────────────────────────────
-- Grants
-- ─────────────────────────────────────────
grant usage on schema construction to anon, authenticated, service_role;

grant all on all tables    in schema construction to anon, authenticated, service_role;
grant all on all routines  in schema construction to anon, authenticated, service_role;
grant all on all sequences in schema construction to anon, authenticated, service_role;

alter default privileges for role postgres in schema construction
  grant all on tables    to anon, authenticated, service_role;
alter default privileges for role postgres in schema construction
  grant all on routines  to anon, authenticated, service_role;
alter default privileges for role postgres in schema construction
  grant all on sequences to anon, authenticated, service_role;

-- ─────────────────────────────────────────
-- Storage buckets (shared namespace → `construction-` prefix)
-- ─────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('construction-logos', 'construction-logos', true, 2097152,
   array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('construction-contracts', 'construction-contracts', false, 10485760,
   array['application/pdf']),
  ('construction-company-images', 'construction-company-images', true, null, null)
on conflict (id) do nothing;

-- construction-logos: public read, owner-folder (<user_id>/...) write
drop policy if exists "construction_logos_public_read" on storage.objects;
create policy "construction_logos_public_read"
  on storage.objects for select
  using (bucket_id = 'construction-logos');

drop policy if exists "construction_logos_insert_own" on storage.objects;
create policy "construction_logos_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'construction-logos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "construction_logos_update_own" on storage.objects;
create policy "construction_logos_update_own"
  on storage.objects for update
  using (
    bucket_id = 'construction-logos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "construction_logos_delete_own" on storage.objects;
create policy "construction_logos_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'construction-logos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- construction-contracts: private; owners read their own folder, the server
-- writes with service_role and hands out signed URLs.
drop policy if exists "construction_contracts_read_own" on storage.objects;
create policy "construction_contracts_read_own"
  on storage.objects for select
  using (
    bucket_id = 'construction-contracts'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- construction-company-images: public read
drop policy if exists "construction_company_images_public_read" on storage.objects;
create policy "construction_company_images_public_read"
  on storage.objects for select
  using (bucket_id = 'construction-company-images');

commit;
