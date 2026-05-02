'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { StepShell } from '../StepShell'
import type {
  InsuranceStepInput,
  WizardState,
} from '@/lib/validations/wizard'

interface InsuranceStepProps {
  state: WizardState
  onNext: (data: InsuranceStepInput) => void
  onBack: () => void
}

export function InsuranceStep({ state, onNext, onBack }: InsuranceStepProps) {
  const t = useTranslations('wizard.insurance')
  const [data, setData] = useState<InsuranceStepInput>(state.insurance)

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
        <Label>{t('insuranceAmount')}</Label>
        <Input
          type="number"
          min={0}
          step="1000"
          value={data.insurance_amount}
          onChange={(e) =>
            setData((p) => ({ ...p, insurance_amount: Number(e.target.value) }))
          }
        />
        <p className="text-xs text-muted-foreground">{t('amountHint')}</p>
      </div>

      <div
        className={`rounded-lg border-2 p-4 space-y-3 transition-colors ${
          data.bond
            ? 'border-brand-cobalt/40 bg-brand-cobalt/5'
            : 'border-muted'
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <Label className="flex-1 font-medium">{t('bondToggle')}</Label>
          <Switch
            checked={data.bond}
            onCheckedChange={(v) => setData((p) => ({ ...p, bond: v }))}
          />
        </div>
        {data.bond ? (
          <div className="space-y-2 pt-2 border-t border-brand-cobalt/20">
            <Label className="text-sm font-normal">{t('bondPct')}</Label>
            <Input
              type="number"
              min={0}
              max={100}
              step="1"
              value={data.bond_pct ?? 50}
              onChange={(e) =>
                setData((p) => ({ ...p, bond_pct: Number(e.target.value) }))
              }
              className="w-32"
            />
          </div>
        ) : null}
      </div>
    </StepShell>
  )
}
