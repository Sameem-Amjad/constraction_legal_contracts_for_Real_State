import { setRequestLocale } from 'next-intl/server'

import { WizardShell } from '@/components/wizard/WizardShell'
import { createClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { isProActive } from '@/types/supabase'
import type { Locale } from '@/i18n'

export default async function NewCCContractPage({
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

  const [{ data: profile }, { data: subscription }] = await Promise.all([
    adminSupabase.from('profiles').select('*').eq('id', user.id).single(),
    adminSupabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  return (
    <WizardShell
      formType="client-contractor"
      locale={locale}
      user={profile ?? null}
      isPro={isProActive(subscription ?? null)}
    />
  )
}
