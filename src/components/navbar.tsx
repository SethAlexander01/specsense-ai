'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from './ui/button'
import { Cpu, LayoutDashboard, Upload, CreditCard, LogOut, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

interface NavbarProps {
  userEmail?: string
  plan?: string
}

export function Navbar({ userEmail, plan }: NavbarProps) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-slate-900">
          <Cpu className="h-6 w-6 text-blue-600" />
          <span>SpecSense AI</span>
          {plan === 'pro' && (
            <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded font-medium">PRO</span>
          )}
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/upload">
            <Button variant="ghost" size="sm">
              <Upload className="h-4 w-4" />
              Upload
            </Button>
          </Link>
          <Link href="/billing">
            <Button variant="ghost" size="sm">
              <CreditCard className="h-4 w-4" />
              Billing
            </Button>
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {userEmail && (
            <span className="text-sm text-slate-500 hidden md:block">{userEmail}</span>
          )}
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </header>
  )
}
