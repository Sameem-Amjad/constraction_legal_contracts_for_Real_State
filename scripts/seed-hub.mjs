/**
 * ConstrAction — demo seeder for the shared Supabase hub (schema `construction`).
 *
 * Same dataset as scripts/seed-demo-users.mjs: 30 confirmed demo accounts with
 * Quebec-appropriate company details (2 admins), subscriptions across every
 * state, a spread of contracts and an activity log.
 *
 * Plus a public portfolio "demo admin that cannot delete":
 * demo.admin@demo.constraction.ca — role admin, app_metadata.no_delete = true.
 *
 * Idempotent:
 *   - auth users are looked up by email and only created when missing
 *     (always via auth.admin.createUser, tagged user_metadata.app = 'construction');
 *   - the demo admin, if it already exists, gets app_metadata.no_delete and the
 *     shared password re-applied (so a visitor's password change is undone);
 *   - profiles / subscriptions are upserted, so roles and plans are re-applied;
 *   - contracts / activity rows are only inserted for demo users that have none.
 *
 *   SUPABASE_URL=https://<ref>.supabase.co SUPABASE_SERVICE_ROLE_KEY=... \
 *     node --experimental-websocket scripts/seed-hub.mjs [--demo-admin-only]
 *
 *   DRY_RUN=1 node scripts/seed-hub.mjs   # print the planned row counts, no network
 *
 * Contracts get a pdf_path but no file: run scripts/seed-hub-pdfs.mjs afterwards
 * to render and upload the PDFs, otherwise "Download PDF" has nothing to sign.
 */
import { createClient } from '@supabase/supabase-js';

const SCHEMA = 'construction';
const APP = 'construction';
const PASSWORD = 'ConstrAction@2026';
const DOMAIN = 'demo.constraction.ca';
const DRY_RUN = Boolean(process.env.DRY_RUN);
const DEMO_ADMIN_ONLY = process.argv.includes('--demo-admin-only');
const DEMO_ADMIN_EMAIL = `demo.admin@${DOMAIN}`;

// Deterministic PRNG so re-runs produce the same spread.
let _s = 0x3ac91f7;
const rnd = () => {
  _s = (_s + 0x6d2b79f5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = (a) => a[Math.floor(rnd() * a.length)];
const int = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));
const iso = (d) => new Date(Date.now() - d * 86400_000).toISOString();

// ── Quebec flavour ──────────────────────────────────────────────────────
const PEOPLE = [
  ['Marc', 'Tremblay'], ['Julie', 'Gagnon'], ['Alexandre', 'Roy'],
  ['Sophie', 'Bergeron'], ['Mathieu', 'Côté'], ['Isabelle', 'Fortin'],
  ['Patrick', 'Lavoie'], ['Caroline', 'Gauthier'], ['Sébastien', 'Morin'],
  ['Nathalie', 'Bouchard'], ['Éric', 'Pelletier'], ['Véronique', 'Bélanger'],
  ['Jean-François', 'Lévesque'], ['Mélanie', 'Girard'], ['Simon', 'Poirier'],
  ['Catherine', 'Leblanc'], ['Martin', 'Dubé'], ['Andrée', 'Ouellet'],
  ['Guillaume', 'Nadeau'], ['Karine', 'Beaulieu'], ['Daniel', 'Thibault'],
  ['Stéphanie', 'Caron'], ['Olivier', 'Lachance'], ['Marie-Claude', 'Dionne'],
  ['François', 'Hébert'], ['Chantal', 'Paquette'], ['Luc', 'Desjardins'],
  ['Geneviève', 'Rousseau'], ['Yannick', 'Boucher'], ['Hélène', 'Charbonneau'],
];

const COMPANY_SUFFIX = ['Construction', 'Bâtiment', 'Rénovation', 'Entrepreneur Général', 'Constructions', 'Toiture', 'Excavation'];

