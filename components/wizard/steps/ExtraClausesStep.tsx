'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { StepShell } from '../StepShell'
import type {
  ExtraClausesStepInput,
  WizardState,
} from '@/lib/validations/wizard'

interface ExtraClausesStepProps {
  state: WizardState
  onNext: (data: ExtraClausesStepInput) => void
  onBack: () => void
}

export function ExtraClausesStep({
  state,
  onNext,
  onBack,
}: ExtraClausesStepProps) {
  const t = useTranslations('wizard.extra')
  const [data, setData] = useState<ExtraClausesStepInput>(state.extra)

  return (
    <StepShell
      title={t('title')}
      subtitle={t('subtitle')}
      onSubmit={(e) => {
        e.preventDefault()
        onNext(data)
      }}
      onBack={onBack}
    >
      <div className="space-y-2">
        <Label>{t('label')}</Label>
        <Textarea
          rows={6}
          value={data.extra_clauses ?? ''}
          onChange={(e) => setData({ extra_clauses: e.target.value })}
          placeholder={t('placeholder')}
        />
      </div>
    </StepShell>
  )
}
