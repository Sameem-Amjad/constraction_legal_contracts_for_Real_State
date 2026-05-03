import { redirect } from 'next/navigation'
import type { Locale } from '@/i18n'

export default async function SubscribeCheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: localeParam } = await params
  const locale = localeParam as Locale
  // Stripe checkout is initiated client-side from the pricing page.
  redirect(`/${locale}/pricing`)
}
