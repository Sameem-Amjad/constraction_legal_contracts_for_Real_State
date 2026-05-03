import Link from 'next/link'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import {
  FileText,
  ArrowRight,
  Home,
  HardHat,
  Building2,
  Wrench,
  Sparkles,
  ArrowLeftRight,
  CheckCircle2,
  Clock,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ContractStatusBadge } from '@/components/shared/ContractStatusBadge'
import { ProBadge } from '@/components/shared/ProBadge'
import { ManageBillingButton } from '@/components/marketing/ManageBillingButton'
import { createClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { isProActive } from '@/types/supabase'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { Locale } from '@/i18n'

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: localeParam } = await params
  const locale = localeParam as Locale
  setRequestLocale(locale)
  const t = await getTranslations('dashboard')
  const tc = await getTranslations('contracts')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const [{ data: profile }, { data: subscription }, { data: contracts }] =
    await Promise.all([
      adminSupabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single(),
      adminSupabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(),
      adminSupabase
        .from('contracts')
        .select(
          'id, contract_type, status, contract_price, created_at, metadata'
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5),
    ])

  const pro = isProActive(subscription ?? null)
  const cancelling = pro && subscription?.cancel_at_period_end
  const periodEnd = subscription?.current_period_end
    ? formatDate(subscription.current_period_end, locale)
    : null

  return (
    <main className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-brand-hero opacity-60"
      />
      <div className="container py-10 space-y-10">
        {/* Welcome header */}
        <div className="flex flex-wrap items-end justify-between gap-4 animate-fade-in-up-fast">
          <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">
            {t('welcome', { name: profile?.first_name ?? '' })}
          </h1>
          {pro ? <ProBadge /> : <Badge variant="secondary">{t('free')}</Badge>}
        </div>

        {/* Subscription banner */}
        <div
          className={`relative overflow-hidden rounded-2xl border p-6 md:p-7 animate-fade-in-up-fast ${
            pro
              ? cancelling
                ? 'border-brand-orange/40 bg-gradient-to-br from-orange-50/70 to-white'
                : 'border-brand-cobalt/30 bg-gradient-to-br from-blue-50/70 to-white'
              : 'border-slate-200 bg-gradient-to-br from-slate-50/80 to-white'
          }`}
          style={{ animationDelay: '60ms' }}
        >
          {!pro ? (
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-cobalt/10 blur-3xl"
            />
          ) : null}
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <h2 className="font-heading text-lg font-semibold">
                {pro
                  ? cancelling && periodEnd
                    ? t('proCanceling', { date: periodEnd })
                    : t('proActive', { date: periodEnd ?? '—' })
                  : t('upgradePrompt')}
              </h2>
              {pro && cancelling ? (
                <p className="text-sm text-muted-foreground">
                  {t('willEndNotice')}
                </p>
              ) : pro ? (
                <p className="text-sm text-muted-foreground">
                  {t('autoRenewNotice')}
                </p>
              ) : null}
            </div>
            {!pro ? (
              <Button
                asChild
                className="btn-shimmer bg-brand-cobalt hover:bg-brand-cobalt/90 shadow-glow"
              >
                <Link href={`/${locale}/pricing`}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t('upgradeCta')}
                </Link>
              </Button>
            ) : (
              <ManageBillingButton locale={locale} />
            )}
          </div>
        </div>

        {/* Contract type cards */}
        <div className="space-y-5">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-brand-cobalt font-semibold">
                {tc('chooseEyebrow')}
              </p>
              <h2 className="text-xl md:text-2xl font-heading font-bold tracking-tight">
                {tc('chooseTitle')}
              </h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* CC Card */}
            <Link
              href={`/${locale}/contracts/new/client-contractor`}
              className="group relative animate-fade-in-up-fast"
              style={{ animationDelay: '120ms' }}
            >
              <div className="relative h-full rounded-2xl bg-white border border-slate-200/80 shadow-soft overflow-hidden transition-all duration-300 hover:shadow-glow hover:-translate-y-1 hover:border-brand-cobalt/40">
                <div className="relative h-24 bg-gradient-to-br from-brand-cobalt via-blue-600 to-brand-blue overflow-hidden">
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-30 bg-brand-stripe"
                  />
                  <div className="absolute top-3 right-3 z-10">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/95 text-brand-cobalt text-[10px] font-semibold shadow-sm">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      {tc('ccCardTag')}
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 translate-y-1/2 flex items-center justify-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-white shadow-md grid place-items-center border border-slate-100 transition-transform duration-300 group-hover:-rotate-6">
                      <Home className="h-5 w-5 text-brand-cobalt" />
                    </div>
                    <div className="h-7 w-7 rounded-full bg-white shadow grid place-items-center border border-slate-100 transition-transform duration-300 group-hover:scale-110">
                      <ArrowLeftRight className="h-3 w-3 text-brand-cobalt" />
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-white shadow-md grid place-items-center border border-slate-100 transition-transform duration-300 group-hover:rotate-6">
                      <HardHat className="h-5 w-5 text-brand-cobalt" />
                    </div>
                  </div>
                </div>

                <div className="pt-9 px-5 pb-5 space-y-3">
                  <h3 className="font-heading font-bold text-base text-center">
                    {tc('ccCardTitle')}
                  </h3>
                  <p className="text-xs text-muted-foreground text-center -mt-2">
                    {tc('ccCardLead')}
                  </p>
                  <ul className="space-y-2 pt-1">
                    <li className="flex gap-2 text-xs">
                      <Home className="h-3.5 w-3.5 text-brand-cobalt flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">{tc('ccCardOwner')}</span>
                        <span className="text-muted-foreground"> · {tc('ccCardOwnerDesc')}</span>
                      </div>
                    </li>
                    <li className="flex gap-2 text-xs">
                      <HardHat className="h-3.5 w-3.5 text-brand-cobalt flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">
                          {tc('ccCardContractor')}
                        </span>
                        <span className="text-muted-foreground"> · {tc('ccCardContractorDesc')}</span>
                      </div>
                    </li>
                  </ul>
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {tc('chooseTimePill')}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-cobalt group-hover:gap-2.5 transition-all">
                      {tc('chooseCta')}
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
              style={{ animationDelay: '180ms' }}
            >
              <div className="relative h-full rounded-2xl bg-white border border-slate-200/80 shadow-soft overflow-hidden transition-all duration-300 hover:shadow-glow-orange hover:-translate-y-1 hover:border-brand-orange/40">
                <div className="relative h-24 bg-gradient-to-br from-brand-orange via-orange-500 to-amber-500 overflow-hidden">
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-25 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.15)_0_12px,transparent_12px_24px)]"
                  />
                  <div className="absolute top-3 right-3 z-10">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/95 text-brand-orange text-[10px] font-semibold shadow-sm">
                      <Wrench className="h-2.5 w-2.5" />
                      {tc('gcCardTag')}
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 translate-y-1/2 flex items-center justify-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-white shadow-md grid place-items-center border border-slate-100 transition-transform duration-300 group-hover:-rotate-6">
                      <Building2 className="h-5 w-5 text-brand-orange" />
                    </div>
                    <div className="h-7 w-7 rounded-full bg-white shadow grid place-items-center border border-slate-100 transition-transform duration-300 group-hover:scale-110">
                      <ArrowLeftRight className="h-3 w-3 text-brand-orange" />
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-white shadow-md grid place-items-center border border-slate-100 transition-transform duration-300 group-hover:rotate-6">
                      <Wrench className="h-5 w-5 text-brand-orange" />
                    </div>
                  </div>
                </div>

                <div className="pt-9 px-5 pb-5 space-y-3">
                  <h3 className="font-heading font-bold text-base text-center">
                    {tc('gcCardTitle')}
                  </h3>
                  <p className="text-xs text-muted-foreground text-center -mt-2">
                    {tc('gcCardLead')}
                  </p>
                  <ul className="space-y-2 pt-1">
                    <li className="flex gap-2 text-xs">
                      <Building2 className="h-3.5 w-3.5 text-brand-orange flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">{tc('gcCardGc')}</span>
                        <span className="text-muted-foreground"> · {tc('gcCardGcDesc')}</span>
                      </div>
                    </li>
                    <li className="flex gap-2 text-xs">
                      <Wrench className="h-3.5 w-3.5 text-brand-orange flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">{tc('gcCardSub')}</span>
                        <span className="text-muted-foreground"> · {tc('gcCardSubDesc')}</span>
                      </div>
                    </li>
                  </ul>
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {tc('chooseTimePill')}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange group-hover:gap-2.5 transition-all">
                      {tc('chooseCta')}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent contracts */}
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <h2 className="text-xl md:text-2xl font-heading font-bold tracking-tight">
              {t('recentContracts')}
            </h2>
            {(contracts?.length ?? 0) > 0 ? (
              <Link
                href={`/${locale}/contracts`}
                className="text-sm font-medium text-brand-cobalt hover:underline inline-flex items-center gap-1.5 group"
              >
                {tc('actions')}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ) : null}
          </div>
          {(contracts?.length ?? 0) === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-brand-cobalt/10 grid place-items-center">
                <FileText className="h-6 w-6 text-brand-cobalt" />
              </div>
              <p className="mt-3 text-muted-foreground">{t('noContracts')}</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {contracts!.map((c) => (
                <Card
                  key={c.id}
                  className="border border-slate-200/80 hover:border-brand-cobalt/30 hover:shadow-soft transition-all"
                >
                  <CardContent className="p-4 flex flex-wrap items-center gap-4">
                    <div
                      className={`h-10 w-10 rounded-lg grid place-items-center flex-shrink-0 ${
                        c.contract_type === 'client-contractor'
                          ? 'bg-brand-cobalt/10 text-brand-cobalt'
                          : 'bg-brand-orange/10 text-brand-orange'
                      }`}
                    >
                      {c.contract_type === 'client-contractor' ? (
                        <HardHat className="h-5 w-5" />
                      ) : (
                        <Building2 className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {c.contract_type === 'client-contractor'
                          ? tc('ccType')
                          : tc('gcType')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(c.created_at, locale)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">
                      {c.contract_price
                        ? formatCurrency(Number(c.contract_price), locale)
                        : '—'}
                    </span>
                    <ContractStatusBadge
                      status={c.status as 'draft' | 'generated' | 'paid' | 'signed' | 'completed'}
                      locale={locale}
                    />
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/${locale}/contracts`}>{tc('actions')}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
