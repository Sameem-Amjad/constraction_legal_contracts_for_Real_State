-- =============================================================================
-- GDPR / Quebec Law 25 erasure log
-- After a hard-delete of a user account, we keep a minimal record so we can
-- prove erasure (and refuse re-creation under the same email if needed).
-- This is the ONLY artifact we retain. No PII beyond the email itself.
-- =============================================================================

create table if not exists public.deleted_users (
  email                  text primary key,
  deleted_at             timestamptz not null default now(),
  reason                 text,
  deleted_contract_count integer not null default 0,
  deleted_by             text,           -- 'self' | 'admin:<admin_email>'
  notes                  text
);

create index if not exists deleted_users_deleted_at_idx
  on public.deleted_users(deleted_at desc);

alter table public.deleted_users enable row level security;

-- Only service_role reads/writes this table — no public policies.
-- The admin API uses service_role so RLS does not apply.
