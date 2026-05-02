'use client'

import { useTranslations } from 'next-intl'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { StepShell } from '../StepShell'
import type {
  RoleStepInput,
  WizardState,
} from '@/lib/validations/wizard'

interface RoleStepProps {
  state: WizardState
  onNext: (data: RoleStepInput) => void
}

export function RoleStep({ state, onNext }: RoleStepProps) {
  const t = useTranslations('wizard.role')
  const isCC = state.role.form_type === 'client-contractor'

  function pick(role: RoleStepInput['role']) {
    onNext({ role, form_type: state.role.form_type })
  }

  return (
    <StepShell
      title={t('title')}
      onSubmit={(e) => {
        e.preventDefault()
        pick(state.role.role)
      }}
    >
      <RadioGroup
        value={state.role.role}
        onValueChange={(v) => pick(v as RoleStepInput['role'])}
        className="grid sm:grid-cols-2 gap-3"
      >
        {(isCC
          ? ([
              { value: 'client', label: t('iAmClient'), desc: t('iAmClient') },
              {
                value: 'contractor',
                label: t('iAmContractor'),
                desc: t('iAmContractor'),
              },
            ] as const)
          : ([
              { value: 'gc', label: t('iAmGC'), desc: t('iAmGC') },
              {
                value: 'subcontractor',
                label: t('iAmSubcontractor'),
                desc: t('iAmSubcontractor'),
              },
            ] as const)
        ).map((opt) => {
          const checked = state.role.role === opt.value
          return (
            <Label
              key={opt.value}
              htmlFor={`role-${opt.value}`}
              className={`flex items-center gap-3 rounded-lg border-2 p-5 cursor-pointer transition-all ${
                checked
                  ? 'border-brand-cobalt bg-brand-cobalt/5 shadow-sm'
                  : 'border-muted hover:border-brand-cobalt/40 hover:bg-muted/40'
              }`}
            >
              <RadioGroupItem value={opt.value} id={`role-${opt.value}`} />
              <span className="flex-1 font-medium">{opt.label}</span>
            </Label>
          )
        })}
      </RadioGroup>
    </StepShell>
  )
}
