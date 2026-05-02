import 'server-only'

import { NextRequest, NextResponse } from 'next/server'

import { stripe } from '@/lib/stripe/server'
import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// POST /api/stripe/portal
// Creates a Stripe Billing Portal session for the logged-in user. The portal
// lets subscribers update card details, view invoices, switch plan, and
// cancel — all without leaving Stripe's hosted UI.
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: sub } = await adminSupabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!sub?.stripe_customer_id) {
    return NextResponse.json(
      { error: 'No billing account found. Subscribe first.' },
      { status: 404 }
    )
  }

  let body: { language?: 'en' | 'fr'; return_url?: string } = {}
  try {
    body = await request.json()
  } catch {
    // empty body is fine
  }

  const language = body.language === 'fr' ? 'fr' : 'en'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!
  const returnUrl =
    body.return_url ?? `${siteUrl}/${language}/dashboard`

  try {
    const portal = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: returnUrl,
      locale: language === 'fr' ? 'fr-CA' : 'en',
    })
    return NextResponse.json({ url: portal.url })
  } catch (error) {
    console.error('[stripe/portal] error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to open billing portal',
      },
      { status: 500 }
    )
  }
}
