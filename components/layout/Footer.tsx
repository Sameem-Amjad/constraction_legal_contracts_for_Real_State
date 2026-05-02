import Link from 'next/link'
import { Mail, MapPin } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n'

const LEGAL_PAGES = {
  en: [
    { href: 'terms-of-use', label: 'Terms of Use' },
    { href: 'privacy-policy', label: 'Privacy Policy' },
    { href: 'cookie-policy', label: 'Cookie Policy' },
    { href: 'subscription-terms', label: 'Subscription Terms' },
    { href: 'refund-policy', label: 'Refund Policy' },
  ],
  fr: [
    { href: 'terms-of-use', label: "Conditions d'utilisation" },
    { href: 'privacy-policy', label: 'Politique de confidentialité' },
    { href: 'cookie-policy', label: 'Politique relative aux témoins' },
    { href: 'subscription-terms', label: "Conditions d'abonnement" },
    { href: 'refund-policy', label: 'Politique de remboursement' },
  ],
}

export async function Footer({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'common' })
  const isFr = locale === 'fr'

  return (
    <footer className="border-t bg-muted/40 mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand + tagline */}
          <div className="space-y-3">
            <p className="font-heading text-xl font-bold tracking-tight">
              <span className="text-brand-cobalt">Constr</span>Action
            </p>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t('tagline')}
            </p>
          </div>

          {/* Product links */}
          <div>
            <p className="font-semibold text-sm mb-3">
              {isFr ? 'Produit' : 'Product'}
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href={`/${locale}`}
                  className="hover:text-foreground transition-colors"
                >
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/pricing`}
                  className="hover:text-foreground transition-colors"
                >
                  {t('pricing')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/contracts/new/client-contractor`}
                  className="hover:text-foreground transition-colors"
                >
                  {isFr
                    ? 'Contrat Client / Entrepreneur'
                    : 'Client / Contractor contract'}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/contracts/new/gc-subcontractor`}
                  className="hover:text-foreground transition-colors"
                >
                  {isFr
                    ? 'Contrat Entrepreneur général / Sous-traitant'
                    : 'GC / Subcontractor contract'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <p className="font-semibold text-sm mb-3">
              {isFr ? 'Documents juridiques' : 'Legal'}
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {LEGAL_PAGES[locale].map((page) => (
                <li key={page.href}>
                  <Link
                    href={`/${locale}/legal/${page.href}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="font-semibold text-sm mb-3">
              {isFr ? 'Contact' : 'Contact'}
            </p>
            <address className="not-italic space-y-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">ConstrAction Inc.</p>
              <p className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  2020 Robert-Bourassa Blvd., Suite 2040
                  <br />
                  Montréal, Québec H3A 2A5
                </span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <a
                  href="mailto:info@constraction.ca"
                  className="hover:text-foreground transition-colors"
                >
                  info@constraction.ca
                </a>
              </p>
            </address>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t mt-10 pt-6 flex flex-col-reverse md:flex-row md:items-start md:justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} ConstrAction Inc.</p>
          <p className="max-w-2xl italic">{t('disclaimer')}</p>
        </div>
      </div>
    </footer>
  )
}
