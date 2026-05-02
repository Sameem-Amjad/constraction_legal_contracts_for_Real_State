import { redirect } from 'next/navigation'

import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'
import type { Locale } from '@/i18n'

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/login`)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar locale={locale} />
      <div className="flex-1">{children}</div>
      <Footer locale={locale} />
    </div>
  )
}
