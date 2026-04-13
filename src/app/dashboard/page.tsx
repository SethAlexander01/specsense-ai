import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatBytes, formatDate, FREE_PLAN_LIMIT } from '@/lib/utils'
import { PLAN_DOC_LIMITS } from '@/lib/billing/plan'
import { Upload, FileText, Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react'

function statusBadge(status: string) {
  const map: Record<string, { variant: 'default' | 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
    uploaded: { variant: 'info', label: 'Uploaded' },
    processing: { variant: 'warning', label: 'Processing' },
    ready: { variant: 'success', label: 'Ready' },
    error: { variant: 'danger', label: 'Error' },
  }
  const s = map[status] ?? { variant: 'default', label: status }
  return <Badge variant={s.variant}>{s.label}</Badge>
}

function statusIcon(status: string) {
  const cls = 'h-5 w-5'
  if (status === 'ready') return <CheckCircle className={`${cls} text-emerald-500`} />
  if (status === 'processing') return <Loader className={`${cls} text-amber-500 animate-spin`} />
  if (status === 'error') return <AlertCircle className={`${cls} text-red-500`} />
  return <Clock className={`${cls} text-slate-400`} />
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profileData }, { data: documents }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('documents').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profile = profileData as any
  const plan: string = profile?.plan ?? 'free'
  const PAID_PLANS = ['starter', 'professional', 'enterprise']
  const isPaid = PAID_PLANS.includes(plan)
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1)
  const planLimit = PLAN_DOC_LIMITS[plan] ?? FREE_PLAN_LIMIT

  // Monthly count — must match checkDocLimit in plan.ts (UTC month boundary)
  const now = new Date()
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const docsThisMonth = documents?.filter(d => new Date(d.created_at) >= startOfMonth).length ?? 0
  const docsTotal = documents?.length ?? 0

  const canUpload = planLimit === Infinity || docsThisMonth < planLimit

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
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
          <h2 className="font-semibold text-slate-900">Your documents</h2>
        </CardHeader>
        {!documents || documents.length === 0 ? (
          <CardContent>
            <div className="text-center py-16">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No documents yet</p>
              <p className="text-slate-400 text-sm mt-1">Upload your first engineering PDF to get started</p>
              <Link href="/dashboard/upload" className="mt-6 inline-block">
                <Button>
                  <Upload className="h-4 w-4" />
                  Upload document
                </Button>
              </Link>
            </div>
          </CardContent>
        ) : (
          <div className="divide-y divide-slate-100">
            {documents.map((doc) => (
              <Link
                key={doc.id}
                href={`/dashboard/docs/${doc.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group"
              >
                <div className="shrink-0">{statusIcon(doc.status)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(doc as any).filename}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {doc.file_size ? formatBytes(doc.file_size) : '—'} · {formatDate(doc.created_at)}
                  </p>
                </div>
                <div className="shrink-0">{statusBadge(doc.status)}</div>
              </Link>
            ))}
          </div>
        )}
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
