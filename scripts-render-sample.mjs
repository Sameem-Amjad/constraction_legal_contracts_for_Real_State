// Smoke test: render both PDF templates with a sample contract to verify they
// produce valid PDFs with no React or @react-pdf/renderer crashes.

import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { writeFileSync } from 'fs'
import { CCDocument } from '../lib/pdf/cc.tsx'
import { GCDocument } from '../lib/pdf/gc.tsx'

const sampleContract = {
  id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  user_id: null,
  contract_type: 'client-contractor',
  client_name: 'Acme Property Holdings Inc.',
  client_address: '123 Rue Sainte-Catherine',
  client_city: 'Montréal',
  client_postal: 'H3B 1A1',
  client_email: 'owner@acme.test',
  client_phone: '(514) 555-1234',
  contractor_name: 'Bâtisseurs Pro Inc.',
  contractor_rbq: '1234-5678-90',
  contractor_address: '456 Boulevard René-Lévesque',
  contractor_city: 'Montréal',
  contractor_postal: 'H3A 2A5',
  contractor_email: 'info@batisseurs.test',
  contractor_phone: '(514) 555-9876',
  project_site: '789 Rue Sherbrooke Est',
  project_city: 'Montréal',
  project_postal: 'H2X 1E2',
  project_description:
    'Renovation of a three-story residential building including kitchen, bathrooms, and full electrical rewiring.',
  contract_price: 125000,
  status: 'generated',
  pdf_path: null,
  metadata: {
    language: 'en',
    role: 'contractor',
    form_type: 'client-contractor',
    payment_method: 'Bank transfer',
    start_date: '2026-05-01',
    end_date: '2026-09-30',
    sign_date: '2026-04-26',
    late_interest: 12,
    holdback: true,
    holdback_pct: 10,
    bond: true,
    bond_pct: 50,
    insurance_amount: 2000000,
    warranty_months: 12,
    escalation: true,
    escalation_pct: 10,
    recovery_penalty: true,
    material_provider: 'contractor',
    extra_clauses:
      'Contractor agrees to coordinate weekly progress reviews with the Client every Friday.',
  },
  stripe_payment_intent_id: null,
  stripe_checkout_session_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

async function run() {
  for (const lang of ['en', 'fr']) {
    const ccBuffer = await renderToBuffer(
      React.createElement(CCDocument, {
        contract: sampleContract,
        profile: null,
        language: lang,
      })
    )
    writeFileSync(`/tmp/sample-cc-${lang}.pdf`, ccBuffer)
    console.log(`CC ${lang}: ${ccBuffer.length} bytes`)

    const gcBuffer = await renderToBuffer(
      React.createElement(GCDocument, {
        contract: { ...sampleContract, contract_type: 'gc-subcontractor' },
        profile: null,
        language: lang,
      })
    )
    writeFileSync(`/tmp/sample-gc-${lang}.pdf`, gcBuffer)
    console.log(`GC ${lang}: ${gcBuffer.length} bytes`)
  }
}

run().catch((err) => {
  console.error('FAILED:', err)
  process.exit(1)
})
