-- =============================================================================
-- Row Level Security policies
-- =============================================================================

alter table public.profiles      enable row level security;
alter table public.subscriptions enable row level security;
alter table public.contracts     enable row level security;
alter table public.activity_log  enable row level security;

-- ─────────────────────────────────────────
-- Helper: is the calling user an admin?
-- ─────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ─────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

-- ─────────────────────────────────────────
-- subscriptions
-- ─────────────────────────────────────────
drop policy if exists "Users can view own subscription" on public.subscriptions;
create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

drop policy if exists "Admins can view all subscriptions" on public.subscriptions;
create policy "Admins can view all subscriptions"
  on public.subscriptions for select
  using (public.is_admin());

-- ─────────────────────────────────────────
-- contracts
-- ─────────────────────────────────────────
drop policy if exists "Users can view own contracts" on public.contracts;
create policy "Users can view own contracts"
  on public.contracts for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own contracts" on public.contracts;
create policy "Users can insert own contracts"
  on public.contracts for insert
  with check (
    auth.uid() = user_id
    or user_id is null
  );

drop policy if exists "Users can update own contracts" on public.contracts;
create policy "Users can update own contracts"
  on public.contracts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Admins can view all contracts" on public.contracts;
create policy "Admins can view all contracts"
  on public.contracts for select
  using (public.is_admin());

-- ─────────────────────────────────────────
-- activity_log
-- ─────────────────────────────────────────
drop policy if exists "Users can insert own activity" on public.activity_log;
create policy "Users can insert own activity"
  on public.activity_log for insert
  with check (auth.uid() = user_id);

drop policy if exists "Admins can view all activity" on public.activity_log;
create policy "Admins can view all activity"
  on public.activity_log for select
  using (public.is_admin());
