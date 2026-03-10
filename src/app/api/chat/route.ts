import { NextRequest, NextResponse } from 'next/server'
import type Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { answerQuestion } from '@/lib/llm/anthropic'

export async function POST(request: NextRequest) {
  try {
    const { documentId, message } = await request.json()
    if (!documentId || !message) {
      return NextResponse.json({ error: 'documentId and message are required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check Pro plan for chat
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single() as any
    if (profile?.plan !== 'pro') {
      return NextResponse.json({ error: 'Chat requires a Pro plan. Please upgrade.' }, { status: 403 })
    }

    // Fetch document + chunks in parallel
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [{ data: docRow }, { data: chunks }, { data: history }] = await Promise.all([
      supabase.from('documents').select('filename, extracted_text, extracted_specs').eq('id', documentId).eq('user_id', user.id).single(),
      supabase.from('doc_chunks').select('content, chunk_index').eq('document_id', documentId).order('chunk_index').limit(15),
      supabase.from('chat_messages').select('role, content').eq('document_id', documentId).eq('user_id', user.id).order('created_at', { ascending: true }).limit(20),
    ]) as [{ data: any }, { data: any }, { data: any }]

    if (!docRow) return NextResponse.json({ error: 'Document not found' }, { status: 404 })

    const contextChunks: string[] = chunks?.map((c: any) => c.content) ?? [docRow.extracted_text ?? '']
    const specsJson = docRow.extracted_specs ? JSON.stringify(docRow.extracted_specs, null, 2) : null

    const msgHistory: Anthropic.MessageParam[] = (history ?? []).map((h: any) => ({
      role: h.role as 'user' | 'assistant',
      content: h.content,
    }))

    // Save user message before calling the model
    await supabase.from('chat_messages').insert({
      document_id: documentId,
      user_id: user.id,
      role: 'user',
      content: message,
    })

    const assistantMessage = await answerQuestion(contextChunks, specsJson, msgHistory, message, docRow.filename)

    // Save assistant reply
    await supabase.from('chat_messages').insert({
      document_id: documentId,
      user_id: user.id,
      role: 'assistant',
      content: assistantMessage,
    })

    return NextResponse.json({ message: assistantMessage })
  } catch (err) {
    console.error('Chat error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
