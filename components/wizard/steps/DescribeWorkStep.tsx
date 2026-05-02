'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { StepShell } from '../StepShell'
import type {
  DescribeWorkStepInput,
  WizardState,
} from '@/lib/validations/wizard'

interface DescribeWorkStepProps {
  state: WizardState
  onNext: (data: DescribeWorkStepInput) => void
  onBack: () => void
}

export function DescribeWorkStep({
  state,
  onNext,
  onBack,
}: DescribeWorkStepProps) {
  const t = useTranslations('wizard.describeWork')
  const [data, setData] = useState<DescribeWorkStepInput>(state.describe_work)
  const [error, setError] = useState<string | null>(null)

  const role = state.role.role
  // The "who provides materials" copy changes per role to make it clearer
  // who's responsible.
  const materialOptions = (() => {
    switch (role) {
      case 'client':
        return [
          { value: 'client', label: t('options.clientProvides') },
          { value: 'contractor', label: t('options.contractorProvidesAll') },
          { value: 'shared', label: t('options.contractorLabourOnly') },
        ] as const
      case 'contractor':
        return [
          { value: 'client', label: t('options.clientProvidesYouLabour') },
          { value: 'contractor', label: t('options.youProvideAll') },
        ] as const
      case 'gc':
        return [
          { value: 'client', label: t('options.gcProvides') },
          { value: 'contractor', label: t('options.subProvidesAll') },
        ] as const
      case 'subcontractor':
      default:
        return [
          { value: 'client', label: t('options.gcProvidesYouLabour') },
          { value: 'contractor', label: t('options.youProvideAll') },
        ] as const
    }
  })()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (
      !data.project_description ||
      data.project_description.trim().length < 10
    ) {
      setError(t('errors.descriptionShort'))
      return
    }
    setError(null)
    onNext(data)
  }

  return (
    <StepShell
      title={t('title')}
      subtitle={t('subtitle')}
      onSubmit={handleSubmit}
      onBack={onBack}
    >
      <fieldset className="space-y-2">
        <Label>{t('materialProviderQ')}</Label>
        <RadioGroup
          value={data.material_provider}
          onValueChange={(v) =>
            setData((prev) => ({
              ...prev,
              material_provider: v as 'contractor' | 'client' | 'shared',
            }))
          }
          className="space-y-2"
        >
          {materialOptions.map((opt) => {
            const checked = data.material_provider === opt.value
            return (
              <Label
                key={opt.value}
                htmlFor={`mp-${opt.value}`}
                className={`flex items-start gap-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                  checked
                    ? 'border-brand-cobalt bg-brand-cobalt/5 shadow-sm'
                    : 'border-muted hover:border-brand-cobalt/40 hover:bg-muted/40'
                }`}
              >
                <RadioGroupItem
                  value={opt.value}
                  id={`mp-${opt.value}`}
                  className="mt-0.5"
                />
                <span className="flex-1 text-sm leading-relaxed">
                  {opt.label}
                </span>
              </Label>
            )
          })}
        </RadioGroup>
      </fieldset>

      <div className="space-y-2">
        <Label>{t('descriptionLabel')}</Label>
        <Textarea
          rows={6}
          value={data.project_description}
          onChange={(e) =>
            setData((prev) => ({
              ...prev,
              project_description: e.target.value,
            }))
          }
          placeholder={t('descriptionPlaceholder')}
        />
        <p className="text-xs text-muted-foreground">{t('descriptionHint')}</p>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    </StepShell>
  )
}
