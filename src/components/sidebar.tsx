'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  Cpu, LayoutDashboard, Upload, CreditCard, LogOut, FileText,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface SidebarProps {
  userEmail?: string
  plan?: string
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/upload', label: 'Upload', icon: Upload, exact: false },
  { href: '/billing', label: 'Billing', icon: CreditCard, exact: false },
]

export function Sidebar({ userEmail, plan }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-60 shrink-0 bg-slate-900 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2.5 text-white font-bold">
          <Cpu className="h-6 w-6 text-blue-400 shrink-0" />
          <span className="text-sm">SpecSense AI</span>
          {plan === 'pro' && (
            <span className="ml-auto text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded font-medium">PRO</span>
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
      </div>
    </aside>
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
