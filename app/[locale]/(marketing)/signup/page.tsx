import { setRequestLocale } from 'next-intl/server'

import { SignupForm } from '@/components/auth/SignupForm'
import type { Locale } from '@/i18n'

export default async function SignupPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: localeParam } = await params
  const locale = localeParam as Locale
  setRequestLocale(locale)
  return (
    <main className="container max-w-xl py-12">
      <SignupForm locale={locale} />
    </main>
  )
}
