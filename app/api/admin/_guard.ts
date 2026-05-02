import 'server-only'

import { NextResponse } from 'next/server'

import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'

export async function requireAdmin() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return {
      user,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }

  return { user, response: null }
}
