import 'server-only'

import { NextRequest, NextResponse } from 'next/server'

import { stripe } from '@/lib/stripe/server'
import { handleStripeEvent } from '@/lib/stripe/webhooks'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    await handleStripeEvent(event)
    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[Webhook] Handler error:', err)
    // Return 200 so Stripe doesn't retry on a deterministic handler bug.
    // The error has been logged for manual review.
    return NextResponse.json({
      received: true,
      warning: 'Handler error — logged',
    })
  }
}
