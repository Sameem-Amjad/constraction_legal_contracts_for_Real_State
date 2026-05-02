'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2, Download, CreditCard, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TaxBreakdown } from '@/components/shared/TaxBreakdown'
import { formatCurrencyCAD } from '@/lib/tax'
import type { WizardState } from '@/lib/validations/wizard'
import type { Profile } from '@/types/supabase'

interface ReviewStepProps {
  state: WizardState
  onBack: () => void
  user: Profile | null
  isPro: boolean
}

export function ReviewStep({ state, onBack, user, isPro }: ReviewStepProps) {
  const t = useTranslations('wizard.review')
  const tc = useTranslations('common')
  const locale = state.language
  const [isLoading, setIsLoading] = useState(false)
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    if (!state.contract_id) {
      setError('Contract not yet saved. Please go back and complete a step.')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const genRes = await fetch('/api/contracts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract_id: state.contract_id,
          language: locale,
          contract_type: state.role.form_type,
        }),
      })
      const genData = await genRes.json()
      if (!genRes.ok) throw new Error(genData.error ?? tc('error'))

      if (genData.is_pro) {
        setSignedUrl(genData.signed_url)
        return
      }

      const checkoutRes = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'payment',
          contract_id: genData.contract_id,
          email:
            user?.email ??
            state.my_info.email ??
            state.other_party.email ??
            '',
          language: locale,
        }),
      })
      const checkoutData = await checkoutRes.json()
      if (!checkoutRes.ok) throw new Error(checkoutData.error ?? tc('error'))

      window.location.href = checkoutData.url
    } catch (err) {
      setError(err instanceof Error ? err.message : tc('error'))
    } finally {
      setIsLoading(false)
    }
  }

  if (signedUrl) {
    return (
      <div className="max-w-xl mx-auto space-y-6 text-center py-12 animate-fade-in-up">
        <div className="relative inline-flex">
          <span className="absolute inset-0 rounded-full bg-brand-green/30 animate-ping" />
          <Sparkles className="relative h-14 w-14 text-brand-green" />
        </div>
        <h1 className="font-heading text-3xl font-bold">{t('contractReady')}</h1>
        <Button
          asChild
          size="lg"
          className="bg-brand-cobalt hover:bg-brand-cobalt/90 shadow-glow"
        >
          <a href={signedUrl} target="_blank" rel="noreferrer">
            <Download className="mr-2 h-4 w-4" />
            {t('downloadButton')}
          </a>
        </Button>
      </div>
    )
  }

  const summaryRows = [
    {
      label: locale === 'en' ? 'Contract Type' : 'Type de contrat',
      value:
        state.role.form_type === 'client-contractor'
          ? locale === 'en'
            ? 'Client / Contractor'
            : 'Client / Entrepreneur'
          : locale === 'en'
            ? 'General Contractor / Subcontractor'
            : 'Entrepreneur général / Sous-traitant',
    },
    {
      label: locale === 'en' ? 'Project Name' : 'Nom du projet',
      value: state.basics.project_name || '—',
    },
    {
      label: locale === 'en' ? 'Project Site' : 'Lieu des travaux',
      value: `${state.basics.project_site}, ${state.basics.project_city}`,
    },
    {
      label: locale === 'en' ? 'Contract Price' : 'Prix du contrat',
      value: formatCurrencyCAD(state.basics.contract_price, locale),
    },
    {
      label: locale === 'en' ? 'Language' : 'Langue',
      value: locale === 'en' ? 'English' : 'Français',
    },
  ]

  return (
    <div className="space-y-6 max-w-xl mx-auto animate-fade-in-up-fast">
      <header className="space-y-1.5">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          {t('title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {locale === 'fr'
            ? 'Vérifiez les détails ci-dessous avant de générer le contrat.'
            : 'Review the details below before generating the contract.'}
        </p>
      </header>

      <div className="rounded-xl border-2 bg-gradient-to-br from-white to-blue-50/30 overflow-hidden">
        {summaryRows.map((row, idx) => (
          <div
            key={row.label}
            className={`flex items-center justify-between gap-4 p-4 text-sm ${
              idx > 0 ? 'border-t' : ''
            }`}
          >
            <span className="text-muted-foreground">{row.label}</span>
            <span className="font-semibold font-heading text-right">
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <Alert
        className={
          isPro
            ? 'border-brand-orange/40 bg-orange-50/40'
            : 'border-brand-cobalt/30 bg-blue-50/30'
        }
      >
        <AlertDescription className="text-sm">
          {isPro ? t('proNotice') : t('freeNotice')}
        </AlertDescription>
      </Alert>

      {!isPro ? <TaxBreakdown subtotal={99} locale={locale} /> : null}

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex items-center justify-between gap-2 pt-4 border-t">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={isLoading}
          className="text-muted-foreground hover:text-foreground"
        >
          {tc('back')}
        </Button>
        <Button
          onClick={handleGenerate}
          disabled={isLoading}
          size="lg"
          className={
            isPro
              ? 'bg-brand-orange hover:bg-brand-orange/90 shadow-glow-orange btn-shimmer'
              : 'bg-brand-cobalt hover:bg-brand-cobalt/90 shadow-glow btn-shimmer'
          }
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {tc('loading')}
            </>
          ) : isPro ? (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              {t('proGenerateButton')}
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              {t('generateButton')}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
