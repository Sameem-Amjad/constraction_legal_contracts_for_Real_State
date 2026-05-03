import Link from 'next/link'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { XCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { Locale } from '@/i18n'

export default async function PaymentCancelledPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ contract_id?: string }>
}) {
  const { locale: localeParam } = await params
  const locale = localeParam as Locale
  const { contract_id } = await searchParams
  setRequestLocale(locale)
  const t = await getTranslations('payment')

  return (
    <main className="container max-w-xl py-16 text-center space-y-6">
      <XCircle className="mx-auto h-16 w-16 text-muted-foreground" />
      <h1 className="text-3xl font-semibold">{t('cancelledTitle')}</h1>
      <p className="text-muted-foreground">{t('cancelledBody')}</p>
      <Button asChild>
        <Link
          href={
            contract_id
              ? `/${locale}/contracts/${contract_id}/edit`
              : `/${locale}/contracts/new`
          }
        >
          {t('retryCta')}
        </Link>
      </Button>
    </main>
  )
}
