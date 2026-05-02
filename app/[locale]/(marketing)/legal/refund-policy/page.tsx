import { setRequestLocale } from 'next-intl/server'

import { LegalShell, LegalSection } from '@/components/legal/LegalShell'
import type { Locale } from '@/i18n'

export const metadata = {
  title: 'Refund Policy',
}

export default async function RefundPolicyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <LegalShell
      title="Refund Policy"
      lastUpdated="February 20, 2026"
      locale={locale}
    >
      <p>
        This Refund Policy (&ldquo;Policy&rdquo;) explains when and how
        ConstrAction Inc. (&ldquo;ConstrAction&rdquo;, &ldquo;we&rdquo;,
        &ldquo;us&rdquo;, &ldquo;our&rdquo;) provides refunds for
        subscriptions purchased through the website{' '}
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
        By purchasing or using our Services, you agree to this Policy, in
        addition to our Terms of Use, Subscription Terms, Privacy Policy,
        Cookie Policy, and any other applicable policies published on the
        Website (collectively, the &ldquo;Agreements&rdquo;).
      </p>

      <LegalSection title="1. General Rule – No Refunds">
        <p>
          All fees and charges for Subscriptions are non-refundable and
          non-creditable, except as expressly stated in this Policy or as
          required by law.
        </p>
        <p>This includes:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Unused time in an active subscription period;</li>
          <li>Partial months or years of service;</li>
          <li>Early termination or cancellation initiated by you.</li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Refund Exceptions">
        <p>Refunds may only be granted under the following limited circumstances:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Duplicate Charges:</strong> If you were mistakenly billed more than once for the same Subscription.</li>
          <li><strong>Technical Errors:</strong> If a payment processing error caused an incorrect charge.</li>
          <li><strong>Service Unavailability:</strong> If our Services are completely unavailable for more than 72 consecutive hours (excluding scheduled maintenance or force majeure events).</li>
          <li><strong>Statutory Rights:</strong> If required under Quebec or Canadian consumer protection law.</li>
        </ul>
        <p>All refund requests must be submitted in writing to our support team (see Section 6).</p>
      </LegalSection>

      <LegalSection title="3. Refund Method">
        <p>
          Approved refunds will be issued to the original payment method used
          at purchase. We are not responsible for delays caused by banks,
          credit card companies, or payment processors.
        </p>
      </LegalSection>

      <LegalSection title="4. Trials and Promotions">
        <p>If we offer free trials, promotional discounts, or introductory pricing:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Refunds are not available for amounts billed after the trial period ends.</li>
          <li>It is your responsibility to cancel before the trial ends to avoid charges.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Chargebacks">
        <p>
          Filing a chargeback with your bank or payment provider without
          first contacting us to resolve the issue may be considered a
          breach of our Terms of Use. We reserve the right to:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Dispute and reverse unauthorized chargebacks;</li>
          <li>Suspend or terminate your account for fraudulent or abusive chargeback activity.</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. How to Request a Refund">
        <p>
          To request a refund, contact us within 10 business days of the
          charge in question, with the following details:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Your name and account email;</li>
          <li>Date and amount of the charge;</li>
          <li>Reason for the refund request;</li>
          <li>Supporting documentation (if applicable).</li>
        </ul>
        <p>Requests can be made to:</p>
        <address className="not-italic">
          <strong>ConstrAction Inc. – Billing Department</strong>
          <br />
          Email:{' '}
          <a
            href="mailto:billing@constraction.ca"
            className="underline underline-offset-2"
          >
            billing@constraction.ca
          </a>
        </address>
      </LegalSection>

      <LegalSection title="7. Amendments">
        <p>
          We may update this Refund Policy from time to time. Updates will be
          posted on the Website with a new &ldquo;Last Updated&rdquo; date.
          Continued use of our Services after updates means you accept the
          revised Policy.
        </p>
      </LegalSection>

      <LegalSection title="8. Governing Law">
        <p>
          This Policy is governed by the laws of Quebec and Canada. Any
          disputes will be resolved exclusively in the courts of the district
          of Montreal, Quebec.
        </p>
      </LegalSection>

      <LegalSection title="9. Language Policy">
        <p>
          In accordance with Quebec&apos;s Charte de la langue française,
          this Refund Policy is available in both French and English. In the
          event of a conflict, the French version shall prevail in Quebec.
        </p>
      </LegalSection>
    </LegalShell>
  )
}
