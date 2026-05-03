import { setRequestLocale } from 'next-intl/server'

import { LegalShell, LegalSection } from '@/components/legal/LegalShell'
import type { Locale } from '@/i18n'

export const metadata = {
  title: 'Terms of Use',
}

export default async function TermsOfUsePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: localeParam } = await params
  const locale = localeParam as Locale
  setRequestLocale(locale)

  return (
    <LegalShell
      title="Terms of Use"
      lastUpdated="February 20, 2026"
      locale={locale}
    >
      <p className="font-medium">
        PLEASE READ THESE TERMS OF USE CAREFULLY BEFORE USING THIS WEBSITE.
      </p>
      <p>
        By accessing or using the website operated by ConstrAction Inc.
        (&ldquo;ConstrAction&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;,
        &ldquo;our&rdquo;), located at{' '}
        <a
          href="https://www.constraction.ca"
          className="underline underline-offset-2"
        >
          https://www.constraction.ca
        </a>{' '}
        (the &ldquo;Website&rdquo;), including all content, services,
        applications, products, and documentation made available through the
        Website (collectively, the &ldquo;Services&rdquo;), you agree to be
        legally bound by these Terms of Use (the &ldquo;Terms&rdquo;). If you
        do not agree with these Terms, do not access or use the Services.
      </p>

      <LegalSection title="1. Legal Agreement and Scope of Use">
        <p>
          These Terms form a legally binding agreement between you and
          ConstrAction. By using the Services, you also agree to our Privacy
          Policy, Cookie Policy, Subscription Terms, Refund Policy, and any
          other legal documents linked on the Website, all of which are
          incorporated by reference.
        </p>
        <p>
          ConstrAction provides automated contract generation tools designed
          for construction professionals in Quebec, based on information you
          input. Your access and use are conditional on lawful, accurate, and
          non-fraudulent use of the Services.
        </p>
      </LegalSection>

      <LegalSection title="2. Eligibility and Account Registration">
        <p>To use certain features, you must create a registered account. You must:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Be at least 18 years old and legally capable of entering into binding contracts;</li>
          <li>Provide accurate, current, and complete information;</li>
          <li>Maintain the confidentiality of your credentials;</li>
          <li>Accept full responsibility for all activities conducted under your account.</li>
        </ul>
        <p>
          We may suspend, restrict, or terminate your account immediately for
          any misuse, inaccurate information, or breach of these Terms.
        </p>
      </LegalSection>

      <LegalSection title="3. Service Description and Limitations">
        <p>
          ConstrAction is not a law firm and does not provide legal advice.
          Our platform generates standardized legal templates based on user
          inputs, designed to comply with Quebec law.
        </p>
        <p>You understand and agree that:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>No solicitor–client relationship is created;</li>
          <li>You are solely responsible for reviewing, adapting, and using documents generated;</li>
          <li>You may need to consult a licensed lawyer for tailored or critical legal advice;</li>
          <li>Generated documents are not guaranteed to be legally sufficient in every circumstance.</li>
        </ul>
        <p className="font-medium pt-2">
          No Legal Advice / Automated Tool Disclaimer
        </p>
        <p>
          The Services constitute automated document generation technology
          only and do not provide legal advice, legal opinions, or
          professional recommendations. Information generated through the
          Services is based exclusively on user-provided inputs and
          standardized logic and does not consider your specific legal
          situation.
        </p>
        <p>
          ConstrAction Inc. does not review, validate, or approve generated
          documents. Use of the Services does not replace consultation with a
          licensed lawyer. You expressly acknowledge that reliance on any
          generated document without independent legal review is undertaken
          entirely at your own risk.
        </p>
      </LegalSection>

      <LegalSection title="4. Independent Contractor Use Only">
        <p>
          Documents generated are intended exclusively for independent
          contractor relationships. By using them, you agree that:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>They do not create an employment, partnership, or joint venture relationship;</li>
          <li>You must not use them as employment contracts;</li>
          <li>Misuse may result in liability, including regulatory penalties for misclassification.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. License and Restrictions">
        <p>
          ConstrAction grants you a limited, non-exclusive, non-transferable,
          revocable license to access and use the Services solely for your
          internal business purposes.
        </p>
        <p>You may not:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Copy, reproduce, distribute, sublicense, sell, rent, or otherwise exploit any part of the Services;</li>
          <li>Reverse-engineer, decompile, disassemble, or modify any software or templates;</li>
          <li>Use automated bots, scrapers, or similar tools to access, extract, or index the Services;</li>
          <li>Train artificial intelligence models or develop competing services using our content;</li>
          <li>Frame, mirror, or deep-link to the Website without prior written consent;</li>
          <li>Use the Services in any manner that could damage, disable, overburden, or impair our systems;</li>
          <li>Use the Services for unlawful, fraudulent, defamatory, infringing, or misleading purposes.</li>
        </ul>
        <p>
          All rights not expressly granted are reserved, including but not
          limited to copyright, trademark, trade secret, moral rights,
          database rights, and sui generis rights.
        </p>
      </LegalSection>

      <LegalSection title="6. Ownership and Intellectual Property">
        <p>
          All intellectual property in the Services is owned by ConstrAction
          Inc., including but not limited to:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Software, source code, and algorithms;</li>
          <li>Contract templates, forms, and generated content;</li>
          <li>Documentation, text, graphics, images, and visual materials;</li>
          <li>Logos, trademarks, and domain names.</li>
        </ul>
        <p>
          Nothing in these Terms transfers ownership of any intellectual
          property to you. You may only use generated contracts for your own
          business purposes, subject to these Terms.
        </p>
      </LegalSection>

      <LegalSection title="7. Pricing, Subscriptions, and Payment">
        <p>Some features are subject to paid subscriptions. By subscribing, you agree to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Pay all applicable fees, charges, and taxes;</li>
          <li>Authorize us to charge your chosen payment method;</li>
          <li>Abide by our Subscription Terms and Refund Policy.</li>
        </ul>
        <p>
          Access is contingent upon timely payment. Failure to pay may result
          in suspension or termination without refund.
        </p>
      </LegalSection>

      <LegalSection title="8. User Input and Content Accuracy">
        <p>
          You are solely responsible for all data you provide. We do not
          verify or validate your inputs.
        </p>
        <p>You warrant that:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>You have the necessary rights and authority to submit the data;</li>
          <li>The data complies with all applicable laws;</li>
          <li>The data does not infringe third-party rights, or contain false, misleading, or defamatory content.</li>
        </ul>
        <p>
          We disclaim responsibility for errors, omissions, or consequences
          arising from your inputs.
        </p>
      </LegalSection>

      <LegalSection title="9. Language Policy">
        <p>
          In accordance with Quebec&apos;s Charte de la langue française, all
          documents, interfaces, and communications are available in both
          French and English. In the event of a conflict, the French version
          prevails in Quebec.
        </p>
      </LegalSection>

      <LegalSection title="10. Beta Disclaimer">
        <p>
          Some Services may be labeled &ldquo;Beta,&rdquo;
          &ldquo;Preview,&rdquo; or &ldquo;Experimental.&rdquo; They are
          provided as-is and may contain bugs or disruptions. We make no
          guarantees of performance, stability, or availability.
        </p>
      </LegalSection>

      <LegalSection title="11. Termination">
        <p>We may suspend or terminate your account and access at any time:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>With or without cause;</li>
          <li>With or without notice;</li>
          <li>For any breach, misuse, failure to pay, or risk to our operations, reputation, or compliance obligations.</li>
        </ul>
        <p>
          Termination may occur at our sole discretion and without refund. You
          may terminate by closing your account. Obligations incurred prior to
          termination survive.
        </p>
      </LegalSection>

      <LegalSection title="12. Disclaimer of Warranties">
        <p>To the maximum extent permitted by law:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>The Services are provided &ldquo;as-is&rdquo; and &ldquo;as-available.&rdquo;</li>
          <li>
            We make no representations or warranties of any kind, express or
            implied, including but not limited to merchantability, fitness for
            a particular purpose, accuracy, completeness, reliability,
            availability, timeliness, quality, compatibility, or
            non-infringement.
          </li>
          <li>
            We do not warrant that the Services will be uninterrupted,
            error-free, secure, or free of viruses or other harmful
            components.
          </li>
          <li>
            Use of third-party services linked to or integrated with our
            platform is at your sole risk.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="13. Limitation of Liability">
        <p>
          To the fullest extent permitted by law, ConstrAction, its directors,
          officers, employees, affiliates, licensors, and agents shall not be
          liable for any:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Indirect, incidental, consequential, special, exemplary, or punitive damages;</li>
          <li>Loss of profits, revenues, contracts, goodwill, data, or business opportunities;</li>
          <li>Damages arising from negligence, strict liability, viruses, force majeure, or third-party actions.</li>
        </ul>
        <p>Our aggregate liability shall not exceed the greater of:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>The amount you paid in the last 3 months; or</li>
          <li>$100 CAD.</li>
        </ul>
        <p>
          Some jurisdictions may not allow these exclusions; liability is in
          all cases limited to the maximum extent permitted by law.
        </p>
        <p>
          You acknowledge that the Services are decision-support tools only
          and that ConstrAction Inc. shall not be responsible for business,
          contractual, financial, regulatory, or legal outcomes resulting from
          use of generated documents.
        </p>
      </LegalSection>

      <LegalSection title="14. Indemnification">
        <p>
          You acknowledge and agree that the contracts generated by
          ConstrAction are provided &ldquo;as-is&rdquo; and without
          independent legal review. You are solely responsible for determining
          their suitability for your specific circumstances.
        </p>
        <p>
          You agree to indemnify, defend, and hold harmless ConstrAction Inc.,
          its affiliates, officers, directors, employees, agents, successors,
          and assigns from and against any and all claims, actions, demands,
          proceedings, investigations, liabilities, damages, fines, penalties,
          losses, costs, settlements, and expenses (including but not limited
          to reasonable legal, accounting, and expert fees) arising out of or
          relating to:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Your use or misuse of the Services;</li>
          <li>Your breach of these Terms;</li>
          <li>Your violation of any applicable law, regulation, or third-party rights;</li>
          <li>Your use of any contract generated by the Services without review by a licensed legal professional;</li>
          <li>Any misclassification, inaccuracy, or insufficiency in such contracts;</li>
          <li>
            Any claim, action, demand, or proceeding brought against you or
            ConstrAction by a third party, regulator, governmental authority,
            or other entity as a result of your use of such contracts.
          </li>
        </ul>
        <p>
          This indemnification obligation is intended to be as broad as
          legally permissible and shall survive termination of these Terms.
        </p>
      </LegalSection>

      <LegalSection title="15. Governing Law and Jurisdiction">
        <p>
          These Terms are governed by the laws of Quebec and Canada. You agree
          that any dispute shall be submitted exclusively to the courts of the
          district of Montreal, Quebec.
        </p>
        <p>You further agree to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Waiver of jury trial;</li>
          <li>
            Class action waiver — disputes must be brought individually, not
            as part of a class or collective proceeding.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="16. Force Majeure">
        <p>
          We shall not be liable for delays or failures caused by events
          beyond our reasonable control, including, without limitation,
          natural disasters, strikes, labor disputes, supply chain
          interruptions, power outages, cyberattacks, pandemics, or
          governmental actions.
        </p>
      </LegalSection>

      <LegalSection title="17. Miscellaneous">
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Severability:</strong> If any provision is held invalid,
            the remainder remains enforceable.
          </li>
          <li>
            <strong>Entire Agreement:</strong> These Terms, together with
            linked policies available on our Website, constitute the entire
            agreement between you and ConstrAction, superseding all prior
            understandings.
          </li>
          <li>
            <strong>Waiver:</strong> Our failure to enforce a right does not
            constitute waiver of that right.
          </li>
          <li>
            <strong>Assignment:</strong> You may not assign these Terms
            without our prior written consent. We may assign them without
            restriction.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="18. Amendments">
        <p>
          We may modify these Terms at any time. Updates will be posted on the
          Website with a new &ldquo;Last Updated&rdquo; date. Changes take
          effect immediately upon posting. Your continued use constitutes
          acceptance of the revised Terms.
        </p>
      </LegalSection>

      <LegalSection title="19. Survival Clause">
        <p>
          Sections relating to intellectual property, limitation of liability,
          indemnification, payment obligations, and dispute resolution shall
          survive termination.
        </p>
      </LegalSection>

      <LegalSection title="20. Notices and Consent">
        <p>
          All notices will be provided electronically through the Website or
          via email. By using the Services, you consent to receive notices
          electronically.
        </p>
        <p>
          You must check the box confirming acceptance of these Terms and all
          linked policies before using the Services.
        </p>
      </LegalSection>

      <LegalSection title="21. Contact">
        <p>For questions, contact us at:</p>
        <address className="not-italic">
          <strong>ConstrAction Inc.</strong>
          <br />
          2020 Robert-Bourassa Blvd., Suite 2040
          <br />
          Montréal, Québec H3A 2A5
          <br />
          Email:{' '}
          <a
            href="mailto:info@constraction.ca"
            className="underline underline-offset-2"
          >
            info@constraction.ca
          </a>
        </address>
      </LegalSection>
    </LegalShell>
  )
}
