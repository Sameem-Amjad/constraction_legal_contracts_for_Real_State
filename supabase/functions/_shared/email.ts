// Shared bilingual email layout used by all sender Edge Functions.
// All copy is owned by ConstrAction Inc. and must include the legal
// disclaimer in the footer per the spec.

export interface EmailLayoutInput {
  language: 'en' | 'fr'
  preheader?: string
  bodyHtml: string
  siteUrl: string
}

const DISCLAIMER = {
  en: 'ConstrAction Inc. provides automated document generation tools and does not offer legal advice, legal opinions, or legal representation.',
  fr: "ConstrAction inc. fournit des outils de génération automatisée de documents et n'offre pas de conseils juridiques, d'opinions juridiques ni de représentation légale.",
}

export function renderEmail({
  language,
  preheader,
  bodyHtml,
  siteUrl,
}: EmailLayoutInput): string {
  return `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ConstrAction</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; color: #1a1a2e; max-width: 640px; margin: 0 auto; background: #f6f6f9; }
    .container { background: #ffffff; }
    .header { background: #1a1a2e; padding: 24px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 22px; letter-spacing: 0.5px; }
    .content { padding: 32px 24px; line-height: 1.55; font-size: 15px; }
    .content h2 { font-size: 20px; margin: 0 0 12px; }
    .cta { display: inline-block; background: #2563eb; color: #fff !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 16px 0; }
    .footer { background: #f5f5f5; padding: 16px 24px; font-size: 12px; color: #666; }
    .footer p { margin: 4px 0; }
    table { border-collapse: collapse; width: 100%; }
    table td { padding: 6px 4px; border-bottom: 1px solid #eee; font-size: 14px; }
    table td.label { color: #666; }
    table td.value { text-align: right; font-weight: 600; }
    .total td { border-top: 2px solid #333; border-bottom: none; padding-top: 10px; font-size: 15px; }
  </style>
</head>
<body>
  ${preheader ? `<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>` : ''}
  <div class="container">
    <div class="header"><h1>ConstrAction</h1></div>
    <div class="content">${bodyHtml}</div>
    <div class="footer">
      <p><em>${DISCLAIMER[language]}</em></p>
      <p>ConstrAction Inc. &middot; Montr&eacute;al, Qu&eacute;bec, Canada &middot; <a href="${siteUrl}">constraction.ca</a></p>
    </div>
  </div>
</body>
</html>`
}
