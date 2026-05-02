'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StepShell } from '../StepShell'
import type { WhenStepInput, WizardState } from '@/lib/validations/wizard'

interface WhenStepProps {
  state: WizardState
  onNext: (data: WhenStepInput) => void
  onBack: () => void
}

export function WhenStep({ state, onNext, onBack }: WhenStepProps) {
  const t = useTranslations('wizard.when')
  const [data, setData] = useState<WhenStepInput>(() => ({
    ...state.when,
    end_kind: state.when.end_kind ?? 'date',
  }))
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof WhenStepInput>(
    key: K,
    value: WhenStepInput[K]
  ) => setData((prev) => ({ ...prev, [key]: value }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!data.start_date) {
      setError(t('errors.startRequired'))
      return
    }
    if (data.end_kind === 'date' && !data.end_date) {
      setError(t('errors.endDateRequired'))
      return
    }
    if (
      data.end_kind === 'duration' &&
      (!data.duration_value || !data.duration_unit)
    ) {
      setError(t('errors.durationRequired'))
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
      <div className="space-y-2">
        <Label>{t('startDate')}</Label>
        <Input
          type="date"
          value={data.start_date}
          onChange={(e) => set('start_date', e.target.value)}
        />
      </div>

      <fieldset className="space-y-3">
        <Label className="text-sm font-semibold">{t('endKindQ')}</Label>
        <RadioGroup
          value={data.end_kind}
          onValueChange={(v) => set('end_kind', v as 'date' | 'duration')}
          className="grid sm:grid-cols-2 gap-3"
        >
          {(['date', 'duration'] as const).map((kind) => {
            const checked = data.end_kind === kind
            return (
              <Label
                key={kind}
                htmlFor={`end-${kind}`}
                className={`flex items-center gap-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                  checked
                    ? 'border-brand-cobalt bg-brand-cobalt/5 shadow-sm'
                    : 'border-muted hover:border-brand-cobalt/40'
                }`}
              >
                <RadioGroupItem value={kind} id={`end-${kind}`} />
                <span className="text-sm font-medium">
                  {kind === 'date' ? t('specificDate') : t('duration')}
                </span>
              </Label>
            )
          })}
        </RadioGroup>
      </fieldset>

      {data.end_kind === 'date' ? (
        <div className="space-y-2">
          <Label>{t('endDate')}</Label>
          <Input
            type="date"
            value={data.end_date ?? ''}
            onChange={(e) => set('end_date', e.target.value)}
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>{t('durationValue')}</Label>
            <Input
              type="number"
              min={1}
              value={data.duration_value ?? ''}
              onChange={(e) =>
                set('duration_value', Number(e.target.value) || undefined)
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{t('durationUnit')}</Label>
            <Select
              value={data.duration_unit ?? ''}
              onValueChange={(v) =>
                set('duration_unit', v as 'days' | 'weeks' | 'months')
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="days">{t('units.days')}</SelectItem>
                <SelectItem value="weeks">{t('units.weeks')}</SelectItem>
                <SelectItem value="months">{t('units.months')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </StepShell>
  )
}
