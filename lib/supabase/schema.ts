// The app lives in its own Postgres schema on a shared Supabase project.
// Every Supabase client must be created with `db: { schema: SUPABASE_SCHEMA }`.
export const SUPABASE_SCHEMA = 'construction'

// Tag written to auth user_metadata.app on signup. The auth.users trigger only
// provisions a profile/subscription for users carrying this tag.
export const SUPABASE_APP_TAG = 'construction'
