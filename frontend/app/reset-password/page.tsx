'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/lib/api'

function ResetForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const uid = searchParams.get('uid') || ''
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { toast.error('Passwords do not match.'); return }
    if (password.length < 8) { toast.error('Password must be at least 8 characters.'); return }
    setLoading(true)
    try {
      await api.post('/api/auth/password-reset/confirm/', { uid, token, new_password: password })
      toast.success('Password reset! You can now log in.')
      router.push('/login')
    } catch {
      toast.error('Reset link is invalid or has expired.')
    } finally {
      setLoading(false)
    }
  }

  if (!uid || !token) {
    return (
      <div className="text-center py-4 space-y-3">
        <p className="text-gray-500 text-sm">Invalid reset link. Request a new one.</p>
        <Link href="/forgot-password"><Button variant="outline">Request reset</Button></Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label>New password</Label>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" required />
      </div>
      <div className="space-y-1">
        <Label>Confirm password</Label>
        <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" required />
      </div>
      <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loading}>
        {loading ? 'Saving…' : 'Set new password'}
      </Button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Link href="/" className="text-emerald-700 font-bold text-xl mb-2 block">Lulimi Connect</Link>
          <CardTitle className="text-xl">Set new password</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<p className="text-sm text-gray-400">Loading…</p>}>
            <ResetForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
