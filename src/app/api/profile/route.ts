import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// PATCH /api/profile
// Body: { full_name? } | { email } | { password }
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const admin = getAdminClient()

    // --- Update full name (auth.users metadata + profiles table) ---
    if ('full_name' in body) {
      const fullName = body.full_name?.trim() ?? ''

      // Update auth.users user_metadata so it shows in the Supabase Users tab
      const { error: authError } = await admin.auth.admin.updateUserById(user.id, {
        user_metadata: { full_name: fullName },
      })
      if (authError) throw authError

      // Update profiles table
      const { error: profileError } = await admin
        .from('profiles')
        .update({ full_name: fullName, updated_at: new Date().toISOString() })
        .eq('id', user.id)
      if (profileError) throw profileError

      return NextResponse.json({ success: true })
    }

    // --- Update email (auth.users + profiles) ---
    if ('email' in body) {
      const newEmail: string = body.email?.trim()
      if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
        return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
      }
      if (newEmail === user.email) {
        return NextResponse.json({ error: 'That is already your current email' }, { status: 400 })
      }

      // email_confirm: true skips the confirmation email and updates auth.users immediately
      const { error: authError } = await admin.auth.admin.updateUserById(user.id, {
        email: newEmail,
        email_confirm: true,
      })
      if (authError) throw authError

      // Keep profiles table in sync
      const { error: profileError } = await admin
        .from('profiles')
        .update({ email: newEmail, updated_at: new Date().toISOString() })
        .eq('id', user.id)
      if (profileError) throw profileError

      return NextResponse.json({ success: true })
    }

    // --- Update password (auth.users only) ---
    if ('password' in body) {
      const newPassword: string = body.password
      if (!newPassword || newPassword.length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
      }

      const { error } = await admin.auth.admin.updateUserById(user.id, { password: newPassword })
      if (error) throw error

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 })
  } catch (err) {
    console.error('[profile PATCH]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Update failed' }, { status: 500 })
  }
}
