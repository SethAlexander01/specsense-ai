import Link from 'next/link'
import { Cpu } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service — SpecExtract',
}

const EFFECTIVE_DATE = 'April 21, 2026'
const CONTACT_EMAIL = 'specextract@specextract.com'

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
          account or using the service, you agree to be bound by these terms.
        </div>

        <Section title="1. Acceptance of Terms">
          <p className="text-slate-700">
            These Terms of Service (&quot;Terms&quot;) govern your access to and use of SpecExtract
            (&quot;Service&quot;), operated by SpecExtract (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;). By accessing or using the
            Service, you agree to these Terms. If you do not agree, do not use the Service.
          </p>
        </Section>

        <Section title="2. Description of Service">
          <p className="text-slate-700">
            SpecExtract is a software-as-a-service platform that allows users to upload engineering
            documents and technical drawings, extract structured specifications using AI, chat with
            document content, and export formatted PDF reports. The AI analysis is powered by
            Anthropic&apos;s Claude models.
          </p>
        </Section>

        <Section title="3. Accounts">
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li>You must provide accurate information when creating an account.</li>
            <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
            <li>You are responsible for all activity that occurs under your account.</li>
            <li>You must be at least 18 years old to use the Service.</li>
            <li>You may not share your account or allow others to access the Service through your credentials.</li>
          </ul>
        </Section>

        <Section title="4. Subscriptions and Billing">
          <SubSection title="Plans">
            SpecExtract offers free and paid subscription plans. Paid plans are billed monthly and
            include increased document limits and access to premium features (AI chat, PDF export).
            Current pricing is displayed on our billing page.
          </SubSection>
          <SubSection title="Payments">
            All payments are processed by Stripe, Inc. By subscribing, you authorise Stripe to charge
            your payment method on a recurring monthly basis until you cancel.
          </SubSection>
          <SubSection title="Cancellation">
            You may cancel your subscription at any time through the billing portal. Cancellation takes
            effect at the end of your current billing period. You will retain access to paid features
            until that date.
          </SubSection>
          <SubSection title="Refunds">
            Subscription fees are non-refundable except where required by applicable law. If you
            believe you were charged in error, contact us within 14 days at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline">{CONTACT_EMAIL}</a>.
          </SubSection>
          <SubSection title="Plan Limits">
            Document upload limits are enforced per calendar month and reset on the 1st of each month.
            Unused uploads do not roll over. Exceeding your plan limit will prevent further uploads
            until the next billing cycle or until you upgrade.
          </SubSection>
        </Section>

        <Section title="5. Acceptable Use">
          <p className="text-slate-700 mb-3">You agree not to use SpecExtract to:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li>Upload documents containing classified, ITAR-controlled, or export-controlled technical data unless you have independently verified compliance with applicable export laws.</li>
            <li>Violate any applicable local, national, or international law or regulation.</li>
            <li>Infringe the intellectual property rights of any third party.</li>
            <li>Upload malicious files, scripts, or content designed to harm the Service or its users.</li>
            <li>Attempt to reverse-engineer, scrape, or circumvent any security or access controls of the Service.</li>
            <li>Resell, sublicense, or provide access to the Service to third parties without our written consent.</li>
            <li>Use the Service to build a competing product or service.</li>
          </ul>
        </Section>

        <Section title="6. Your Content and Data">
          <SubSection title="Ownership">
            You retain full ownership of the documents you upload and the extracted specification data.
            We claim no intellectual property rights over your content.
          </SubSection>
          <SubSection title="Licence to Operate">
            By uploading documents, you grant us a limited, non-exclusive licence to process, store,
            and transmit your content solely for the purpose of providing the Service to you. This
            includes sending document content to Anthropic&apos;s API for AI analysis.
          </SubSection>
          <SubSection title="Responsibility">
            You are solely responsible for the documents you upload. You must have the right to upload
            and process each document. We are not responsible for any third-party IP infringement
            arising from content you upload.
          </SubSection>
        </Section>

        <Section title="7. AI-Generated Output">
          <p className="text-slate-700">
            Extracted specifications and AI chat responses are generated by an automated AI system and
            may contain errors, omissions, or inaccuracies. <strong>You must independently verify all
            extracted data before using it in any engineering, manufacturing, procurement, or safety
            decision.</strong> We expressly disclaim liability for any loss or damage arising from
            reliance on AI-generated output without independent verification.
          </p>
        </Section>

        <Section title="8. Intellectual Property">
          <p className="text-slate-700">
            The SpecExtract platform, including its software, design, trademarks, and content (excluding
            your uploaded documents), is owned by us and protected by intellectual property laws. You
            may not copy, modify, distribute, or create derivative works based on the Service without
            our prior written consent.
          </p>
        </Section>

        <Section title="9. Disclaimer of Warranties">
          <p className="text-slate-700">
            THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
            EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS
            FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL
            BE UNINTERRUPTED, ERROR-FREE, OR THAT EXTRACTED DATA WILL BE ACCURATE OR COMPLETE.
          </p>
        </Section>

        <Section title="10. Limitation of Liability">
          <p className="text-slate-700">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL SPECSENSE AI, ITS OFFICERS,
            DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
            CONSEQUENTIAL, OR PUNITIVE DAMAGES — INCLUDING LOSS OF PROFITS, DATA, OR BUSINESS —
            ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE, EVEN IF WE HAVE BEEN ADVISED OF
            THE POSSIBILITY OF SUCH DAMAGES. OUR TOTAL LIABILITY FOR ANY CLAIM ARISING FROM THESE
            TERMS OR THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE 12 MONTHS
            PRECEDING THE CLAIM.
          </p>
        </Section>

        <Section title="11. Indemnification">
          <p className="text-slate-700">
            You agree to indemnify and hold harmless SpecExtract and its affiliates from any claims,
            damages, losses, or expenses (including reasonable legal fees) arising from your use of
            the Service, your violation of these Terms, or your infringement of any third-party rights.
          </p>
        </Section>

        <Section title="12. Termination">
          <p className="text-slate-700">
            We reserve the right to suspend or terminate your account at any time for violation of
            these Terms, suspected fraud, or conduct that may harm the Service or other users. You
            may delete your account at any time. Upon termination, your right to use the Service ceases
            immediately. Provisions that by their nature should survive termination will do so.
          </p>
        </Section>

        <Section title="13. Changes to Terms">
          <p className="text-slate-700">
            We may update these Terms at any time. Material changes will be communicated via email or
            prominent notice in the application at least 14 days before taking effect. Continued use
            of the Service after the effective date constitutes acceptance of the updated Terms.
          </p>
        </Section>

        <Section title="14. Governing Law">
          <p className="text-slate-700">
            These Terms are governed by and construed in accordance with the laws of the United States.
            Any disputes arising from these Terms or the Service shall be resolved through binding
            arbitration or in the courts of competent jurisdiction, and you consent to such jurisdiction.
          </p>
        </Section>

        <Section title="15. Contact">
          <p className="text-slate-700">
            For questions about these Terms, contact us at:{' '}
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
