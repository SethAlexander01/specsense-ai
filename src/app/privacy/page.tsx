import Link from 'next/link'
import { Cpu } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy — SpecExtract',
}

const EFFECTIVE_DATE    = 'April 22, 2026'
const CONTACT_EMAIL     = 'specextract@specextract.com'
const ENTITY_NAME       = 'Seth A Alexander'      // TODO: replace with registered entity
const BUSINESS_ADDRESS  = '112 W Hopkins Ave'        // TODO: replace before launch

export default function PrivacyPage() {
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
            <Link href="/terms" className="hover:text-slate-900">Terms of Service</Link>
            <Link href="/login" className="hover:text-slate-900">Log in</Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-slate-500 text-sm mb-10">Effective date: {EFFECTIVE_DATE}</p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-10 text-sm text-amber-800">
          This Privacy Policy explains how SpecExtract (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;)
          — operated by {ENTITY_NAME} — collects, uses, stores, and shares your information when
          you use our service. Please read it carefully before using SpecExtract.
        </div>

        {/* ─── 1. Information We Collect ─── */}
        <Section title="1. Information We Collect">
          <SubSection title="Account Information">
            When you register, we collect your email address and, optionally, your full name. This
            information is used to authenticate you, manage your account, and communicate with you
            about your subscription and the Service.
          </SubSection>
          <SubSection title="Documents You Upload">
            When you upload engineering drawings, specification sheets, or other technical documents,
            the file is stored in cloud storage (currently Supabase Storage, hosted on AWS
            infrastructure). The contents of your documents are transmitted to Anthropic&apos;s API for
            AI-powered analysis. <strong>You should not upload documents containing classified,
            export-controlled, ITAR-regulated, or other highly sensitive information unless you have
            independently determined that doing so is legally permitted and you have reviewed
            Anthropic&apos;s usage and data policies.</strong>
          </SubSection>
          <SubSection title="Extracted and Generated Data">
            Structured data extracted from your documents — such as materials, dimensions, tolerances,
            notes, and specifications — and AI chat responses are stored in our database associated
            with your account and the uploaded file.
          </SubSection>
          <SubSection title="Payment Information">
            We do not store credit card numbers or raw payment credentials. All billing is processed
            by Stripe, Inc. We receive and store only your Stripe customer ID and subscription status,
            which we use to manage your plan access.
          </SubSection>
          <SubSection title="Usage and Technical Data">
            We automatically collect limited technical information such as your IP address, browser
            type, pages visited, features used, error events, and timestamps. This data is used to
            operate, secure, and improve the Service.
          </SubSection>
        </Section>

        {/* ─── 2. How We Use Your Information ─── */}
        <Section title="2. How We Use Your Information">
          <p className="text-slate-700 mb-3">We process your information for the following purposes and on the following bases:</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left px-4 py-2 text-slate-700">Purpose</th>
                  <th className="text-left px-4 py-2 text-slate-700">Lawful basis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {[
                  ['Provide and operate the Service', 'Contract (necessary to deliver what you signed up for)'],
                  ['Process AI document analysis via Anthropic', 'Contract / your explicit action of uploading'],
                  ['Manage your subscription and process payments via Stripe', 'Contract / legal obligation'],
                  ['Send transactional emails (receipts, account confirmation)', 'Contract / legitimate interest'],
                  ['Respond to support requests', 'Legitimate interest'],
                  ['Detect fraud, abuse, or security threats', 'Legitimate interest / legal obligation'],
                  ['Improve the accuracy and features of the Service (using aggregated, anonymised data only)', 'Legitimate interest'],
                  ['Comply with applicable law and enforce our Terms', 'Legal obligation / legitimate interest'],
                ].map(([purpose, basis]) => (
                  <tr key={purpose} className="bg-white">
                    <td className="px-4 py-2 text-slate-700">{purpose}</td>
                    <td className="px-4 py-2 text-slate-500">{basis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-slate-700">
            <strong>We do not sell, rent, or trade your personal information or document data to
            third parties for marketing, advertising, or data brokerage purposes.</strong>
          </p>
        </Section>

        {/* ─── 3. No AI Training on Your Content ─── */}
        <Section title="3. No AI Training on Your Content">
          <p className="text-slate-700">
            We do not use your uploaded documents, extracted specification data, or AI chat content
            to train our own AI or machine learning models. Your document content is processed
            solely to provide the Service to you.
          </p>
          <p className="mt-3 text-slate-700">
            Document content is transmitted to Anthropic&apos;s API for analysis. Anthropic&apos;s handling
            of that data — including whether it is used for model improvement — is governed by
            Anthropic&apos;s own usage policies, terms of service, and privacy documentation. We
            encourage you to review Anthropic&apos;s policies if this is a concern. We operate under
            a commercial API arrangement with Anthropic, which generally limits use of API inputs
            for training; however, we make no independent guarantee of Anthropic&apos;s practices.
          </p>
        </Section>

        {/* ─── 4. Third-Party Services ─── */}
        <Section title="4. Third-Party Services">
          <p className="text-slate-700 mb-3">
            We rely on third-party infrastructure and service providers to operate SpecExtract.
            Your data may be transmitted to, processed by, or stored by these providers as a
            necessary part of delivering the Service. We are not responsible for the privacy,
            security, uptime, or data handling practices of these providers — their handling of
            your data is governed by their own terms of service and privacy policies.
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left px-4 py-2 text-slate-700">Provider</th>
                  <th className="text-left px-4 py-2 text-slate-700">Purpose</th>
                  <th className="text-left px-4 py-2 text-slate-700">Data Shared</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {[
                  ['Anthropic', 'AI document analysis', 'Document file contents, text'],
                  ['Supabase', 'Database & file storage', 'Account data, documents, extracted specs'],
                  ['Stripe', 'Payment processing', 'Email address, billing information'],
                  ['Vercel', 'Application hosting & delivery', 'Request logs, IP address'],
                ].map(([provider, purpose, data]) => (
                  <tr key={provider} className="bg-white">
                    <td className="px-4 py-2 font-medium">{provider}</td>
                    <td className="px-4 py-2 text-slate-600">{purpose}</td>
                    <td className="px-4 py-2 text-slate-600">{data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-slate-700">
            We may add, change, or remove third-party providers as needed to operate the Service.
            Significant changes to how your data is shared will be reflected in an updated version
            of this Privacy Policy.
          </p>
        </Section>

        {/* ─── 5. International Data Transfers ─── */}
        <Section title="5. International Data Transfers">
          <p className="text-slate-700">
            SpecExtract is operated from the United States. Your information — including documents
            you upload and personal data — may be processed, stored, or transferred to servers
            located in the United States or other jurisdictions where our infrastructure providers
            operate. Data protection laws in those jurisdictions may differ from the laws in your
            country. By using the Service, you acknowledge that your data may be transferred
            internationally as described in this policy. Where required by applicable law, we will
            take steps to ensure that such transfers are subject to appropriate safeguards.
          </p>
        </Section>

        {/* ─── 6. Sensitive Documents and Confidential Content ─── */}
        <Section title="6. Sensitive Documents and Confidential Content">
          <p className="text-slate-700 mb-3">
            You are solely responsible for determining whether you are authorised to upload, share,
            and process any document through the Service. In particular:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li>Do not upload classified, government-restricted, ITAR-controlled, EAR-controlled, or otherwise export-restricted technical data unless you have independently confirmed that doing so is legally permitted under all applicable laws and regulations.</li>
            <li>Do not upload documents covered by confidentiality agreements, trade secret protections, or third-party intellectual property restrictions unless you have the right to share that content.</li>
            <li>The Service is not represented or warranted as suitable, certified, or compliant for the processing of controlled, sensitive, or classified technical data. We provide no representation as to legal adequacy for any regulatory regime.</li>
            <li>You should exercise caution and avoid uploading documents containing personal information of third parties (employees, customers) beyond what is necessary for your use case.</li>
          </ul>
        </Section>

        {/* ─── 7. Data Retention ─── */}
        <Section title="7. Data Retention">
          <p className="text-slate-700 mb-3">We retain your information for as long as needed to provide the Service and fulfil the purposes described in this policy:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li>Your account data is retained for as long as your account is active.</li>
            <li>Uploaded documents and extracted specifications are retained until you delete them or close your account.</li>
            <li>If you cancel a paid subscription, your data remains accessible under free-tier limits until you choose to delete it or close your account.</li>
            <li>Upon account deletion, we will delete your personal data and uploaded files from active systems within 30 days.</li>
            <li>Some data may remain in encrypted backups, audit logs, or archived systems for a further limited period. This data is not actively accessed and will be deleted or anonymised when those systems are purged.</li>
            <li>We may retain certain data for longer periods where required by applicable law, or for legitimate business purposes such as billing records, fraud prevention, dispute resolution, or compliance obligations.</li>
          </ul>
        </Section>

        {/* ─── 8. Data Security ─── */}
        <Section title="8. Data Security">
          <p className="text-slate-700">
            We apply commercially reasonable administrative, technical, and organisational
            safeguards to protect your information from unauthorised access, disclosure, alteration,
            or destruction. These include encrypted connections (TLS/HTTPS), row-level security
            controls on our database, restricted access to production systems, and access
            controls on cloud storage. However, <strong>no method of data transmission or
            electronic storage is guaranteed to be completely secure.</strong> We cannot promise
            absolute security. You use the Service at your own risk and should exercise caution
            in deciding what documents and information you upload. Do not upload documents you
            cannot afford to have exposed in the event of a security incident. In the event of a
            data breach affecting your personal information, we will notify you as required by
            applicable law.
          </p>
        </Section>

        {/* ─── 9. Your Rights ─── */}
        <Section title="9. Your Rights">
          <p className="text-slate-700 mb-3">
            Depending on your location and applicable law, you may have the following rights
            regarding your personal data. To exercise any of these rights, contact us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline">{CONTACT_EMAIL}</a>.
            We will respond within a reasonable time and in accordance with applicable law.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
            <li><strong>Correction:</strong> Request correction of inaccurate or incomplete personal data.</li>
            <li><strong>Deletion:</strong> Request deletion of your personal data and account. You may also delete individual documents at any time from your dashboard.</li>
            <li><strong>Portability:</strong> Request an export of your extracted specification data in a machine-readable format such as JSON.</li>
            <li><strong>Restriction:</strong> Request that we restrict processing of your personal data in certain circumstances.</li>
            <li><strong>Objection:</strong> Object to processing carried out on the basis of legitimate interests.</li>
            <li><strong>Withdrawal of consent:</strong> Where processing is based on your consent, you may withdraw it at any time without affecting the lawfulness of prior processing.</li>
          </ul>
          <p className="mt-4 text-slate-700">
            Note that some of these rights may be subject to limitations under applicable law.
            We may need to verify your identity before acting on a request.
          </p>
        </Section>

        {/* ─── 10. Cookies ─── */}
        <Section title="10. Cookies">
          <p className="text-slate-700">
            We use only essential cookies that are strictly necessary for authentication, session
            management, security, and the core operation of the Service. These cookies cannot be
            disabled without impairing your ability to use the Service. We do not currently use
            advertising, tracking, analytics, or third-party marketing cookies. If we introduce
            non-essential cookies in the future, we will update this policy accordingly and, where
            required by applicable law, obtain your consent before setting them.
          </p>
        </Section>

        {/* ─── 11. Business Transfers ─── */}
        <Section title="11. Business Transfers">
          <p className="text-slate-700">
            If SpecExtract or {ENTITY_NAME} is involved in a merger, acquisition, asset sale,
            financing event, reorganisation, or similar transaction, your personal information may
            be transferred to a successor or acquiring entity as part of that transaction. We will
            use reasonable efforts to ensure that any successor entity honours the privacy
            commitments made in this policy or provides you with equivalent protections. We will
            notify you via email or a prominent notice within the Service of any such change in
            ownership or control of your personal data, to the extent required by applicable law.
          </p>
        </Section>

        {/* ─── 12. Children&apos;s Privacy ─── */}
        <Section title="12. Children's Privacy">
          <p className="text-slate-700">
            SpecExtract is not directed at or intended for children under 16 years of age. We do
            not knowingly collect personal information from children under 16. If you believe a
            child has provided personal data to us, please contact us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline">{CONTACT_EMAIL}</a>{' '}
            and we will promptly delete it.
          </p>
        </Section>

        {/* ─── 13. Changes to This Policy ─── */}
        <Section title="13. Changes to This Policy">
          <p className="text-slate-700">
            We may update this Privacy Policy from time to time to reflect changes in our practices,
            the Service, or applicable law. When we make material changes, we will notify you by
            email to the address on your account, or by a prominent notice within the Service,
            at least 14 days before the changes take effect. The updated effective date will be
            shown at the top of this page. Your continued use of the Service after the effective
            date of any updated policy constitutes your acceptance of the changes. If you do not
            agree, you should stop using the Service and may request deletion of your account.
          </p>
        </Section>

        {/* ─── 14. Contact ─── */}
        <Section title="14. Contact">
          <p className="text-slate-700">
            If you have questions, concerns, or requests regarding this Privacy Policy or our
            handling of your personal data, please contact us at:
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
