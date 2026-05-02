import { setRequestLocale } from 'next-intl/server'

import { LegalShell, LegalSection } from '@/components/legal/LegalShell'
import type { Locale } from '@/i18n'

export const metadata = {
  title: 'Subscription Terms',
}

export default async function SubscriptionTermsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <LegalShell
      title="Subscription Terms"
      lastUpdated="February 20, 2026"
      locale={locale}
    >
      <p>
        These Subscription Terms (&ldquo;Subscription Terms&rdquo;) govern
        your purchase and use of paid subscription plans
        (&ldquo;Subscription&rdquo;) offered by ConstrAction Inc.
        (&ldquo;ConstrAction&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;,
        &ldquo;our&rdquo;) through the website{' '}
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
        By purchasing or using a Subscription, you agree to be legally bound
        by these Subscription Terms, our Terms of Use, Privacy Policy, Refund
        Policy, Cookie Policy and any other policies published on the Website
        (together, the &ldquo;Agreements&rdquo;). If you do not agree, do not
        purchase or use a Subscription.
      </p>

      <LegalSection title="1. Subscription Plans">
        <p>
          We offer various Subscription plans that may differ in features,
          access levels, duration, and pricing. The details of your
          Subscription will be specified at the time of purchase.
        </p>
        <p>
          We reserve the right to modify or discontinue Subscription plans at
          any time, with or without notice, subject to Section 10
          (Amendments).
        </p>
      </LegalSection>

      <LegalSection title="2. Eligibility">
        <p>To purchase a Subscription, you must:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Be at least 18 years old and legally capable of entering into binding contracts;</li>
          <li>Provide accurate and complete registration, billing, and payment information;</li>
          <li>Agree to comply with these Subscription Terms and all applicable laws.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Billing and Payment">
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Automatic Billing:</strong> By purchasing a Subscription,
            you authorize ConstrAction (or its payment processor) to charge
            your selected payment method on a recurring basis (monthly or
            annually, depending on your plan).
          </li>
          <li>
            <strong>Payment Information:</strong> You must provide and
            maintain accurate billing details. If payment fails, access may
            be suspended until payment is received.
          </li>
          <li>
            <strong>Taxes:</strong> All fees are exclusive of applicable taxes
            (GST, QST, etc.), which you agree to pay.
          </li>
          <li>
            <strong>Currency:</strong> Unless otherwise stated, all prices
            are in Canadian dollars (CAD).
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Renewal">
        <p>
          Subscriptions automatically renew at the end of each billing cycle
          unless cancelled in accordance with Section 5. The renewal rate
          will be the same as your current plan unless otherwise notified in
          advance.
        </p>
      </LegalSection>

      <LegalSection title="5. Cancellation by You">
        <p>
          You may cancel your Subscription at any time by managing your
          account settings or contacting us.
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Cancellations take effect at the end of your current billing cycle.</li>
          <li>You will continue to have access until then.</li>
          <li>No refunds will be issued for partial billing periods, except as required by law or our Refund Policy.</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Termination by Us">
        <p>
          We may suspend or terminate your Subscription immediately, without
          refund, if:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>You breach these Subscription Terms or our Terms of Use;</li>
          <li>You misuse the Services or engage in unlawful activity;</li>
          <li>Payment is not received when due;</li>
          <li>Your continued use risks harm to ConstrAction&apos;s operations, reputation, or compliance obligations.</li>
        </ul>
        <p>
          We may also terminate Subscriptions at our discretion by providing
          written notice. In such cases, you will be refunded any prepaid,
          unused portion of your Subscription.
        </p>
      </LegalSection>

      <LegalSection title="7. Refund Policy">
        <p>
          Refunds are governed by our Refund Policy, available on the
          Website. Unless stated otherwise, all fees are non-refundable.
        </p>
      </LegalSection>

      <LegalSection title="8. Changes to Pricing">
        <p>We may change Subscription fees at any time. If we do:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>We will notify you in advance by email or through the Website;</li>
          <li>New rates will apply upon your next renewal;</li>
          <li>If you do not agree, you may cancel before the renewal date.</li>
        </ul>
      </LegalSection>

      <LegalSection title="9. No Transfer">
        <p>
          Your Subscription is personal to you and may not be sold, assigned,
          transferred, or shared with others without our prior written
          consent.
        </p>
      </LegalSection>

      <LegalSection title="10. Amendments">
        <p>
          We may amend these Subscription Terms from time to time. Updates
          will be posted on the Website with a new &ldquo;Last Updated&rdquo;
          date. Continued use of the Services after such updates constitutes
          your acceptance of the revised Subscription Terms.
        </p>
      </LegalSection>

      <LegalSection title="11. Limitation of Liability">
        <p>To the maximum extent permitted by law:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>ConstrAction shall not be liable for any indirect, incidental, consequential, or punitive damages arising from your Subscription or use of the Services;</li>
          <li>Our aggregate liability is limited to the amount you paid for the Subscription during the three (3) months immediately preceding the claim.</li>
        </ul>
      </LegalSection>

      <LegalSection title="12. Governing Law and Jurisdiction">
        <p>
          These Subscription Terms are governed by the laws of Quebec and
          Canada. Any dispute shall be resolved exclusively before the courts
          of the district of Montreal, Quebec.
        </p>
      </LegalSection>

      <LegalSection title="13. Contact">
        <p>If you have any questions regarding these Subscription Terms, please contact us:</p>
        <address className="not-italic">
          <strong>ConstrAction Inc.</strong>
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

      <LegalSection title="14. Language Policy">
        <p>
          In accordance with Quebec&apos;s Charte de la langue française,
          these Subscription Terms are available in both French and English.
          In the event of a conflict, the French version shall prevail in
          Quebec.
        </p>
      </LegalSection>
    </LegalShell>
  )
}
