import 'server-only'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import { SUPABASE_SCHEMA } from './schema'

type AdminClient = SupabaseClient<Database>

let cachedClient: AdminClient | null = null

export function getAdminSupabase(): AdminClient {
  if (cachedClient) return cachedClient
  cachedClient = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      db: { schema: SUPABASE_SCHEMA },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
  return cachedClient
}

export const adminSupabase = new Proxy({} as AdminClient, {
  get(_target, prop) {
    const client = getAdminSupabase()
    const value = client[prop as keyof AdminClient]
    return typeof value === 'function' ? value.bind(client) : value
  },
})
