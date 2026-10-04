/**
 * ConstrAction — render the stored contract PDFs for the seeded demo data.
 *
 * scripts/seed-hub.mjs gives every non-draft contract a pdf_path
 * (<user_id>/<contract_id>.pdf in the `construction-contracts` bucket) but
 * never uploads a file, so "Download PDF" (/api/contracts/signed-url) could not
 * sign anything and returned 500. In the real app the PDF is stored when the
 * contract is generated (/api/contracts/generate); this script does the same
 * for the seeded rows, with the same templates (lib/pdf/cc.tsx, lib/pdf/gc.tsx)
 * and the same props.
 *
 * Idempotent: only files that are missing are rendered and uploaded; existing
 * files are never overwritten and contract rows are not modified.
 * Run it after seed-hub.mjs (it imports the .tsx templates, hence tsx):
 *
 *   SUPABASE_URL=https://<ref>.supabase.co SUPABASE_SERVICE_ROLE_KEY=... \
 *     npx tsx scripts/seed-hub-pdfs.mjs
 *
 *   DRY_RUN=1 ...   # list the missing files, render and upload nothing
 */
import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { renderToBuffer } from '@react-pdf/renderer';

import { CCDocument } from '../lib/pdf/cc.tsx';
import { GCDocument } from '../lib/pdf/gc.tsx';

const SCHEMA = 'construction';
const BUCKET = 'construction-contracts';
const DRY_RUN = Boolean(process.env.DRY_RUN);

async function main() {
  const SUPA = process.env.SUPABASE_URL;
  const SRK = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPA || !SRK) throw new Error('set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');

  const supabase = createClient(SUPA, SRK, {
    db: { schema: SCHEMA },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: contracts, error } = await supabase
    .from('contracts')
    .select('*')
    .not('pdf_path', 'is', null)
    .order('created_at');
  if (error) throw new Error(`contracts: ${error.message}`);

  // Files already in the bucket, listed once per <user_id>/ folder.
  const stored = new Set();
  for (const folder of new Set(contracts.map((c) => c.pdf_path.split('/')[0]))) {
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET)
      .list(folder, { limit: 1000 });
    if (listError) throw new Error(`list ${folder}: ${listError.message}`);
    for (const f of files) stored.add(`${folder}/${f.name}`);
  }

  const missing = contracts.filter((c) => !stored.has(c.pdf_path));
  console.log(`→ ${contracts.length} contracts with a pdf_path, ${missing.length} files missing`);

  const profiles = new Map();
  let uploaded = 0;
  for (const contract of missing) {
    const meta = contract.metadata ?? {};
    const language = (meta.language ?? meta.locale) === 'fr' ? 'fr' : 'en';

    if (DRY_RUN) {
      console.log(`   · ${contract.pdf_path} (${contract.contract_type}, ${language}, ${contract.status})`);
      continue;
    }

    // Same inputs as /api/contracts/generate: the owner's profile and logo.
    if (contract.user_id && !profiles.has(contract.user_id)) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', contract.user_id)
        .maybeSingle();
      profiles.set(contract.user_id, data ?? null);
    }
    const profile = profiles.get(contract.user_id) ?? null;
    const logoUrl = meta.logo_url ?? profile?.logo_url ?? undefined;

    const DocumentComponent =
      contract.contract_type === 'client-contractor' ? CCDocument : GCDocument;
    const pdfBuffer = await renderToBuffer(
      React.createElement(DocumentComponent, { contract, profile, language, logoUrl })
    );

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(contract.pdf_path, pdfBuffer, { contentType: 'application/pdf', upsert: false });
    if (uploadError) {
      console.error(`   ✗ ${contract.pdf_path}: ${uploadError.message}`);
      continue;
    }
    uploaded++;
    console.log(`   + ${contract.pdf_path} (${contract.contract_type}, ${language}, ${pdfBuffer.length} bytes)`);
  }

  console.log(`\n✓ ${DRY_RUN ? 'dry run' : `${uploaded} PDFs uploaded`}`);
}

main().catch((e) => {
  console.error('\n✗ seed-hub-pdfs failed:', e.message);
  process.exit(1);
});