const CITIES = [
  ['Montréal', 'H2X'], ['Québec', 'G1R'], ['Laval', 'H7N'], ['Gatineau', 'J8X'],
  ['Longueuil', 'J4K'], ['Sherbrooke', 'J1H'], ['Saguenay', 'G7H'], ['Lévis', 'G6V'],
  ['Trois-Rivières', 'G9A'], ['Terrebonne', 'J6W'], ['Saint-Jérôme', 'J7Z'], ['Drummondville', 'J2B'],
];

const STREETS = [
  'rue Saint-Denis', 'boulevard René-Lévesque', 'avenue du Mont-Royal', 'rue Sainte-Catherine',
  'chemin de la Côte-des-Neiges', 'boulevard Taschereau', 'rue Principale', 'avenue Cartier',
  'rue Notre-Dame', 'boulevard Laurier', 'rue King Ouest', 'montée Masson',
];

const PROJECTS = [
  'Rénovation complète de cuisine et salle de bain',
  'Agrandissement arrière sur deux étages',
  'Réfection de toiture en bardeaux d\'asphalte',
  'Construction d\'un garage détaché de 24 pi x 24 pi',
  'Aménagement de sous-sol avec salle familiale',
  'Remplacement des fenêtres et portes extérieures',
  'Installation d\'une terrasse en bois traité',
  'Réfection du drain français et imperméabilisation',
  'Finition intérieure — plâtre, peinture et plancher',
  'Coulée de dalle de béton et fondation',
  'Réaménagement d\'un local commercial',
  'Isolation de l\'entretoit à la cellulose',
];

const ACTIONS = [
  ['contract.created', 'Nouveau contrat créé'],
  ['contract.generated', 'PDF généré'],
  ['contract.paid', 'Paiement confirmé'],
  ['profile.updated', 'Profil mis à jour'],
  ['auth.login', 'Connexion réussie'],
  ['subscription.started', 'Abonnement mensuel activé'],
];

// Subscriptions across every allowed state.
const SUB_STATES = [
  { status: 'active', plan_type: 'unlimited_monthly' },
  { status: 'active', plan_type: 'pay_per_contract' },
  { status: 'inactive', plan_type: 'pay_per_contract' },
  { status: 'canceled', plan_type: 'unlimited_monthly' },
  { status: 'past_due', plan_type: 'unlimited_monthly' },
];

const postal = (fsa) => `${fsa} ${int(1, 9)}${String.fromCharCode(65 + int(0, 25))}${int(1, 9)}`;
const rbq = () => `${int(1000, 9999)}-${int(1000, 9999)}-${int(10, 99)}`;
const phone = () => `(${pick(['514', '438', '450', '418', '819', '579', '873'])}) ${int(200, 989)}-${int(1000, 9999)}`;
const street = () => `${int(20, 9800)} ${pick(STREETS)}`;
const slug = (f, l) =>
  `${f}.${l}`.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')  // strip accents for the address
    .replace(/[^a-z.]+/g, '');

