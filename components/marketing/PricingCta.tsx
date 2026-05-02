'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

interface PricingCtaProps {
  locale: 'en' | 'fr'
  plan: 'single' | 'subscription'
  loggedIn: boolean
  subscription: {
    status: string
    plan_type: string
    cancel_at_period_end: boolean
    current_period_end: string | null
  } | null
}

export function PricingCta({
  locale,
  plan,
  loggedIn,
  subscription,
}: PricingCtaProps) {
  const t = useTranslations('marketing.plans')
  const td = useTranslations('dashboard')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isProActive =
    subscription?.status === 'active' &&
    subscription?.plan_type === 'unlimited_monthly'
  const isCancelling = isProActive && subscription?.cancel_at_period_end

  if (plan === 'single') {
    return (
      <Button asChild className="w-full" variant="outline">
        <Link
          href={
            loggedIn
              ? `/${locale}/contracts/new`
              : `/${locale}/signup`
          }
        >
          {t('getStarted')}
        </Link>
      </Button>
    )
  }

  if (!loggedIn) {
    return (
      <Button asChild className="w-full">
        <Link href={`/${locale}/signup`}>{t('getStarted')}</Link>
      </Button>
    )
  }

  if (isCancelling && subscription?.current_period_end) {
    return (
      <p className="text-sm text-muted-foreground text-center">
        {td('proCanceling', {
          date: formatDate(subscription.current_period_end, locale),
        })}
      </p>
    )
  }

  if (isProActive) {
    async function openPortal() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/stripe/portal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: locale }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Failed')
        window.location.href = data.url
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed')
        setLoading(false)
      }
    }
    return (
      <div className="space-y-2">
        <Button
          className="w-full"
          variant="outline"
          onClick={openPortal}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {td('manageBilling')}
            </>
          ) : (
            td('manageBilling')
          )}
        </Button>
        {error ? (
          <p className="text-xs text-destructive text-center">{error}</p>
        ) : null}
      </div>
    )
  }

  async function upgrade() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'subscription', language: locale }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button className="w-full" onClick={upgrade} disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('upgrade')}
          </>
        ) : (
          t('upgrade')
        )}
      </Button>
      {error ? (
        <p className="text-xs text-destructive text-center">{error}</p>
      ) : null}
    </div>
  )
}
