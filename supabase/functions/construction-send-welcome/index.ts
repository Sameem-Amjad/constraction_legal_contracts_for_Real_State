// @ts-nocheck — Deno runtime. TypeScript types come from Deno, not Node.
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createTransport } from 'npm:nodemailer@6'
import { corsHeaders } from '../_shared/cors.ts'
import { renderEmail } from '../_shared/email.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, first_name, language = 'en' } = await req.json()

    const siteUrl =
      Deno.env.get('NEXT_PUBLIC_SITE_URL') ?? 'https://constraction.ca'

    const transport = createTransport({
      service: 'gmail',
      auth: {
        user: Deno.env.get('SMTP_USER'),
        pass: Deno.env.get('SMTP_PASSWORD'),
      },
    })

    const isEn = language === 'en'

    const subject = isEn
      ? 'Welcome to ConstrAction — Your account is ready'
      : 'Bienvenue chez ConstrAction — Votre compte est prêt'

    const greeting = isEn
      ? `Welcome, ${first_name}!`
      : `Bienvenue, ${first_name} !`

    const intro = isEn
      ? 'Your ConstrAction account has been created. You can now generate Quebec-compliant construction contracts in minutes.'
      : 'Votre compte ConstrAction a été créé. Vous pouvez maintenant générer des contrats de construction conformes au droit québécois en quelques minutes.'

    const features = isEn
      ? [
          'Generate Client / Contractor agreements',
          'Generate GC / Subcontractor agreements',
          'Download PDFs in English or French',
          'Upgrade to Pro for unlimited contracts at $349 / month',
        ]
      : [
          'Générer des contrats Client / Entrepreneur',
          'Générer des contrats Entrepreneur général / Sous-traitant',
          'Télécharger les PDF en anglais ou en français',
          'Passer à Pro pour des contrats illimités à 349 $ / mois',
        ]

    const ctaLabel = isEn ? 'Go to Dashboard' : 'Accéder au tableau de bord'

    const bodyHtml = `
      <h2>${greeting}</h2>
      <p>${intro}</p>
      <p><a href="${siteUrl}/${language}/dashboard" class="cta">${ctaLabel}</a></p>
      <hr />
      <p><strong>${isEn ? 'What you can do:' : 'Ce que vous pouvez faire :'}</strong></p>
      <ul>
        ${features.map((f) => `<li>${f}</li>`).join('')}
      </ul>
    `

    await transport.sendMail({
      from: `"ConstrAction" <${Deno.env.get('SMTP_USER')}>`,
      to: email,
      subject,
      html: renderEmail({ language, bodyHtml, siteUrl, preheader: subject }),
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[send-welcome] Error:', err)
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
