import Link from 'next/link'
import { redirect } from 'next/navigation'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { stripe } from '@/lib/stripe/server'
import type { Locale } from '@/i18n'

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ session_id?: string }>
}

export default async function SubscriptionSuccessPage({
  params,
  searchParams,
}: PageProps) {
  const { locale: localeParam } = await params
  const locale = localeParam as Locale
  const { session_id } = await searchParams
  setRequestLocale(locale)
  const t = await getTranslations('payment')

  if (!session_id) redirect(`/${locale}/pricing`)

  const session = await stripe.checkout.sessions.retrieve(session_id)
  if (session.mode !== 'subscription') redirect(`/${locale}/pricing`)

  return (
    <main className="container max-w-xl py-16 text-center space-y-6">
      <Sparkles className="mx-auto h-16 w-16 text-amber-500" />
      <h1 className="text-3xl font-semibold">{t('subscriptionSuccessTitle')}</h1>
      <p className="text-muted-foreground">{t('subscriptionSuccessBody')}</p>
      <Button asChild>
        <Link href={`/${locale}/dashboard`}>Go to Dashboard</Link>
      </Button>
    </main>
  )
}
