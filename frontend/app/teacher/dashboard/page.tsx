'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Navbar from '@/components/Navbar'
import api from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { TeacherDashboard, Booking } from '@/types'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  declined: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
  completed: 'bg-blue-100 text-blue-700',
}

function BookingCard({ booking, onConfirm, onDecline }: { booking: Booking; onConfirm?: () => void; onDecline?: () => void }) {
  return (
    <div className="flex items-start justify-between py-3 border-b last:border-0 gap-3">
      <div className="min-w-0">
        <p className="font-medium text-sm">{booking.learner_name}</p>
        <p className="text-xs text-gray-500">{booking.language_name} · {new Date(booking.start_at).toLocaleString()}</p>
        {booking.external_meeting_link && (
          <a href={booking.external_meeting_link} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:underline">Join lesson →</a>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge className={`text-xs border-0 ${STATUS_COLORS[booking.status]}`}>{booking.status}</Badge>
        {onConfirm && <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-xs" onClick={onConfirm}>Confirm</Button>}
        {onDecline && <Button size="sm" variant="outline" className="h-7 text-xs text-red-500 border-red-200 hover:bg-red-50" onClick={onDecline}>Decline</Button>}
      </div>
    </div>
  )
}

export default function TeacherDashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [dashboard, setDashboard] = useState<TeacherDashboard | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboard = async () => {
    try {
      const { data } = await api.get('/api/teachers/dashboard/')
      setDashboard(data)
    } catch {
      toast.error('Could not load dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return }
    if (!authLoading && user?.role !== 'teacher') { router.push('/learner/dashboard'); return }
    if (!authLoading) fetchDashboard()
  }, [authLoading, user])

  const handleConfirm = async (id: number) => {
    try {
      await api.post(`/api/bookings/${id}/confirm/`, {})
      toast.success('Booking confirmed.')
      fetchDashboard()
    } catch { toast.error('Failed to confirm.') }
  }

  const handleDecline = async (id: number) => {
    try {
      await api.post(`/api/bookings/${id}/decline/`, {})
      toast.success('Booking declined.')
      fetchDashboard()
    } catch { toast.error('Failed to decline.') }
  }

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto w-full px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {user?.full_name?.split(' ')[0]}</h1>
            <p className="text-gray-500 text-sm">Your teaching dashboard</p>
          </div>
          <div className="flex gap-3">
            <Link href="/teacher/profile"><Button variant="outline" size="sm">Edit profile</Button></Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Upcoming lessons', value: dashboard?.upcoming_lessons.length ?? 0 },
            { label: 'Pending requests', value: dashboard?.pending_requests_count ?? 0 },
            { label: 'Total students', value: dashboard?.total_students ?? 0 },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-emerald-700">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Pending requests */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Booking requests</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard?.pending_requests.length === 0 ? (
                <p className="text-sm text-gray-400">No pending requests.</p>
              ) : (
                dashboard?.pending_requests.map((b) => (
                  <BookingCard key={b.id} booking={b} onConfirm={() => handleConfirm(b.id)} onDecline={() => handleDecline(b.id)} />
                ))
              )}
            </CardContent>
          </Card>

          {/* Upcoming lessons */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Upcoming lessons</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard?.upcoming_lessons.length === 0 ? (
                <p className="text-sm text-gray-400">No upcoming lessons.</p>
              ) : (
                dashboard?.upcoming_lessons.map((b) => (
                  <BookingCard key={b.id} booking={b} />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
