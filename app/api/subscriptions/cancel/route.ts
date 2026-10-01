import 'server-only'

import { NextRequest, NextResponse } from 'next/server'

import { createClient as createServerSupabase } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!user || !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/construction-cancel-subscription`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ user_id: user.id }),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    return NextResponse.json(
      { error: data.error ?? 'Cancellation failed' },
      { status: response.status }
    )
  }

  return NextResponse.json(data)
}
