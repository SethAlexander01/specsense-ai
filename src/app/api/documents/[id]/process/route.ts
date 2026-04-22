import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractTextFromPDF, chunkText } from '@/lib/pdf-extract'

export const maxDuration = 60

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: documentId } = await params

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify ownership
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: doc } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single() as { data: any }

    if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })

    // Mark as processing
    await supabase.from('documents').update({ status: 'processing' }).eq('id', documentId)

    // Download from Supabase Storage
    const { data: fileData, error: dlError } = await supabase.storage
      .from('documents')
      .download(doc.storage_path)

    if (dlError || !fileData) {
      await supabase.from('documents').update({ status: 'error' }).eq('id', documentId)
      return NextResponse.json({ error: 'Failed to download file from storage' }, { status: 500 })
    }

    const buffer = Buffer.from(await fileData.arrayBuffer())

    // Extract text
    let extractedText = ''
    let pageCount: number = doc.page_count ?? 0

    if (doc.mime_type === 'application/pdf') {
      try {
        const result = await extractTextFromPDF(buffer)
        extractedText = result.text
        pageCount = result.pages
      } catch {
        extractedText = '[PDF text extraction failed — file may be scanned or image-based]'
      }
    } else {
      extractedText = '[Image file — text extraction not supported for images]'
    }

    // Save extracted_text + page_count
    await supabase.from('documents').update({
      extracted_text: extractedText.slice(0, 50_000),
      page_count: pageCount,
    }).eq('id', documentId)

    // Chunk text (~1000 chars, 150-char overlap)
    const chunks = chunkText(extractedText, 1000, 150)

    // Replace any existing chunks
    await supabase.from('doc_chunks').delete().eq('document_id', documentId)
    if (chunks.length > 0) {
      await supabase.from('doc_chunks').insert(
        chunks.map((content, i) => ({ document_id: documentId, chunk_index: i, content }))
      )
    }

    // Mark ready
    await supabase.from('documents').update({ status: 'ready' }).eq('id', documentId)

    return NextResponse.json({
      success: true,
      chunkCount: chunks.length,
      pageCount,
      textLength: extractedText.length,
    })
  } catch (err) {
    console.error('[process]', err)
    try {
      const supabase = await createClient()
      await supabase.from('documents').update({ status: 'error' }).eq('id', documentId)
    } catch { /* best-effort */ }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
