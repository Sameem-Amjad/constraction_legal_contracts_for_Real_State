import { setRequestLocale } from 'next-intl/server'

import { SignupForm } from '@/components/auth/SignupForm'
import type { Locale } from '@/i18n'

export default async function SignupPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  return (
    <main className="container max-w-xl py-12">
      <SignupForm locale={locale} />
    </main>
  )
}
