'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'

import { WizardSidebar } from './WizardSidebar'
import { RoleStep } from './steps/RoleStep'
import { BasicsStep } from './steps/BasicsStep'
import { MyInfoStep } from './steps/MyInfoStep'
import { OtherPartyStep } from './steps/OtherPartyStep'
import { DescribeWorkStep } from './steps/DescribeWorkStep'
import { WhenStep } from './steps/WhenStep'
import { PaymentStep } from './steps/PaymentStep'
import { EscalationStep } from './steps/EscalationStep'
import { LatePayStep } from './steps/LatePayStep'
import { WarrantyStep } from './steps/WarrantyStep'
import { InsuranceStep } from './steps/InsuranceStep'
import { AcceptanceStep } from './steps/AcceptanceStep'
import { ExtraClausesStep } from './steps/ExtraClausesStep'
import { ReviewStep } from './steps/ReviewStep'
import { createClient } from '@/lib/supabase/client'
import type {
  PartyInfoInput,
  WizardState,
} from '@/lib/validations/wizard'
import type { Profile } from '@/types/supabase'

type FormType = 'client-contractor' | 'gc-subcontractor'
type Role = 'client' | 'contractor' | 'gc' | 'subcontractor'

interface WizardShellProps {
  formType: FormType
  initialState?: Partial<WizardState>
  locale: 'en' | 'fr'
  user: Profile | null
  isPro: boolean
}

// Step keys used to drive both the sidebar list and the renderer below.
type StepKey =
  | 'role'
  | 'basics'
  | 'my_info'
  | 'other_party'
  | 'describe_work'
  | 'when'
  | 'payment'
  | 'escalation'
  | 'late_pay'
  | 'warranty'
  | 'insurance'
  | 'acceptance'
  | 'extra'
  | 'review'

// "Contractor working for client" skips Other Party Details per the v2 spec.
function stepsForRole(role: Role): StepKey[] {
  const common: StepKey[] = [
    'role',
    'basics',
    'my_info',
    'other_party',
    'describe_work',
    'when',
    'payment',
    'escalation',
    'late_pay',
    'warranty',
    'insurance',
    'acceptance',
    'extra',
    'review',
  ]
  if (role === 'contractor') {
    return common.filter((k) => k !== 'other_party')
  }
  return common
}

