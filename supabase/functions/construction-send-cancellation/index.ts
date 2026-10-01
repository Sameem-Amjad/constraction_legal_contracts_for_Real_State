// @ts-nocheck — Deno runtime.
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createTransport } from 'npm:nodemailer@6'
import { corsHeaders } from '../_shared/cors.ts'
import { renderEmail } from '../_shared/email.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {
      email,
      first_name,
      current_period_end,
      language = 'en',
    } = await req.json()

    const siteUrl =
      Deno.env.get('NEXT_PUBLIC_SITE_URL') ?? 'https://constraction.ca'

    const isEn = language === 'en'
    const endDate = new Date(current_period_end).toLocaleDateString(
      isEn ? 'en-CA' : 'fr-CA',
      { year: 'numeric', month: 'long', day: 'numeric' }
    )

    const subject = isEn
      ? 'Your ConstrAction Pro subscription has been cancelled'
      : 'Votre abonnement ConstrAction Pro a été annulé'

    const bodyHtml = isEn
      ? `<h2>Hi ${first_name ?? 'there'},</h2>
         <p>Your ConstrAction Pro subscription has been cancelled. <strong>Your Pro access will remain active until ${endDate}.</strong></p>
         <p>You will continue to enjoy all Pro benefits — unlimited contracts, instant generation, and priority support — until that date. After ${endDate}, your account will switch to pay-per-contract.</p>
         <p>If this was a mistake or you change your mind, you can resubscribe at any time from your dashboard.</p>
         <p><a href="${siteUrl}/${language}/dashboard" class="cta">Go to Dashboard</a></p>
         <p>Thank you for being part of ConstrAction.</p>`
      : `<h2>Bonjour ${first_name ?? ''},</h2>
         <p>Votre abonnement ConstrAction Pro a été annulé. <strong>Votre accès Pro restera actif jusqu'au ${endDate}.</strong></p>
         <p>Vous continuerez à profiter de tous les avantages Pro — contrats illimités, génération instantanée et soutien prioritaire — jusqu'à cette date. Après le ${endDate}, votre compte passera au mode paiement par contrat.</p>
         <p>Si c'est une erreur ou si vous changez d'avis, vous pouvez vous réabonner à tout moment depuis votre tableau de bord.</p>
         <p><a href="${siteUrl}/${language}/dashboard" class="cta">Accéder au tableau de bord</a></p>
         <p>Merci de faire partie de ConstrAction.</p>`

    const transport = createTransport({
      service: 'gmail',
      auth: {
        user: Deno.env.get('SMTP_USER'),
        pass: Deno.env.get('SMTP_PASSWORD'),
      },
    })

    await transport.sendMail({
      from: `"ConstrAction" <${Deno.env.get('SMTP_USER')}>`,
      to: email,
      subject,
      html: renderEmail({
        language,
        bodyHtml,
        siteUrl,
        preheader: subject,
      }),
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[send-cancellation] Error:', err)
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
