'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Upload, FileText, X, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatBytes } from '@/lib/utils'

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 50 * 1024 * 1024

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const validateFile = (f: File) => {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      toast.error('Only PDF, JPEG, PNG, and WebP files are accepted')
      return false
    }
    if (f.size > MAX_SIZE) {
      toast.error('File must be under 50 MB')
      return false
    }
    return true
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && validateFile(f)) setFile(f)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f && validateFile(f)) setFile(f)
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // XHR so we can track upload progress bytes
      const documentId = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', '/api/upload')

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
        })

        xhr.addEventListener('load', () => {
          try {
            const data = JSON.parse(xhr.responseText)
            if (xhr.status >= 400) reject(new Error(data.error ?? 'Upload failed'))
            else resolve(data.documentId)
          } catch {
            reject(new Error('Invalid server response'))
          }
        })

        xhr.addEventListener('error', () => reject(new Error('Network error — please try again')))
        xhr.send(formData)
      })

      toast.success('Uploaded! Extracting specs…')

      // Fire-and-forget: kick off server-side extraction
      fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId }),
      })

      router.push(`/dashboard/docs/${documentId}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Upload document</h1>
        <p className="text-slate-500 text-sm mt-1">Upload a PDF, drawing, or spec sheet to extract structured data.</p>
      </div>

      <Card>
        <CardHeader><h2 className="font-medium text-slate-900">Select file</h2></CardHeader>
        <CardContent>
          {!file ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
                dragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400'
              }`}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <Upload className="h-10 w-10 text-slate-400 mx-auto mb-4" />
              <p className="font-medium text-slate-700">Drop your file here, or click to browse</p>
              <p className="text-sm text-slate-400 mt-2">PDF, JPEG, PNG, WebP · Max 50 MB</p>
              <input
                id="file-input"
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={onFileChange}
              />
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <FileText className="h-10 w-10 text-blue-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">{file.name}</p>
                <p className="text-sm text-slate-400">{formatBytes(file.size)}</p>
              </div>
              {!uploading && (
                <button
                  onClick={() => setFile(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}

          {/* Upload progress */}
          {uploading && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>{progress < 100 ? 'Uploading…' : 'Processing…'}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              loading={uploading}
              className="flex-1"
            >
              <Upload className="h-4 w-4" />
              {uploading ? 'Uploading…' : 'Upload & extract specs'}
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard')} disabled={uploading}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
        <p className="text-sm font-medium text-blue-900 mb-2">What gets extracted?</p>
        <ul className="text-sm text-blue-700 space-y-1">
          {[
            'Materials & alloys',
            'Tolerances & fits',
            'Thread specifications',
            'Surface finishes',
            'Industry standards (ISO, ASTM, DIN…)',
            'Key dimensions',
            'Engineering notes',
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex items-start gap-2 text-xs text-slate-400">
        <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <span>
          Free plan: up to 3 documents.{' '}
          <a href="/billing" className="underline text-slate-500 hover:text-slate-700">Upgrade to Pro</a>{' '}
          for unlimited uploads.
        </span>
      </div>
    </div>
  )
}
