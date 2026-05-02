'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'
import { locales } from '@/i18n'

export function LanguageToggle() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  function switchTo(target: 'en' | 'fr') {
    if (target === locale) return
    try {
      window.localStorage.setItem('constraction_locale', target)
    } catch {
      // localStorage unavailable — ignore
    }
    const segments = pathname.split('/')
    if (locales.includes(segments[1] as (typeof locales)[number])) {
      segments[1] = target
    } else {
      segments.splice(1, 0, target)
    }
    router.push(segments.join('/') || `/${target}`)
  }

  return (
    <div
      role="group"
      aria-label="Language / Langue"
      className="inline-flex h-8 rounded-full border bg-background text-xs font-medium overflow-hidden"
    >
      {locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => switchTo(loc as 'en' | 'fr')}
          className={cn(
            'px-3 transition-colors',
            locale === loc
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted'
          )}
          aria-pressed={locale === loc}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
