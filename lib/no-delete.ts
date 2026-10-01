import type { User } from '@supabase/supabase-js'

// Public portfolio demo admins carry app_metadata.no_delete = true (only the
// service role can set app_metadata). They may read, add and update, but every
// server-side delete — and anything that could escalate another account —
// must refuse them, because the service-role client bypasses RLS.
export const NO_DELETE_MESSAGE = "Demo admin accounts can't delete data"

export function isNoDeleteUser(
  user: Pick<User, 'app_metadata'> | null | undefined
): boolean {
  return user?.app_metadata?.no_delete === true
}
