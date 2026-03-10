import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractTextFromPDF, chunkText } from '@/lib/pdf-extract'
import { extractSpecs } from '@/lib/llm/anthropic'

export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json()
    if (!documentId) return NextResponse.json({ error: 'documentId required' }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Fetch document — user_id enforces ownership
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: doc } = await supabase
      .from('documents').select('*').eq('id', documentId).eq('user_id', user.id).single() as { data: any }

    if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })

    await supabase.from('documents').update({ status: 'processing' }).eq('id', documentId)

    // Download from Storage using storage_path
    const { data: fileData, error: dlError } = await supabase.storage
      .from('documents')
      .download(doc.storage_path)

    if (dlError || !fileData) {
      await supabase.from('documents').update({ status: 'error' }).eq('id', documentId)
      return NextResponse.json({ error: 'Failed to download file' }, { status: 500 })
    }

    const buffer = Buffer.from(await fileData.arrayBuffer())

    let rawText = ''
    let pageCount = 0
    if (doc.mime_type === 'application/pdf') {
      try {
        const extracted = await extractTextFromPDF(buffer)
        rawText = extracted.text
        pageCount = extracted.pages
      } catch {
        rawText = '[PDF text extraction failed — file may be scanned/image-based]'
      }
    } else {
      rawText = '[Image file — text extraction not available]'
    }

    // Replace old chunks with a fresh set (doc_chunks table)
    await supabase.from('doc_chunks').delete().eq('document_id', documentId)
    const chunks = chunkText(rawText)
    if (chunks.length > 0) {
      await supabase.from('doc_chunks').insert(
        chunks.map((content, i) => ({ document_id: documentId, chunk_index: i, content }))
      )
    }

    // Persist raw text in documents.extracted_text
    await supabase.from('documents').update({
      extracted_text: rawText.slice(0, 50_000),
      page_count: pageCount,
    }).eq('id', documentId)

    // Claude — extract structured specs via shared LLM layer
    let parsedSpecs
    try {
      parsedSpecs = await extractSpecs(rawText)
    } catch {
      parsedSpecs = { material: null, coating_finish: null, surface_finish: null,
        tolerance_general: null, heat_treatment: null, threads: [], standards: [],
        critical_dimensions: [], notes: ['Spec extraction could not be parsed.'], confidence: 0 }
    }

    // Store as documents.extracted_specs (jsonb) — no separate specs table
    await supabase.from('documents').update({
      extracted_specs: parsedSpecs,
      status: 'ready',
    }).eq('id', documentId)

    return NextResponse.json({ success: true, specs: parsedSpecs })
  } catch (err) {
    console.error('[extract]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
