import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractSpecs } from '@/lib/llm/anthropic'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: documentId } = await params

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify ownership and fetch extracted_text
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: doc } = await supabase
      .from('documents')
      .select('extracted_text, status')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single() as { data: any }

    if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })

    // Build text: prefer extracted_text, fall back to concatenating stored chunks
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
      return NextResponse.json(
        { error: 'No text available. Process the document first.' },
        { status: 400 }
      )
    }

    // Mark processing so the UI shows the spinner
    await supabase.from('documents').update({ status: 'processing' }).eq('id', documentId)

    let specs
    try {
      specs = await extractSpecs(text)
    } catch (llmErr) {
      // Restore previous status on LLM/parse failure
      await supabase.from('documents')
        .update({ status: doc.status ?? 'ready' })
        .eq('id', documentId)
      console.error('[extract-specs] LLM error:', llmErr)
      return NextResponse.json({ error: 'Spec extraction failed. The model may not have returned valid JSON.' }, { status: 500 })
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
