import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

import { BRAND_LOGO_URL } from '@/lib/constants'
import { LanguageToggle } from './LanguageToggle'
import { AuthWidget } from './AuthWidget'

export async function Navbar({ locale }: { locale: 'en' | 'fr' }) {
  const t = await getTranslations({ locale, namespace: 'common' })

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href={`/${locale}`} className="flex items-center">
            <Image
              src={BRAND_LOGO_URL}
              alt="ConstrAction"
              width={140}
              height={40}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link
              href={`/${locale}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('home')}
            </Link>
            <Link
              href={`/${locale}/pricing`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('pricing')}
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <AuthWidget />
        </div>
      </div>
    </header>
  )
}
