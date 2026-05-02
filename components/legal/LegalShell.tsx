import Link from 'next/link'
import type { ReactNode } from 'react'

interface LegalShellProps {
  title: string
  lastUpdated: string
  locale: 'en' | 'fr'
  children: ReactNode
}

const LEGAL_LINKS = {
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

export function LegalShell({
  title,
  lastUpdated,
  locale,
  children,
}: LegalShellProps) {
  const links = LEGAL_LINKS[locale]
  const isFr = locale === 'fr'

  return (
    <main className="container max-w-6xl py-12">
      <div className="grid lg:grid-cols-[220px_1fr] gap-10">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
            {isFr ? 'Documents juridiques' : 'Legal'}
          </p>
          <ul className="space-y-1 text-sm">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={`/${locale}/legal/${link.href}`}
                  className="block rounded-md px-3 py-2 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
        <article className="min-w-0">
          <header className="mb-10 border-b pb-6">
            <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {isFr ? 'Dernière mise à jour' : 'Last updated'}: {lastUpdated}
            </p>
          </header>
          <div className="legal-prose space-y-8 text-[15px] leading-relaxed text-foreground/90">
            {children}
          </div>
        </article>
      </div>
    </main>
  )
}

export function LegalSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold tracking-tight scroll-mt-24">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}
