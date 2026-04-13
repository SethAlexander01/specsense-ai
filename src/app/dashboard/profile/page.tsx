'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Lock, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function ProfilePage() {
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingEmail, setSavingEmail] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [plan, setPlan] = useState('free')
  const [memberSince, setMemberSince] = useState('')

  const [newEmail, setNewEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setEmail(user.email ?? '')
      setNewEmail(user.email ?? '')
      setMemberSince(new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }))

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, plan')
        .eq('id', user.id)
        .single() as any

      setFullName(profile?.full_name ?? '')
      setPlan(profile?.plan ?? 'free')
      setLoading(false)
    }
    load()
  }, [supabase])

  async function patchProfile(body: Record<string, string>) {
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Update failed')
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await patchProfile({ full_name: fullName.trim() })
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdateEmail(e: React.FormEvent) {
    e.preventDefault()
    setSavingEmail(true)
    try {
      await patchProfile({ email: newEmail })
      setEmail(newEmail)
      toast.success('Email updated successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update email')
    } finally {
      setSavingEmail(false)
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match')
    if (newPassword.length < 8) return toast.error('Password must be at least 8 characters')
    setSavingPassword(true)
    try {
      await patchProfile({ password: newPassword })
      toast.success('Password updated')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setSavingPassword(false)
    }
  }

  const PLAN_LABELS: Record<string, { label: string; color: 'default' | 'success' | 'info' | 'warning' }> = {
    free:         { label: 'Free',         color: 'default' },
    starter:      { label: 'Starter',      color: 'info' },
    professional: { label: 'Professional', color: 'success' },
    enterprise:   { label: 'Enterprise',   color: 'warning' },
  }
  const planInfo = PLAN_LABELS[plan] ?? PLAN_LABELS.free

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account information and security settings.</p>
      </div>

      {/* Account summary */}
      <Card className="mb-6">
        <CardContent className="py-5">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <User className="h-7 w-7 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 truncate">{fullName || email}</p>
              <p className="text-sm text-slate-500 truncate">{email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge variant={planInfo.color}>{planInfo.label}</Badge>
                <span className="text-xs text-slate-400">Member since {memberSince}</span>
              </div>
            </div>
            <Link href="/billing" className="ml-auto shrink-0">
              <Button variant="outline" size="sm">
                <Shield className="h-3.5 w-3.5" />
                Manage plan
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Personal info */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-slate-500" />
            <h2 className="font-semibold text-slate-900">Personal information</h2>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="text"
                value={email}
                disabled
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-400 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 mt-1">Change your email in the section below.</p>
            </div>
            <Button type="submit" loading={saving} size="sm">
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change email */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-slate-500" />
            <h2 className="font-semibold text-slate-900">Change email</h2>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateEmail} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New email address</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="new@example.com"
              />
              <p className="text-xs text-slate-400 mt-1">A confirmation link will be sent to both addresses.</p>
            </div>
            <Button type="submit" loading={savingEmail} size="sm" variant="outline">
              Update email
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-slate-500" />
            <h2 className="font-semibold text-slate-900">Change password</h2>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm new password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button type="submit" loading={savingPassword} size="sm" variant="outline">
              Update password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
