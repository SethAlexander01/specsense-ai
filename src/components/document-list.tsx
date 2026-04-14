'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatBytes, formatDate } from '@/lib/utils'
import { Upload, FileText, Clock, CheckCircle, AlertCircle, Loader, ChevronDown } from 'lucide-react'

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

export function DocumentList({ documents }: { documents: Doc[] }) {
  const [visible, setVisible] = useState(PAGE_SIZE)

  if (!documents || documents.length === 0) {
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

  const shown = documents.slice(0, visible)
  const remaining = documents.length - visible
  const hasMore = remaining > 0

  return (
    <>
      <div className="divide-y divide-slate-100">
        {shown.map((doc) => (
          <Link
            key={doc.id}
            href={`/dashboard/docs/${doc.id}`}
            className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group"
          >
            <div className="shrink-0">{statusIcon(doc.status)}</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                {doc.filename}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {doc.file_size ? formatBytes(doc.file_size) : '—'} · {formatDate(doc.created_at)}
              </p>
            </div>
            <div className="shrink-0">{statusBadge(doc.status)}</div>
          </Link>
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
