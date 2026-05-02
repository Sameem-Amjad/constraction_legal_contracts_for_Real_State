'use client'

import { Check, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'

interface WizardSidebarProps {
  steps: string[]
  currentStep: number
  isSaving?: boolean
}

export function WizardSidebar({
  steps,
  currentStep,
  isSaving,
}: WizardSidebarProps) {
  const t = useTranslations('wizard')
  // Progress = current step + 1 (counting completed steps including current)
  const total = steps.length
  const completed = Math.max(0, Math.min(currentStep, total))
  const percent = total > 0 ? Math.round((completed / Math.max(1, total - 1)) * 100) : 0

  return (
    <aside className="hidden md:flex w-72 flex-col border-r bg-gradient-to-b from-brand-smoke/40 to-white p-6">
      {/* Brand mini-header */}
      <div className="mb-5 flex items-center justify-between">
        <span className="font-heading font-bold text-sm tracking-tight">
          <span className="text-brand-cobalt">Constr</span>Action
        </span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {t('steps.review').replace('& Generate', '').replace('et génération', '').trim()}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">
            Step {Math.min(currentStep + 1, total)} / {total}
          </span>
          <span className="font-semibold text-brand-cobalt">{percent}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-cobalt to-brand-blue transition-all duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Steps list */}
      <ol className="space-y-1.5 flex-1">
        {steps.map((label, idx) => {
          const isCompleted = idx < currentStep
          const isActive = idx === currentStep
          return (
            <li key={`${label}-${idx}`}>
              <div
                className={cn(
                  'flex items-center gap-3 rounded-md px-2.5 py-2 transition-all duration-200',
                  isActive
                    ? 'bg-brand-cobalt/10 ring-1 ring-brand-cobalt/30'
                    : isCompleted
                      ? 'opacity-80 hover:opacity-100'
                      : 'opacity-50'
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold shrink-0 transition-all',
                    isCompleted
                      ? 'bg-brand-green text-white'
                      : isActive
                        ? 'bg-brand-cobalt text-white shadow-sm'
                        : 'border border-muted-foreground/30 text-muted-foreground'
                  )}
                >
                  {isCompleted ? <Check className="h-3 w-3" /> : idx + 1}
                </span>
                <span
                  className={cn(
                    'text-sm leading-tight',
                    isActive
                      ? 'font-semibold text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {label}
                </span>
              </div>
            </li>
          )
        })}
      </ol>

      {/* Save indicator */}
      <div className="mt-4 pt-4 border-t text-xs">
        {isSaving ? (
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            {t('saving')}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-brand-green">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
            {t('saved')}
          </span>
        )}
      </div>
    </aside>
  )
}
