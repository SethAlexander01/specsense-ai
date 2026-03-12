import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractSpecs, extractSpecsFromFile } from '@/lib/llm/anthropic'

const TEXT_EXTRACTION_FAILED_PREFIXES = [
  '[PDF text extraction failed',
  '[Image file',
]

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: documentId } = await params

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: doc } = await supabase
      .from('documents')
      .select('extracted_text, status, storage_path, mime_type')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single() as { data: any }

    if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })

    const textFailed = !doc.extracted_text ||
      TEXT_EXTRACTION_FAILED_PREFIXES.some((p: string) => doc.extracted_text.startsWith(p))

    // Mark processing so the UI shows the spinner
    await supabase.from('documents').update({ status: 'processing' }).eq('id', documentId)

    let specs
    try {
      if (textFailed && doc.storage_path) {
        // Scanned/image PDF — send raw file to Claude vision
        const { data: fileData, error: dlError } = await supabase.storage
          .from('documents')
          .download(doc.storage_path)
        if (dlError || !fileData) throw new Error('Failed to download file for vision extraction')
        const buffer = Buffer.from(await fileData.arrayBuffer())
        specs = await extractSpecsFromFile(buffer, doc.mime_type ?? 'application/pdf')
      } else {
        // Text-based PDF — use extracted text
        let text: string = doc.extracted_text ?? ''
        if (!text) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: chunks } = await supabase
            .from('doc_chunks')
            .select('content, chunk_index')
            .eq('document_id', documentId)
            .order('chunk_index')
            .limit(30) as { data: any }
          text = (chunks ?? []).map((c: any) => c.content).join('\n\n')
        }
        if (!text.trim()) {
          await supabase.from('documents').update({ status: doc.status ?? 'ready' }).eq('id', documentId)
          return NextResponse.json({ error: 'No text available. Process the document first.' }, { status: 400 })
        }
        specs = await extractSpecs(text)
      }
    } catch (llmErr) {
      await supabase.from('documents')
        .update({ status: doc.status ?? 'ready' })
        .eq('id', documentId)
      console.error('[extract-specs] LLM error:', llmErr)
      return NextResponse.json({ error: 'Spec extraction failed. Check Vercel logs for details.' }, { status: 500 })
    }

    // Persist and mark ready
    await supabase.from('documents').update({
      extracted_specs: specs,
      status: 'ready',
    }).eq('id', documentId)

    return NextResponse.json({ success: true, specs })
  } catch (err) {
    console.error('[extract-specs]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
