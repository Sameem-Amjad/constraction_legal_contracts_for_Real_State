'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { StepShell } from '../StepShell'
import type {
  EscalationStepInput,
  WizardState,
} from '@/lib/validations/wizard'

interface EscalationStepProps {
  state: WizardState
  onNext: (data: EscalationStepInput) => void
  onBack: () => void
}

export function EscalationStep({
  state,
  onNext,
  onBack,
}: EscalationStepProps) {
  const t = useTranslations('wizard.escalation')
  const [data, setData] = useState<EscalationStepInput>(state.escalation)

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
      <div
        className={`rounded-lg border-2 p-4 space-y-3 transition-colors ${
          data.escalation
            ? 'border-brand-cobalt/40 bg-brand-cobalt/5'
            : 'border-muted'
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <Label className="flex-1 font-medium">{t('toggleLabel')}</Label>
          <Switch
            checked={data.escalation}
            onCheckedChange={(v) => setData((p) => ({ ...p, escalation: v }))}
          />
        </div>
        {data.escalation ? (
          <div className="space-y-2 pt-2 border-t border-brand-cobalt/20">
            <Label className="text-sm font-normal">{t('threshold')}</Label>
            <Input
              type="number"
              min={0}
              max={100}
              step="0.5"
              value={data.escalation_pct ?? 10}
              onChange={(e) =>
                setData((p) => ({
                  ...p,
                  escalation_pct: Number(e.target.value),
                }))
              }
              className="w-32"
            />
          </div>
        ) : null}
      </div>
    </StepShell>
  )
}
