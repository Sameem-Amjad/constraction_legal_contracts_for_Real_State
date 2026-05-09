'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StepShell } from '../StepShell'
import type { MilestoneInput, PaymentStepInput, WizardState } from '@/lib/validations/wizard'

interface PaymentStepProps {
  state: WizardState
  onNext: (data: PaymentStepInput) => void
  onBack: () => void
}

const PAYMENT_METHODS = [
  'lump_sum',
  'single_payment_completion',
  'progress_payments',
  'milestone_payments',
  'time_and_materials',
] as const

const DUE_DAYS = [0, 5, 15, 30, 45, 60] as const

export function PaymentStep({ state, onNext, onBack }: PaymentStepProps) {
  const t = useTranslations('wizard.payment')
  const [data, setData] = useState<PaymentStepInput>(state.payment)

  const set = <K extends keyof PaymentStepInput>(
    key: K,
    value: PaymentStepInput[K]
  ) => setData((prev) => ({ ...prev, [key]: value }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onNext(data)
  }

  const showInvoiceFrequency =
    data.payment_method === 'progress_payments' ||
    data.payment_method === 'time_and_materials'
  const showTimeMaterialsDescription =
    data.payment_method === 'time_and_materials'
  const showMilestones = data.payment_method === 'milestone_payments'

  function addMilestone() {
    const current = data.milestones ?? []
    set('milestones', [...current, { description: '', amount: 0 }])
  }
  function removeMilestone(idx: number) {
    const current = data.milestones ?? []
    set('milestones', current.filter((_, i) => i !== idx))
  }
  function updateMilestone(idx: number, patch: Partial<MilestoneInput>) {
    const current = data.milestones ?? []
    set('milestones', current.map((m, i) => (i === idx ? { ...m, ...patch } : m)))
  }

  return (
    <StepShell
      title={t('title')}
      subtitle={t('subtitle')}
      onSubmit={handleSubmit}
      onBack={onBack}
    >
      <fieldset className="space-y-3">
        <Label className="text-base font-semibold">{t('methodQ')}</Label>
        <RadioGroup
          value={data.payment_method}
          onValueChange={(v) =>
            set('payment_method', v as PaymentStepInput['payment_method'])
          }
          className="space-y-2"
        >
          {PAYMENT_METHODS.map((m) => {
            const checked = data.payment_method === m
            return (
              <Label
                key={m}
                htmlFor={`pm-${m}`}
                className={`flex items-start gap-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                  checked
                    ? 'border-brand-cobalt bg-brand-cobalt/5 shadow-sm'
                    : 'border-muted hover:border-brand-cobalt/40 hover:bg-muted/40'
                }`}
              >
                <RadioGroupItem value={m} id={`pm-${m}`} className="mt-0.5" />
                <span className="flex-1 text-sm leading-relaxed">
                  {t(`methods.${m}`)}
                </span>
              </Label>
            )
          })}
        </RadioGroup>
      </fieldset>

      {showMilestones ? (
        <div className="space-y-3">
          <Label className="text-base font-semibold">{t('milestonesLabel')}</Label>
          {(data.milestones ?? []).map((m, idx) => (
            <div key={idx} className="rounded-lg border-2 border-muted p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{t('milestone')} {idx + 1}</span>
                <button
                  type="button"
                  onClick={() => removeMilestone(idx)}
                  className="text-xs text-destructive hover:underline"
                >
                  {t('remove')}
                </button>
              </div>
              <Input
                placeholder={t('milestoneDescription')}
                value={m.description}
                onChange={(e) => updateMilestone(idx, { description: e.target.value })}
              />
              <Input
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                value={m.amount || ''}
                onChange={(e) => updateMilestone(idx, { amount: Number(e.target.value) })}
              />
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addMilestone}>
            + {t('addMilestone')}
          </Button>
        </div>
      ) : null}

      {showTimeMaterialsDescription ? (
        <div className="space-y-2">
          <Label>{t('timeMaterialsDescription')}</Label>
          <Textarea
            rows={3}
            value={data.time_materials_description ?? ''}
            onChange={(e) =>
              set('time_materials_description', e.target.value)
            }
            placeholder={t('timeMaterialsPlaceholder')}
          />
        </div>
      ) : null}

      {showInvoiceFrequency ? (
        <div className="space-y-2">
          <Label>{t('invoiceFrequency')}</Label>
          <Select
            value={data.invoice_frequency ?? ''}
            onValueChange={(v) =>
              set(
                'invoice_frequency',
                v as PaymentStepInput['invoice_frequency']
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">{t('frequencies.weekly')}</SelectItem>
              <SelectItem value="bi_weekly">
                {t('frequencies.bi_weekly')}
              </SelectItem>
              <SelectItem value="monthly">{t('frequencies.monthly')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label>{t('dueDays')}</Label>
        <Select
          value={String(data.payment_due_days ?? 5)}
          onValueChange={(v) =>
            set(
              'payment_due_days',
              Number(v) as PaymentStepInput['payment_due_days']
            )
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DUE_DAYS.map((d) => (
              <SelectItem key={d} value={String(d)}>
                {d === 0 ? t('dueDaysOptions.sameDay') : `${d} ${t('dueDaysOptions.days')}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <fieldset
        className={`rounded-lg border-2 p-4 space-y-3 transition-colors ${
          data.advance_payment
            ? 'border-brand-cobalt/40 bg-brand-cobalt/5'
            : 'border-muted'
        }`}
      >
        <ToggleRow
          label={t('advancePayment')}
          checked={data.advance_payment}
          onCheckedChange={(v) => set('advance_payment', v)}
        />
        {data.advance_payment ? (
          <div className="space-y-2 pt-2 border-t border-brand-cobalt/20">
            <Label className="text-sm font-normal">
              {t('advancePaymentAmount')}
            </Label>
            <div className="flex gap-2">
              <div className="flex rounded-md border-2 border-brand-cobalt/30 overflow-hidden">
                {(['$', '%'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => set('advance_payment_type', type)}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      (data.advance_payment_type ?? '$') === type
                        ? 'bg-brand-cobalt text-white'
                        : 'bg-white text-muted-foreground hover:bg-muted/40'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <Input
                type="number"
                min={0}
                step={data.advance_payment_type === '%' ? '0.1' : '0.01'}
                max={data.advance_payment_type === '%' ? 100 : undefined}
                value={data.advance_payment_amount ?? ''}
                onChange={(e) =>
                  set(
                    'advance_payment_amount',
                    Number(e.target.value) || undefined
                  )
                }
                placeholder={data.advance_payment_type === '%' ? '10' : '0.00'}
                className="flex-1"
              />
            </div>
          </div>
        ) : null}
      </fieldset>

      <fieldset
        className={`rounded-lg border-2 p-4 space-y-3 transition-colors ${
          data.holdback
            ? 'border-brand-cobalt/40 bg-brand-cobalt/5'
            : 'border-muted'
        }`}
      >
        <ToggleRow
          label={t('holdback')}
          checked={data.holdback}
          onCheckedChange={(v) => set('holdback', v)}
        />
        {data.holdback ? (
          <div className="space-y-2 pt-2 border-t border-brand-cobalt/20">
            <Label className="text-sm font-normal">
              {t('holdbackPercentage')}
            </Label>
            <Input
              type="number"
              min={0}
              max={100}
              step="0.5"
              value={data.holdback_pct ?? 10}
              onChange={(e) => set('holdback_pct', Number(e.target.value))}
              className="w-32"
            />
          </div>
        ) : null}
      </fieldset>
    </StepShell>
  )
}

function ToggleRow({
  label,
  checked,
  onCheckedChange,
}: {
  label: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Label className="flex-1 font-medium">{label}</Label>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}
