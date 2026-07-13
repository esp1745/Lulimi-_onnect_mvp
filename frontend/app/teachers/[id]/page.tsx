'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Navbar from '@/components/Navbar'
import PhoneNumberInput from '@/components/PhoneNumberInput'
import api from '@/lib/api'
import { Teacher, Availability } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { buildWhatsAppLink } from '@/lib/whatsapp'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function TeacherProfilePage() {
  const { id } = useParams()
  const { user } = useAuth()
  const router = useRouter()
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [availability, setAvailability] = useState<Availability[]>([])
  const [booking, setBooking] = useState({ start_at: '', end_at: '', language_name: '', learner_whatsapp_number: '', timezone_snapshot: Intl.DateTimeFormat().resolvedOptions().timeZone })
  // raw datetime-local string values (YYYY-MM-DDTHH:MM)
  const [startRaw, setStartRaw] = useState('')
  const [endRaw, setEndRaw] = useState('')
  const [loading, setLoading] = useState(true)
  const [booking_loading, setBookingLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get(`/api/teachers/${id}/public/`),
      api.get(`/api/teachers/${id}/availability/?timezone=${Intl.DateTimeFormat().resolvedOptions().timeZone}`),
    ]).then(([t, a]) => {
      setTeacher(t.data)
      setAvailability(a.data)
    }).catch(() => toast.error('Could not load teacher profile.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { router.push('/login'); return }
    if (user.role !== 'learner') { toast.error('Only learners can book lessons.'); return }
    setBookingLoading(true)
    try {
      const { data: availabilityCheck } = await api.get(`/api/teachers/${id}/availability/check/`, {
        params: { start: booking.start_at, end: booking.end_at },
      })
      if (!availabilityCheck.available) {
        toast.error('This teacher already has a lesson booked during that time. Please pick another slot.')
        return
      }
      await api.post('/api/bookings/', { teacher: Number(id), ...booking })
      toast.success('Booking request sent! The teacher will confirm shortly.')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Could not send booking request.')
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>
  if (!teacher) return <div className="min-h-screen flex items-center justify-center text-gray-400">Teacher not found.</div>

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="max-w-4xl mx-auto w-full px-6 py-10 grid md:grid-cols-3 gap-8">
        {/* Left: Profile */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex gap-5 items-start">
            <Avatar className="h-20 w-20 shrink-0">
              <AvatarImage src={teacher.profile_photo_url} />
              <AvatarFallback className="bg-emerald-100 text-emerald-700 text-2xl font-bold">
                {teacher.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{teacher.full_name}</h1>
              <p className="text-gray-500">{teacher.country}</p>
              <p className="text-gray-700 font-medium mt-1">{teacher.headline}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {teacher.languages.map((l) => (
                  <Badge key={l.id} className="bg-emerald-50 text-emerald-700 border-emerald-200">{l.language_name} · {l.proficiency_type}</Badge>
                ))}
                <Badge variant="outline" className="capitalize">{teacher.lesson_format?.replace('_', ' ')}</Badge>
              </div>
              {teacher.whatsapp_number && (
                <a
                  href={buildWhatsAppLink(teacher.whatsapp_number, `Hi ${teacher.full_name}, I found your profile on Lulimi Connect and would like to ask about lessons.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:underline mt-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Message on WhatsApp
                </a>
              )}
            </div>
          </div>

          {teacher.intro_audio_url && (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Audio introduction</p>
              <audio controls src={teacher.intro_audio_url} className="w-full" />
            </div>
          )}

          <div>
            <h2 className="font-semibold text-lg mb-2">About</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{teacher.bio}</p>
          </div>

          {availability.length > 0 && (
            <div>
              <h2 className="font-semibold text-lg mb-3">Availability <span className="text-sm font-normal text-gray-400">(your timezone)</span></h2>
              <div className="space-y-2">
                {availability.filter(a => a.is_active).map((slot) => (
                  <div key={slot.id} className="flex items-center gap-3 text-sm">
                    <span className="w-24 font-medium text-gray-700">
                      {DAYS[slot.converted_day_of_week ?? slot.day_of_week]}
                    </span>
                    <span className="text-gray-500">
                      {slot.converted_start_time ?? slot.start_time} – {slot.converted_end_time ?? slot.end_time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Book */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-base">Book a lesson</CardTitle>
            </CardHeader>
            <CardContent>
              {user?.role === 'teacher' ? (
                <p className="text-sm text-gray-400">Switch to a learner account to book lessons.</p>
              ) : (
                <form onSubmit={handleBook} className="space-y-3">
                  <div className="space-y-1">
                    <Label>Language</Label>
                    <Input
                      value={booking.language_name}
                      onChange={(e) => setBooking((b) => ({ ...b, language_name: e.target.value }))}
                      placeholder="e.g. Kinyarwanda"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Start time</Label>
                    <Input
                      type="datetime-local"
                      value={startRaw}
                      onChange={(e) => {
                        setStartRaw(e.target.value)
                        setBooking((b) => ({ ...b, start_at: e.target.value ? new Date(e.target.value).toISOString() : '' }))
                      }}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>End time</Label>
                    <Input
                      type="datetime-local"
                      value={endRaw}
                      onChange={(e) => {
                        setEndRaw(e.target.value)
                        setBooking((b) => ({ ...b, end_at: e.target.value ? new Date(e.target.value).toISOString() : '' }))
                      }}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Your WhatsApp number <span className="text-gray-400 font-normal">(optional)</span></Label>
                    <PhoneNumberInput
                      value={booking.learner_whatsapp_number}
                      onChange={(v) => setBooking((b) => ({ ...b, learner_whatsapp_number: v }))}
                    />
                    <p className="text-xs text-gray-400">Share this if you&apos;d like to move the conversation to WhatsApp.</p>
                  </div>
                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={booking_loading}>
                    {booking_loading ? 'Sending…' : user ? 'Request lesson' : 'Log in to book'}
                  </Button>
                  <p className="text-xs text-gray-400 text-center">The teacher will confirm your request.</p>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
