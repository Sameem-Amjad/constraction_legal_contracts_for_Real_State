'use client'

import { useTranslations } from 'next-intl'

import type { PartyInfoInput, WizardState } from '@/lib/validations/wizard'
import { PartyForm } from './PartyForm'

interface MyInfoStepProps {
  state: WizardState
  userId: string | null
  onNext: (data: PartyInfoInput) => void
  onBack: () => void
}

export function MyInfoStep({ state, userId, onNext, onBack }: MyInfoStepProps) {
  const t = useTranslations('wizard.myInfo')
  const role = state.role.role
  const subtitleKey =
    role === 'client'
      ? 'subtitleClient'
      : role === 'contractor'
        ? 'subtitleContractor'
        : role === 'gc'
          ? 'subtitleGC'
          : 'subtitleSubcontractor'
  return (
    <PartyForm
      title={t('title')}
      subtitle={t(subtitleKey)}
      initialValue={state.my_info}
      onSubmit={onNext}
      onBack={onBack}
      userId={userId}
    />
  )
}
