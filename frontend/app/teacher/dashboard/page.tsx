'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Navbar from '@/components/Navbar'
import AIAssistant from '@/components/AIAssistant'
import api from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { buildGoogleCalendarUrl } from '@/lib/googleCalendar'
import { buildWhatsAppLink } from '@/lib/whatsapp'
import { TeacherDashboard, Booking } from '@/types'

interface Student {
  id: number
  full_name: string
  email: string
  country: string
  lesson_count: number
  last_lesson: string
  language_name: string
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  declined: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
  completed: 'bg-blue-100 text-blue-700',
}

function BookingCard({ booking, onConfirm, onDecline }: { booking: Booking; onConfirm?: (link: string) => void; onDecline?: () => void }) {
  const [meetingLink, setMeetingLink] = useState('')
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="py-3 border-b last:border-0 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-sm">{booking.learner_name}</p>
          <p className="text-xs text-gray-500">{booking.language_name} · {new Date(booking.start_at).toLocaleString()}</p>
          <div className="flex items-center gap-3">
            {booking.external_meeting_link && (
              <a href={booking.external_meeting_link} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:underline">Join lesson →</a>
            )}
            {booking.status === 'confirmed' && (
              <a href={buildGoogleCalendarUrl(booking)} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:underline">+ Add to Google Calendar</a>
            )}
            {booking.learner_whatsapp_number && ['pending', 'confirmed'].includes(booking.status) && (
              <a
                href={buildWhatsAppLink(booking.learner_whatsapp_number, `Hi ${booking.learner_name}, this is regarding your ${booking.language_name} lesson request on Lulimi Connect.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:underline"
              >
                Continue on WhatsApp
              </a>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge className={`text-xs border-0 ${STATUS_COLORS[booking.status]}`}>{booking.status}</Badge>
          {onDecline && <Button size="sm" variant="outline" className="h-7 text-xs text-red-500 border-red-200 hover:bg-red-50" onClick={onDecline}>Decline</Button>}
        </div>
      </div>
      {onConfirm && (
        confirming ? (
          <div className="flex gap-2 items-center">
            <Input
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="Zoom / Google Meet / WhatsApp link (optional)"
              className="text-xs h-8"
            />
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs shrink-0" onClick={() => onConfirm(meetingLink)}>
              Confirm
            </Button>
            <Button size="sm" variant="ghost" className="h-8 text-xs shrink-0" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-xs" onClick={() => setConfirming(true)}>
            Confirm booking
          </Button>
        )
      )}
    </div>
  )
}

function NotesCard({ booking, onSaved }: { booking: Booking; onSaved: () => void }) {
  const [notes, setNotes] = useState(booking.teacher_notes || '')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.patch(`/api/bookings/${booking.id}/notes/`, { teacher_notes: notes })
      toast.success('Notes saved.')
      setEditing(false)
      onSaved()
    } catch { toast.error('Could not save notes.') }
    finally { setSaving(false) }
  }

  return (
    <div className="py-3 border-b last:border-0 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-sm">{booking.learner_name}</p>
          <p className="text-xs text-gray-500">{booking.language_name} · {new Date(booking.start_at).toLocaleString()}</p>
        </div>
        <Badge className="text-xs border-0 bg-blue-100 text-blue-700 shrink-0">completed</Badge>
      </div>
      {editing ? (
        <div className="space-y-2">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add lesson notes, progress observations, homework…" rows={3} className="text-xs" />
          <div className="flex gap-2">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-xs" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setEditing(false); setNotes(booking.teacher_notes || '') }}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2">
          {notes ? <p className="text-xs text-gray-600 flex-1">{notes}</p> : <p className="text-xs text-gray-400 flex-1 italic">No notes yet.</p>}
          <Button size="sm" variant="ghost" className="h-6 text-xs text-gray-400 hover:text-gray-700 shrink-0" onClick={() => setEditing(true)}>
            {notes ? 'Edit' : '+ Add notes'}
          </Button>
        </div>
      )}
    </div>
  )
}

export default function TeacherDashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [dashboard, setDashboard] = useState<TeacherDashboard | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDashboard = async () => {
    try {
      const [{ data }, { data: studentData }] = await Promise.all([
        api.get('/api/teachers/dashboard/'),
        api.get('/api/teachers/students/'),
      ])
      setDashboard(data)
      setStudents(studentData)
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

  const handleConfirm = async (id: number, meetingLink: string) => {
    try {
      await api.post(`/api/bookings/${id}/confirm/`, { external_meeting_link: meetingLink })
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
          <div className="flex gap-3 flex-wrap">
            <Link href="/teacher/profile"><Button variant="outline" size="sm">Edit profile</Button></Link>
            <Link href="/teacher/availability"><Button variant="outline" size="sm">Availability</Button></Link>
            <Link href="/teacher/resources"><Button variant="outline" size="sm">Resources</Button></Link>
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
                  <BookingCard key={b.id} booking={b} onConfirm={(link) => handleConfirm(b.id, link)} onDecline={() => handleDecline(b.id)} />
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

          {/* Recent completed lessons with notes */}
          {(dashboard?.recent_completions?.length ?? 0) > 0 && (
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Recent completed lessons</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboard!.recent_completions.map((b) => (
                  <NotesCard key={b.id} booking={b} onSaved={fetchDashboard} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Students */}
          {students.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">My students ({students.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {students.map((s) => (
                    <div key={s.id} className="flex items-center justify-between px-5 py-3 gap-4">
                      <div className="min-w-0">
                        <p className="font-medium text-sm">{s.full_name}</p>
                        <p className="text-xs text-gray-500">{s.country} · {s.language_name}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 text-right">
                        <div>
                          <p className="text-xs text-gray-500">{s.lesson_count} lesson{s.lesson_count !== 1 ? 's' : ''}</p>
                          <p className="text-xs text-gray-400">Last: {new Date(s.last_lesson).toLocaleDateString()}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">{s.email}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AIAssistant
        role="teacher"
        onSaveAsResource={(content) => {
          router.push('/teacher/resources?draft=' + encodeURIComponent(content.slice(0, 200)))
        }}
      />
    </div>
  )
}
