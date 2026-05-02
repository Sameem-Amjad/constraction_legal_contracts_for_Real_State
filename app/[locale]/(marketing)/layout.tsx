import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import type { Locale } from '@/i18n'

export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar locale={locale} />
      <div className="flex-1">{children}</div>
      <Footer locale={locale} />
    </div>
  )
}