// Builds the whole dataset up front, consuming the PRNG in the same order as
// seed-demo-users.mjs did on a fresh project, so the spread is identical and
// does not depend on which accounts already exist.
function buildDataset() {
  const people = PEOPLE.map(([first, last], i) => {
    const email = `${slug(first, last)}@${DOMAIN}`;
    const metaPhone = phone();

    // First two accounts are admins so the /admin area has more than one operator.
    const role = i < 2 ? 'admin' : 'user';
    const isCompany = rnd() < 0.68;
    const [city, fsa] = pick(CITIES);
    const company = `${last} ${pick(COMPANY_SUFFIX)}${rnd() < 0.4 ? ' inc.' : ''}`;

    const profile = {
      email,
      first_name: first,
      last_name: last,
      phone: phone(),
      role,
      entity_type: isCompany ? 'company' : 'individual',
      // Company branch
      company_name: isCompany ? company : null,
      incorporation_regime: isCompany ? pick(['quebec_inc', 'canada_inc']) : null,
      rbq: isCompany ? rbq() : null,
      head_office: isCompany ? street() : null,
      ho_city: isCompany ? city : null,
      ho_postal: isCompany ? postal(fsa) : null,
      rep_name: isCompany ? `${first} ${last}` : null,
      rep_title: isCompany ? pick(['Président', 'Directeur des opérations', 'Propriétaire', 'Gérant de projet']) : null,
      // Individual branch
      full_name: isCompany ? null : `${first} ${last}`,
      address: isCompany ? null : street(),
      ind_city: isCompany ? null : city,
      ind_postal: isCompany ? null : postal(fsa),
      created_at: iso(int(10, 150)),
    };

    const sub = i < 2 ? SUB_STATES[0] : SUB_STATES[i % SUB_STATES.length];
    const monthly = sub.plan_type === 'unlimited_monthly';
    const subscription = {
      status: sub.status,
      plan_type: sub.plan_type,
      cancel_at_period_end: sub.status === 'canceled',
      current_period_end: monthly && sub.status !== 'inactive' ? iso(-int(3, 28)) : null,
    };

    return { first, last, email, metaPhone, role, city, fsa, isCompany, company, monthly, profile, subscription };
  });

  // ── contracts (user_id / pdf_path filled in once the auth id is known) ──
  for (const u of people) {
    u.contracts = [];
    const n = int(1, 4);
    for (let c = 0; c < n; c++) {
      const type = rnd() < 0.72 ? 'client-contractor' : 'gc-subcontractor';
      // Weighted so the pipeline looks real: mostly finished work, some drafts.
      const status = pick([
        'draft', 'draft', 'generated', 'generated',
        'paid', 'paid', 'paid', 'signed', 'signed', 'completed',
      ]);
      u.contracts.push(makeContract(u, type, status));
    }
  }

  // ── activity log ──────────────────────────────────────────────────────
  for (const u of people) {
    u.activity = [];
    for (let a = 0; a < int(2, 6); a++) u.activity.push(makeActivity());
  }

  return people;
}

function makeContract(u, type, status) {
  const [pCity, pFsa] = pick(CITIES);
  const clientPerson = pick(PEOPLE);
  const paid = ['paid', 'signed', 'completed'].includes(status);
  const age = int(1, 120);

  return {
    id: crypto.randomUUID(),
    contract_type: type,
    client_name: `${clientPerson[0]} ${clientPerson[1]}`,
    client_address: street(),
    client_city: pCity,
    client_postal: postal(pFsa),
    client_email: `${slug(clientPerson[0], clientPerson[1])}@example.com`,
    client_phone: phone(),
    contractor_name: u.isCompany ? u.company : `${u.first} ${u.last}`,
    contractor_rbq: rbq(),
    contractor_address: street(),
    contractor_city: u.city,
    contractor_postal: postal(u.fsa),
    contractor_email: u.email,
    contractor_phone: phone(),
    project_site: street(),
    project_city: pCity,
    project_postal: postal(pFsa),
    project_description: pick(PROJECTS),
    contract_price: Number((int(2_500, 185_000) + rnd()).toFixed(2)),
    status,
    stripe_payment_intent_id: paid ? `pi_demo${crypto.randomUUID().slice(0, 14).replace(/-/g, '')}` : null,
    stripe_checkout_session_id: paid ? `cs_demo${crypto.randomUUID().slice(0, 14).replace(/-/g, '')}` : null,
    metadata: { locale: rnd() < 0.5 ? 'fr' : 'en', source: 'demo-seed' },
    created_at: iso(age),
    updated_at: iso(Math.max(0, age - int(0, 6))),
  };
}

function makeActivity() {
  const [action, details] = pick(ACTIONS);
  return {
    action,
    details,
    ip_address: `${int(24, 208)}.${int(0, 255)}.${int(0, 255)}.${int(1, 254)}`,
    created_at: iso(int(0, 60)),
  };
}

