import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  // User client — for auth only
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  // Service client — bypasses RLS for writes (ownership verified below in code)
  const admin = await createServiceClient()

  // Fetch document to verify ownership and get storage path
  const { data: doc, error: fetchErr } = await admin
    .from('documents')
    .select('id, user_id, storage_path')
    .eq('id', id)
    .is('deleted_at', null)
    .single() as { data: { id: string; user_id: string; storage_path: string | null } | null; error: unknown }

  if (fetchErr || !doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }
  if (doc.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Delete file from storage (free up space)
  if (doc.storage_path) {
    const { error: storageErr } = await admin.storage
      .from('documents')
      .remove([doc.storage_path])
    if (storageErr) {
      console.error('[delete] storage remove error:', storageErr)
      // Non-fatal — proceed with soft-delete even if storage fails
    }
  }

  // Delete chunks and messages — cascade won't fire on a soft-delete UPDATE
  await admin.from('doc_chunks').delete().eq('document_id', id)
  await admin.from('chat_messages').delete().eq('document_id', id)

  // Soft-delete the document row so it still counts toward monthly upload limit
  const { error: deleteErr } = await admin
    .from('documents')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (deleteErr) {
    console.error('[delete] db error:', deleteErr)
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
