import { setRequestLocale } from 'next-intl/server'

import { LegalShell, LegalSection } from '@/components/legal/LegalShell'
import type { Locale } from '@/i18n'

export const metadata = {
  title: 'Privacy Policy',
}

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: localeParam } = await params
  const locale = localeParam as Locale
  setRequestLocale(locale)

  return (
    <LegalShell
      title="Privacy Policy"
      lastUpdated="February 20, 2026"
      locale={locale}
    >
      <p>
        ConstrAction Inc. (&ldquo;ConstrAction&rdquo;, &ldquo;we&rdquo;,
        &ldquo;us&rdquo;, &ldquo;our&rdquo;) values your privacy and is
        committed to safeguarding your personal information. This Privacy
        Policy explains how we collect, use, disclose, and protect information
        when you use our website{' '}
        <a
          href="https://www.constraction.ca"
          className="underline underline-offset-2"
        >
          https://www.constraction.ca
        </a>{' '}
        (the &ldquo;Website&rdquo;) and related services (the
        &ldquo;Services&rdquo;).
      </p>
      <p>
        By using our Services, you consent to this Privacy Policy. If you do
        not agree, please do not use our Services.
      </p>

      <LegalSection title="1. Scope of this Policy">
        <p>This Policy applies to personal information collected when you:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Use our Website or Services;</li>
          <li>Register an account;</li>
          <li>Purchase a subscription;</li>
          <li>Enter information into our contract generator;</li>
          <li>Communicate with us (email, phone, chat); or</li>
          <li>Interact with our advertising and analytics tools.</li>
        </ul>
        <p>
          It does not apply to third-party websites or services linked to our
          Website.
        </p>
      </LegalSection>

      <LegalSection title="2. Information We Collect">
        <p>We may collect:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Account Information:</strong> name, email, phone, business
            name, role, login credentials.
          </li>
          <li>
            <strong>Payment Information:</strong> billing address, payment
            method, transaction history (processed via third-party providers —
            we do not store credit card numbers).
          </li>
          <li>
            <strong>User Input Data:</strong> information you enter into our
            contract generator (e.g., contract parties, terms, project
            details).
          </li>
          <li>
            <strong>Usage Data:</strong> IP address, browser type, device
            information, operating system, referral source, pages viewed,
            interactions with the Services.
          </li>
          <li>
            <strong>Communications:</strong> support requests, feedback,
            correspondence.
          </li>
          <li>
            <strong>Cookies &amp; Tracking:</strong> see Section 8.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. How We Use Your Information">
        <p>We use your information to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Provide, operate, and maintain the Services;</li>
          <li>Generate contracts based on your inputs;</li>
          <li>Manage accounts, subscriptions, and billing;</li>
          <li>Communicate with you regarding updates, transactions, or support;</li>
          <li>Improve, personalize, and secure our Services;</li>
          <li>Deliver advertising and measure performance (see Section 8);</li>
          <li>Comply with legal obligations and enforce our Terms of Use.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Disclosure of Your Information">
        <p>We do not sell your personal information. We may share it:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>With service providers (hosting, payment processors, IT, marketing platforms);</li>
          <li>With affiliates and professional advisors (lawyers, accountants, auditors);</li>
          <li>With regulators, law enforcement, or courts when legally required;</li>
          <li>In business transfers (mergers, acquisitions, asset sales);</li>
          <li>With third parties if you consent.</li>
        </ul>
        <p>All service providers must protect your information by contract.</p>
      </LegalSection>

      <LegalSection title="5. International Transfers">
        <p>
          Your data may be stored or processed outside Quebec or Canada. If
          so, it may be subject to foreign laws. We take reasonable steps to
          ensure adequate protection.
        </p>
      </LegalSection>

      <LegalSection title="6. Data Retention">
        <p>
          We keep your information only as long as needed for the purposes
          described or as required by law. When no longer required, we
          securely delete, anonymize, or archive it.
        </p>
      </LegalSection>

      <LegalSection title="7. Security">
        <p>
          We implement physical, organizational, and technical safeguards to
          protect personal information. However, no system is 100% secure,
          and we cannot guarantee absolute protection.
        </p>
      </LegalSection>

      <LegalSection title="8. Cookies, Advertising & Analytics">
        <p>We use cookies, web beacons, and similar technologies to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Enable platform functionality;</li>
          <li>Remember preferences;</li>
          <li>Analyze traffic and usage patterns;</li>
          <li>Deliver targeted ads and measure their effectiveness.</li>
        </ul>
        <p>
          We may use third-party services such as Google Ads, Google
          Analytics, and Bing Ads. These services may collect data across
          websites for interest-based advertising.
        </p>
        <p>You may opt out of personalized ads through:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Google Ads Preferences</li>
          <li>Microsoft Ads Opt-Out</li>
          <li>Network Advertising Initiative</li>
        </ul>
        <p>
          You may also disable cookies in your browser, though this may affect
          functionality.
        </p>
      </LegalSection>

      <LegalSection title="9. Marketing Communications">
        <p>
          If you subscribe to our mailing list, we may send you promotional
          communications. You may opt out anytime by clicking
          &ldquo;unsubscribe&rdquo; or contacting us directly.
        </p>
      </LegalSection>

      <LegalSection title="10. Your Rights">
        <p>Under Quebec law and PIPEDA, you have the right to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Access personal information we hold about you;</li>
          <li>Request corrections of inaccuracies;</li>
          <li>Withdraw consent (subject to contractual/legal limits);</li>
          <li>Request deletion, subject to legal retention obligations;</li>
          <li>
            File a complaint with the Commission d&apos;accès à
            l&apos;information du Québec or the Office of the Privacy
            Commissioner of Canada.
          </li>
        </ul>
        <p>To exercise your rights, see Section 12.</p>
      </LegalSection>

      <LegalSection title="11. Children's Privacy">
        <p>
          Our Services are not directed to minors under 18. We do not
          knowingly collect information from them. If discovered, such data
          will be deleted.
        </p>
      </LegalSection>

      <LegalSection title="12. Contact – Privacy Officer">
        <p>We have designated a Privacy Officer to oversee compliance.</p>
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

      <LegalSection title="13. Amendments">
        <p>
          We may update this Policy from time to time. Updates will be posted
          on the Website with a new &ldquo;Last Updated&rdquo; date.
          Continued use after changes means you accept them.
        </p>
      </LegalSection>

      <LegalSection title="14. Third-Party Links & Practices">
        <p>
          Our Website may contain links to external sites. We are not
          responsible for the privacy practices or content of third parties.
          You should review their privacy policies.
        </p>
      </LegalSection>

      <LegalSection title="15. Language Policy">
        <p>
          In accordance with Quebec&apos;s Charte de la langue française, this
          Policy is available in both French and English. In case of conflict,
          the French version prevails in Quebec.
        </p>
      </LegalSection>
    </LegalShell>
  )
}
