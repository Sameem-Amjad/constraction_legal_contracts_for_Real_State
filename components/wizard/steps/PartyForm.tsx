'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { LogoUpload } from '@/components/shared/LogoUpload'
import { StepShell } from '../StepShell'
import type { PartyInfoInput } from '@/lib/validations/wizard'

interface PartyFormProps {
  initialValue: PartyInfoInput
  onSubmit: (data: PartyInfoInput) => void
  onBack?: () => void
  userId?: string | null
  title: string
  subtitle?: string
}

export function PartyForm({
  initialValue,
  onSubmit,
  onBack,
  userId,
  title,
  subtitle,
}: PartyFormProps) {
  const t = useTranslations('auth')
  const tw = useTranslations('wizard.party')
  const [data, setData] = useState<PartyInfoInput>(() => ({
    ...initialValue,
    entity_type: initialValue.entity_type ?? 'company',
  }))

  const set = <K extends keyof PartyInfoInput>(
    key: K,
    value: PartyInfoInput[K]
  ) => setData((prev) => ({ ...prev, [key]: value }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(data)
  }

  const isCompanyOrOther =
    data.entity_type === 'company' || data.entity_type === 'other'

  return (
    <StepShell
      title={title}
      subtitle={subtitle}
      onSubmit={handleSubmit}
      onBack={onBack}
    >
      <fieldset className="space-y-3">
        <Label className="text-sm font-semibold">{t('entityType')}</Label>
        <RadioGroup
          value={data.entity_type}
          onValueChange={(v) =>
            set('entity_type', v as PartyInfoInput['entity_type'])
          }
          className="grid sm:grid-cols-3 gap-2"
        >
          {(['company', 'individual', 'other'] as const).map((opt) => {
            const checked = data.entity_type === opt
            return (
              <Label
                key={opt}
                htmlFor={`ent-${opt}`}
                className={`flex items-center gap-2 rounded-md border-2 p-3 cursor-pointer text-sm transition-all ${
                  checked
                    ? 'border-brand-cobalt bg-brand-cobalt/5 shadow-sm'
                    : 'border-muted hover:border-brand-cobalt/40'
                }`}
              >
                <RadioGroupItem value={opt} id={`ent-${opt}`} />
                <span>{tw(`entityType.${opt}`)}</span>
              </Label>
            )
          })}
        </RadioGroup>
      </fieldset>

      {isCompanyOrOther ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label={t('companyName')}
            value={data.company_name ?? ''}
            onChange={(v) => set('company_name', v)}
          />
          {data.entity_type === 'company' || data.entity_type === 'other' ? (
            <div className="space-y-2">
              <Label>{t('incorporationRegime')}</Label>
              <Select
                value={data.incorporation_regime ?? 'other_regime'}
                onValueChange={(v) => {
                  if (v === 'other_regime') {
                    set('incorporation_regime', undefined)
                  } else {
                    set('incorporation_regime', v as 'quebec_inc' | 'canada_inc')
                    set('other_incorporation_regime', undefined)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quebec_inc">{t('quebecInc')}</SelectItem>
                  <SelectItem value="canada_inc">{t('canadaInc')}</SelectItem>
                  <SelectItem value="other_regime">{tw('otherRegime')}</SelectItem>
                </SelectContent>
              </Select>
              {!data.incorporation_regime ? (
                <Input
                  placeholder={tw('otherRegimePlaceholder')}
                  value={data.other_incorporation_regime ?? ''}
                  onChange={(e) => set('other_incorporation_regime', e.target.value)}
                />
              ) : null}
            </div>
          ) : null}
          <Field
            label={t('rbq')}
            value={data.rbq ?? ''}
            onChange={(v) => set('rbq', v)}
          />
          <Field
            label={t('repName')}
            value={data.rep_name ?? ''}
            onChange={(v) => set('rep_name', v)}
          />
          <Field
            label={t('repTitle')}
            value={data.rep_title ?? ''}
            onChange={(v) => set('rep_title', v)}
          />
          <Field
            className="md:col-span-2"
            label={t('headOffice')}
            value={data.head_office ?? ''}
            onChange={(v) => set('head_office', v)}
          />
          <Field
            label={t('city')}
            value={data.ho_city ?? ''}
            onChange={(v) => set('ho_city', v)}
          />
          <Field
            label={t('postalCode')}
            value={data.ho_postal ?? ''}
            onChange={(v) => set('ho_postal', v)}
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            className="md:col-span-2"
            label={t('fullName')}
            value={data.full_name ?? ''}
            onChange={(v) => set('full_name', v)}
          />
          <Field
            className="md:col-span-2"
            label={t('address')}
            value={data.address ?? ''}
            onChange={(v) => set('address', v)}
          />
          <Field
            label={t('city')}
            value={data.ind_city ?? ''}
            onChange={(v) => set('ind_city', v)}
          />
          <Field
            label={t('postalCode')}
            value={data.ind_postal ?? ''}
            onChange={(v) => set('ind_postal', v)}
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label={t('emailLabel')}
          type="email"
          value={data.email ?? ''}
          onChange={(v) => set('email', v)}
        />
        <Field
          label={t('phoneLabel')}
          value={data.phone ?? ''}
          onChange={(v) => set('phone', v)}
        />
      </div>

      {userId ? (
        <div className="space-y-2">
          <Label>{t('logoUpload')}</Label>
          <LogoUpload
            userId={userId}
            currentUrl={data.logo_url}
            onUpload={(url) => set('logo_url', url)}
            onRemove={() => set('logo_url', '')}
            label={t('logoUpload')}
            hint={t('logoUploadHint')}
          />
        </div>
      ) : null}
    </StepShell>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  className,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  className?: string
}) {
  return (
    <div className={`space-y-2 ${className ?? ''}`}>
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
