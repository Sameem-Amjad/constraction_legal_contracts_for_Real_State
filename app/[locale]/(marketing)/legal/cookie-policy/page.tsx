import { setRequestLocale } from 'next-intl/server'

import { LegalShell, LegalSection } from '@/components/legal/LegalShell'
import type { Locale } from '@/i18n'

export const metadata = {
  title: 'Cookie Policy',
}

export default async function CookiePolicyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <LegalShell
      title="Cookie Policy"
      lastUpdated="February 20, 2026"
      locale={locale}
    >
      <p>
        ConstrAction Inc. (&ldquo;ConstrAction&rdquo;, &ldquo;we&rdquo;,
        &ldquo;us&rdquo;, &ldquo;our&rdquo;) uses cookies and similar tracking
        technologies on our website{' '}
        <a
          href="https://www.constraction.ca"
          className="underline underline-offset-2"
        >
          https://www.constraction.ca
        </a>{' '}
        (the &ldquo;Website&rdquo;). This Cookie Policy explains what cookies
        are, how we use them, and how you can manage your cookie preferences.
      </p>

      <LegalSection title="1. What Are Cookies?">
        <p>
          Cookies are small text files placed on your device when you visit a
          website. They help websites recognize your device, store
          preferences, and improve functionality. Cookies may be:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Session cookies:</strong> temporary, deleted when you close your browser;</li>
          <li><strong>Persistent cookies:</strong> remain on your device until they expire or are deleted;</li>
          <li><strong>First-party cookies:</strong> set by ConstrAction;</li>
          <li><strong>Third-party cookies:</strong> set by external services (e.g., analytics or advertising).</li>
        </ul>
      </LegalSection>

      <LegalSection title="2. How We Use Cookies">
        <p>We use cookies for the following purposes:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Essential cookies:</strong> to operate the Website and provide core functions (e.g., login, navigation, security).</li>
          <li><strong>Performance cookies:</strong> to collect information about how users interact with the Website, helping us improve usability.</li>
          <li><strong>Functional cookies:</strong> to remember user settings and preferences (e.g., language selection).</li>
          <li><strong>Analytics cookies:</strong> to measure traffic, usage trends, and improve Services (e.g., Google Analytics).</li>
          <li><strong>Advertising cookies:</strong> to deliver personalized ads and measure their effectiveness (e.g., Google Ads, Microsoft Ads).</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Third-Party Cookies">
        <p>
          We may allow third parties to place cookies on your device when you
          use our Website. These may include:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Google Analytics &amp; Ads:</strong> to analyze usage and deliver targeted ads.</li>
          <li><strong>Microsoft Ads:</strong> to provide personalized advertising.</li>
          <li>Other service providers that help us monitor performance and deliver marketing campaigns.</li>
        </ul>
        <p>
          We are not responsible for the privacy practices of these third
          parties. Please review their policies directly.
        </p>
      </LegalSection>

      <LegalSection title="4. Your Choices">
        <p>
          You can manage or disable cookies in your browser settings. Please
          note that disabling certain cookies may affect Website functionality.
        </p>
        <p>You may also opt out of personalized advertising via:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Google Ads Preferences</li>
          <li>Microsoft Ads Opt-Out</li>
          <li>Network Advertising Initiative Opt-Out</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Consent">
        <p>
          By continuing to use our Website, you consent to our use of cookies
          as described in this Policy. Where required by law, we will obtain
          your consent through a cookie banner or pop-up before placing
          non-essential cookies.
        </p>
      </LegalSection>

      <LegalSection title="6. Updates to this Policy">
        <p>
          We may update this Cookie Policy from time to time. Changes will be
          posted on the Website with a new &ldquo;Last Updated&rdquo; date.
          Your continued use of the Website constitutes acceptance of the
          updated Policy.
        </p>
      </LegalSection>

      <LegalSection title="7. Contact">
        <p>
          If you have any questions about our use of cookies, please contact
          our Privacy Officer:
        </p>
        <address className="not-italic">
          <strong>Privacy Officer – ConstrAction Inc.</strong>
          <br />
          Email:{' '}
          <a
            href="mailto:privacy@constraction.ca"
            className="underline underline-offset-2"
          >
            privacy@constraction.ca
          </a>
        </address>
      </LegalSection>

      <LegalSection title="8. Language Policy">
        <p>
          In accordance with Quebec&apos;s Charte de la langue française, this
          Cookie Policy is available in both French and English. In the event
          of a conflict, the French version shall prevail in Quebec.
        </p>
      </LegalSection>
    </LegalShell>
  )
}
