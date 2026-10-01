import 'server-only'

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body?.email) {
    return NextResponse.json({ error: 'email required' }, { status: 400 })
  }

  await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/construction-send-welcome`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify(body),
    }
  ).catch((err) => console.error('[welcome] failed:', err))

  return NextResponse.json({ ok: true })
}