export function WizardShell({
  formType,
  initialState,
  locale,
  user,
  isPro,
}: WizardShellProps) {
  const t = useTranslations('wizard.steps')
  const supabase = createClient()
  const [isSaving, setIsSaving] = useState(false)
  const [state, setState] = useState<WizardState>(() =>
    buildInitialState(formType, locale, user, initialState)
  )

  useEffect(() => {
    setState((prev) => ({ ...prev, language: locale }))
  }, [locale])

  const stepKeys = useMemo(() => stepsForRole(state.role.role), [state.role.role])
  const currentStep = state.step
  const currentKey = stepKeys[currentStep] ?? 'role'

  const saveDraft = useCallback(
    async (next: WizardState) => {
      if (!user) return
      setIsSaving(true)
      try {
        const row = buildContractRow(next, formType, user.id)
        if (next.contract_id) {
          await supabase
            .from('contracts')
            .update({ ...row, status: 'draft' })
            .eq('id', next.contract_id)
        } else {
          const { data } = await supabase
            .from('contracts')
            .insert({ ...row, status: 'draft' })
            .select('id')
            .single()
          if (data) {
            setState((prev) => ({ ...prev, contract_id: data.id }))
          }
        }
      } catch (err) {
        console.error('[Wizard] Draft save failed:', err)
      } finally {
        setIsSaving(false)
      }
    },
    [user, formType, supabase]
  )

  const goToIndex = useCallback(
    async (newIdx: number, patch?: Partial<WizardState>) => {
      const next: WizardState = { ...state, ...patch, step: newIdx }
      setState(next)
      await saveDraft(next)
    },
    [state, saveDraft]
  )

  const goNext = useCallback(
    (patch?: Partial<WizardState>) =>
      goToIndex(Math.min(stepKeys.length - 1, currentStep + 1), patch),
    [currentStep, stepKeys.length, goToIndex]
  )
  const goBack = useCallback(
    () => goToIndex(Math.max(0, currentStep - 1)),
    [currentStep, goToIndex]
  )

  const showOwnerType = state.role.role === 'contractor'
  const showOwnerFields = state.role.form_type === 'gc-subcontractor'

  const node = (() => {
    switch (currentKey) {
      case 'role':
        return (
          <RoleStep
            state={state}
            onNext={(role) => goNext({ role })}
          />
        )
      case 'basics':
        return (
          <BasicsStep
            state={state}
            showOwnerTypeQuestion={showOwnerType}
            showOwnerFields={showOwnerFields}
            onNext={(basics) => goNext({ basics })}
          />
        )
      case 'my_info':
        return (
          <MyInfoStep
            state={state}
            userId={user?.id ?? null}
            onNext={(my_info) => goNext({ my_info })}
            onBack={goBack}
          />
        )
      case 'other_party':
        return (
          <OtherPartyStep
            state={state}
            onNext={(other_party) => goNext({ other_party })}
            onBack={goBack}
          />
        )
      case 'describe_work':
        return (
          <DescribeWorkStep
            state={state}
            onNext={(describe_work) => goNext({ describe_work })}
            onBack={goBack}
          />
        )
      case 'when':
        return (
          <WhenStep
            state={state}
            onNext={(when) => goNext({ when })}
            onBack={goBack}
          />
        )
      case 'payment':
        return (
          <PaymentStep
            state={state}
            onNext={(payment) => goNext({ payment })}
            onBack={goBack}
          />
        )
      case 'escalation':
        return (
          <EscalationStep
            state={state}
            onNext={(escalation) => goNext({ escalation })}
            onBack={goBack}
          />
        )
      case 'late_pay':
        return (
          <LatePayStep
            state={state}
            onNext={(late_pay) => goNext({ late_pay })}
            onBack={goBack}
          />
        )
      case 'warranty':
        return (
          <WarrantyStep
            state={state}
            onNext={(warranty) => goNext({ warranty })}
            onBack={goBack}
          />
        )
      case 'insurance':
        return (
          <InsuranceStep
            state={state}
            onNext={(insurance) => goNext({ insurance })}
            onBack={goBack}
          />
        )
      case 'acceptance':
        return (
          <AcceptanceStep
            state={state}
            onNext={(acceptance) => goNext({ acceptance })}
            onBack={goBack}
          />
        )
      case 'extra':
        return (
          <ExtraClausesStep
            state={state}
            onNext={(extra) => goNext({ extra })}
            onBack={goBack}
          />
        )
      case 'review':
        return (
          <ReviewStep
            state={state}
            onBack={goBack}
            user={user}
            isPro={isPro}
          />
        )
      default:
        return null
    }
  })()

  // Sidebar shows steps minus the role step (which is more of a gateway).
  const sidebarKeys = stepKeys.filter(
    (k): k is Exclude<StepKey, 'role'> => k !== 'role'
  )
  const sidebarLabels = sidebarKeys.map((k) => t(k))
  const sidebarIndex = Math.max(
    0,
    currentKey === 'role'
      ? -1
      : sidebarKeys.indexOf(currentKey as Exclude<StepKey, 'role'>)
  )

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <WizardSidebar
        steps={sidebarLabels}
        currentStep={sidebarIndex}
        isSaving={isSaving}
      />
      <main className="flex-1 p-6 md:p-12 lg:p-16">{node}</main>
    </div>
  )
}

// ============================================================================
// Initial state builder (defaults consistent with PDF spec hints)
// ============================================================================

function buildInitialState(
  formType: FormType,
  locale: 'en' | 'fr',
  user: Profile | null,
  initial?: Partial<WizardState>
): WizardState {
  const defaultRole: Role = formType === 'client-contractor' ? 'contractor' : 'gc'
  return {
    step: 0,
    language: locale,
    role: {
      role: defaultRole,
      form_type: formType,
    },
    basics: {
      project_name: '',
      project_site: '',
      project_city: '',
      project_postal: '',
      contract_price: 0,
      sign_date: '',
    },
    my_info: prefillFromProfile(user),
    other_party: { entity_type: 'company' },
    describe_work: {
      material_provider: 'contractor',
      project_description: '',
    },
    when: {
      start_date: '',
      end_kind: 'date',
    },
    payment: {
      payment_method: 'lump_sum',
      payment_due_days: 5,
      advance_payment: false,
      holdback: false,
    },
    escalation: { escalation: false },
    late_pay: { late_interest: 1, recovery_penalty: false },
    warranty: { warranty_months: 12 },
    insurance: { insurance_amount: 2000000, bond: false },
    acceptance: {
      inspection_period_days: 15,
      suspension_request_adjustment_days: 30,
      suspension_terminate_days: 60,
      suspension_resume_claim_days: 15,
    },
    extra: { extra_clauses: '' },
    ...initial,
  }
}

function prefillFromProfile(profile: Profile | null): PartyInfoInput {
  if (!profile) return { entity_type: 'company' }
  const entityType: PartyInfoInput['entity_type'] =
    profile.entity_type === 'individual' ? 'individual' : 'company'
  const regime =
    profile.incorporation_regime === 'quebec_inc' ||
    profile.incorporation_regime === 'canada_inc'
      ? profile.incorporation_regime
      : undefined
  return {
    entity_type: entityType,
    company_name: profile.company_name ?? undefined,
    incorporation_regime: regime,
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
    email: profile.email ?? undefined,
    phone: profile.phone ?? undefined,
    logo_url: profile.logo_url ?? undefined,
  }
}

