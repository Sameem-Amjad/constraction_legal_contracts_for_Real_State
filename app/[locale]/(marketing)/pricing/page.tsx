import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Check } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TaxBreakdown } from '@/components/shared/TaxBreakdown'
import { PricingCta } from '@/components/marketing/PricingCta'
import type { Locale } from '@/i18n'
import { createClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('marketing.plans')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let subscriptionStatus:
    | { status: string; plan_type: string; cancel_at_period_end: boolean; current_period_end: string | null }
    | null = null
  if (user) {
    const { data } = await adminSupabase
      .from('subscriptions')
      .select('status, plan_type, cancel_at_period_end, current_period_end')
      .eq('user_id', user.id)
      .maybeSingle()
    subscriptionStatus = data ?? null
  }

  return (
    <main className="container py-16">
      <h1 className="text-4xl font-semibold text-center">{t('title')}</h1>

      <div className="mt-12 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{t('payPerContract')}</CardTitle>
            <p className="text-3xl font-bold mt-2">
              $99 <span className="text-base font-normal text-muted-foreground">{t('perContract')}</span>
            </p>
            <p className="text-xs text-muted-foreground">{t('plusTaxes')}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 mt-0.5 text-emerald-600" />
                EN + FR contracts
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 mt-0.5 text-emerald-600" />
                PDF download + email delivery
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 mt-0.5 text-emerald-600" />
                CC and GC contract types
              </li>
            </ul>
            <TaxBreakdown subtotal={99} locale={locale} />
            <PricingCta
              locale={locale}
              plan="single"
              loggedIn={Boolean(user)}
              subscription={subscriptionStatus}
            />
          </CardContent>
        </Card>

        <Card className="border-amber-500/50">
          <CardHeader>
            <div className="text-xs uppercase tracking-wide font-semibold text-amber-600">
              PRO
            </div>
            <CardTitle>{t('pro')}</CardTitle>
            <p className="text-3xl font-bold mt-2">
              $349 <span className="text-base font-normal text-muted-foreground">{t('perMonth')}</span>
            </p>
            <p className="text-xs text-muted-foreground">{t('plusTaxes')}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 mt-0.5 text-emerald-600" />
                Unlimited contracts
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 mt-0.5 text-emerald-600" />
                Instant generation
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 mt-0.5 text-emerald-600" />
                Pro badge on account
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 mt-0.5 text-emerald-600" />
                Cancel anytime
              </li>
            </ul>
            <TaxBreakdown subtotal={349} locale={locale} />
            <PricingCta
              locale={locale}
              plan="subscription"
              loggedIn={Boolean(user)}
              subscription={subscriptionStatus}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
