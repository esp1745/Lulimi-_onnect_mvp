'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/lib/api'

export default function GoogleCalendarCard({ connectedDescription, disconnectedDescription }: {
  connectedDescription: string
  disconnectedDescription: string
}) {
  const [status, setStatus] = useState<{ connected: boolean; google_email: string | null } | null>(null)
  const [connecting, setConnecting] = useState(false)
  const searchParams = useSearchParams()

  const fetchStatus = async () => {
    try {
      const { data } = await api.get('/api/calendar/google/status/')
      setStatus(data)
    } catch { /* leave status null, card just won't render a state */ }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  useEffect(() => {
    const calendarParam = searchParams.get('calendar')
    if (calendarParam === 'connected') {
      toast.success('Google Calendar connected.')
      fetchStatus()
    } else if (calendarParam === 'no_access') {
      toast.error('Calendar permission wasn’t granted. On the Google consent screen, make sure the Calendar access checkbox is checked before clicking Continue, then try again.')
    } else if (calendarParam === 'error') {
      toast.error('Could not connect Google Calendar. Please try again.')
    }
  }, [searchParams])

  const handleConnect = async () => {
    setConnecting(true)
    try {
      const { data } = await api.get('/api/calendar/google/connect/')
      window.location.href = data.authorization_url
    } catch {
      toast.error('Could not start Google Calendar connection.')
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await api.post('/api/calendar/google/disconnect/', {})
      toast.success('Google Calendar disconnected.')
      fetchStatus()
    } catch { toast.error('Could not disconnect Google Calendar.') }
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Google Calendar</CardTitle></CardHeader>
      <CardContent>
        {status?.connected ? (
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm">Connected as <span className="font-medium">{status.google_email}</span></p>
              <p className="text-xs text-gray-500 mt-1">{connectedDescription}</p>
            </div>
            <Button size="sm" variant="outline" onClick={handleDisconnect}>Disconnect</Button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-gray-500">{disconnectedDescription}</p>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0" disabled={connecting} onClick={handleConnect}>
              {connecting ? 'Redirecting…' : 'Connect'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
