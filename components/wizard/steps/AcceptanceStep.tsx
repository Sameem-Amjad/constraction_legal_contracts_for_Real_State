'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StepShell } from '../StepShell'
import type {
  AcceptanceStepInput,
  WizardState,
} from '@/lib/validations/wizard'

interface AcceptanceStepProps {
  state: WizardState
  onNext: (data: AcceptanceStepInput) => void
  onBack: () => void
}

export function AcceptanceStep({
  state,
  onNext,
  onBack,
}: AcceptanceStepProps) {
  const t = useTranslations('wizard.acceptance')
  const [data, setData] = useState<AcceptanceStepInput>(state.acceptance)

  const set = <K extends keyof AcceptanceStepInput>(
    key: K,
    value: AcceptanceStepInput[K]
  ) => setData((prev) => ({ ...prev, [key]: value }))

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
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {t('acceptanceSection')}
        </h2>
        <div className="space-y-2">
          <Label>{t('inspectionPeriod')}</Label>
          <Input
            type="number"
            min={0}
            value={data.inspection_period_days}
            onChange={(e) =>
              set('inspection_period_days', Number(e.target.value))
            }
            className="w-32"
          />
          <p className="text-xs text-muted-foreground">{t('inspectionHint')}</p>
        </div>
      </section>

      <section className="space-y-3 pt-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {t('suspensionSection')}
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label className="text-sm font-normal">
              {t('suspensionAdjustmentDays')}
            </Label>
            <Input
              type="number"
              min={0}
              value={data.suspension_request_adjustment_days}
              onChange={(e) =>
                set(
                  'suspension_request_adjustment_days',
                  Number(e.target.value)
                )
              }
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-normal">
              {t('suspensionTerminateDays')}
            </Label>
            <Input
              type="number"
              min={0}
              value={data.suspension_terminate_days}
              onChange={(e) =>
                set('suspension_terminate_days', Number(e.target.value))
              }
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-normal">
              {t('suspensionResumeClaimDays')}
            </Label>
            <Input
              type="number"
              min={0}
              value={data.suspension_resume_claim_days}
              onChange={(e) =>
                set('suspension_resume_claim_days', Number(e.target.value))
              }
            />
          </div>
        </div>
      </section>
    </StepShell>
  )
}
