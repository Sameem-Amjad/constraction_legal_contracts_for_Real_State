-- =============================================================================
-- Storage buckets and policies
-- =============================================================================

-- ─────────────────────────────────────────
-- Bucket: logos (public read, auth write)
-- ─────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'logos',
  'logos',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can read logos" on storage.objects;
create policy "Anyone can read logos"
  on storage.objects for select
  using (bucket_id = 'logos');

drop policy if exists "Auth users upload their own logo" on storage.objects;
create policy "Auth users upload their own logo"
  on storage.objects for insert
  with check (
    bucket_id = 'logos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Auth users update their own logo" on storage.objects;
create policy "Auth users update their own logo"
  on storage.objects for update
  using (
    bucket_id = 'logos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Auth users delete their own logo" on storage.objects;
create policy "Auth users delete their own logo"
  on storage.objects for delete
  using (
    bucket_id = 'logos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─────────────────────────────────────────
-- Bucket: contracts (private, signed-URL only)
-- ─────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'contracts',
  'contracts',
  false,
  10485760,
  array['application/pdf']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can read their own contract PDFs" on storage.objects;
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

drop policy if exists "Anyone can read company images" on storage.objects;
create policy "Anyone can read company images"
  on storage.objects for select
  using (bucket_id = 'company-images');
