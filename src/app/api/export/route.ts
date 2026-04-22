import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateSpecReport } from '@/lib/report-generator'
import type { Document } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json()
    if (!documentId) return NextResponse.json({ error: 'documentId required' }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check Pro plan
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profileData } = await supabase.from('profiles').select('plan').eq('id', user.id).single() as any
    if (profileData?.plan !== 'pro') {
      return NextResponse.json({ error: 'PDF export requires a Pro plan.' }, { status: 403 })
    }

    // Documents now carry extracted_specs directly (no separate specs table)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: docData } = await supabase
      .from('documents').select('*').eq('id', documentId).eq('user_id', user.id).is('deleted_at', null).single() as { data: any }

    const doc = docData as Document | null
    if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })

    const pdfBuffer = await generateSpecReport(doc, user.email ?? 'Unknown')

    return new NextResponse(pdfBuffer.buffer as ArrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="spec-report-${doc.filename.replace(/\.[^.]+$/, '')}.pdf"`,
      },
    })
  } catch (err) {
    console.error('Export error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
