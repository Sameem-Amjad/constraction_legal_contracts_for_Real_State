'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'
import { SUPABASE_SCHEMA } from './schema'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { db: { schema: SUPABASE_SCHEMA } }
  )
}
