import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { answerQuestion } from '@/lib/llm/anthropic'
import { isPro } from '@/lib/billing/plan'
import type Anthropic from '@anthropic-ai/sdk'

// ---------------------------------------------------------------------------
// In-memory rate limiter
// TODO (prod): replace with Redis sliding-window counter
// ---------------------------------------------------------------------------
interface RateLimitEntry { count: number; windowStart: number }
const rlStore = new Map<string, RateLimitEntry>()
const RL_WINDOW_MS = 60_000  // 1 minute
const RL_MAX       = 20      // requests per window per user

function checkRateLimit(userId: string): { ok: boolean; retryAfterSec: number } {
  const now = Date.now()
  const entry = rlStore.get(userId)
  if (!entry || now - entry.windowStart > RL_WINDOW_MS) {
    rlStore.set(userId, { count: 1, windowStart: now })
    return { ok: true, retryAfterSec: 0 }
  }
  if (entry.count >= RL_MAX) {
    const retryAfterSec = Math.ceil((entry.windowStart + RL_WINDOW_MS - now) / 1000)
    return { ok: false, retryAfterSec }
  }
  entry.count++
  return { ok: true, retryAfterSec: 0 }
}

// ---------------------------------------------------------------------------
// Keyword-overlap chunk scorer (MVP — no embeddings)
// ---------------------------------------------------------------------------
const STOPWORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with','by',
  'is','are','was','be','as','it','its','this','that','these','those','what',
  'which','who','how','when','where','from','not','all','if','about','into',
])

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9._+-]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOPWORDS.has(t))
}

function scoreChunk(chunkText: string, queryTokens: string[]): number {
  const lower = chunkText.toLowerCase()
  let score = 0
  for (const token of queryTokens) {
    // Exact term presence
    if (lower.includes(token)) {
      score += 2
    } else {
      // Partial match (e.g. query "tolerance" matches chunk "tolerances")
      for (const word of lower.split(/\s+/)) {
        if (word.startsWith(token) || token.startsWith(word)) {
          score += 0.5
          break
        }
      }
    }
  }
  return score
}

function selectTopChunks(
  chunks: Array<{ content: string; chunk_index: number }>,
  question: string,
  topK: number,
): string[] {
  const queryTokens = tokenize(question)
  if (queryTokens.length === 0) {
    // No meaningful query terms — fall back to first topK chunks in order
    return chunks.slice(0, topK).map(c => c.content)
  }
  const scored = chunks
    .map(c => ({ content: c.content, score: scoreChunk(c.content, queryTokens) }))
    .sort((a, b) => b.score - a.score)
  return scored.slice(0, topK).map(c => c.content)
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const MAX_QUESTION_LEN  = 1_000
const FETCH_CHUNKS_LIMIT = 200
const TOP_K_CHUNKS       = 6

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: documentId } = await params

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Plan gate — chat is Pro only
    const userIsPro = await isPro(user.id, supabase)
    if (!userIsPro) {
      return NextResponse.json(
        { error: 'Chat requires a Pro plan. Upgrade at /billing.' },
        { status: 403 }
      )
    }

    // Rate limit
    const rl = checkRateLimit(user.id)
    if (!rl.ok) {
      return NextResponse.json(
        { error: `Too many messages. Please wait ${rl.retryAfterSec}s before sending another.` },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } }
      )
    }

    // Parse + validate body
    let body: { message?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const question = (body.message ?? '').trim()
    if (!question) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 })
    }
    if (question.length > MAX_QUESTION_LEN) {
      return NextResponse.json(
        { error: `Message too long — maximum is ${MAX_QUESTION_LEN} characters.` },
        { status: 400 }
      )
    }

    // Verify doc ownership
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: doc } = await supabase
      .from('documents')
      .select('filename, extracted_specs')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single() as { data: any }

    if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })

    // Fetch up to 200 chunks + conversation history in parallel
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [{ data: allChunks }, { data: history }] = await Promise.all([
      supabase
        .from('doc_chunks')
        .select('content, chunk_index')
        .eq('document_id', documentId)
        .order('chunk_index')
        .limit(FETCH_CHUNKS_LIMIT),
      supabase
        .from('chat_messages')
        .select('role, content')
        .eq('document_id', documentId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(20),
    ]) as [{ data: any }, { data: any }]

    // Keyword-score chunks and pick top K
    const topChunks = selectTopChunks(allChunks ?? [], question, TOP_K_CHUNKS)

    const specsJson = doc.extracted_specs
      ? JSON.stringify(doc.extracted_specs, null, 2)
      : null

    const msgHistory: Anthropic.MessageParam[] = (history ?? []).map((h: any) => ({
      role: h.role as 'user' | 'assistant',
      content: h.content,
    }))

    // Persist user message before calling the model
    await supabase.from('chat_messages').insert({
      document_id: documentId,
      user_id: user.id,
      role: 'user',
      content: question,
    })

    // Call LLM
    const assistantMessage = await answerQuestion(
      topChunks,
      specsJson,
      msgHistory,
      question,
      doc.filename,
    )

    // Persist assistant message
    await supabase.from('chat_messages').insert({
      document_id: documentId,
      user_id: user.id,
      role: 'assistant',
      content: assistantMessage,
    })

    return NextResponse.json({ message: assistantMessage })
  } catch (err) {
    console.error('[doc-chat]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
