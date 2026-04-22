import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  // Fetch document to verify ownership and get storage path
  const { data: doc, error: fetchErr } = await supabase
    .from('documents')
    .select('id, user_id, storage_path')
    .eq('id', id)
    .single() as { data: { id: string; user_id: string; storage_path: string | null } | null; error: unknown }

  if (fetchErr || !doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }
  if (doc.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Delete file from storage if it exists
  if (doc.storage_path) {
    const { error: storageErr } = await supabase.storage
      .from('documents')
      .remove([doc.storage_path])

    if (storageErr) {
      console.error('[delete] storage remove error:', storageErr)
      // Non-fatal — proceed with DB deletion even if storage fails
    }
  }

  // Delete document row — chunks and messages cascade automatically
  const { error: deleteErr } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)

  if (deleteErr) {
    console.error('[delete] db error:', deleteErr)
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
