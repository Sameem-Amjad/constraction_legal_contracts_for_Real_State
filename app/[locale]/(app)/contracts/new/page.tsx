import Link from 'next/link'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import {
  ArrowRight,
  Home,
  HardHat,
  Building2,
  Wrench,
  Sparkles,
  Clock,
  CheckCircle2,
  Info,
  ArrowLeftRight,
} from 'lucide-react'

import type { Locale } from '@/i18n'

export default async function ChooseContractTypePage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('contracts')

  return (
    <main className="relative overflow-hidden">
      {/* Decorative background blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-brand-hero"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand-cobalt/20 blur-3xl -z-10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-brand-orange/15 blur-3xl -z-10"
      />

      <div className="container py-14 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 space-y-4 animate-fade-in-up-fast">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cobalt/10 text-brand-cobalt text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            {t('chooseEyebrow')}
          </span>
          <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight">
            <span className="text-gradient-brand">{t('chooseTitle')}</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            {t('chooseSubtitle')}
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {/* CC Card */}
          <Link
            href={`/${locale}/contracts/new/client-contractor`}
            className="group relative animate-fade-in-up-fast"
          >
            <div className="relative h-full rounded-2xl bg-white border border-slate-200/80 shadow-soft overflow-hidden transition-all duration-300 hover:shadow-glow hover:-translate-y-1 hover:border-brand-cobalt/40">
              {/* Gradient header band */}
              <div className="relative h-32 bg-gradient-to-br from-brand-cobalt via-blue-600 to-brand-blue overflow-hidden">
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-30 bg-brand-stripe"
                />
                <div className="absolute top-4 right-4 z-10">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 text-brand-cobalt text-[11px] font-semibold shadow-sm">
                    <CheckCircle2 className="h-3 w-3" />
                    {t('ccCardTag')}
                  </span>
                </div>
                {/* Party visual */}
                <div className="absolute inset-x-0 bottom-0 translate-y-1/2 flex items-center justify-center gap-4 px-8">
                  <div className="h-16 w-16 rounded-2xl bg-white shadow-lg grid place-items-center border border-slate-100 transition-transform duration-300 group-hover:-rotate-6">
                    <Home className="h-7 w-7 text-brand-cobalt" />
                  </div>
                  <div className="h-9 w-9 rounded-full bg-white shadow-md grid place-items-center border border-slate-100 transition-transform duration-300 group-hover:scale-110">
                    <ArrowLeftRight className="h-4 w-4 text-brand-cobalt" />
                  </div>
                  <div className="h-16 w-16 rounded-2xl bg-white shadow-lg grid place-items-center border border-slate-100 transition-transform duration-300 group-hover:rotate-6">
                    <HardHat className="h-7 w-7 text-brand-cobalt" />
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="pt-12 px-6 pb-6 md:px-8 md:pb-8 space-y-5">
                <div className="space-y-1.5 text-center">
                  <h2 className="text-xl md:text-2xl font-heading font-bold tracking-tight">
                    {t('ccCardTitle')}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t('ccCardLead')}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100 transition-colors group-hover:bg-brand-cobalt/5 group-hover:border-brand-cobalt/20">
                    <div className="h-9 w-9 flex-shrink-0 rounded-lg bg-white border border-slate-200 grid place-items-center">
                      <Home className="h-4 w-4 text-brand-cobalt" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm">
                        {t('ccCardOwner')}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {t('ccCardOwnerDesc')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100 transition-colors group-hover:bg-brand-cobalt/5 group-hover:border-brand-cobalt/20">
                    <div className="h-9 w-9 flex-shrink-0 rounded-lg bg-white border border-slate-200 grid place-items-center">
                      <HardHat className="h-4 w-4 text-brand-cobalt" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm">
                        {t('ccCardContractor')}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {t('ccCardContractorDesc')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 gap-3">
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {t('chooseTimePill')}
                  </span>
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-cobalt text-white text-sm font-semibold shadow-sm transition-all duration-300 group-hover:gap-3 group-hover:shadow-glow">
                    {t('chooseCta')}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* GC Card */}
          <Link
            href={`/${locale}/contracts/new/gc-subcontractor`}
            className="group relative animate-fade-in-up-fast"
            style={{ animationDelay: '80ms' }}
          >
            <div className="relative h-full rounded-2xl bg-white border border-slate-200/80 shadow-soft overflow-hidden transition-all duration-300 hover:shadow-glow-orange hover:-translate-y-1 hover:border-brand-orange/40">
              {/* Gradient header band */}
              <div className="relative h-32 bg-gradient-to-br from-brand-orange via-orange-500 to-amber-500 overflow-hidden">
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-25 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.15)_0_12px,transparent_12px_24px)]"
                />
                <div className="absolute top-4 right-4 z-10">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 text-brand-orange text-[11px] font-semibold shadow-sm">
                    <Wrench className="h-3 w-3" />
                    {t('gcCardTag')}
                  </span>
                </div>
                {/* Party visual */}
                <div className="absolute inset-x-0 bottom-0 translate-y-1/2 flex items-center justify-center gap-4 px-8">
                  <div className="h-16 w-16 rounded-2xl bg-white shadow-lg grid place-items-center border border-slate-100 transition-transform duration-300 group-hover:-rotate-6">
                    <Building2 className="h-7 w-7 text-brand-orange" />
                  </div>
                  <div className="h-9 w-9 rounded-full bg-white shadow-md grid place-items-center border border-slate-100 transition-transform duration-300 group-hover:scale-110">
                    <ArrowLeftRight className="h-4 w-4 text-brand-orange" />
                  </div>
                  <div className="h-16 w-16 rounded-2xl bg-white shadow-lg grid place-items-center border border-slate-100 transition-transform duration-300 group-hover:rotate-6">
                    <Wrench className="h-7 w-7 text-brand-orange" />
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="pt-12 px-6 pb-6 md:px-8 md:pb-8 space-y-5">
                <div className="space-y-1.5 text-center">
                  <h2 className="text-xl md:text-2xl font-heading font-bold tracking-tight">
                    {t('gcCardTitle')}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t('gcCardLead')}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100 transition-colors group-hover:bg-brand-orange/5 group-hover:border-brand-orange/20">
                    <div className="h-9 w-9 flex-shrink-0 rounded-lg bg-white border border-slate-200 grid place-items-center">
                      <Building2 className="h-4 w-4 text-brand-orange" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm">{t('gcCardGc')}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {t('gcCardGcDesc')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100 transition-colors group-hover:bg-brand-orange/5 group-hover:border-brand-orange/20">
                    <div className="h-9 w-9 flex-shrink-0 rounded-lg bg-white border border-slate-200 grid place-items-center">
                      <Wrench className="h-4 w-4 text-brand-orange" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm">{t('gcCardSub')}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {t('gcCardSubDesc')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 gap-3">
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {t('chooseTimePill')}
                  </span>
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-orange text-white text-sm font-semibold shadow-sm transition-all duration-300 group-hover:gap-3 group-hover:shadow-glow-orange">
                    {t('chooseCta')}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Helper card */}
        <div
          className="mt-10 rounded-2xl border border-brand-cobalt/15 bg-gradient-to-br from-blue-50/60 to-white p-5 md:p-6 flex gap-4 animate-fade-in-up-fast"
          style={{ animationDelay: '160ms' }}
        >
          <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-brand-cobalt/10 text-brand-cobalt grid place-items-center">
            <Info className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-sm">{t('chooseHelpTitle')}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('chooseHelpDesc')}
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
