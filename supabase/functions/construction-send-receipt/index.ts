// @ts-nocheck — Deno runtime.
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createTransport } from 'npm:nodemailer@6'
import { corsHeaders } from '../_shared/cors.ts'

const GST_RATE = 0.05
const QST_RATE = 0.09975

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

interface ReceiptInput {
  email: string
  first_name?: string
  contract_id: string
  amount: number
  language?: 'en' | 'fr'
  full_address?: string
  contract_type?: 'client-contractor' | 'gc-subcontractor'
}

function renderReceiptHtml(input: ReceiptInput): string {
  const language = input.language ?? 'en'
  const isCC = input.contract_type !== 'gc-subcontractor'

  const subtotal = Number(input.amount)
  const gst = Math.round(subtotal * GST_RATE * 100) / 100
  const qst = Math.round(subtotal * QST_RATE * 100) / 100
  const total = Math.round((subtotal + gst + qst) * 100) / 100

  const fullName =
    input.first_name?.trim() || input.email.split('@')[0] || 'Customer'
  const fullAddress = input.full_address ?? ''

  // Receipt number: short, deterministic (last 8 chars of contract uuid).
  const invoiceNumber = `CTR-${input.contract_id.replace(/-/g, '').slice(-8).toUpperCase()}`

  const paymentDate = new Date().toLocaleDateString(
    language === 'fr' ? 'fr-CA' : 'en-CA',
    { year: 'numeric', month: 'long', day: 'numeric' }
  )

  const productName =
    language === 'fr'
      ? isCC
        ? 'Contrat Client / Entrepreneur'
        : 'Contrat Entrepreneur général / Sous-traitant'
      : isCC
        ? 'Client / Contractor Contract'
        : 'GC / Subcontractor Contract'

  const productDesc =
    language === 'fr'
      ? 'Génération automatisée de contrat (PDF bilingue, conforme au droit québécois)'
      : 'Automated contract generation (bilingual PDF, Quebec-law compliant)'

  return `<!DOCTYPE html>
<html lang="${language}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Receipt / Reçu — ConstrAction Inc.</title>
<style>
  body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  body { margin: 0; padding: 0; width: 100% !important; background-color: #f4f5f7; font-family: 'Inter', Arial, Helvetica, sans-serif; color: #2d3748; }
  .container { max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .header { background-color: #1a2744; padding: 32px 40px; text-align: center; }
  .header h1 { color: #fff; margin: 0; font-size: 22px; letter-spacing: 0.5px; }
  .badge { display: inline-block; background: #2e7dba; color: #ffffff; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 6px 18px; border-radius: 3px; margin-top: 12px; }
  .body-section { padding: 36px 40px; }
  .section-title { font-size: 12px; font-weight: 700; color: #2e7dba; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 14px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
  .info-grid { width: 100%; border-collapse: collapse; }
  .info-grid td { padding: 6px 0; vertical-align: top; font-size: 14px; line-height: 1.6; }
  .info-label { color: #718096; font-weight: 500; width: 50%; }
  .info-value { color: #1a202c; font-weight: 600; text-align: right; }
  .divider { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }
  .tax-inline p { margin: 2px 0; font-size: 12px; color: #4a5568; }
  .items-table { width: 100%; border-collapse: collapse; margin-top: 4px; }
  .items-table th { font-size: 11px; font-weight: 700; color: #718096; text-transform: uppercase; letter-spacing: 1px; text-align: left; padding: 10px 8px; border-bottom: 2px solid #e2e8f0; }
  .items-table td { padding: 14px 8px; border-bottom: 1px solid #edf2f7; font-size: 14px; vertical-align: top; }
  .item-name { font-weight: 600; color: #1a202c; }
  .item-desc { font-size: 12px; color: #718096; margin-top: 4px; }
  .totals-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  .totals-table td { padding: 6px 8px; font-size: 14px; }
  .totals-table .label { color: #718096; text-align: right; width: 70%; }
  .totals-table .value { color: #1a202c; font-weight: 600; text-align: right; }
  .total-row td { font-size: 16px; font-weight: 700; color: #1a202c; padding-top: 12px; border-top: 2px solid #1a202c; }
  .paid-row td { background: #ebf8ff; color: #1a2744; padding: 10px 8px; font-size: 14px; border-radius: 4px; margin-top: 8px; }
  .footer { background: #1a2744; color: #cbd5e0; padding: 24px 40px; text-align: center; }
  .footer p { margin: 4px 0; font-size: 12px; }
  .footer a { color: #90cdf4; text-decoration: none; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>ConstrAction</h1>
    <span class="badge">${language === 'fr' ? 'Reçu' : 'Receipt'}</span>
  </div>

  <div class="body-section">

    <p class="section-title">${language === 'fr' ? 'Détails du reçu' : 'Receipt Details'}</p>
    <table class="info-grid">
      <tr>
        <td class="info-label">${language === 'fr' ? 'N° de reçu' : 'Receipt No.'}</td>
        <td class="info-value">${invoiceNumber}</td>
      </tr>
      <tr>
        <td class="info-label">${language === 'fr' ? 'Date de paiement' : 'Date Paid'}</td>
        <td class="info-value">${paymentDate}</td>
      </tr>
    </table>

    <hr class="divider" />

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td width="50%" valign="top" style="padding-right: 16px;">
          <p class="section-title">${language === 'fr' ? 'De' : 'From'}</p>
          <p style="margin:0; font-size:15px; font-weight:700; color:#1a202c;">ConstrAction Inc.</p>
          <div class="tax-inline">
            <p><strong>GST/TPS:</strong> 74029 7569 RT 0001</p>
            <p><strong>QST/TVQ:</strong> 12 3300 4053 TQ 0001</p>
          </div>
          <p style="margin:10px 0 4px 0; font-size:13px; color:#4a5568;">2040-2020 Boulevard Robert-Bourassa<br/>Montréal, Québec H3A 2A5<br/>Canada</p>
          <p style="margin:4px 0; font-size:13px;"><a href="https://constraction.ca" style="color:#2e7dba; text-decoration:none;">constraction.ca</a></p>
        </td>
        <td width="50%" valign="top" style="padding-left: 16px;">
          <p class="section-title">${language === 'fr' ? 'Facturé à' : 'Billed To'}</p>
          <p style="margin:0; font-size:15px; font-weight:700; color:#1a202c;">${fullName}</p>
          <p style="margin:4px 0; font-size:13px; color:#4a5568;">${input.email}</p>
          ${fullAddress ? `<p style="margin:4px 0; font-size:13px; color:#4a5568;">${fullAddress}</p>` : ''}
          <p style="margin:4px 0; font-size:13px; color:#4a5568;">Canada</p>
        </td>
      </tr>
    </table>

    <hr class="divider" />

    <p class="section-title">${language === 'fr' ? 'Articles' : 'Items'}</p>
    <table class="items-table">
      <thead>
        <tr>
          <th>${language === 'fr' ? 'Article' : 'Item'}</th>
          <th style="text-align:center;">${language === 'fr' ? 'Qté' : 'Qty'}</th>
          <th style="text-align:right;">${language === 'fr' ? 'Prix' : 'Price'}</th>
          <th style="text-align:right;">${language === 'fr' ? 'Sous-total' : 'Subtotal'}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div class="item-name">${productName}</div>
            <div class="item-desc">${productDesc}</div>
          </td>
          <td style="text-align:center;">1</td>
          <td style="text-align:right;">CA$${formatCurrency(subtotal)}</td>
          <td style="text-align:right;">CA$${formatCurrency(subtotal)}</td>
        </tr>
      </tbody>
    </table>

    <table class="totals-table">
      <tr>
        <td class="label">${language === 'fr' ? 'Sous-total' : 'Subtotal'}</td>
        <td class="value">CA$${formatCurrency(subtotal)}</td>
      </tr>
      <tr>
        <td class="label">GST / TPS (5%)</td>
        <td class="value">CA$${formatCurrency(gst)}</td>
      </tr>
      <tr>
        <td class="label">QST / TVQ (9.975%)</td>
        <td class="value">CA$${formatCurrency(qst)}</td>
      </tr>
      <tr class="total-row">
        <td class="label">Total (CAD)</td>
        <td class="value">CA$${formatCurrency(total)}</td>
      </tr>
      <tr class="paid-row">
        <td class="label" style="font-weight:700;">${language === 'fr' ? 'Montant payé' : 'Amount Paid'} (CAD)</td>
        <td class="value">CA$${formatCurrency(total)}</td>
      </tr>
    </table>
  </div>

  <div class="footer">
    <p style="font-size:13px; color:#ffffff; font-weight:600;">ConstrAction Inc.</p>
    <p>2040-2020 Boulevard Robert-Bourassa, Montréal, QC H3A 2A5</p>
    <p><a href="https://constraction.ca">constraction.ca</a></p>
    <p style="margin-top:12px; font-size:11px; color:#94a3b8;">
      ${language === 'fr'
        ? 'Ce reçu confirme que votre paiement a été traité avec succès.'
        : 'This receipt confirms your payment has been processed successfully.'}
    </p>
    <p style="margin-top:8px; font-size:11px; color:#94a3b8; font-style: italic;">
      ${language === 'fr'
        ? "ConstrAction inc. fournit des outils de génération automatisée de documents et n'offre pas de conseils juridiques, d'opinions juridiques ni de représentation légale."
        : 'ConstrAction Inc. provides automated document generation tools and does not offer legal advice, legal opinions, or legal representation.'}
    </p>
    <p style="margin-top:12px; font-size:11px; color:#cbd5e0;">
      ${language === 'fr' ? 'Merci pour votre confiance !' : 'Thank you for your trust!'}
    </p>
  </div>

</div>
</body>
</html>`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const input: ReceiptInput = await req.json()
    const language = input.language ?? 'en'

    const subtotal = Number(input.amount)
    const total =
      Math.round((subtotal * (1 + GST_RATE + QST_RATE)) * 100) / 100

    const subject =
      language === 'fr'
        ? `Votre reçu ConstrAction — CA$${formatCurrency(total)}`
        : `Your ConstrAction receipt — CA$${formatCurrency(total)}`

    const transport = createTransport({
      service: 'gmail',
      auth: {
        user: Deno.env.get('SMTP_USER'),
        pass: Deno.env.get('SMTP_PASSWORD'),
      },
    })

    const sendResult = await transport.sendMail({
      from: `"ConstrAction Inc." <${Deno.env.get('SMTP_USER')}>`,
      to: input.email,
      replyTo: 'billing@constraction.ca',
      subject,
      html: renderReceiptHtml(input),
      headers: {
        // Help Gmail/Outlook classify this as transactional, not bulk
        'List-Unsubscribe': '<mailto:billing@constraction.ca?subject=Unsubscribe>',
        'X-Entity-Ref-ID': input.contract_id,
      },
    })

    return new Response(
      JSON.stringify({
        success: true,
        messageId: sendResult?.messageId ?? null,
        accepted: sendResult?.accepted ?? null,
        rejected: sendResult?.rejected ?? null,
        response: sendResult?.response ?? null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('[send-receipt] Error:', err)
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
