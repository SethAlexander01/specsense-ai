'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Zap, Shield, FileText, MessageSquare, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { Suspense } from 'react'
import { LegalFooter } from '@/components/ui/legal-footer'

function BillingContent() {
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [profile, setProfile] = useState<{ plan: string; stripe_customer_id: string | null; email?: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [userEmail, setUserEmail] = useState<string>()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserEmail(user.email)
      const { data } = await supabase.from('profiles').select('plan, stripe_customer_id').eq('id', user.id).single()
      setProfile(data)
    }
    load()

    if (searchParams.get('success') === '1') toast.success('Subscription activated! Welcome to Pro.')
    if (searchParams.get('canceled') === '1') toast.error('Checkout canceled.')
  }, [searchParams, supabase])

  async function handleUpgrade(plan: 'starter' | 'professional' | 'enterprise' = 'professional') {
    setLoading(true)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start checkout')
      setLoading(false)
    }
  }

  async function handlePortal() {
    setLoading(true)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to open portal')
      setLoading(false)
    }
  }

  const PAID_PLANS = ['starter', 'professional', 'enterprise']
  const isPaid = PAID_PLANS.includes(profile?.plan ?? '')

  const PLAN_LABELS: Record<string, { name: string; price: string }> = {
    starter:      { name: 'Starter', price: '$79/month' },
    professional: { name: 'Professional', price: '$249/month' },
    enterprise:   { name: 'Enterprise', price: '$499/month' },
  }
  const currentPlanInfo = profile?.plan ? PLAN_LABELS[profile.plan] : null

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar userEmail={userEmail} plan={profile?.plan} />

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-slate-900">Billing & Plan</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your subscription and billing.</p>
        </div>

        {/* Current plan */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Current plan</h2>
              <Badge variant={isPaid ? 'success' : 'default'}>{currentPlanInfo ? currentPlanInfo.name : 'Free'}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isPaid ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">{currentPlanInfo?.name} — {currentPlanInfo?.price}</p>
                  <p className="text-sm text-slate-500 mt-1">Unlimited documents, AI chat, PDF export</p>
                </div>
                <Button variant="outline" onClick={handlePortal} loading={loading}>
                  Manage subscription
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">No active plan</p>
                  <p className="text-sm text-slate-500 mt-1">Choose a plan below to unlock full access</p>
                </div>
                <Button onClick={() => handleUpgrade()} loading={loading}>
                  <Zap className="h-4 w-4" />
                  View plans
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plan comparison */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Starter */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-slate-900">Starter</h3>
              <p className="text-3xl font-bold text-slate-900 mt-2">$79<span className="text-base font-normal text-slate-500">/mo</span></p>
              <p className="text-xs text-slate-500 mt-1">20 drawings/month</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {[
                  { icon: FileText, text: '20 drawing uploads' },
                  { icon: CheckCircle, text: 'Spec extraction' },
                  { icon: CheckCircle, text: 'View extracted data' },
                  { icon: Download, text: 'PDF report export' },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-2 text-sm text-slate-600">
                    <Icon className="h-4 w-4 text-slate-400 shrink-0" />
                    {text}
                  </li>
                ))}
              </ul>
              {profile?.plan !== 'starter' && !isPaid && (
                <Button variant="outline" className="w-full" onClick={() => handleUpgrade('starter')} loading={loading}>
                  <Zap className="h-4 w-4" />
                  Get started
                </Button>
              )}
              {profile?.plan === 'starter' && (
                <Badge variant="success" className="w-full justify-center py-1">Current plan</Badge>
              )}
            </CardContent>
          </Card>

          {/* Professional */}
          <Card className={profile?.plan === 'professional' ? 'ring-2 ring-blue-500' : 'border-blue-200 bg-blue-50/30'}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Professional</h3>
                {profile?.plan === 'professional' && <Badge variant="success">Current plan</Badge>}
              </div>
              <p className="text-3xl font-bold text-slate-900 mt-2">$249<span className="text-base font-normal text-slate-500">/mo</span></p>
              <p className="text-xs text-slate-500 mt-1">200 drawings/month</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {[
                  { icon: FileText, text: '200 drawing uploads' },
                  { icon: Shield, text: 'Full spec extraction' },
                  { icon: MessageSquare, text: 'AI chat with documents' },
                  { icon: Download, text: 'PDF report export' },
                  { icon: Zap, text: 'Priority processing' },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-2 text-sm text-slate-700">
                    <Icon className="h-4 w-4 text-blue-600 shrink-0" />
                    {text}
                  </li>
                ))}
              </ul>
              {profile?.plan !== 'professional' && profile?.plan !== 'enterprise' && (
                <Button className="w-full" onClick={() => handleUpgrade('professional')} loading={loading}>
                  <Zap className="h-4 w-4" />
                  {isPaid ? 'Switch plan' : 'Upgrade now'}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Enterprise */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-slate-900">Enterprise</h3>
              <p className="text-3xl font-bold text-slate-900 mt-2">$499<span className="text-base font-normal text-slate-500">/mo</span></p>
              <p className="text-xs text-slate-500 mt-1">Unlimited drawings</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {[
                  { icon: FileText, text: 'Unlimited drawing uploads' },
                  { icon: Shield, text: 'Full spec extraction' },
                  { icon: MessageSquare, text: 'AI chat with documents' },
                  { icon: Download, text: 'PDF report export' },
                  { icon: Zap, text: 'Priority processing' },
                  { icon: CheckCircle, text: 'Dedicated support' },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-2 text-sm text-slate-700">
                    <Icon className="h-4 w-4 text-emerald-600 shrink-0" />
                    {text}
                  </li>
                ))}
              </ul>
              {profile?.plan === 'enterprise' ? (
                <Badge variant="success" className="w-full justify-center py-1">Current plan</Badge>
              ) : (
                <Button variant="outline" className="w-full" onClick={() => handleUpgrade('enterprise')} loading={loading}>
                  <Zap className="h-4 w-4" />
                  Contact sales
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <LegalFooter />
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense>
      <BillingContent />
    </Suspense>
  )
}
