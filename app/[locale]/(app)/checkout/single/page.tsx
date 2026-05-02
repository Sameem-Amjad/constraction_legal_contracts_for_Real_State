import { redirect } from 'next/navigation'
import type { Locale } from '@/i18n'

export default async function SingleCheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ contract_id?: string }>
}) {
  const { locale } = await params
  const { contract_id } = await searchParams
  // Redirect users to the contract editor; the editor's Review step
  // initiates Stripe Checkout. Going directly to Stripe without a
  // generated PDF would skip the generate step.
  if (contract_id) {
    redirect(`/${locale}/contracts/${contract_id}/edit`)
  }
  redirect(`/${locale}/contracts`)
}
