import Link from 'next/link'

export function LegalFooter({ dark = false }: { dark?: boolean }) {
  const text = dark ? 'text-slate-500' : 'text-slate-400'
  const hover = dark ? 'hover:text-slate-300' : 'hover:text-slate-600'
  const border = dark ? 'border-slate-700' : 'border-slate-200'
  const bg = dark ? '' : 'bg-white'

  return (
    <footer className={`border-t ${border} ${bg} mt-auto`}>
      <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${text}`}>
        <span className={text}>&copy; {new Date().getFullYear()} SpecSense AI. All rights reserved.</span>
        <div className="flex items-center gap-5">
          <Link href="/terms" className={`${text} ${hover} underline-offset-2 hover:underline`}>
            Terms of Service
          </Link>
          <Link href="/privacy" className={`${text} ${hover} underline-offset-2 hover:underline`}>
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  )
}
