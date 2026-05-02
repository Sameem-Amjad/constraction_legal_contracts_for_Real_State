import 'server-only'

import type Stripe from 'stripe'
import { stripe } from './server'
import { adminSupabase } from '@/lib/supabase/admin'
import type { ContractMetadata } from '@/types/supabase'

export async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  // Idempotency check — skip if we've already processed this event.
  const { data: existing } = await adminSupabase
    .from('stripe_events')
    .select('id')
    .eq('id', event.id)
    .maybeSingle()

  if (existing) {
    console.log(`[Stripe Webhook] Duplicate event ${event.id} — skipping`)
    return
  }

  await adminSupabase.from('stripe_events').insert({
    id: event.id,
    type: event.type,
  })

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(
        event.data.object as Stripe.Checkout.Session
      )
      break
    // Fires on initial purchase AND on every successful renewal billing cycle.
    case 'invoice.paid':
    case 'invoice.payment_succeeded':
      await handleInvoicePaid(event.data.object as Stripe.Invoice)
      break
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
      break
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(
        event.data.object as Stripe.Subscription
      )
      break
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(
        event.data.object as Stripe.Subscription
      )
      break
    default:
      console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`)
  }
}

async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice
): Promise<void> {
  const subId = invoice.subscription
  if (!subId || typeof subId !== 'string') return

  const { data: sub } = await adminSupabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subId)
    .maybeSingle()

  if (!sub) return

  // Mark past_due. Stripe will retry per the project's Smart Retries config;
  // if all retries fail, customer.subscription.deleted will follow and
  // status will move to 'canceled' via handleSubscriptionDeleted.
  await adminSupabase
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_subscription_id', subId)

  await adminSupabase.from('activity_log').insert({
    user_id: sub.user_id,
    action: 'subscription_payment_failed',
    details: `Invoice ${invoice.id} failed to charge`,
  })
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  const { mode, metadata, customer } = session

  if (mode === 'payment') {
    await reconcilePaymentSession(session)
  } else if (mode === 'subscription') {
    const userId = metadata?.user_id
    if (!userId) {
      console.error(
        '[Webhook] checkout.session.completed (sub): no user_id in metadata'
      )
      return
    }

    const stripeSubId = session.subscription as string
    const sub = await stripe.subscriptions.retrieve(stripeSubId)

    await adminSupabase
      .from('subscriptions')
      .update({
        status: 'active',
        plan_type: 'unlimited_monthly',
        stripe_customer_id: typeof customer === 'string' ? customer : customer?.id ?? null,
        stripe_subscription_id: stripeSubId,
        cancel_at_period_end: sub.cancel_at_period_end,
        current_period_end: new Date(
          sub.current_period_end * 1000
        ).toISOString(),
      })
      .eq('user_id', userId)

    await adminSupabase.from('activity_log').insert({
      user_id: userId,
      action: 'subscription_started',
      details: `Stripe subscription ${stripeSubId}`,
    })
  }
}

/**
 * Idempotent reconciliation of a one-off payment Checkout Session.
 * Safe to call from both webhook and the post-checkout success page.
 * No-ops if the contract is already marked paid.
 */
export async function reconcilePaymentSession(
  session: Stripe.Checkout.Session
): Promise<{ alreadyPaid: boolean; contractId: string | null }> {
  const contractId = session.metadata?.contract_id
  if (!contractId) {
    console.error(
      '[Stripe] reconcilePaymentSession: no contract_id in session metadata'
    )
    return { alreadyPaid: false, contractId: null }
  }

  const { data: existing } = await adminSupabase
    .from('contracts')
    .select('status')
    .eq('id', contractId)
    .single()

  if (existing?.status === 'paid' || existing?.status === 'signed' || existing?.status === 'completed') {
    return { alreadyPaid: true, contractId }
  }

  await adminSupabase
    .from('contracts')
    .update({
      status: 'paid',
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id:
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id ?? null,
    })
    .eq('id', contractId)

  const { data: contract } = await adminSupabase
    .from('contracts')
    .select('*')
    .eq('id', contractId)
    .single()

  if (!contract) return { alreadyPaid: false, contractId }

  let firstName = session.customer_email?.split('@')[0] ?? ''
  if (contract.user_id) {
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('first_name, email')
      .eq('id', contract.user_id)
      .single()
    firstName = profile?.first_name ?? firstName
  }

  const recipientEmail =
    session.customer_email ?? contract.client_email ?? ''
  const meta =
    (contract.metadata as ContractMetadata | null) ?? ({} as ContractMetadata)
  const language: 'en' | 'fr' = meta.language ?? 'en'

  await invokeEdgeFunction('send-receipt', {
    email: recipientEmail,
    first_name: firstName,
    contract_id: contractId,
    amount: (session.amount_total ?? 0) / 100,
    language,
  })

  if (contract.pdf_path) {
    await invokeEdgeFunction('send-contract', {
      email: recipientEmail,
      first_name: firstName,
      contract_id: contractId,
      pdf_path: contract.pdf_path,
      language,
      contract_type: contract.contract_type,
    })
  }

  if (contract.user_id) {
    await adminSupabase.from('activity_log').insert({
      user_id: contract.user_id,
      action: 'contract_paid',
      details: `Contract ${contractId} paid via Stripe session ${session.id}`,
    })
  }

  return { alreadyPaid: false, contractId }
}

async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  const subId = invoice.subscription
  if (!subId || typeof subId !== 'string') return

  const { data: sub } = await adminSupabase
    .from('subscriptions')
    .select('user_id, stripe_subscription_id')
    .eq('stripe_subscription_id', subId)
    .maybeSingle()

  if (!sub) return

  const stripeSub = await stripe.subscriptions.retrieve(subId)

  await adminSupabase
    .from('subscriptions')
    .update({
      status: 'active',
      current_period_end: new Date(
        stripeSub.current_period_end * 1000
      ).toISOString(),
      cancel_at_period_end: stripeSub.cancel_at_period_end,
    })
    .eq('stripe_subscription_id', subId)

  await adminSupabase.from('activity_log').insert({
    user_id: sub.user_id,
    action: 'subscription_renewed',
    details: `Invoice ${invoice.id} paid`,
  })
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
): Promise<void> {
  const status = mapStripeStatus(subscription.status)

  await adminSupabase
    .from('subscriptions')
    .update({
      status,
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_end: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  await adminSupabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      plan_type: 'pay_per_contract',
      cancel_at_period_end: false,
    })
    .eq('stripe_subscription_id', subscription.id)

  const { data: sub } = await adminSupabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .maybeSingle()

  if (sub) {
    await adminSupabase.from('activity_log').insert({
      user_id: sub.user_id,
      action: 'subscription_cancelled',
      details: `Stripe subscription ${subscription.id} deleted`,
    })
  }
}

function mapStripeStatus(
  stripeStatus: Stripe.Subscription.Status
): 'active' | 'inactive' | 'canceled' | 'past_due' {
  switch (stripeStatus) {
    case 'active':
    case 'trialing':
      return 'active'
    case 'past_due':
    case 'unpaid':
      return 'past_due'
    case 'canceled':
    case 'incomplete_expired':
      return 'canceled'
    default:
      return 'inactive'
  }
}

async function invokeEdgeFunction(
  functionName: string,
  payload: Record<string, unknown>
): Promise<void> {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${functionName}`
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const body = await response.text()
      console.error(
        `[Edge Function] ${functionName} failed: ${response.status} ${body}`
      )
    }
  } catch (err) {
    console.error(`[Edge Function] ${functionName} threw:`, err)
  }
}
