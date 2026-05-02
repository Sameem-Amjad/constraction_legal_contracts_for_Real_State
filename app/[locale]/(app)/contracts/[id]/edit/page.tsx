import { notFound, redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'

import { WizardShell } from '@/components/wizard/WizardShell'
import { createClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { isProActive } from '@/types/supabase'
import type { Locale } from '@/i18n'
import type { WizardState } from '@/lib/validations/wizard'
import type { ContractMetadata } from '@/types/supabase'

export default async function EditContractPage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>
}) {
  const { locale, id } = await params
  setRequestLocale(locale)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: contract } = await adminSupabase
    .from('contracts')
    .select('*')
    .eq('id', id)
    .single()

  if (!contract) notFound()
  if (contract.user_id !== user.id) redirect(`/${locale}/contracts`)

  const [{ data: profile }, { data: subscription }] = await Promise.all([
    adminSupabase.from('profiles').select('*').eq('id', user.id).single(),
    adminSupabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  const meta = (contract.metadata as ContractMetadata | null) ?? ({} as ContractMetadata)
  const formType = (meta.form_type ?? contract.contract_type) as
    | 'client-contractor'
    | 'gc-subcontractor'
  const isClientRole = meta.role === 'client' || meta.role === 'gc'

  const role: 'client' | 'contractor' | 'gc' | 'subcontractor' =
    (meta.role as 'client' | 'contractor' | 'gc' | 'subcontractor') ??
    (formType === 'client-contractor' ? 'contractor' : 'gc')

  // Land on review for resumed drafts. Step indices:
  //   contractor flow has 12 steps + role + review (13 indices, 0-based)
  //   other flows  has 13 steps + role + review (14 indices, 0-based)
  const reviewStepIdx = role === 'contractor' ? 12 : 13

  const safePaymentMethod = ([
    'lump_sum',
    'single_payment_completion',
    'progress_payments',
    'milestone_payments',
    'time_and_materials',
  ] as const).includes(meta.payment_method as never)
    ? (meta.payment_method as
        | 'lump_sum'
        | 'single_payment_completion'
        | 'progress_payments'
        | 'milestone_payments'
        | 'time_and_materials')
    : 'lump_sum'

  const safeDueDays = ([0, 5, 15, 30, 45, 60] as const).includes(
    meta.payment_due_days as never
  )
    ? (meta.payment_due_days as 0 | 5 | 15 | 30 | 45 | 60)
    : 5

  const initialState: Partial<WizardState> = {
    step: reviewStepIdx,
    contract_id: contract.id,
    language: (meta.language as 'en' | 'fr') ?? locale,
    role: { role, form_type: formType },
    basics: {
      project_name: meta.project_name ?? '',
      project_site: contract.project_site ?? '',
      project_city: contract.project_city ?? '',
      project_postal: contract.project_postal ?? '',
      contract_price: Number(contract.contract_price ?? 0),
      sign_date: meta.sign_date ?? '',
      other_entity_type: meta.other_entity_type as
        | 'company'
        | 'individual'
        | 'other'
        | undefined,
    },
    my_info: {
      entity_type:
        (meta.my_entity_type as 'company' | 'individual' | 'other') ??
        (profile?.entity_type === 'individual' ? 'individual' : 'company'),
      email: isClientRole
        ? contract.client_email ?? undefined
        : contract.contractor_email ?? undefined,
      phone: isClientRole
        ? contract.client_phone ?? undefined
        : contract.contractor_phone ?? undefined,
      logo_url: meta.logo_url,
      ...(profile
        ? {
            company_name: profile.company_name ?? undefined,
            incorporation_regime:
              profile.incorporation_regime === 'quebec_inc' ||
              profile.incorporation_regime === 'canada_inc'
                ? profile.incorporation_regime
                : undefined,
            rbq: profile.rbq ?? undefined,
            head_office: profile.head_office ?? undefined,
            ho_city: profile.ho_city ?? undefined,
            ho_postal: profile.ho_postal ?? undefined,
            rep_name: profile.rep_name ?? undefined,
            rep_title: profile.rep_title ?? undefined,
            full_name: profile.full_name ?? undefined,
            address: profile.address ?? undefined,
            ind_city: profile.ind_city ?? undefined,
            ind_postal: profile.ind_postal ?? undefined,
          }
        : {}),
    },
    other_party: {
      entity_type:
        (meta.other_entity_type as 'company' | 'individual' | 'other') ??
        'company',
      company_name: isClientRole
        ? contract.contractor_name ?? undefined
        : contract.client_name ?? undefined,
      head_office: isClientRole
        ? contract.contractor_address ?? undefined
        : contract.client_address ?? undefined,
      ho_city: isClientRole
        ? contract.contractor_city ?? undefined
        : contract.client_city ?? undefined,
      ho_postal: isClientRole
        ? contract.contractor_postal ?? undefined
        : contract.client_postal ?? undefined,
      email: isClientRole
        ? contract.contractor_email ?? undefined
        : contract.client_email ?? undefined,
      phone: isClientRole
        ? contract.contractor_phone ?? undefined
        : contract.client_phone ?? undefined,
      rbq: contract.contractor_rbq ?? undefined,
    },
    describe_work: {
      material_provider: meta.material_provider ?? 'contractor',
      project_description: contract.project_description ?? '',
    },
    when: {
      start_date: meta.start_date ?? '',
      end_kind: meta.end_date ? 'date' : 'duration',
      end_date: meta.end_date,
      duration_value: meta.duration_value,
      duration_unit: meta.duration_unit,
    },
    payment: {
      payment_method: safePaymentMethod,
      time_materials_description: meta.time_materials_description,
      invoice_frequency: meta.invoice_frequency,
      payment_due_days: safeDueDays,
      advance_payment: meta.advance_payment ?? false,
      advance_payment_amount: meta.advance_payment_amount,
      holdback: meta.holdback ?? false,
      holdback_pct: meta.holdback_pct,
    },
    escalation: {
      escalation: meta.escalation ?? false,
      escalation_pct: meta.escalation_pct,
    },
    late_pay: {
      late_interest: meta.late_interest ?? 1,
      recovery_penalty: meta.recovery_penalty ?? false,
    },
    warranty: {
      warranty_months: meta.warranty_months ?? 12,
    },
    insurance: {
      insurance_amount: meta.insurance_amount ?? 2000000,
      bond: meta.bond ?? false,
      bond_pct: meta.bond_pct,
    },
    acceptance: {
      inspection_period_days: meta.inspection_period_days ?? 15,
      suspension_request_adjustment_days:
        meta.suspension_request_adjustment_days ?? 30,
      suspension_terminate_days: meta.suspension_terminate_days ?? 60,
      suspension_resume_claim_days: meta.suspension_resume_claim_days ?? 15,
    },
    extra: {
      extra_clauses: meta.extra_clauses,
    },
  }

  return (
    <WizardShell
      formType={formType}
      locale={locale}
      user={profile ?? null}
      isPro={isProActive(subscription ?? null)}
      initialState={initialState}
    />
  )
}
