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

export interface EducationEntry {
  degree: string
  institution: string
}

export interface TeacherPackage {
  id: number
  title: string
  description: string
  hours: number
  price: string
  savings: string | null
  created_at: string
}

export interface ScoreBreakdown {
  knowledge: number | null
  value: number | null
  responsiveness: number | null
  supportiveness: number | null
}

export interface Review {
  id: number
  learner_name: string
  rating: number
  knowledge_score: number | null
  value_score: number | null
  responsiveness_score: number | null
  supportiveness_score: number | null
  text: string
  tag: string
  created_at: string
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
  price: string | null
  profile_photo_url: string
  intro_audio_url: string
  whatsapp_number: string
  region: string
  institution: string
  professional_role: string
  education: EducationEntry[]
  specializations: string[]
  services: string[]
  badge: string
  rating: number | null
  review_count: number
  follower_count: number
  minutes_coached: number
  score_breakdown: ScoreBreakdown | null
  packages: TeacherPackage[]
  is_published: boolean
  approval_status: 'pending' | 'approved' | 'rejected'
  is_featured: boolean
  languages: TeacherLanguage[]
  availability?: Availability[]
  created_at: string
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
  teacher_user_id: number
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
  reviewed?: boolean
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

export interface Learner {
  id: number
  goals: string
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | ''
  created_at: string
}

export interface LessonResource {
  id: number
  booking: number
  resource: Resource
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

export interface Message {
  id: number
  sender: number
  sender_name: string
  recipient: number
  text: string
  read_at: string | null
  created_at: string
}

export interface MessageThread {
  user_id: number
  full_name: string
  last_message: string
  last_message_at: string
  unread_count: number
}

export interface AIChatContentBlock {
  type: "text" | "tool_use" | "tool_result"
  text?: string
  id?: string
  name?: string
  input?: Record<string, unknown>
  tool_use_id?: string
  content?: string
}

export interface AIChatMessage {
  role: "user" | "assistant"
  content: string | AIChatContentBlock[]
}

export interface AIChatConfirmation {
  tool_use_id: string
  tool_name: string
  tool_input: Record<string, unknown>
  summary: string
}

export interface AIChatResponse {
  status: "ok" | "confirm_required"
  messages: AIChatMessage[]
  confirmation?: AIChatConfirmation
}
