import { Booking } from '@/types'

function toGoogleDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, '')
}

export function buildGoogleCalendarUrl(booking: Pick<Booking, 'language_name' | 'teacher_name' | 'learner_name' | 'start_at' | 'end_at' | 'external_meeting_link'>): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${booking.language_name} lesson: ${booking.teacher_name} & ${booking.learner_name}`,
    dates: `${toGoogleDate(booking.start_at)}/${toGoogleDate(booking.end_at)}`,
    details: booking.external_meeting_link ? `Meeting link: ${booking.external_meeting_link}` : 'Lulimi Connect lesson',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
