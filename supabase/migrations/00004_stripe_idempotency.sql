-- =============================================================================
-- Stripe webhook idempotency
-- Prevents double-processing of the same event when Stripe retries.
-- =============================================================================

create table if not exists public.stripe_events (
  id           text primary key,           -- Stripe event ID (evt_...)
  type         text not null,
  processed_at timestamptz not null default now()
);

create index if not exists stripe_events_processed_at_idx
  on public.stripe_events(processed_at);

create index if not exists stripe_events_type_idx
  on public.stripe_events(type);

alter table public.stripe_events enable row level security;

-- Only service_role writes/reads this table — no policies for authenticated users.
