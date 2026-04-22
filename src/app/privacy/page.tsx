import Link from 'next/link'
import { Cpu } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy — SpecExtract',
}

const EFFECTIVE_DATE = 'April 21, 2026'
const CONTACT_EMAIL = 'specextract@specextract.com'

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
          This Privacy Policy explains how SpecExtract (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) collects, uses, and
          protects your information when you use our service. Please read it carefully.
        </div>

        <Section title="1. Information We Collect">
          <SubSection title="Account Information">
            When you register, we collect your email address and, optionally, your full name. This
            information is stored securely via Supabase and is used to authenticate you and communicate
            with you about your account.
          </SubSection>
          <SubSection title="Documents You Upload">
            When you upload engineering drawings, spec sheets, or other documents, the file is stored
            in Supabase Storage (hosted on AWS). The contents of your documents are transmitted to
            Anthropic&apos;s API for AI-powered analysis. <strong>Do not upload documents containing
            classified, export-controlled (ITAR/EAR), or highly sensitive information unless you have
            reviewed Anthropic&apos;s data handling policies.</strong>
          </SubSection>
          <SubSection title="Extracted Data">
            Structured data extracted from your documents (materials, dimensions, tolerances, etc.) is
            stored in our database associated with your account and the uploaded file.
          </SubSection>
          <SubSection title="Payment Information">
            We do not store credit card numbers or payment credentials. All billing is processed by
            Stripe, Inc. Stripe may retain payment data in accordance with their own privacy policy.
            We store your Stripe customer ID and subscription status to manage your plan.
          </SubSection>
          <SubSection title="Usage Data">
            We automatically collect limited technical data including your IP address, browser type,
            pages visited, and feature usage for the purpose of operating and improving the service.
          </SubSection>
        </Section>

        <Section title="2. How We Use Your Information">
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li>To provide and operate the SpecExtract service</li>
            <li>To process your documents using AI (via Anthropic&apos;s API)</li>
            <li>To manage your subscription and process payments via Stripe</li>
            <li>To send transactional emails (account confirmation, billing receipts)</li>
            <li>To respond to support requests</li>
            <li>To detect and prevent fraud or abuse</li>
            <li>To improve the accuracy and features of the service</li>
          </ul>
          <p className="mt-4 text-slate-700">
            We do not sell, rent, or trade your personal information or document data to third parties
            for marketing purposes.
          </p>
        </Section>

        <Section title="3. Third-Party Services">
          <p className="text-slate-700 mb-3">
            We rely on the following third-party services to operate SpecExtract. Your data may be
            transmitted to or stored by these providers:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left px-4 py-2 text-slate-700">Service</th>
                  <th className="text-left px-4 py-2 text-slate-700">Purpose</th>
                  <th className="text-left px-4 py-2 text-slate-700">Data Shared</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="bg-white">
                  <td className="px-4 py-2 font-medium">Anthropic</td>
                  <td className="px-4 py-2 text-slate-600">AI document analysis</td>
                  <td className="px-4 py-2 text-slate-600">Document contents</td>
                </tr>
                <tr className="bg-white">
                  <td className="px-4 py-2 font-medium">Supabase</td>
                  <td className="px-4 py-2 text-slate-600">Database &amp; file storage</td>
                  <td className="px-4 py-2 text-slate-600">Account data, documents</td>
                </tr>
                <tr className="bg-white">
                  <td className="px-4 py-2 font-medium">Stripe</td>
                  <td className="px-4 py-2 text-slate-600">Payment processing</td>
                  <td className="px-4 py-2 text-slate-600">Email, billing info</td>
                </tr>
                <tr className="bg-white">
                  <td className="px-4 py-2 font-medium">Vercel</td>
                  <td className="px-4 py-2 text-slate-600">Application hosting</td>
                  <td className="px-4 py-2 text-slate-600">Request logs, IP address</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="4. Data Retention">
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li>Your account data is retained for as long as your account is active.</li>
            <li>Uploaded documents and extracted specs are retained until you delete them or close your account.</li>
            <li>If you cancel your subscription, your data remains accessible on the free tier limits until you choose to delete it.</li>
            <li>Upon account deletion, we will delete your personal data and uploaded files within 30 days, except where retention is required by law.</li>
          </ul>
        </Section>

        <Section title="5. Your Rights">
          <p className="text-slate-700 mb-3">
            Depending on your location, you may have the following rights regarding your personal data:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
            <li><strong>Correction:</strong> Request correction of inaccurate personal data.</li>
            <li><strong>Deletion:</strong> Request deletion of your account and associated data.</li>
            <li><strong>Portability:</strong> Request an export of your extracted spec data in JSON format.</li>
            <li><strong>Objection:</strong> Object to certain processing activities.</li>
          </ul>
          <p className="mt-4 text-slate-700">
            To exercise any of these rights, contact us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline">{CONTACT_EMAIL}</a>.
          </p>
        </Section>

        <Section title="6. Data Security">
          <p className="text-slate-700">
            We implement appropriate technical and organizational measures to protect your information,
            including encrypted connections (TLS), row-level security on our database, and restricted
            access to production systems. However, no system is completely secure. You use the service
            at your own risk and should not upload documents you cannot afford to have compromised.
          </p>
        </Section>

        <Section title="7. Cookies">
          <p className="text-slate-700">
            We use session cookies strictly necessary for authentication. We do not use advertising
            or tracking cookies. No cookie consent banner is required as we only use essential cookies.
          </p>
        </Section>

        <Section title="8. Children's Privacy">
          <p className="text-slate-700">
            SpecExtract is not directed at children under 16 years of age. We do not knowingly collect
            personal information from children. If you believe a child has provided us with personal
            data, contact us and we will delete it promptly.
          </p>
        </Section>

        <Section title="9. Changes to This Policy">
          <p className="text-slate-700">
            We may update this Privacy Policy from time to time. When we do, we will update the
            effective date at the top of this page. For material changes, we will notify you by email
            or by a prominent notice in the application. Continued use of the service after changes
            constitutes acceptance of the updated policy.
          </p>
        </Section>

        <Section title="10. Contact">
          <p className="text-slate-700">
            If you have questions or concerns about this Privacy Policy, please contact us at:{' '}
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
