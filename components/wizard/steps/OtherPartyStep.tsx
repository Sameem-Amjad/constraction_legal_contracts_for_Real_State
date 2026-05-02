'use client'

import { useTranslations } from 'next-intl'

import type { PartyInfoInput, WizardState } from '@/lib/validations/wizard'
import { PartyForm } from './PartyForm'

interface OtherPartyStepProps {
  state: WizardState
  onNext: (data: PartyInfoInput) => void
  onBack: () => void
}

export function OtherPartyStep({
  state,
  onNext,
  onBack,
}: OtherPartyStepProps) {
  const t = useTranslations('wizard.otherParty')
  const role = state.role.role

  // Title varies by who the "other party" is in this flow.
  const titleKey =
    role === 'client'
      ? 'titleContractor'
      : role === 'gc'
        ? 'titleSubcontractor'
        : role === 'subcontractor'
          ? 'titleGC'
          : 'titleClient'

  return (
    <PartyForm
      title={t(titleKey)}
      subtitle={t('subtitle')}
      initialValue={state.other_party}
      onSubmit={onNext}
      onBack={onBack}
    />
  )
}
