-- =============================================================================
-- ConstrAction — Initial Schema
-- Idempotent: safe to re-run. Does NOT drop existing tables.
-- =============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────
-- Helper trigger function: keep updated_at fresh
-- ─────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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

drop trigger if exists profiles_updated_at on public.profiles;
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

drop trigger if exists subscriptions_updated_at on public.subscriptions;
create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.handle_updated_at();

-- ─────────────────────────────────────────
-- Table: contracts
-- ─────────────────────────────────────────
create table if not exists public.contracts (
  id                         uuid primary key default gen_random_uuid(),
  user_id                    uuid references public.profiles(id) on delete set null,

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

drop trigger if exists contracts_updated_at on public.contracts;
create trigger contracts_updated_at
  before update on public.contracts
  for each row execute function public.handle_updated_at();

create index if not exists contracts_user_id_idx
  on public.contracts(user_id);
create index if not exists contracts_status_idx
  on public.contracts(status);
create index if not exists contracts_type_idx
  on public.contracts(contract_type);
create index if not exists contracts_created_at_idx
  on public.contracts(created_at desc);

-- ─────────────────────────────────────────
-- Table: activity_log
-- ─────────────────────────────────────────
create table if not exists public.activity_log (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles(id) on delete set null,
  action     text not null,
  details    text,
  ip_address inet,
  created_at timestamptz not null default now()
);

create index if not exists activity_log_user_id_idx
  on public.activity_log(user_id);
create index if not exists activity_log_action_idx
  on public.activity_log(action);
create index if not exists activity_log_created_at_idx
  on public.activity_log(created_at desc);

-- ─────────────────────────────────────────
-- Auth trigger: create profile + subscription on new auth user
-- ─────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, phone)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do nothing;

  insert into public.subscriptions (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
