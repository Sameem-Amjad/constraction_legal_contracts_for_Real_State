import { redirect } from 'next/navigation'
import Link from 'next/link'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { CheckCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { TaxBreakdown } from '@/components/shared/TaxBreakdown'
import { DownloadContractButton } from '@/components/contracts/DownloadContractButton'
import { stripe } from '@/lib/stripe/server'
import { reconcilePaymentSession } from '@/lib/stripe/webhooks'
import type { Locale } from '@/i18n'

interface PageProps {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ session_id?: string; contract_id?: string }>
}

export default async function PaymentSuccessPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params
  const { session_id, contract_id } = await searchParams
  setRequestLocale(locale)
  const t = await getTranslations('payment')

  if (!session_id) {
    redirect(`/${locale}/contracts`)
  }

  const session = await stripe.checkout.sessions.retrieve(session_id)
  if (session.payment_status !== 'paid') {
    redirect(`/${locale}/contracts`)
  }

  // Reconcile the contract status, send receipt + contract emails if the
  // webhook hasn't processed this session yet. Idempotent — no-op if already paid.
  if (session.mode === 'payment') {
    try {
      await reconcilePaymentSession(session)
    } catch (err) {
      console.error('[payment-success] reconcile failed:', err)
    }
  }

  const email = session.customer_email ?? ''
  const subtotal = (session.amount_subtotal ?? 0) / 100

  return (
    <main className="container max-w-xl py-16 text-center space-y-6">
      <CheckCircle className="mx-auto h-16 w-16 text-emerald-600" />
      <h1 className="text-3xl font-semibold">{t('successTitle')}</h1>
      <p className="text-muted-foreground">
        {t('successBody', { email })}
      </p>

      <TaxBreakdown subtotal={subtotal || 99} locale={locale} />

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 items-center">
        {contract_id ? (
          <DownloadContractButton contractId={contract_id} autoStart />
        ) : null}
        <Button asChild>
          <Link href={`/${locale}/contracts/new`}>
            {t('newContractCta')}
          </Link>
        </Button>
      </div>
    </main>
  )
}
