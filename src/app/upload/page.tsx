'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Upload, FileText, X, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatBytes, FREE_PLAN_LIMIT } from '@/lib/utils'
import { useEffect } from 'react'

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 50 * 1024 * 1024 // 50MB

export default function UploadPage() {
  const router = useRouter()
  const supabase = createClient()
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [userEmail, setUserEmail] = useState<string>()
  const [plan, setPlan] = useState<string>('free')
  const [canUpload, setCanUpload] = useState(true)

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserEmail(user.email)

      const { data: profile } = await supabase.from('profiles').select('plan, documents_used').eq('id', user.id).single()
      const { count } = await supabase.from('documents').select('*', { count: 'exact', head: true }).eq('user_id', user.id)

      setPlan(profile?.plan ?? 'free')
      const docCount = count ?? 0
      setCanUpload(profile?.plan === 'pro' || docCount < FREE_PLAN_LIMIT)
    }
    loadUser()
  }, [router, supabase])

  const validateFile = (f: File) => {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      toast.error('Only PDF, JPEG, PNG, and WebP files are accepted')
      return false
    }
    if (f.size > MAX_SIZE) {
      toast.error('File must be under 50MB')
      return false
    }
    return true
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && validateFile(f)) setFile(f)
  }, [])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f && validateFile(f)) setFile(f)
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Upload to Supabase Storage
      const ext = file.name.split('.').pop()
      const filePath = `${user.id}/${Date.now()}.${ext}`
      const { error: storageError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, { contentType: file.type })

      if (storageError) throw storageError

      // Create document row
      const { data: doc, error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          status: 'uploaded',
        })
        .select()
        .single()

      if (dbError) throw dbError

      toast.success('Document uploaded! Extracting specs...')

      // Trigger extraction (fire and forget, then redirect)
      fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: doc.id }),
      })

      router.push(`/documents/${doc.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar userEmail={userEmail} plan={plan} />

      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Upload document</h1>
          <p className="text-slate-500 text-sm mt-1">
            Upload an engineering PDF, drawing, or spec sheet to extract structured data.
          </p>
        </div>

        {!canUpload && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Free plan limit reached</p>
              <p className="text-sm text-amber-700 mt-0.5">
                You&apos;ve used all {FREE_PLAN_LIMIT} free documents.{' '}
                <a href="/billing" className="underline font-medium">Upgrade to Pro</a> for unlimited uploads.
              </p>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <h2 className="font-medium text-slate-900">Select file</h2>
          </CardHeader>
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
                <p className="text-sm text-slate-400 mt-2">PDF, JPEG, PNG, WebP · Max 50MB</p>
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
                <button
                  onClick={() => setFile(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <Button
                onClick={handleUpload}
                disabled={!file || !canUpload}
                loading={uploading}
                className="flex-1"
              >
                <Upload className="h-4 w-4" />
                {uploading ? 'Uploading...' : 'Upload & extract specs'}
              </Button>
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-sm font-medium text-blue-900 mb-2">What gets extracted?</p>
          <ul className="text-sm text-blue-700 space-y-1">
            {['Materials & alloys', 'Tolerances & fits', 'Thread specifications', 'Surface finishes', 'Industry standards (ISO, ASTM, DIN…)', 'Key dimensions', 'Engineering notes'].map(i => (
              <li key={i} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                {i}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  )
}
