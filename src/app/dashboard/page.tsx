import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FREE_PLAN_LIMIT } from '@/lib/utils'
import { PLAN_DOC_LIMITS } from '@/lib/billing/plan'
import { DocumentList } from '@/components/document-list'
import { Upload } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Monthly start — UTC so it matches checkDocLimit exactly
  const now = new Date()
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))

  const [{ data: profileData }, { data: documents }, { count: monthCount }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    // List: exclude soft-deleted docs
    supabase.from('documents').select('*').eq('user_id', user.id).is('deleted_at', null).order('created_at', { ascending: false }),
    // Monthly count: include soft-deleted so deletions don't restore quota
    supabase.from('documents').select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth.toISOString()),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profile = profileData as any
  const plan: string = profile?.plan ?? 'free'
  const PAID_PLANS = ['starter', 'professional', 'enterprise']
  const isPaid = PAID_PLANS.includes(plan)
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1)
  const planLimit = PLAN_DOC_LIMITS[plan] ?? FREE_PLAN_LIMIT

  const docsThisMonth = monthCount ?? 0
  const docsTotal = documents?.length ?? 0

  const canUpload = planLimit === Infinity || docsThisMonth < planLimit

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {profile?.full_name ? `Welcome, ${profile.full_name.split(' ')[0]}` : 'Dashboard'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {planLimit === Infinity
              ? `${planLabel} plan — unlimited documents`
              : `${planLabel} plan — ${docsThisMonth}/${planLimit} uploads used this month`}
          </p>
        </div>
        {canUpload ? (
          <Link href="/dashboard/upload">
            <Button>
              <Upload className="h-4 w-4" />
              Upload document
            </Button>
          </Link>
        ) : (
          <Link href="/billing">
            <Button>Upgrade to Pro</Button>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total documents', value: docsTotal },
          { label: planLimit === Infinity ? 'This month' : `This month (limit ${planLimit})`, value: planLimit === Infinity ? docsThisMonth : `${docsThisMonth}/${planLimit}` },
          { label: 'Ready', value: documents?.filter(d => d.status === 'ready').length ?? 0 },
          { label: 'Plan', value: planLabel },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="py-4">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Documents list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Your documents</h2>
            <span className="text-xs text-slate-400">{docsTotal} total</span>
          </div>
        </CardHeader>
        <DocumentList documents={(documents ?? []) as any} />
      </Card>

      {!isPaid && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6 flex items-center justify-between">
          <div>
            <p className="font-semibold text-blue-900">Upgrade to Pro</p>
            <p className="text-blue-700 text-sm mt-1">Unlock unlimited documents, AI chat, and PDF export.</p>
          </div>
          <Link href="/billing">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
              View plans — from $79/mo
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
