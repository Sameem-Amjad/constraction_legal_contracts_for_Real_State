import Link from 'next/link'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { FileText, Plus, HardHat, Building2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ContractStatusBadge } from '@/components/shared/ContractStatusBadge'
import { ContractRowActions } from '@/components/contracts/ContractRowActions'
import { AutoDownloadHandler } from '@/components/contracts/AutoDownloadHandler'
import { createClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { isNoDeleteUser } from '@/lib/no-delete'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { Locale } from '@/i18n'

export default async function ContractsListPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: localeParam } = await params
  const locale = localeParam as Locale
  setRequestLocale(locale)
  const t = await getTranslations('contracts')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: contracts } = await adminSupabase
    .from('contracts')
    .select(
      'id, contract_type, status, contract_price, created_at, metadata'
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <main className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-brand-hero opacity-50"
      />
      <div className="container py-10 space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4 animate-fade-in-up-fast">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-brand-cobalt font-semibold">
              {t('chooseEyebrow')}
            </p>
            <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">
              {t('title')}
            </h1>
          </div>
          <Button
            asChild
            className="btn-shimmer bg-brand-cobalt hover:bg-brand-cobalt/90 shadow-glow"
          >
            <Link href={`/${locale}/contracts/new`}>
              <Plus className="mr-2 h-4 w-4" />
              {t('newContract')}
            </Link>
          </Button>
        </div>

        <AutoDownloadHandler />

        {(contracts?.length ?? 0) === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-12 text-center animate-fade-in-up-fast">
            <div className="mx-auto h-14 w-14 rounded-full bg-brand-cobalt/10 grid place-items-center">
              <FileText className="h-7 w-7 text-brand-cobalt" />
            </div>
            <p className="mt-4 text-muted-foreground">{t('empty')}</p>
            <Button
              asChild
              className="mt-5 btn-shimmer bg-brand-cobalt hover:bg-brand-cobalt/90 shadow-glow"
            >
              <Link href={`/${locale}/contracts/new`}>
                <Plus className="mr-2 h-4 w-4" />
                {t('createCta')}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 animate-fade-in-up-fast">
            {contracts!.map((c, i) => (
              <Card
                key={c.id}
                className="border border-slate-200/80 hover:border-brand-cobalt/30 hover:shadow-soft transition-all animate-fade-in-up-fast"
                style={{ animationDelay: `${Math.min(i * 40, 240)}ms` }}
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
                        ? t('ccType')
                        : t('gcType')}
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
                  <ContractRowActions
                    locale={locale}
                    id={c.id}
                    status={c.status}
                    canDelete={!isNoDeleteUser(user)}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
