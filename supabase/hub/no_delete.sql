-- =============================================================================
-- ConstrAction — "demo admin that cannot delete" (apply after schema.sql)
--
-- Users whose JWT carries app_metadata.no_delete = true can never DELETE, even
-- where a permissive policy would allow it. Restrictive policies are ANDed with
-- every permissive one. Re-runnable. The same block is at the end of schema.sql
-- so a rebuild keeps it.
--
-- Note: service_role bypasses RLS, so the app also checks isNoDeleteUser() in
-- every server-side delete path (lib/no-delete.ts).
-- =============================================================================

begin;

do $$
declare
  t record;
begin
  for t in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'construction'
      and c.relkind in ('r', 'p')
  loop
    execute format(
      'drop policy if exists construction_no_delete_demo_admin on construction.%I',
      t.relname
    );
    execute format(
      $p$create policy construction_no_delete_demo_admin on construction.%I
           as restrictive for delete to authenticated
           using (coalesce((auth.jwt()->'app_metadata'->>'no_delete')::boolean, false) = false)$p$,
      t.relname
    );
  end loop;
end
$$;

-- storage.objects is shared by every app: only restrict ConstrAction buckets.
drop policy if exists "construction_no_delete_demo_admin" on storage.objects;
create policy "construction_no_delete_demo_admin"
  on storage.objects
  as restrictive for delete to authenticated
  using (
    bucket_id not like 'construction-%'
    or coalesce((auth.jwt()->'app_metadata'->>'no_delete')::boolean, false) = false
  );

commit;
