// @ts-nocheck — Deno runtime.
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.46.1'
import Stripe from 'https://esm.sh/stripe@17.4.0?target=deno'
import { corsHeaders } from '../_shared/cors.ts'
import { SUPABASE_SCHEMA } from '../_shared/schema.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify the caller's JWT before doing anything destructive
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userJwt = authHeader.replace('Bearer ', '')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Client scoped to the calling user (verifies JWT)
    const userClient = createClient(supabaseUrl, serviceRoleKey, {
      db: { schema: SUPABASE_SCHEMA },
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${userJwt}` } },
    })

    const { data: { user }, error: userError } = await userClient.auth.getUser(userJwt)
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      db: { schema: SUPABASE_SCHEMA },
      auth: { persistSession: false },
    })

    const { data: sub } = await admin
      .from('subscriptions')
      .select('stripe_subscription_id, current_period_end, status')
      .eq('user_id', user.id)
      .single()

    if (!sub?.stripe_subscription_id) {
      return new Response(
        JSON.stringify({ error: 'No active subscription found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2024-12-18.acacia',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const updated = await stripe.subscriptions.update(
      sub.stripe_subscription_id,
      { cancel_at_period_end: true }
    )

    const periodEnd = new Date(updated.current_period_end * 1000).toISOString()

    await admin
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        current_period_end: periodEnd,
      })
      .eq('user_id', user.id)

    await admin.from('activity_log').insert({
      user_id: user.id,
      action: 'subscription_cancelled',
      details: `User-initiated cancel. Access until ${periodEnd}.`,
    })

    // Fire-and-forget cancellation email
    const { data: profile } = await admin
      .from('profiles')
      .select('email, first_name')
      .eq('id', user.id)
      .single()

    if (profile?.email) {
      await fetch(`${supabaseUrl}/functions/v1/construction-send-cancellation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({
          email: profile.email,
          first_name: profile.first_name ?? '',
          current_period_end: periodEnd,
          language: 'en',
        }),
      })
    }

    return new Response(
      JSON.stringify({ success: true, current_period_end: periodEnd }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('[cancel-subscription] Error:', err)
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
