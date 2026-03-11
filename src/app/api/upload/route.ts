import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkDocLimit } from '@/lib/billing/plan'

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 50 * 1024 * 1024 // 50 MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    if (!ACCEPTED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only PDF, JPEG, PNG, and WebP files are accepted' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File must be under 50 MB' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Enforce per-plan document limit
    const { allowed, used, limit } = await checkDocLimit(user.id, supabase)
    if (!allowed) {
      return NextResponse.json(
        { error: `Plan limit of ${limit} documents/month reached (${used} used). Upgrade your plan for a higher limit.` },
        { status: 403 }
      )
    }

    // 1. Create document row to obtain a stable UUID
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'pdf'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: docRow, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        filename: file.name,
        storage_path: `${user.id}/pending/original.${ext}`, // placeholder, updated below
        file_size: file.size,
        mime_type: file.type,
        status: 'uploaded',
      })
      .select('id')
      .single() as any
    if (dbError) throw dbError

    const docId = docRow.id as string

    // 2. Upload file bytes to storage at userId/documentId/original.ext
    const storagePath = `${user.id}/${docId}/original.${ext}`
    const arrayBuffer = await file.arrayBuffer()
    const { error: storageError } = await supabase.storage
      .from('documents')
      .upload(storagePath, arrayBuffer, { contentType: file.type })
    if (storageError) throw storageError

    // 3. Patch document row with the real storage path
    await supabase.from('documents').update({ storage_path: storagePath }).eq('id', docId)

    return NextResponse.json({ documentId: docId })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
