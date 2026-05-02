'use client'

import { useTranslations } from 'next-intl'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface StepShellProps {
  title: string
  subtitle?: string
  children: ReactNode
  onSubmit: (e: React.FormEvent) => void
  onBack?: () => void
  submitLabel?: string
  isLoading?: boolean
  className?: string
}

export function StepShell({
  title,
  subtitle,
  children,
  onSubmit,
  onBack,
  submitLabel,
  isLoading,
  className,
}: StepShellProps) {
  const tc = useTranslations('common')
  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        'space-y-7 max-w-2xl mx-auto animate-fade-in-up-fast',
        className
      )}
    >
      <header className="space-y-1.5">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-muted-foreground leading-relaxed">{subtitle}</p>
        ) : null}
      </header>

      <div className="space-y-4">{children}</div>

      <footer className="flex items-center justify-between gap-2 pt-4 border-t">
        {onBack ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            disabled={isLoading}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {tc('back')}
          </Button>
        ) : (
          <span />
        )}
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-brand-cobalt hover:bg-brand-cobalt/90 shadow-sm hover:shadow-glow transition-all"
        >
          {submitLabel ?? tc('next')}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </footer>
    </form>
  )
}