// Public portfolio admin: full admin role, but app_metadata.no_delete = true
// makes every delete path refuse it. Built after the main dataset so it never
// shifts the PRNG sequence of the 30 demo accounts.
function buildDemoAdmin() {
  const first = 'Démo';
  const last = 'Admin';
  const [city, fsa] = CITIES[0];
  const company = 'ConstrAction Démo inc.';
  const u = {
    first, last, email: DEMO_ADMIN_EMAIL, metaPhone: phone(), role: 'admin',
    city, fsa, isCompany: true, company, monthly: true,
    appMetadata: { no_delete: true },
  };
  u.profile = {
    email: u.email,
    first_name: first,
    last_name: last,
    phone: phone(),
    role: 'admin',
    entity_type: 'company',
    company_name: company,
    incorporation_regime: 'quebec_inc',
    rbq: rbq(),
    head_office: street(),
    ho_city: city,
    ho_postal: postal(fsa),
    rep_name: `${first} ${last}`,
    rep_title: 'Administrateur (démo)',
    full_name: null,
    address: null,
    ind_city: null,
    ind_postal: null,
    created_at: iso(45),
  };
  u.subscription = {
    status: 'active',
    plan_type: 'unlimited_monthly',
    cancel_at_period_end: false,
    current_period_end: iso(-365),
  };
  // One contract per status so every row action (incl. the disabled delete) shows.
  u.contracts = ['draft', 'generated', 'paid', 'signed', 'completed'].map((status, k) =>
    makeContract(u, k % 2 ? 'gc-subcontractor' : 'client-contractor', status)
  );
  u.activity = Array.from({ length: 4 }, makeActivity);
  return u;
}

function summarize(people) {
  const subs = {};
  const contracts = {};
  for (const u of people) {
    const k = `${u.subscription.status}/${u.subscription.plan_type}`;
    subs[k] = (subs[k] ?? 0) + 1;
    for (const c of u.contracts) contracts[c.status] = (contracts[c.status] ?? 0) + 1;
  }
  return {
    users: people.length,
    admins: people.filter((u) => u.role === 'admin').length,
    contracts: people.reduce((n, u) => n + u.contracts.length, 0),
    activity_log: people.reduce((n, u) => n + u.activity.length, 0),
    subscriptions: subs,
    contract_status: contracts,
  };
}

