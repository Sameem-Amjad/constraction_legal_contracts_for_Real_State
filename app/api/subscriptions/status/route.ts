import 'server-only'

import { NextResponse } from 'next/server'

import { createClient as createServerSupabase } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { isPro: false, status: null },
      { status: 200 }
    )
  }

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('status, plan_type, current_period_end, cancel_at_period_end')
    .eq('user_id', user.id)
    .maybeSingle()

  const isPro =
    sub?.status === 'active' &&
    sub?.plan_type === 'unlimited_monthly' &&
    (!sub.current_period_end ||
      new Date(sub.current_period_end) > new Date())

  return NextResponse.json({ isPro, ...sub })
}
