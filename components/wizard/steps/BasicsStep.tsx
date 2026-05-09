'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { StepShell } from '../StepShell'
import type { BasicsStepInput, WizardState } from '@/lib/validations/wizard'

interface BasicsStepProps {
  state: WizardState
  onNext: (data: BasicsStepInput) => void
  /** True when on the Contractor → Client flow; shows the property-owner type sub-question */
  showOwnerTypeQuestion?: boolean
  /** True when on the GC → Subcontractor flow; shows the immovable owner fields */
  showOwnerFields?: boolean
}

export function BasicsStep({
  state,
  onNext,
  showOwnerTypeQuestion,
  showOwnerFields,
}: BasicsStepProps) {
  const t = useTranslations('wizard.basics')
  const [data, setData] = useState<BasicsStepInput>(state.basics)
  const [errors, setErrors] = useState<
    Partial<Record<keyof BasicsStepInput, string>>
  >({})

  const set = <K extends keyof BasicsStepInput>(
    key: K,
    value: BasicsStepInput[K]
  ) => setData((prev) => ({ ...prev, [key]: value }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const next: typeof errors = {}
    if (!data.project_name) next.project_name = t('errors.required')
    if (!data.project_site) next.project_site = t('errors.required')
    if (!data.project_city) next.project_city = t('errors.required')
    if (!data.project_postal) next.project_postal = t('errors.required')
    if (!(data.contract_price > 0))
      next.contract_price = t('errors.positiveAmount')
    if (!data.sign_date) next.sign_date = t('errors.required')
    setErrors(next)
    if (Object.keys(next).length === 0) onNext(data)
  }

  return (
    <StepShell
      title={t('title')}
      subtitle={t('subtitle')}
      onSubmit={handleSubmit}
    >
      <Field
        label={t('projectName')}
        value={data.project_name}
        error={errors.project_name}
        onChange={(v) => set('project_name', v)}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          className="md:col-span-2"
          label={t('siteAddress')}
          value={data.project_site}
          error={errors.project_site}
          onChange={(v) => set('project_site', v)}
        />
        <Field
          label={t('siteCity')}
          value={data.project_city}
          error={errors.project_city}
          onChange={(v) => set('project_city', v)}
        />
        <Field
          label={t('sitePostal')}
          value={data.project_postal}
          error={errors.project_postal}
          onChange={(v) => set('project_postal', v)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{t('contractPrice')}</Label>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={data.contract_price || ''}
            onChange={(e) => set('contract_price', Number(e.target.value))}
            placeholder="0.00"
          />
          {errors.contract_price ? (
            <p className="text-xs text-destructive">{errors.contract_price}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label>{t('signDate')}</Label>
          <Input
            type="date"
            value={data.sign_date}
            onChange={(e) => set('sign_date', e.target.value)}
          />
          {errors.sign_date ? (
            <p className="text-xs text-destructive">{errors.sign_date}</p>
          ) : null}
        </div>
      </div>

      {showOwnerFields ? (
        <fieldset className="space-y-3 rounded-lg border-2 border-brand-cobalt/20 bg-blue-50/30 p-4">
          <Label className="text-sm font-semibold">{t('ownerInfo')}</Label>
          <p className="text-xs text-muted-foreground">{t('ownerInfoHint')}</p>
          <Field
            label={t('ownerName')}
            value={data.owner_name ?? ''}
            onChange={(v) => set('owner_name', v)}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              className="md:col-span-2"
              label={t('ownerAddress')}
              value={data.owner_address ?? ''}
              onChange={(v) => set('owner_address', v)}
            />
            <Field
              label={t('ownerCity')}
              value={data.owner_city ?? ''}
              onChange={(v) => set('owner_city', v)}
            />
            <Field
              label={t('ownerPostal')}
              value={data.owner_postal ?? ''}
              onChange={(v) => set('owner_postal', v)}
            />
          </div>
        </fieldset>
      ) : null}

      {showOwnerTypeQuestion ? (
        <fieldset className="space-y-3 rounded-lg border-2 border-brand-orange/20 bg-orange-50/30 p-4">
          <Label className="text-sm font-semibold">{t('ownerType')}</Label>
          <RadioGroup
            value={data.other_entity_type ?? 'company'}
            onValueChange={(v) =>
              set(
                'other_entity_type',
                v as 'company' | 'individual' | 'other'
              )
            }
            className="grid sm:grid-cols-3 gap-2"
          >
            {(['company', 'individual', 'other'] as const).map((opt) => {
              const checked = (data.other_entity_type ?? 'company') === opt
              return (
                <Label
                  key={opt}
                  htmlFor={`owner-${opt}`}
                  className={`flex items-center gap-2 rounded-md border-2 p-3 cursor-pointer text-sm transition-all ${
                    checked
                      ? 'border-brand-orange bg-white shadow-sm'
                      : 'border-muted hover:border-brand-orange/40 bg-white/60'
                  }`}
                >
                  <RadioGroupItem value={opt} id={`owner-${opt}`} />
                  <span>{t(`entityType.${opt}`)}</span>
                </Label>
              )
            })}
          </RadioGroup>
        </fieldset>
      ) : null}
    </StepShell>
  )
}

function Field({
  label,
  value,
  onChange,
  error,
  className,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  className?: string
}) {
  return (
    <div className={`space-y-2 ${className ?? ''}`}>
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
