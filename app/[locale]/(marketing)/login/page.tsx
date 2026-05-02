import { setRequestLocale } from 'next-intl/server'

import { LoginForm } from '@/components/auth/LoginForm'
import type { Locale } from '@/i18n'

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  return (
    <main className="container max-w-md py-16">
      <LoginForm locale={locale} />
    </main>
  )
}
