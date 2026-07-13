'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Navbar from '@/components/Navbar'
import PhoneNumberInput from '@/components/PhoneNumberInput'
import GoogleCalendarCard from '@/components/GoogleCalendarCard'
import api from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { Teacher } from '@/types'

function TeacherProfileContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [newLang, setNewLang] = useState({ language_name: '', proficiency_type: 'fluent' })
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    headline: '', bio: '', lesson_format: 'online', years_experience: '',
    pricing_info: '', profile_photo_url: '', intro_audio_url: '', whatsapp_number: '',
    teaching_levels: [] as string[], age_groups: [] as string[], certifications: '',
  })

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return }
    if (!authLoading && user?.role !== 'teacher') { router.push('/learner/dashboard'); return }
    if (!authLoading) {
      api.get('/api/teachers/profile/')
        .then((r) => {
          setTeacher(r.data)
          setForm({
            headline: r.data.headline || '',
            bio: r.data.bio || '',
            lesson_format: r.data.lesson_format || 'online',
            years_experience: r.data.years_experience || '',
            pricing_info: r.data.pricing_info || '',
            profile_photo_url: r.data.profile_photo_url || '',
            intro_audio_url: r.data.intro_audio_url || '',
            whatsapp_number: r.data.whatsapp_number || '',
            teaching_levels: r.data.teaching_levels || [],
            age_groups: r.data.age_groups || [],
            certifications: r.data.certifications || '',
          })
        })
        .finally(() => setLoading(false))
    }
  }, [authLoading, user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.put('/api/teachers/profile/', form)
      setTeacher(data)
      toast.success('Profile saved.')
    } catch { toast.error('Could not save profile.') }
    finally { setSaving(false) }
  }

  const handleAddLanguage = async () => {
    if (!newLang.language_name.trim()) return
    try {
      await api.post('/api/teachers/languages/', newLang)
      const { data } = await api.get('/api/teachers/profile/')
      setTeacher(data)
      setNewLang({ language_name: '', proficiency_type: 'fluent' })
      toast.success('Language added.')
    } catch { toast.error('Could not add language.') }
  }

  const handleRemoveLanguage = async (id: number) => {
    try {
      await api.delete(`/api/teachers/languages/${id}/`)
      const { data } = await api.get('/api/teachers/profile/')
      setTeacher(data)
    } catch { toast.error('Could not remove language.') }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPhoto(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post('/api/resources/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setForm((f) => ({ ...f, profile_photo_url: data.url }))
      toast.success('Photo uploaded.')
    } catch {
      toast.error('Could not upload photo. Make sure it is a JPG, PNG, or WebP.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handlePublish = async () => {
    try {
      await api.post('/api/teachers/profile/publish/', {})
      toast.success('Profile submitted for review.')
      const { data } = await api.get('/api/teachers/profile/')
      setTeacher(data)
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Could not submit profile.')
    }
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const toggleArrayItem = (key: 'teaching_levels' | 'age_groups', value: string) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value],
    }))

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto w-full px-6 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Edit profile</h1>
          <div className="flex items-center gap-3">
            {teacher?.approval_status && (
              <Badge variant="outline" className="capitalize">{teacher.approval_status}</Badge>
            )}
            {teacher?.approval_status !== 'approved' && (
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handlePublish}>
                Submit for review
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Profile details</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <Label>Headline</Label>
                <Input value={form.headline} onChange={set('headline')} placeholder="e.g. Native Yoruba speaker with 5 years teaching experience" />
              </div>
              <div className="space-y-1">
                <Label>Bio</Label>
                <Textarea value={form.bio} onChange={set('bio')} placeholder="Tell students about yourself, your teaching style, and your experience…" rows={5} />
              </div>
              <div className="space-y-1">
                <Label>Lesson format</Label>
                <select value={form.lesson_format} onChange={set('lesson_format')} className="w-full border rounded-md px-3 py-2 text-sm bg-white">
                  <option value="online">Online</option>
                  <option value="in_person">In person</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Years of experience</Label>
                  <Input type="number" value={form.years_experience} onChange={set('years_experience')} placeholder="e.g. 5" min={0} />
                </div>
                <div className="space-y-1">
                  <Label>Pricing info</Label>
                  <Input value={form.pricing_info} onChange={set('pricing_info')} placeholder="e.g. $30/hr" />
                </div>
              </div>

              <div className="space-y-1">
                <Label>Teaching levels</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {['beginner', 'intermediate', 'advanced'].map((l) => (
                    <button key={l} type="button" onClick={() => toggleArrayItem('teaching_levels', l)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors capitalize ${
                        form.teaching_levels.includes(l)
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-400'
                      }`}
                    >{l}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <Label>Age groups</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {['children', 'teens', 'adults', 'seniors'].map((g) => (
                    <button key={g} type="button" onClick={() => toggleArrayItem('age_groups', g)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors capitalize ${
                        form.age_groups.includes(g)
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-400'
                      }`}
                    >{g}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <Label>Certifications <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Textarea value={form.certifications} onChange={set('certifications')} placeholder="e.g. TEFL certified, BA in Linguistics…" rows={2} />
              </div>

              <div className="space-y-1">
                <Label>Profile photo</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 cursor-pointer" onClick={() => photoInputRef.current?.click()}>
                    <AvatarImage src={form.profile_photo_url} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xl font-bold">
                      {user?.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingPhoto}
                      onClick={() => photoInputRef.current?.click()}
                    >
                      {uploadingPhoto ? 'Uploading…' : 'Upload photo'}
                    </Button>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG or WebP. Max 5MB.</p>
                  </div>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Intro audio URL</Label>
                <Input value={form.intro_audio_url} onChange={set('intro_audio_url')} placeholder="https://… (mp3 or wav)" />
              </div>
              <div className="space-y-1">
                <Label>WhatsApp number <span className="text-gray-400 font-normal">(optional)</span></Label>
                <PhoneNumberInput value={form.whatsapp_number} onChange={(v) => setForm((f) => ({ ...f, whatsapp_number: v }))} />
                <p className="text-xs text-gray-400">Shown to learners as a &quot;Message on WhatsApp&quot; button on your public profile.</p>
              </div>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={saving}>
                {saving ? 'Saving…' : 'Save profile'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Languages taught</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {teacher?.languages.map((l) => (
                <Badge key={l.id} variant="outline" className="gap-1 pr-1">
                  {l.language_name} · {l.proficiency_type}
                  <button onClick={() => handleRemoveLanguage(l.id)} className="ml-1 text-gray-400 hover:text-red-500">×</button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={newLang.language_name} onChange={(e) => setNewLang((n) => ({ ...n, language_name: e.target.value }))} placeholder="Language name" className="flex-1" />
              <select value={newLang.proficiency_type} onChange={(e) => setNewLang((n) => ({ ...n, proficiency_type: e.target.value }))} className="border rounded-md px-3 py-2 text-sm bg-white">
                <option value="native">Native</option>
                <option value="fluent">Fluent</option>
                <option value="advanced">Advanced</option>
              </select>
              <Button type="button" onClick={handleAddLanguage} className="bg-emerald-600 hover:bg-emerald-700 text-white">Add</Button>
            </div>
          </CardContent>
        </Card>

        <GoogleCalendarCard
          connectedDescription="Confirmed lessons automatically get a Google Meet link and show up on your calendar."
          disconnectedDescription="Connect your Google Calendar to auto-create Meet links and keep your availability in sync."
        />

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => router.push('/teacher/dashboard')}>← Back to dashboard</Button>
        </div>
      </div>
    </div>
  )
}

export default function TeacherProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>}>
      <TeacherProfileContent />
    </Suspense>
  )
}
