'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { StepShell } from '../StepShell'
import type { LatePayStepInput, WizardState } from '@/lib/validations/wizard'

interface LatePayStepProps {
  state: WizardState
  onNext: (data: LatePayStepInput) => void
  onBack: () => void
}

export function LatePayStep({ state, onNext, onBack }: LatePayStepProps) {
  const t = useTranslations('wizard.latePay')
  const [data, setData] = useState<LatePayStepInput>(state.late_pay)

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
        <Label>{t('interestRate')}</Label>
        <Input
          type="number"
          min={0}
          max={50}
          step="0.1"
          value={data.late_interest}
          onChange={(e) =>
            setData((p) => ({ ...p, late_interest: Number(e.target.value) }))
          }
          className="w-32"
        />
        <p className="text-xs text-muted-foreground">{t('interestHint')}</p>
      </div>

      <div
        className={`rounded-lg border-2 p-4 flex items-center justify-between gap-4 transition-colors ${
          data.recovery_penalty
            ? 'border-brand-cobalt/40 bg-brand-cobalt/5'
            : 'border-muted'
        }`}
      >
        <Label className="flex-1 font-medium">{t('recoveryPenalty')}</Label>
        <Switch
          checked={data.recovery_penalty}
          onCheckedChange={(v) =>
            setData((p) => ({ ...p, recovery_penalty: v }))
          }
        />
      </div>
    </StepShell>
  )
}
