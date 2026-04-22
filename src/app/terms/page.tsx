import Link from 'next/link'
import { Cpu } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service — SpecExtract',
}

const EFFECTIVE_DATE    = 'April 22, 2026'
const CONTACT_EMAIL     = 'specextract@specextract.com'
const ENTITY_NAME       = 'Seth A Alexander'      // TODO: replace with registered entity
const BUSINESS_ADDRESS  = '112 W Hopkins Ave'        // TODO: replace before launch
const STATE             = 'Michigan'   // TODO: e.g. "Delaware"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
            <Cpu className="h-5 w-5 text-blue-600" />
            SpecExtract
          </Link>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <Link href="/privacy" className="hover:text-slate-900">Privacy Policy</Link>
            <Link href="/login" className="hover:text-slate-900">Log in</Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-slate-500 text-sm mb-10">Effective date: {EFFECTIVE_DATE}</p>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-10 text-sm text-blue-800">
          Please read these Terms of Service carefully before using SpecExtract. By creating an
          account or using the service in any way, you agree to be bound by these Terms in full.
          If you do not agree, do not access or use the service.
        </div>

        {/* ─── 1. Acceptance ─── */}
        <Section title="1. Acceptance of Terms">
          <p className="text-slate-700">
            These Terms of Service (&ldquo;Terms&rdquo;) are a legally binding agreement between you
            (&ldquo;User&rdquo;, &ldquo;you&rdquo;) and {ENTITY_NAME} (&ldquo;SpecExtract&rdquo;,
            &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;), the operator of the SpecExtract
            platform available at specextract.com (&ldquo;Service&rdquo;). By accessing or using the
            Service — including creating an account, uploading a document, or using any feature — you
            confirm that you have read, understood, and agree to these Terms and our{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
            If you are using the Service on behalf of an organisation, you represent that you have
            authority to bind that organisation to these Terms.
          </p>
        </Section>

        {/* ─── 2. Description of Service ─── */}
        <Section title="2. Description of Service">
          <p className="text-slate-700">
            SpecExtract is a software-as-a-service (SaaS) platform that allows users to upload
            engineering documents — including technical drawings, specification sheets, material data
            sheets, and similar files — and use AI to extract structured specifications, ask questions
            about document content, and export formatted reports. AI analysis is powered by
            Anthropic&apos;s Claude models operating via API. The Service is intended as a productivity
            and reference tool for engineers, procurement professionals, and technical teams. It is
            not a substitute for professional engineering judgment, regulatory compliance review, or
            domain-specific expert advice.
          </p>
        </Section>

        {/* ─── 3. Accounts ─── */}
        <Section title="3. Accounts">
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li>You must provide accurate, current, and complete information when creating an account and keep it up to date.</li>
            <li>You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account.</li>
            <li>You must be at least 18 years old to use the Service.</li>
            <li>You may not share your account, allow others to access the Service through your credentials, or create accounts on behalf of others without their consent.</li>
            <li>If you believe your account has been compromised, notify us immediately at <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline">{CONTACT_EMAIL}</a>.</li>
          </ul>
        </Section>

        {/* ─── 4. Subscriptions and Billing ─── */}
        <Section title="4. Subscriptions and Billing">
          <SubSection title="Plans">
            SpecExtract offers free and paid subscription plans. Paid plans unlock higher document
            upload limits and premium features (AI chat, PDF export). Current plan details and
            pricing are displayed on the billing page within the Service.
          </SubSection>
          <SubSection title="Payments">
            All payments are processed by Stripe, Inc. By subscribing, you authorise Stripe to charge
            your payment method on a recurring monthly basis until you cancel. You agree to Stripe&apos;s
            own terms of service. We do not store or process your payment card details directly.
          </SubSection>
          <SubSection title="Cancellation">
            You may cancel your subscription at any time through the in-app billing portal.
            Cancellation takes effect at the end of your current paid billing period. You will retain
            access to paid features until that date.
          </SubSection>
          <SubSection title="Refunds">
            Subscription fees are non-refundable except where required by applicable law. If you
            believe you were charged in error, contact us within 14 days at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline">{CONTACT_EMAIL}</a>.
            We reserve the right to issue refunds at our sole discretion.
          </SubSection>
          <SubSection title="Plan Limits">
            Document upload limits are enforced per calendar month (UTC) and reset on the 1st of
            each month. Unused uploads do not roll over. Deleting a document does not restore your
            upload count for that month — limits track uploads made, not documents currently stored.
            Exceeding your plan limit prevents further uploads until the next billing cycle or until
            you upgrade.
          </SubSection>
        </Section>

        {/* ─── 5. Acceptable Use ─── */}
        <Section title="5. Acceptable Use">
          <p className="text-slate-700 mb-3">You agree not to use SpecExtract to:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li>
              Upload, transmit, or process documents containing classified information,
              ITAR-controlled technical data, EAR-controlled items, or other export-controlled
              content, unless you have independently determined that doing so is legally permissible
              under all applicable export control laws and regulations. <strong>The Service is not
              represented or warranted as suitable, approved, or compliant for the processing of
              controlled technical data.</strong> You bear sole responsibility for assessing whether
              your documents may be legally uploaded.
            </li>
            <li>Violate any applicable local, state, national, or international law or regulation.</li>
            <li>Infringe the intellectual property, privacy, or other rights of any third party.</li>
            <li>Upload malicious files, scripts, or content designed to harm the Service or its users.</li>
            <li>Attempt to reverse-engineer, scrape, decompile, or circumvent any security or access control of the Service.</li>
            <li>Resell, sublicense, white-label, or provide access to the Service to third parties without our prior written consent.</li>
            <li>Use the Service to build a competing product or extract features for competitive intelligence.</li>
            <li>Abuse the Service through automated uploads, scripted API calls, or bulk requests beyond normal use.</li>
          </ul>
          <p className="mt-4 text-slate-700">
            We reserve the right to suspend or terminate accounts that violate these restrictions,
            without refund and without prior notice where circumstances require immediate action.
          </p>
        </Section>

        {/* ─── 6. Your Content and Data ─── */}
        <Section title="6. Your Content and Data">
          <SubSection title="Ownership">
            You retain full ownership of all documents you upload and all extracted specification data
            generated from your documents. We claim no intellectual property rights over your content.
          </SubSection>
          <SubSection title="Licence to Operate">
            By uploading documents, you grant us a limited, non-exclusive, royalty-free, worldwide
            licence to store, process, reproduce, and transmit your content solely as required to
            provide the Service to you. This includes sending document content to Anthropic&apos;s API
            for AI analysis. This licence terminates when your content is deleted or your account
            is closed.
          </SubSection>
          <SubSection title="Deletion">
            You may permanently delete any uploaded document from your dashboard at any time.
            Deletion removes the file from our storage and all associated extracted data, AI chat
            history, and processed content from our database. Deletion is immediate and irreversible —
            deleted documents cannot be recovered. Your upload count for the current month is not
            reduced by deletion. We may retain anonymised, aggregated usage statistics that cannot
            identify you or your content.
          </SubSection>
          <SubSection title="Your Responsibility">
            You are solely responsible for the content you upload. You represent and warrant that
            you have all necessary rights to upload and process each document. We are not responsible
            for any third-party intellectual property infringement, regulatory violation, or legal
            liability arising from content you upload or from your use of extracted outputs.
          </SubSection>
        </Section>

        {/* ─── 7. AI-Generated Output ─── */}
        <Section title="7. AI-Generated Output">
          <p className="text-slate-700 mb-3">
            Extracted specifications, structured data, and AI chat responses are generated by an
            automated probabilistic AI system. You acknowledge and agree that:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li>AI outputs are inherently probabilistic and may be <strong>incomplete, incorrect, misleading, or out of context</strong> — even when they appear confident or precise.</li>
            <li>Extracted values such as dimensions, tolerances, materials, thread callouts, and other engineering data may contain errors or omissions that are not obvious on the face of the output.</li>
            <li>AI chat responses are not professional engineering advice, legal advice, regulatory guidance, or safety certification of any kind.</li>
            <li><strong>You assume the full risk of relying on any AI-generated output without independent verification by a qualified person.</strong></li>
          </ul>
          <p className="mt-3 text-slate-700">
            We expressly disclaim all liability for any loss, damage, injury, claim, or expense
            arising from your use of or reliance on AI-generated outputs, including but not limited
            to errors in extracted specifications, incomplete data extraction, or AI responses that
            are factually incorrect.
          </p>
        </Section>

        {/* ─── 8. Engineering and Professional Use Disclaimer ─── */}
        <Section title="8. Engineering and Professional Use Disclaimer">
          <p className="text-slate-700 mb-3">
            <strong>The Service is a document analysis tool, not a licensed engineering service.</strong>
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li>SpecExtract is not a substitute for professional engineering judgment, domain expertise, peer review, or regulatory compliance verification.</li>
            <li>Outputs produced by the Service must be independently reviewed and verified by a qualified engineer or relevant professional before being used in any manufacturing, procurement, construction, safety-critical, compliance, or technical decision-making process.</li>
            <li>We make no representation that the Service is suitable, approved, or certified for use in any regulated industry, safety-critical application, or compliance workflow.</li>
            <li>Any reliance on extracted data for downstream engineering, procurement, or manufacturing decisions is entirely at your own risk.</li>
          </ul>
          <p className="mt-3 text-slate-700">
            If your use case requires guaranteed accuracy, certified outputs, or regulatory approval,
            you must obtain those assurances independently. The Service does not provide them.
          </p>
        </Section>

        {/* ─── 9. Data Security ─── */}
        <Section title="9. Data Security">
          <p className="text-slate-700">
            We implement commercially reasonable technical and organisational measures to protect your
            data — including encrypted connections (TLS/HTTPS), row-level access controls on our
            database, and restricted access to production systems. However, <strong>no data transmission
            over the internet or electronic storage system is completely secure.</strong> We cannot
            guarantee the absolute security of your data. By using the Service, you acknowledge that
            the transmission and storage of your documents and account data is at your own risk. You
            should not upload documents that you cannot afford to have exposed in the event of a
            security incident. In the event of a data breach affecting your personal information, we
            will notify you as required by applicable law.
          </p>
        </Section>

        {/* ─── 10. Service Availability ─── */}
        <Section title="10. Service Availability">
          <p className="text-slate-700">
            We will endeavour to make the Service available, but we do not guarantee any specific
            level of uptime, availability, or performance. The Service may be temporarily unavailable,
            degraded, interrupted, or delayed due to maintenance, infrastructure issues, third-party
            provider outages, or events outside our control. <strong>We provide no uptime guarantee or
            service level agreement (SLA) unless one is separately and explicitly agreed in writing.</strong>{' '}
            We are not liable for any losses, damages, or costs arising from service interruptions,
            outages, latency, or data unavailability.
          </p>
        </Section>

        {/* ─── 11. Third-Party Services ─── */}
        <Section title="11. Third-Party Services">
          <p className="text-slate-700 mb-3">
            The Service depends on third-party infrastructure and service providers including, but
            not limited to, Anthropic (AI API), Supabase (database and file storage), Stripe
            (payment processing), and Vercel (application hosting). You acknowledge that:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li>We are not responsible for failures, outages, errors, data handling, security incidents, or policy changes by any third-party provider.</li>
            <li>Your use of the Service may result in your data being transmitted to and processed by these providers in accordance with their own terms of service and privacy policies.</li>
            <li>Availability and quality of AI analysis depends on Anthropic&apos;s services, which are outside our control.</li>
            <li>We may change, add, or remove third-party service providers at any time as part of operating the Service.</li>
          </ul>
          <p className="mt-3 text-slate-700">
            Links to or integration with third-party services are provided for convenience and do
            not constitute an endorsement. We encourage you to review the privacy policies and terms
            of service of any third-party providers whose services you interact with through our platform.
          </p>
        </Section>

        {/* ─── 12. Intellectual Property ─── */}
        <Section title="12. Intellectual Property">
          <p className="text-slate-700">
            The SpecExtract platform — including its software, design, interfaces, trademarks, logos,
            and non-user-generated content — is owned by {ENTITY_NAME} and protected by applicable
            intellectual property laws. Nothing in these Terms transfers any ownership of our
            intellectual property to you. You may not copy, modify, distribute, create derivative
            works from, reverse-engineer, or commercially exploit any part of the Service without
            our prior written consent.
          </p>
        </Section>

        {/* ─── 13. Disclaimer of Warranties ─── */}
        <Section title="13. Disclaimer of Warranties">
          <p className="text-slate-700">
            THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT
            WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, TITLE, NON-INFRINGEMENT,
            OR UNINTERRUPTED ACCESS. WE DO NOT WARRANT THAT: (A) THE SERVICE WILL MEET YOUR
            REQUIREMENTS; (B) THE SERVICE WILL BE AVAILABLE, ACCURATE, RELIABLE, OR ERROR-FREE AT
            ANY TIME; (C) EXTRACTED SPECIFICATIONS WILL BE COMPLETE OR CORRECT; OR (D) THE SERVICE
            IS SUITABLE FOR ANY SPECIFIC PROFESSIONAL, REGULATORY, OR ENGINEERING USE CASE. SOME
            JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF IMPLIED WARRANTIES — IN THOSE JURISDICTIONS,
            OUR LIABILITY IS LIMITED TO THE MAXIMUM EXTENT PERMITTED BY LAW.
          </p>
        </Section>

        {/* ─── 14. Limitation of Liability ─── */}
        <Section title="14. Limitation of Liability">
          <p className="text-slate-700 mb-3">
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL SPECEXTRACT,
            {ENTITY_NAME}, ITS OFFICERS, DIRECTORS, EMPLOYEES, CONTRACTORS, OR AGENTS BE LIABLE
            FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES
            OF ANY KIND ARISING OUT OF OR RELATED TO THESE TERMS OR YOUR USE OF THE SERVICE,
            INCLUDING BUT NOT LIMITED TO:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700 mb-3">
            <li>Reliance on AI-generated output, extracted specifications, or AI chat responses</li>
            <li>Engineering, manufacturing, procurement, safety, or technical decisions made using Service outputs</li>
            <li>Loss of data, documents, or extracted information</li>
            <li>Service interruptions, outages, downtime, or degraded performance</li>
            <li>Failures or errors caused by third-party service providers</li>
            <li>Unauthorised access to or alteration of your data</li>
            <li>Loss of profits, revenue, business opportunity, or goodwill</li>
          </ul>
          <p className="text-slate-700">
            EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR TOTAL CUMULATIVE
            LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATED TO THESE TERMS OR THE SERVICE —
            REGARDLESS OF THE FORM OF ACTION — SHALL NOT EXCEED THE GREATER OF: (A) THE TOTAL FEES
            PAID BY YOU TO US IN THE 12 MONTHS IMMEDIATELY PRECEDING THE CLAIM; OR (B) ONE HUNDRED
            US DOLLARS (USD $100).
          </p>
        </Section>

        {/* ─── 15. Indemnification ─── */}
        <Section title="15. Indemnification">
          <p className="text-slate-700">
            You agree to defend, indemnify, and hold harmless SpecExtract, {ENTITY_NAME}, and their
            officers, directors, employees, and agents from and against any claims, liabilities,
            damages, losses, costs, and expenses (including reasonable attorneys&apos; fees) arising out
            of or in connection with: (a) your use of or access to the Service; (b) your violation
            of these Terms; (c) any content you upload; (d) your violation of any applicable law or
            third-party right; or (e) any engineering, procurement, manufacturing, or other decision
            you make based on Service outputs.
          </p>
        </Section>

        {/* ─── 16. Force Majeure ─── */}
        <Section title="16. Force Majeure">
          <p className="text-slate-700">
            We are not liable for any failure or delay in performing our obligations under these
            Terms to the extent that such failure or delay is caused by events or circumstances
            beyond our reasonable control, including but not limited to: acts of God, natural
            disasters, pandemic or public health emergencies, fire, flood, earthquake, power
            outages, internet failures, cyberattacks, denial-of-service attacks, third-party
            provider failures or outages (including cloud infrastructure, AI API providers, or
            payment processors), government actions or restrictions, labour disputes, war, terrorism,
            or changes in law or regulation. We will use reasonable efforts to resume performance
            as soon as practicable after such events.
          </p>
        </Section>

        {/* ─── 17. Termination ─── */}
        <Section title="17. Termination">
          <SubSection title="By You">
            You may stop using the Service and close your account at any time. Closing your account
            does not entitle you to a refund of any prepaid subscription fees. You remain responsible
            for any amounts owed prior to termination.
          </SubSection>
          <SubSection title="By Us">
            We reserve the right to suspend or terminate your access to the Service at any time,
            with or without notice, if we determine in our sole discretion that you have violated
            these Terms, engaged in fraudulent or abusive behaviour, or if continuation of your
            access would expose us or others to harm or legal liability. We may also discontinue
            the Service in whole or in part at any time.
          </SubSection>
          <SubSection title="Effect of Termination">
            Upon termination, your right to use the Service ceases immediately. We may delete your
            account data in accordance with our Privacy Policy. Provisions that by their nature
            should survive termination will do so — see Section 19 (Survival).
          </SubSection>
        </Section>

        {/* ─── 18. Dispute Resolution ─── */}
        <Section title="18. Dispute Resolution">
          <SubSection title="Informal Resolution First">
            Before initiating any formal dispute, you agree to contact us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline">{CONTACT_EMAIL}</a>{' '}
            and give us at least 30 days to attempt to resolve the dispute informally. Most concerns
            can be resolved quickly this way.
          </SubSection>
          <SubSection title="Binding Arbitration">
            If we cannot resolve a dispute informally, any claim, controversy, or dispute arising
            out of or relating to these Terms or the Service (a &ldquo;Dispute&rdquo;) shall be finally
            resolved by binding individual arbitration administered by [ARBITRATION FORUM, e.g.
            JAMS or AAA] under its applicable rules in effect at the time, except as set out below.
            The arbitration shall be conducted in {STATE} (or by remote hearing if available), in
            English, and the arbitrator&apos;s decision shall be final and binding. Either party may seek
            emergency injunctive relief in a court of competent jurisdiction to prevent irreparable
            harm pending the outcome of arbitration.
          </SubSection>
          <SubSection title="Class Action Waiver">
            YOU AND SPECEXTRACT EACH WAIVE THE RIGHT TO A JURY TRIAL AND TO PARTICIPATE IN CLASS
            ACTION PROCEEDINGS. ALL DISPUTES MUST BE BROUGHT IN YOUR INDIVIDUAL CAPACITY, AND NOT
            AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE PROCEEDING.
          </SubSection>
          <SubSection title="Small Claims">
            Either party may bring an individual claim in small claims court in lieu of arbitration,
            provided the claim qualifies for that court&apos;s jurisdiction and is brought on an
            individual basis only.
          </SubSection>
          <SubSection title="Opt-Out">
            You may opt out of the arbitration agreement within 30 days of first agreeing to these
            Terms by emailing us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline">{CONTACT_EMAIL}</a>{' '}
            with the subject line &ldquo;Arbitration Opt-Out&rdquo; and your account email address.
          </SubSection>
        </Section>

        {/* ─── 19. Governing Law ─── */}
        <Section title="19. Governing Law">
          <p className="text-slate-700">
            These Terms are governed by and construed in accordance with the laws of the State of
            {' '}{STATE}, without regard to its conflict of law principles. To the extent that any
            Dispute is not subject to arbitration under Section 18, or to the extent a party
            validly opts out of arbitration, you agree to submit to the exclusive jurisdiction of
            the state and federal courts located in {STATE} for resolution of that Dispute, and
            you waive any objection to jurisdiction or venue in those courts.
          </p>
        </Section>

        {/* ─── 20. Survival ─── */}
        <Section title="20. Survival">
          <p className="text-slate-700">
            The following sections survive expiration or termination of these Terms for any reason:
            Section 4 (payment obligations accrued prior to termination), Section 6 (Your Content
            and Data — ownership and responsibility), Section 7 (AI-Generated Output), Section 8
            (Engineering and Professional Use Disclaimer), Section 12 (Intellectual Property),
            Section 13 (Disclaimer of Warranties), Section 14 (Limitation of Liability), Section 15
            (Indemnification), Section 18 (Dispute Resolution), Section 19 (Governing Law), and
            this Section 20 (Survival).
          </p>
        </Section>

        {/* ─── 21. Changes to Terms ─── */}
        <Section title="21. Changes to Terms">
          <p className="text-slate-700">
            We may update these Terms at any time. For material changes, we will provide at least
            14 days&apos; notice by email to the address on your account, or by a prominent notice within
            the Service. The updated Terms will be identified by a new effective date at the top of
            this page. Your continued use of the Service after the effective date of updated Terms
            constitutes your acceptance of those changes. If you do not agree to revised Terms, you
            must stop using the Service before the effective date.
          </p>
        </Section>

        {/* ─── 22. General ─── */}
        <Section title="22. General">
          <SubSection title="Entire Agreement">
            These Terms, together with our Privacy Policy, constitute the entire agreement between
            you and SpecExtract regarding the Service and supersede any prior agreements or
            understandings on the same subject.
          </SubSection>
          <SubSection title="Severability">
            If any provision of these Terms is found to be invalid, illegal, or unenforceable, the
            remaining provisions will continue in full force and effect. The invalid provision will
            be modified to the minimum extent necessary to make it enforceable.
          </SubSection>
          <SubSection title="Waiver">
            Our failure to enforce any right or provision of these Terms is not a waiver of that
            right or provision. Any waiver must be in writing signed by an authorised representative
            of SpecExtract.
          </SubSection>
          <SubSection title="Assignment">
            You may not assign or transfer your rights or obligations under these Terms without our
            prior written consent. We may assign these Terms freely, including in connection with a
            merger, acquisition, or sale of assets, with reasonable notice to you.
          </SubSection>
        </Section>

        {/* ─── 23. Contact ─── */}
        <Section title="23. Contact">
          <p className="text-slate-700">
            For questions or concerns about these Terms, contact us at:
          </p>
          <p className="mt-2 text-slate-700">
            <strong>SpecExtract ({ENTITY_NAME})</strong><br />
            {BUSINESS_ADDRESS}<br />
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline">{CONTACT_EMAIL}</a>
          </p>
        </Section>
      </main>

      <footer className="border-t border-slate-200 bg-white mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between text-sm text-slate-400">
          <span>&copy; {new Date().getFullYear()} SpecExtract. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-slate-600">Terms</Link>
            <Link href="/privacy" className="hover:text-slate-600">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-medium text-slate-800 mb-1">{title}</h3>
      <p className="text-slate-700">{children}</p>
    </div>
  )
}
