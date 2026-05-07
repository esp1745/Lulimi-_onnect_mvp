'use client'
import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/api/auth/password-reset/', { email })
      setSent(true)
    } catch {
      toast.error('Could not send reset email. Check the address and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Link href="/" className="text-emerald-700 font-bold text-xl mb-2 block">Lulimi Connect</Link>
          <CardTitle className="text-xl">Reset your password</CardTitle>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center py-4 space-y-3">
              <div className="text-4xl">📬</div>
              <p className="font-medium">Check your inbox</p>
              <p className="text-sm text-gray-500">
                If an account exists for <span className="font-medium">{email}</span>, you'll receive a reset link shortly.
              </p>
              <Link href="/login">
                <Button variant="outline" className="mt-4">Back to log in</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-500">Enter your email and we'll send you a link to reset your password.</p>
              <div className="space-y-1">
                <Label>Email address</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loading}>
                {loading ? 'Sending…' : 'Send reset link'}
              </Button>
              <p className="text-center text-sm text-gray-500">
                Remember it?{' '}
                <Link href="/login" className="text-emerald-600 hover:underline">Log in</Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
