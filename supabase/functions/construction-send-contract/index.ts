// @ts-nocheck — Deno runtime.
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.46.1'
import { createTransport } from 'npm:nodemailer@6'
import { Buffer } from 'node:buffer'
import { corsHeaders } from '../_shared/cors.ts'
import { renderEmail } from '../_shared/email.ts'
import { SUPABASE_SCHEMA } from '../_shared/schema.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {
      email,
      first_name,
      contract_id,
      pdf_path,
      language = 'en',
      contract_type,
    } = await req.json()

    const siteUrl =
      Deno.env.get('NEXT_PUBLIC_SITE_URL') ?? 'https://constraction.ca'

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { db: { schema: SUPABASE_SCHEMA }, auth: { persistSession: false } }
    )

    // Download the PDF as a Blob → ArrayBuffer → Uint8Array → base64
    const { data: blob, error: downloadError } = await supabase.storage
      .from('construction-contracts')
      .download(pdf_path)

    if (downloadError || !blob) {
      throw new Error(
        `Could not download PDF at ${pdf_path}: ${downloadError?.message ?? 'no data'}`
      )
    }

    const buffer = new Uint8Array(await blob.arrayBuffer())

    const isEn = language === 'en'
    const isCC = contract_type === 'client-contractor'
    const today = new Date().toISOString().split('T')[0]

    const typeLabel = isEn
      ? isCC
        ? 'Client / Contractor'
        : 'GC / Subcontractor'
      : isCC
        ? 'Client / Entrepreneur'
        : 'Entrepreneur général / Sous-traitant'

    const subject = isEn
      ? `Your ConstrAction Contract — ${typeLabel} (${today})`
      : `Votre contrat ConstrAction — ${typeLabel} (${today})`

    const filename = `Contract_${isCC ? 'CC' : 'GC'}_${today}.pdf`

    const greeting = isEn
      ? `Hi ${first_name ?? 'there'},`
      : `Bonjour ${first_name ?? ''},`

    const body = isEn
      ? `<p>${greeting}</p>
         <p>Your ${typeLabel} contract is attached to this email as a PDF. Please review it carefully, sign both copies, and keep a signed copy for your records.</p>
         <p>You can also download the contract from your dashboard at any time:</p>
         <p><a href="${siteUrl}/${language}/dashboard" class="cta">View My Contracts</a></p>
         <p>Thank you for using ConstrAction.</p>`
      : `<p>${greeting}</p>
         <p>Votre contrat ${typeLabel} est joint à ce courriel au format PDF. Veuillez le lire attentivement, signer les deux exemplaires et conserver un exemplaire signé pour vos dossiers.</p>
         <p>Vous pouvez également télécharger le contrat depuis votre tableau de bord à tout moment :</p>
         <p><a href="${siteUrl}/${language}/dashboard" class="cta">Voir mes contrats</a></p>
         <p>Merci d'utiliser ConstrAction.</p>`

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
        bodyHtml: body,
        siteUrl,
        preheader: subject,
      }),
      attachments: [
        {
          filename,
          content: Buffer.from(buffer),
          contentType: 'application/pdf',
        },
      ],
    })

    return new Response(
      JSON.stringify({ success: true, contract_id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('[send-contract] Error:', err)
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
