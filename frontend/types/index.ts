export interface User {
  id: number
  email: string
  full_name: string
  role: 'teacher' | 'learner' | 'admin'
  country: string
  timezone: string
  created_at: string
}

export interface TeacherLanguage {
  id: number
  language_name: string
  proficiency_type: string
}

export interface Teacher {
  id: number
  full_name: string
  country: string
  timezone?: string
  headline: string
  bio: string
  lesson_format: 'online' | 'in_person' | 'both'
  teaching_levels: string[]
  age_groups: string[]
  years_experience: number | null
  certifications: string
  pricing_info: string
  profile_photo_url: string
  intro_audio_url: string
  whatsapp_number: string
  is_published: boolean
  approval_status: 'pending' | 'approved' | 'rejected'
  is_featured: boolean
  languages: TeacherLanguage[]
  availability?: Availability[]
}

export interface Availability {
  id: number
  day_of_week: number
  day_name: string
  start_time: string
  end_time: string
  timezone: string
  is_active: boolean
  converted_start_time?: string
  converted_end_time?: string
  converted_day_of_week?: number
  converted_timezone?: string
}

export interface Booking {
  id: number
  teacher: number
  teacher_name: string
  teacher_whatsapp_number: string
  learner: number
  learner_name: string
  language_name: string
  start_at: string
  end_at: string
  timezone_snapshot: string
  status: 'pending' | 'confirmed' | 'declined' | 'completed' | 'cancelled'
  external_meeting_link: string
  learner_whatsapp_number: string
  teacher_notes: string
  learner_notes: string
  created_at: string
}

export interface Resource {
  id: number
  teacher: number
  title: string
  description: string
  language_name: string
  resource_type: 'text' | 'pdf' | 'audio' | 'image' | 'link'
  file_url: string
  content_text: string
  visibility: 'public' | 'teacher_only' | 'student_shared'
  created_at: string
}

export interface Notification {
  id: number
  notification_type: string
  title: string
  body: string
  read_at: string | null
  created_at: string
}

export interface TeacherDashboard {
  upcoming_lessons: Booking[]
  pending_requests: Booking[]
  pending_requests_count: number
  total_students: number
  recent_completions: Booking[]
}

export interface LearnerDashboard {
  pending_requests: Booking[]
  upcoming_lessons: Booking[]
  past_lessons: Booking[]
  saved_resources: Resource[]
}
