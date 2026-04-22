'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatBytes, formatDate } from '@/lib/utils'
import { Upload, FileText, Clock, CheckCircle, AlertCircle, Loader, ChevronDown, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const PAGE_SIZE = 10

interface Doc {
  id: string
  filename: string
  status: string
  file_size: number | null
  created_at: string
}

function statusBadge(status: string) {
  const map: Record<string, { variant: 'default' | 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
    uploaded:   { variant: 'info',    label: 'Uploaded' },
    processing: { variant: 'warning', label: 'Processing' },
    ready:      { variant: 'success', label: 'Ready' },
    error:      { variant: 'danger',  label: 'Error' },
  }
  const s = map[status] ?? { variant: 'default', label: status }
  return <Badge variant={s.variant}>{s.label}</Badge>
}

function statusIcon(status: string) {
  const cls = 'h-5 w-5'
  if (status === 'ready')      return <CheckCircle className={`${cls} text-emerald-500`} />
  if (status === 'processing') return <Loader      className={`${cls} text-amber-500 animate-spin`} />
  if (status === 'error')      return <AlertCircle className={`${cls} text-red-500`} />
  return <Clock className={`${cls} text-slate-400`} />
}

export function DocumentList({ documents: initial }: { documents: Doc[] }) {
  const router = useRouter()
  const [docs, setDocs] = useState<Doc[]>(initial)
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(e: React.MouseEvent, doc: Doc) {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm(`Delete "${doc.filename}"? This cannot be undone.`)) return

    setDeleting(doc.id)
    try {
      const res = await fetch(`/api/documents/${doc.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Delete failed')
      }
      setDocs(prev => prev.filter(d => d.id !== doc.id))
      toast.success(`"${doc.filename}" deleted`)
      router.refresh() // Re-sync server stats (monthly count, totals)
    } catch (err) {
      toast.error((err as Error).message || 'Could not delete document')
    } finally {
      setDeleting(null)
    }
  }

  if (!docs || docs.length === 0) {
    return (
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
    )
  }

  const shown = docs.slice(0, visible)
  const remaining = docs.length - visible
  const hasMore = remaining > 0

  return (
    <>
      <div className="divide-y divide-slate-100">
        {shown.map((doc) => (
          <div key={doc.id} className="group flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
            {/* Clickable area — icon + filename */}
            <Link
              href={`/dashboard/docs/${doc.id}`}
              className="flex items-center gap-4 flex-1 min-w-0"
            >
              <div className="shrink-0">{statusIcon(doc.status)}</div>
              <div className="min-w-0">
                <p className="font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                  {doc.filename}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {doc.file_size ? formatBytes(doc.file_size) : '—'} · {formatDate(doc.created_at)}
                </p>
              </div>
            </Link>

            {/* Badge + delete button — always on the right, side by side */}
            <div className="flex items-center gap-2 shrink-0">
              {statusBadge(doc.status)}
              <button
                onClick={(e) => handleDelete(e, doc)}
                disabled={deleting === doc.id}
                title="Delete document"
                className="p-1.5 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50
                           transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting === doc.id
                  ? <Loader className="h-4 w-4 animate-spin" />
                  : <Trash2 className="h-4 w-4" />
                }
              </button>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setVisible(v => v + PAGE_SIZE)}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors border-t border-slate-100"
        >
          <ChevronDown className="h-4 w-4" />
          Show {Math.min(remaining, PAGE_SIZE)} more
          <span className="text-slate-400">({remaining} remaining)</span>
        </button>
      )}
    </>
  )
}
