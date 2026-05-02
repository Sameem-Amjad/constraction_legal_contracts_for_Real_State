import { redirect } from 'next/navigation'
import type { Locale } from '@/i18n'

export default async function SubscribeCheckoutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  // Stripe checkout is initiated client-side from the pricing page.
  redirect(`/${locale}/pricing`)
}