async function main() {
  const people = buildDataset();
  const demoAdmin = buildDemoAdmin();
  const targets = DEMO_ADMIN_ONLY ? [demoAdmin] : [...people, demoAdmin];

  if (DRY_RUN) {
    console.log(JSON.stringify(summarize(targets), null, 2));
    return;
  }

  const SUPA = process.env.SUPABASE_URL;
  const SRK = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPA || !SRK) throw new Error('set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');

  const supabase = createClient(SUPA, SRK, {
    db: { schema: SCHEMA },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const db = supabase.schema(SCHEMA);

  const count = async (table, filter) => {
    let q = db.from(table).select('*', { count: 'exact', head: true });
    if (filter) q = filter(q);
    const { count: n, error } = await q;
    if (error) throw new Error(`count ${table}: ${error.message}`);
    return n ?? 0;
  };

  // Auth is shared by every app on the hub: page through all users.
  console.log('→ reading existing accounts');
  const existing = new Map();
  for (let page = 1; ; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`listUsers: ${error.message}`);
    for (const u of data.users) if (u.email) existing.set(u.email.toLowerCase(), u);
    if (data.users.length < 1000) break;
  }
  console.log(`   ${existing.size} auth users on the hub`);

  const before = {
    profiles: await count('profiles'),
    subscriptions: await count('subscriptions'),
    contracts: await count('contracts'),
    activity_log: await count('activity_log'),
  };

  let createdUsers = 0;
  let insertedContracts = 0;
  let insertedActivity = 0;

  for (const u of targets) {
    const found = existing.get(u.email);
    let id = found?.id;
    if (id && u.appMetadata) {
      // Demo admin: re-apply the no-delete flag and the shared password.
      const { error } = await supabase.auth.admin.updateUserById(id, {
        password: PASSWORD,
        app_metadata: { ...found.app_metadata, ...u.appMetadata },
        user_metadata: { ...found.user_metadata, app: APP },
      });
      if (error) {
        console.error(`   ✗ ${u.email}: ${error.message}`);
        continue;
      }
      console.log(`   = ${u.email.padEnd(38)} exists (no_delete + password re-applied)`);
    } else if (id) {
      console.log(`   = ${u.email.padEnd(38)} exists`);
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { app: APP, first_name: u.first, last_name: u.last, phone: u.metaPhone },
        ...(u.appMetadata ? { app_metadata: u.appMetadata } : {}),
      });
      if (error || !data.user) {
        console.error(`   ✗ ${u.email}: ${error?.message ?? 'no user returned'}`);
        continue;
      }
      id = data.user.id;
      createdUsers++;
      console.log(`   + ${u.email.padEnd(38)} created`);
    }

    // Profile + subscription: the auth trigger creates bare rows for new users;
    // upsert so roles/plans are (re)applied and rows exist even if the schema
    // was rebuilt after the auth users were created.
    const { error: pErr } = await db.from('profiles').upsert({ id, ...u.profile }, { onConflict: 'id' });
    if (pErr) {
      console.error(`   ! profile ${u.email}: ${pErr.message}`);
      continue;
    }

    const stripeTag = id.slice(0, 10).replace(/-/g, '');
    const { error: sErr } = await db.from('subscriptions').upsert(
      {
        user_id: id,
        ...u.subscription,
        stripe_customer_id: u.subscription.status === 'inactive' ? null : `cus_demo${stripeTag}`,
        stripe_subscription_id: u.monthly && u.subscription.status !== 'inactive' ? `sub_demo${stripeTag}` : null,
      },
      { onConflict: 'user_id' }
    );
    if (sErr) console.error(`   ! subscription ${u.email}: ${sErr.message}`);

    if ((await count('contracts', (q) => q.eq('user_id', id))) === 0) {
      const rows = u.contracts.map((c) => ({
        ...c,
        user_id: id,
        // Same layout the app uses: <user_id>/<contract_id>.pdf in construction-contracts.
        pdf_path: c.status === 'draft' ? null : `${id}/${c.id}.pdf`,
      }));
      const { error } = await db.from('contracts').insert(rows);
      if (error) console.error(`   ! contracts ${u.email}: ${error.message}`);
      else insertedContracts += rows.length;
    }

    if ((await count('activity_log', (q) => q.eq('user_id', id))) === 0) {
      const rows = u.activity.map((a) => ({ ...a, user_id: id }));
      const { error } = await db.from('activity_log').insert(rows);
      if (error) console.error(`   ! activity ${u.email}: ${error.message}`);
      else insertedActivity += rows.length;
    }

    console.log(`     ${u.role.padEnd(5)} ${u.subscription.status}/${u.subscription.plan_type}${u.appMetadata ? ' no_delete' : ''}`);
  }

  const after = {
    profiles: await count('profiles'),
    subscriptions: await count('subscriptions'),
    contracts: await count('contracts'),
    activity_log: await count('activity_log'),
  };

  console.log('\n✓ seed complete');
  console.log(`  ${createdUsers} users created, ${insertedContracts} contracts, ${insertedActivity} activity rows inserted`);
  console.log(`  password for every demo account: ${PASSWORD}`);
  console.table(Object.fromEntries(Object.keys(after).map((k) => [k, { before: before[k], after: after[k] }])));
}

main().catch((e) => {
  console.error('\n✗ seed failed:', e.message);
  process.exit(1);
});
