import 'server-only'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { stripe } from '@/lib/stripe/server'
import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

const checkoutSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('payment'),
    contract_id: z.string().uuid(),
    email: z.string().email(),
    language: z.enum(['en', 'fr']),
  }),
  z.object({
    mode: z.literal('subscription'),
    language: z.enum(['en', 'fr']),
  }),
])

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = checkoutSchema.parse(body)

    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!
    const locale = parsed.language

    if (parsed.mode === 'payment') {
      const { contract_id, email } = parsed

      const { data: contract } = await adminSupabase
        .from('contracts')
        .select('id, status, contract_price')
        .eq('id', contract_id)
        .single()

      if (!contract || contract.status === 'paid') {
        return NextResponse.json(
          { error: 'Invalid contract' },
          { status: 400 }
        )
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: email,
        line_items: [
          {
            price: process.env.STRIPE_PRICE_SINGLE!,
            quantity: 1,
          },
        ],
        metadata: {
          contract_id,
          user_id: user?.id ?? 'guest',
          language: locale,
        },
        success_url: `${siteUrl}/${locale}/payment-success?session_id={CHECKOUT_SESSION_ID}&contract_id=${contract_id}`,
        cancel_url: `${siteUrl}/${locale}/payment-cancelled?contract_id=${contract_id}`,
        automatic_tax: { enabled: false },
        locale: locale === 'fr' ? 'fr-CA' : 'en',
      })

      return NextResponse.json({ url: session.url })
    } else {
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { data: profile } = await adminSupabase
        .from('profiles')
        .select('email, first_name, last_name')
        .eq('id', user.id)
        .single()

      const { data: subRow } = await adminSupabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .maybeSingle()

      let customerId = subRow?.stripe_customer_id ?? null

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: profile?.email ?? user.email ?? undefined,
          name: profile
            ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() ||
              undefined
            : undefined,
          metadata: { user_id: user.id },
        })
        customerId = customer.id

        await adminSupabase
          .from('subscriptions')
          .update({ stripe_customer_id: customerId })
          .eq('user_id', user.id)
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: customerId,
        line_items: [
          {
            price: process.env.STRIPE_PRICE_SUBSCRIPTION!,
            quantity: 1,
          },
        ],
        metadata: {
          user_id: user.id,
          language: locale,
        },
        // Stripe copies these to the recurring Subscription so renewals fire
        // invoice.paid events that we can correlate to the user.
        subscription_data: {
          metadata: {
            user_id: user.id,
            language: locale,
          },
        },
        success_url: `${siteUrl}/${locale}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/${locale}/pricing`,
        locale: locale === 'fr' ? 'fr-CA' : 'en',
        // Auto-renewal is the default for `mode: subscription`. Customers
        // will be charged at the end of each billing_cycle_anchor period
        // unless they cancel via the Customer Portal.
        billing_address_collection: 'required',
        allow_promotion_codes: true,
      })

      return NextResponse.json({ url: session.url })
    }
  } catch (error) {
    console.error('[Checkout] Error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
