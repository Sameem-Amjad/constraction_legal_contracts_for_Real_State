'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StepShell } from '../StepShell'
import type {
  WarrantyStepInput,
  WizardState,
} from '@/lib/validations/wizard'

interface WarrantyStepProps {
  state: WizardState
  onNext: (data: WarrantyStepInput) => void
  onBack: () => void
}

export function WarrantyStep({ state, onNext, onBack }: WarrantyStepProps) {
  const t = useTranslations('wizard.warranty')
  const [data, setData] = useState<WarrantyStepInput>(state.warranty)

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
        <Label>{t('months')}</Label>
        <Input
          type="number"
          min={1}
          value={data.warranty_months}
          onChange={(e) =>
            setData({ warranty_months: Number(e.target.value) })
          }
          className="w-32"
        />
        <p className="text-xs text-muted-foreground">{t('hint')}</p>
      </div>
    </StepShell>
  )
}
