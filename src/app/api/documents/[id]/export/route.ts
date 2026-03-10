import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateSpecReport } from '@/lib/report-generator'
import { isPro } from '@/lib/billing/plan'
import type { Document } from '@/types/database'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: documentId } = await params

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Enforce Pro plan
    const userIsPro = await isPro(user.id, supabase)
    if (!userIsPro) {
      return NextResponse.json(
        { error: 'PDF export requires a Pro plan. Upgrade at /billing.' },
        { status: 403 }
      )
    }

    // Verify ownership + fetch document
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: docData } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single() as { data: any }

    if (!docData) return NextResponse.json({ error: 'Document not found' }, { status: 404 })

    const doc = docData as Document
    if (!doc.extracted_specs) {
      return NextResponse.json(
        { error: 'No specs extracted yet. Run "Extract specs" first.' },
        { status: 400 }
      )
    }

    const pdfBuffer = await generateSpecReport(doc, user.email ?? 'Unknown')

    const slug = doc.filename.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_')
    return new NextResponse(pdfBuffer.buffer as ArrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="spec-report-${slug}.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('[export]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
