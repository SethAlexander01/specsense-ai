import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DocumentView } from '@/components/document-view'

export default async function DocPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  // Layout already handles auth redirect, but guard just in case
  if (!user) notFound()

  // Specs now live in documents.extracted_specs (jsonb) — no separate specs table
  const [{ data: docData }, { data: chatHistory }, { data: profileData }, { count: chunkCount }] = await Promise.all([
    supabase.from('documents').select('*').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('chat_messages').select('*').eq('document_id', id).eq('user_id', user.id).order('created_at', { ascending: true }),
    supabase.from('profiles').select('plan').eq('id', user.id).single(),
    supabase.from('doc_chunks').select('*', { count: 'exact', head: true }).eq('document_id', id),
  ])

  if (!docData) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = docData as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isPro = (profileData as any)?.plan === 'pro'

  return (
    <DocumentView
      doc={doc}
      initialMessages={chatHistory ?? []}
      isPro={isPro}
      chunkCount={chunkCount ?? 0}
    />
  )
}
