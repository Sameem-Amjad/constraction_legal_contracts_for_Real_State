import { setRequestLocale } from 'next-intl/server'

import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'
import type { Locale } from '@/i18n'

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: localeParam } = await params
  const locale = localeParam as Locale
  setRequestLocale(locale)
  return (
    <main className="container max-w-md py-16">
      <ResetPasswordForm locale={locale} />
    </main>
  )
}
