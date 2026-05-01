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
import { LearnerDashboard, Resource } from '@/types'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  declined: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
  completed: 'bg-blue-100 text-blue-700',
}

function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <div className="py-3 border-b last:border-0">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-sm">{resource.title}</p>
          <p className="text-xs text-gray-500">{resource.language_name} · {resource.resource_type}</p>
        </div>
        {resource.file_url && (
          <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" className="h-7 text-xs">Open</Button>
          </a>
        )}
      </div>
      {resource.resource_type === 'audio' && resource.file_url && (
        <audio controls src={resource.file_url} className="w-full mt-2 h-8" />
      )}
      {resource.content_text && (
        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{resource.content_text}</p>
      )}
    </div>
  )
}

export default function LearnerDashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [dashboard, setDashboard] = useState<LearnerDashboard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return }
    if (!authLoading && user?.role === 'teacher') { router.push('/teacher/dashboard'); return }
    if (!authLoading) {
      api.get('/api/learners/dashboard/')
        .then((r) => setDashboard(r.data))
        .catch(() => toast.error('Could not load dashboard.'))
        .finally(() => setLoading(false))
    }
  }, [authLoading, user])

  const handleCancel = async (id: number) => {
    try {
      await api.post(`/api/bookings/${id}/cancel/`, {})
      toast.success('Booking cancelled.')
      const { data } = await api.get('/api/learners/dashboard/')
      setDashboard(data)
    } catch { toast.error('Could not cancel booking.') }
  }

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto w-full px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {user?.full_name?.split(' ')[0]}</h1>
            <p className="text-gray-500 text-sm">Your learning dashboard</p>
          </div>
          <Link href="/marketplace">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" size="sm">Find a teacher</Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Upcoming lessons */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Upcoming lessons</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard?.upcoming_lessons.length === 0 ? (
                <div className="text-sm text-gray-400 py-2">
                  No upcoming lessons.{' '}
                  <Link href="/marketplace" className="text-emerald-600 hover:underline">Find a teacher →</Link>
                </div>
              ) : (
                dashboard?.upcoming_lessons.map((b) => (
                  <div key={b.id} className="py-3 border-b last:border-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">{b.teacher_name}</p>
                        <p className="text-xs text-gray-500">{b.language_name} · {new Date(b.start_at).toLocaleString()}</p>
                        {b.external_meeting_link && (
                          <a href={b.external_meeting_link} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:underline">Join lesson →</a>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={`text-xs border-0 ${STATUS_COLORS[b.status]}`}>{b.status}</Badge>
                        {b.status === 'confirmed' && (
                          <Button size="sm" variant="outline" className="h-7 text-xs text-red-500 border-red-200 hover:bg-red-50" onClick={() => handleCancel(b.id)}>Cancel</Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Past lessons */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Past lessons</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard?.past_lessons.length === 0 ? (
                <p className="text-sm text-gray-400">No past lessons yet.</p>
              ) : (
                dashboard?.past_lessons.map((b) => (
                  <div key={b.id} className="py-3 border-b last:border-0">
                    <p className="font-medium text-sm">{b.teacher_name}</p>
                    <p className="text-xs text-gray-500">{b.language_name} · {new Date(b.start_at).toLocaleString()}</p>
                    <Badge className={`text-xs border-0 mt-1 ${STATUS_COLORS[b.status]}`}>{b.status}</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Saved resources */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Lesson resources</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard?.saved_resources.length === 0 ? (
                <p className="text-sm text-gray-400">No resources shared with you yet.</p>
              ) : (
                dashboard?.saved_resources.map((r) => <ResourceCard key={r.id} resource={r} />)
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
