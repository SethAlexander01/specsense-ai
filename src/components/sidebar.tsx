'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  Cpu, LayoutDashboard, Upload, CreditCard, LogOut, FileText,
  UserCircle, Menu, X,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface SidebarProps {
  userEmail?: string
  plan?: string
}

const navItems = [
  { href: '/dashboard',         label: 'Dashboard', icon: LayoutDashboard, exact: true  },
  { href: '/dashboard/upload',  label: 'Upload',    icon: Upload,          exact: false },
  { href: '/billing',           label: 'Billing',   icon: CreditCard,      exact: false },
  { href: '/dashboard/profile', label: 'Profile',   icon: UserCircle,      exact: false },
]

export function Sidebar({ userEmail, plan }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close drawer on navigation
  useEffect(() => { setMobileOpen(false) }, [pathname])

  async function handleSignOut() {
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Mobile top bar — hidden on lg+ */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 text-white font-bold text-sm">
          <Cpu className="h-5 w-5 text-blue-400 shrink-0" />
          SpecExtract
          {plan && plan !== 'free' && (
            <span className="ml-1 text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded font-medium uppercase">
              {plan.slice(0, 3)}
            </span>
          )}
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Backdrop — mobile only */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'w-60 shrink-0 bg-slate-900 flex flex-col',
          // Mobile: fixed slide-in drawer
          'fixed inset-y-0 left-0 z-50 transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: static in flex flow, always visible
          'lg:relative lg:translate-x-0 lg:transition-none lg:min-h-screen',
        )}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
          className="lg:hidden absolute top-4 right-4 p-1 text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-2.5 text-white font-bold">
            <Cpu className="h-6 w-6 text-blue-400 shrink-0" />
            <span className="text-sm">SpecExtract</span>
            {plan && plan !== 'free' && (
              <span className="ml-auto text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded font-medium uppercase">
                {plan.slice(0, 3)}
              </span>
            )}
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-slate-800">
          {userEmail && (
            <div className="px-3 mb-3">
              <p className="text-xs text-slate-500 truncate">{userEmail}</p>
              <p className="text-xs text-slate-600 mt-0.5 capitalize">{plan ?? 'free'} plan</p>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors w-full"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
          <div className="flex items-center gap-3 px-3 mt-3 pt-3 border-t border-slate-800">
            <Link href="/terms"   className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Terms</Link>
            <span className="text-slate-700 text-xs">·</span>
            <Link href="/privacy" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Privacy</Link>
          </div>
        </div>
      </aside>
    </>
  )
}

export function DocsSidebarItem({ id, name, active }: { id: string; name: string; active: boolean }) {
  return (
    <Link
      href={`/dashboard/docs/${id}`}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
        active
          ? 'bg-slate-800 text-white'
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
      )}
    >
      <FileText className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{name}</span>
    </Link>
  )
}
