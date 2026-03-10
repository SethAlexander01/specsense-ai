import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Cpu, FileText, MessageSquare, Download, Shield, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800">
      {/* Nav */}
      <nav className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white font-bold text-xl">
          <Cpu className="h-7 w-7 text-blue-400" />
          SpecSense AI
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login">
            <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-700">
              Sign in
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white">
              Get started free
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-900/40 text-blue-300 border border-blue-700/50 rounded-full px-4 py-1.5 text-sm mb-8">
          <Zap className="h-3.5 w-3.5" />
          Powered by Claude AI
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Extract specs from<br />
          <span className="text-blue-400">engineering documents</span>
        </h1>
        <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
          Upload PDFs, drawings, and spec sheets. SpecSense AI extracts materials, tolerances,
          threads, finishes, and standards instantly.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/auth/signup">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white px-8">
              Start for free
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
              Sign in
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-800/50 py-24">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Everything you need</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                title: 'Smart Extraction',
                desc: 'Claude AI reads your PDFs and pulls out materials, tolerances, threads, finishes, standards, and dimensions — structured and ready to use.',
              },
              {
                icon: MessageSquare,
                title: 'Chat with your docs',
                desc: 'Ask natural language questions about your spec sheet. "What is the surface finish?" or "List all thread specifications."',
              },
              {
                icon: Download,
                title: 'Export reports',
                desc: 'Generate professional PDF spec summaries with one click. Share with your team, clients, or suppliers.',
              },
            ].map((f) => (
              <div key={f.title} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="h-12 w-12 rounded-lg bg-blue-900/50 flex items-center justify-center mb-4">
                  <f.icon className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-4">Simple pricing</h2>
          <p className="text-slate-400 text-center mb-12">Choose the plan that fits your team</p>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 flex flex-col">
              <h3 className="text-xl font-bold text-white mb-1">Starter</h3>
              <p className="text-4xl font-bold text-white mt-4 mb-2">
                $79<span className="text-lg text-slate-400 font-normal">/mo</span>
              </p>
              <p className="text-slate-400 text-sm mb-8">20 drawings per month</p>
              <ul className="space-y-3 text-sm text-slate-300 mb-8 flex-1">
                {['20 drawing uploads', 'Spec extraction', 'View extracted data', 'PDF report export'].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" className="block">
                <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                  Get started
                </Button>
              </Link>
            </div>

            {/* Professional */}
            <div className="bg-blue-600 rounded-xl p-8 border border-blue-500 relative overflow-hidden flex flex-col">
              <div className="absolute top-4 right-4 bg-white/20 text-white text-xs px-2 py-1 rounded font-medium">
                Most popular
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Professional</h3>
              <p className="text-4xl font-bold text-white mt-4 mb-2">
                $249<span className="text-lg text-white/70 font-normal">/mo</span>
              </p>
              <p className="text-white/70 text-sm mb-8">200 drawings per month</p>
              <ul className="space-y-3 text-sm text-white mb-8 flex-1">
                {['200 drawing uploads', 'Spec extraction', 'AI chat with docs', 'PDF report export', 'Priority processing'].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-white shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" className="block">
                <Button className="w-full bg-white text-blue-700 hover:bg-white/90 font-semibold">
                  Start free trial
                </Button>
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 flex flex-col">
              <h3 className="text-xl font-bold text-white mb-1">Enterprise</h3>
              <p className="text-4xl font-bold text-white mt-4 mb-2">
                $499<span className="text-lg text-slate-400 font-normal">/mo</span>
              </p>
              <p className="text-slate-400 text-sm mb-8">Unlimited drawings</p>
              <ul className="space-y-3 text-sm text-slate-300 mb-8 flex-1">
                {['Unlimited drawing uploads', 'Spec extraction', 'AI chat with docs', 'PDF report export', 'Priority processing', 'Dedicated support'].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" className="block">
                <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                  Contact sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-700 py-8 text-center text-slate-500 text-sm">
        © {new Date().getFullYear()} SpecSense AI. Built with Claude AI.
      </footer>
    </div>
  )
}
