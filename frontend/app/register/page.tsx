'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import GoogleSignInButton from '@/components/GoogleSignInButton'
import api from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { User } from '@/types'
import Cookies from 'js-cookie'

function RegisterForm() {
  const { login } = useAuth()
  const router = useRouter()
  const params = useSearchParams()
  const defaultRole = params.get('role') === 'teacher' ? 'teacher' : 'learner'

  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: defaultRole })
  const [loading, setLoading] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/register/', form)
      Cookies.set('access_token', data.access, { expires: 1 })
      Cookies.set('refresh_token', data.refresh, { expires: 7 })
      toast.success('Account created!')
      if (data.user.role === 'teacher') router.push('/teacher/dashboard')
      else router.push('/learner/dashboard')
    } catch (err: any) {
      const msg = err?.response?.data
      toast.error(typeof msg === 'object' ? Object.values(msg).flat().join(' ') : 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = (user: User) => {
    toast.success('Account ready!')
    if (user.role === 'teacher') router.push('/teacher/dashboard')
    else router.push('/learner/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="text-xl font-bold text-emerald-700 mb-2 block">Lulimi Connect</Link>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Join as a teacher or learner</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label>I am a</Label>
              <div className="grid grid-cols-2 gap-2">
                {['learner', 'teacher'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, role: r }))}
                    className={`py-2 rounded-lg border text-sm font-medium transition-colors capitalize ${
                      form.role === r
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-gray-200 text-gray-600 hover:border-emerald-300'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" value={form.full_name} onChange={set('full_name')} required placeholder="Your full name" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={set('email')} required placeholder="you@example.com" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={form.password} onChange={set('password')} required placeholder="At least 8 characters" minLength={8} />
            </div>
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
          <div className="flex items-center gap-3 my-4">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-xs text-gray-400">or</span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>
          <GoogleSignInButton role={form.role as 'teacher' | 'learner'} onSuccess={handleGoogleSuccess} />
          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-emerald-600 hover:underline font-medium">Log in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
