'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2, CreditCard } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ManageBillingButtonProps {
  locale: 'en' | 'fr'
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  className?: string
  size?: 'default' | 'sm' | 'lg'
}

export function ManageBillingButton({
  locale,
  variant = 'outline',
  className,
  size = 'default',
}: ManageBillingButtonProps) {
  const t = useTranslations('dashboard')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function open() {
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
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
      setLoading(false)
    }
  }

  return (
    <div className={cn('inline-flex flex-col gap-1', className)}>
      <Button
        variant={variant}
        size={size}
        onClick={open}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <CreditCard className="mr-2 h-4 w-4" />
        )}
        {t('manageBilling')}
      </Button>
      {error ? (
        <span className="text-xs text-destructive">{error}</span>
      ) : null}
    </div>
  )
}
