import { setRequestLocale } from 'next-intl/server'

import { ProfileForm } from '@/components/profile/ProfileForm'
import { createClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'
import type { Locale } from '@/i18n'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: localeParam } = await params
  const locale = localeParam as Locale
  setRequestLocale(locale)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <main className="container max-w-3xl py-10">
      <ProfileForm locale={locale} profile={profile!} />
    </main>
  )
}