// ============================================================================
// buildContractRow — flatten the WizardState into a contracts row for upsert
// ============================================================================

function buildContractRow(
  state: WizardState,
  formType: FormType,
  userId: string
) {
  // The "client" columns hold the property owner / general contractor (i.e.
  // whoever is hiring), and the "contractor" columns hold the worker side.
  const isClientRole =
    state.role.role === 'client' || state.role.role === 'gc'
  const myParty = isClientRole ? 'client' : 'contractor'
  const otherParty = isClientRole ? 'contractor' : 'client'

  function partyName(info: PartyInfoInput): string {
    if (info.entity_type === 'individual') return info.full_name ?? ''
    return info.company_name ?? info.full_name ?? ''
  }
  function partyAddress(info: PartyInfoInput) {
    if (info.entity_type === 'individual') {
      return {
        address: info.address ?? '',
        city: info.ind_city ?? '',
        postal: info.ind_postal ?? '',
      }
    }
    return {
      address: info.head_office ?? info.address ?? '',
      city: info.ho_city ?? info.ind_city ?? '',
      postal: info.ho_postal ?? info.ind_postal ?? '',
    }
  }

  const myAddr = partyAddress(state.my_info)
  const otherAddr = partyAddress(state.other_party)

  return {
    user_id: userId,
    contract_type: formType,
    [`${myParty}_name`]: partyName(state.my_info),
    [`${myParty}_address`]: myAddr.address,
    [`${myParty}_city`]: myAddr.city,
    [`${myParty}_postal`]: myAddr.postal,
    [`${myParty}_email`]: state.my_info.email,
    [`${myParty}_phone`]: state.my_info.phone,
    [`${otherParty}_name`]: partyName(state.other_party),
    [`${otherParty}_address`]: otherAddr.address,
    [`${otherParty}_city`]: otherAddr.city,
    [`${otherParty}_postal`]: otherAddr.postal,
    [`${otherParty}_email`]: state.other_party.email,
    [`${otherParty}_phone`]: state.other_party.phone,
    contractor_rbq:
      myParty === 'contractor' ? state.my_info.rbq : state.other_party.rbq,
    project_site: state.basics.project_site,
    project_city: state.basics.project_city,
    project_postal: state.basics.project_postal,
    project_description: state.describe_work.project_description,
    contract_price: state.basics.contract_price,
    metadata: {
      project_name: state.basics.project_name,
      language: state.language,
      role: state.role.role,
      form_type: formType,
      logo_url: state.my_info.logo_url,
      my_entity_type: state.my_info.entity_type,
      other_entity_type:
        state.basics.other_entity_type ?? state.other_party.entity_type,
      // Owner info (GC-sub only)
      owner_name: state.basics.owner_name,
      owner_address: state.basics.owner_address,
      owner_city: state.basics.owner_city,
      owner_postal: state.basics.owner_postal,
      // Schedule
      start_date: state.when.start_date,
      end_date: state.when.end_date,
      sign_date: state.basics.sign_date,
      duration_value: state.when.duration_value,
      duration_unit: state.when.duration_unit,
      // Materials
      material_provider: state.describe_work.material_provider,
      // Payment
      payment_method: state.payment.payment_method,
      time_materials_description: state.payment.time_materials_description,
      invoice_frequency: state.payment.invoice_frequency,
      milestones: state.payment.milestones,
      payment_due_days: state.payment.payment_due_days,
      advance_payment: state.payment.advance_payment,
      advance_payment_amount: state.payment.advance_payment_amount,
      advance_payment_type: state.payment.advance_payment_type,
      holdback: state.payment.holdback,
      holdback_pct: state.payment.holdback_pct,
      // Escalation
      escalation: state.escalation.escalation,
      escalation_pct: state.escalation.escalation_pct,
      // Late pay
      late_interest: state.late_pay.late_interest,
      recovery_penalty: state.late_pay.recovery_penalty,
      // Warranty + Insurance + Bond
      warranty_months: state.warranty.warranty_months,
      insurance_amount: state.insurance.insurance_amount,
      bond: state.insurance.bond,
      bond_pct: state.insurance.bond_pct,
      // Acceptance + Suspension
      inspection_period_days: state.acceptance.inspection_period_days,
      suspension_request_adjustment_days:
        state.acceptance.suspension_request_adjustment_days,
      suspension_terminate_days: state.acceptance.suspension_terminate_days,
      suspension_resume_claim_days:
        state.acceptance.suspension_resume_claim_days,
      // Misc
      extra_clauses: state.extra.extra_clauses,
    },
  }
}
