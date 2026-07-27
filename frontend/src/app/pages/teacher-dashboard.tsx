import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Navigation } from "../components/navigation";
import { Footer } from "../components/footer";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import AIAssistant from "../components/AIAssistant";
import api from "@/lib/api";
import { useAuth } from "../context/auth-context";
import { buildGoogleCalendarUrl } from "@/lib/googleCalendar";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import type { TeacherDashboard as TeacherDashboardData, Booking, Resource, LessonResource } from "@/types";

interface Student {
  id: number;
  full_name: string;
  email: string;
  country: string;
  lesson_count: number;
  last_lesson: string;
  language_name: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-[#F5C42C]/20 text-[#7A2E1A]",
  confirmed: "bg-[#2D5A45]/10 text-[#2D5A45]",
  declined: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
  completed: "bg-blue-100 text-blue-700",
};

function LessonResourcesPanel({ booking, libraryResources }: { booking: Booking; libraryResources: Resource[] }) {
  const [expanded, setExpanded] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [attached, setAttached] = useState<LessonResource[]>([]);
  const [selectedId, setSelectedId] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get(`/api/resources/lessons/${booking.id}/`);
      setAttached(data);
      setLoaded(true);
    } catch {
      toast.error("Could not load lesson resources.");
    }
  };

  const toggle = () => {
    setExpanded((e) => !e);
    if (!loaded) load();
  };

  const handleAttach = async () => {
    if (!selectedId) return;
    try {
      const { data } = await api.post(`/api/resources/lessons/${booking.id}/`, { resource_id: Number(selectedId) });
      setAttached((a) => [...a, data]);
      setSelectedId("");
    } catch {
      toast.error("Could not attach resource.");
    }
  };

  const handleRemove = async (lessonResourceId: number) => {
    try {
      await api.delete(`/api/resources/lessons/items/${lessonResourceId}/`);
      setAttached((a) => a.filter((lr) => lr.id !== lessonResourceId));
    } catch {
      toast.error("Could not remove resource.");
    }
  };

  const attachedIds = new Set(attached.map((lr) => lr.resource.id));
  const available = libraryResources.filter((r) => !attachedIds.has(r.id));
  const selectedResource = libraryResources.find((r) => r.id === Number(selectedId));

  return (
    <div className="mt-2">
      <button type="button" className="text-xs text-gray-500 hover:text-[#1A3A35] hover:underline" onClick={toggle}>
        {expanded ? "Hide" : "Manage"} lesson resources{attached.length > 0 ? ` (${attached.length})` : ""}
      </button>
      {expanded && (
        <div className="mt-2 space-y-2 rounded-lg bg-[#F5F0E8] p-2">
          {attached.length > 0 && (
            <div className="space-y-1">
              {attached.map((lr) => (
                <div key={lr.id} className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-[#1A3A35] truncate">{lr.resource.title}</span>
                  <button type="button" onClick={() => handleRemove(lr.id)} className="text-gray-400 hover:text-red-500 shrink-0">
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          {available.length > 0 ? (
            <div className="flex gap-2 items-center">
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="flex-1 text-xs rounded px-2 py-1 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1A3A35]/20"
              >
                <option value="">Select a resource…</option>
                {available.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
              <Button size="sm" className="h-7 text-xs bg-[#1A3A35] hover:bg-[#2D5A45] text-white shrink-0" onClick={handleAttach} disabled={!selectedId}>
                Attach
              </Button>
            </div>
          ) : (
            <p className="text-xs text-gray-400">No more resources in your library to attach.</p>
          )}
          {selectedResource && selectedResource.visibility !== "student_shared" && (
            <p className="text-xs text-[#C4622D]">Only resources shared with students will show on the learner&apos;s dashboard.</p>
          )}
        </div>
      )}
    </div>
  );
}

function BookingCard({
  booking,
  onConfirm,
  onDecline,
  libraryResources,
}: {
  booking: Booking;
  onConfirm?: (link: string) => void;
  onDecline?: () => void;
  libraryResources: Resource[];
}) {
  const [meetingLink, setMeetingLink] = useState("");
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="py-3 border-b last:border-0 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-sm text-[#1A3A35]">{booking.learner_name}</p>
          <p className="text-xs text-gray-500">
            {booking.language_name} · {new Date(booking.start_at).toLocaleString()}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            {booking.external_meeting_link && (
              <a href={booking.external_meeting_link} target="_blank" rel="noopener noreferrer" className="text-xs text-[#2D5A45] hover:underline">
                Join lesson →
              </a>
            )}
            {booking.status === "confirmed" && (
              <a href={buildGoogleCalendarUrl(booking)} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:underline">
                + Add to Google Calendar
              </a>
            )}
            {booking.learner_whatsapp_number && ["pending", "confirmed"].includes(booking.status) && (
              <a
                href={buildWhatsAppLink(
                  booking.learner_whatsapp_number,
                  `Hi ${booking.learner_name}, this is regarding your ${booking.language_name} lesson request on Lulimi Connect.`
                )}
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
          {onDecline && (
            <Button size="sm" variant="outline" className="h-7 text-xs text-red-500 border-red-200 hover:bg-red-50" onClick={onDecline}>
              Decline
            </Button>
          )}
        </div>
      </div>
      {onConfirm &&
        (confirming ? (
          <div className="flex gap-2 items-center">
            <Input
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="Zoom / Google Meet / WhatsApp link (optional)"
              className="text-xs h-8"
            />
            <Button size="sm" className="bg-[#1A3A35] hover:bg-[#2D5A45] text-white h-8 text-xs shrink-0" onClick={() => onConfirm(meetingLink)}>
              Confirm
            </Button>
            <Button size="sm" variant="ghost" className="h-8 text-xs shrink-0" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button size="sm" className="bg-[#1A3A35] hover:bg-[#2D5A45] text-white h-7 text-xs" onClick={() => setConfirming(true)}>
            Confirm booking
          </Button>
        ))}
      {booking.status === "confirmed" && <LessonResourcesPanel booking={booking} libraryResources={libraryResources} />}
    </div>
  );
}

function NotesCard({ booking, onSaved, libraryResources }: { booking: Booking; onSaved: () => void; libraryResources: Resource[] }) {
  const [notes, setNotes] = useState(booking.teacher_notes || "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/api/bookings/${booking.id}/notes/`, { teacher_notes: notes });
      toast.success("Notes saved.");
      setEditing(false);
      onSaved();
    } catch {
      toast.error("Could not save notes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="py-3 border-b last:border-0 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-sm text-[#1A3A35]">{booking.learner_name}</p>
          <p className="text-xs text-gray-500">
            {booking.language_name} · {new Date(booking.start_at).toLocaleString()}
          </p>
        </div>
        <Badge className="text-xs border-0 bg-blue-100 text-blue-700 shrink-0">completed</Badge>
      </div>
      {editing ? (
        <div className="space-y-2">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add lesson notes, progress observations, homework…" rows={3} className="text-xs" />
          <div className="flex gap-2">
            <Button size="sm" className="bg-[#1A3A35] hover:bg-[#2D5A45] text-white h-7 text-xs" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={() => {
                setEditing(false);
                setNotes(booking.teacher_notes || "");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2">
          {notes ? <p className="text-xs text-gray-600 flex-1">{notes}</p> : <p className="text-xs text-gray-400 flex-1 italic">No notes yet.</p>}
          <Button size="sm" variant="ghost" className="h-6 text-xs text-gray-400 hover:text-gray-700 shrink-0" onClick={() => setEditing(true)}>
            {notes ? "Edit" : "+ Add notes"}
          </Button>
        </div>
      )}
      <LessonResourcesPanel booking={booking} libraryResources={libraryResources} />
    </div>
  );
}

export function TeacherDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<TeacherDashboardData | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const [{ data }, { data: studentData }, { data: resourceData }] = await Promise.all([
        api.get("/api/teachers/dashboard/"),
        api.get("/api/teachers/students/"),
        api.get("/api/resources/"),
      ]);
      setDashboard(data);
      setStudents(studentData);
      setResources(resourceData);
    } catch {
      toast.error("Could not load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/signin");
      return;
    }
    if (!authLoading && user?.role !== "teacher") {
      navigate("/learner/dashboard");
      return;
    }
    if (!authLoading) fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  const handleConfirm = async (id: number, meetingLink: string) => {
    try {
      await api.post(`/api/bookings/${id}/confirm/`, { external_meeting_link: meetingLink });
      toast.success("Booking confirmed.");
      fetchDashboard();
    } catch {
      toast.error("Failed to confirm.");
    }
  };

  const handleDecline = async (id: number) => {
    try {
      await api.post(`/api/bookings/${id}/decline/`, {});
      toast.success("Booking declined.");
      fetchDashboard();
    } catch {
      toast.error("Failed to decline.");
    }
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Navigation />
      <div className="max-w-5xl mx-auto w-full px-6 py-10">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1A3A35]" style={{ fontFamily: "Playfair Display, serif" }}>
              Welcome, {user?.full_name?.split(" ")[0]}
            </h1>
            <p className="text-gray-500 text-sm">Your teaching dashboard</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link to="/teacher/profile">
              <Button variant="outline" size="sm">
                Edit profile
              </Button>
            </Link>
            <Link to="/teacher/availability">
              <Button variant="outline" size="sm">
                Availability
              </Button>
            </Link>
            <Link to="/teacher/resources">
              <Button variant="outline" size="sm">
                Resources
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Upcoming lessons", value: dashboard?.upcoming_lessons.length ?? 0 },
            { label: "Pending requests", value: dashboard?.pending_requests_count ?? 0 },
            { label: "Total students", value: dashboard?.total_students ?? 0 },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-[#C4622D]">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Booking requests</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard?.pending_requests.length === 0 ? (
                <p className="text-sm text-gray-400">No pending requests.</p>
              ) : (
                dashboard?.pending_requests.map((b) => (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    onConfirm={(link) => handleConfirm(b.id, link)}
                    onDecline={() => handleDecline(b.id)}
                    libraryResources={resources}
                  />
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Upcoming lessons</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard?.upcoming_lessons.length === 0 ? (
                <p className="text-sm text-gray-400">No upcoming lessons.</p>
              ) : (
                dashboard?.upcoming_lessons.map((b) => <BookingCard key={b.id} booking={b} libraryResources={resources} />)
              )}
            </CardContent>
          </Card>

          {(dashboard?.recent_completions?.length ?? 0) > 0 && (
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Recent completed lessons</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboard!.recent_completions.map((b) => (
                  <NotesCard key={b.id} booking={b} onSaved={fetchDashboard} libraryResources={resources} />
                ))}
              </CardContent>
            </Card>
          )}

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
                        <p className="font-medium text-sm text-[#1A3A35]">{s.full_name}</p>
                        <p className="text-xs text-gray-500">
                          {s.country} · {s.language_name}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 text-right">
                        <div>
                          <p className="text-xs text-gray-500">
                            {s.lesson_count} lesson{s.lesson_count !== 1 ? "s" : ""}
                          </p>
                          <p className="text-xs text-gray-400">Last: {new Date(s.last_lesson).toLocaleDateString()}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {s.email}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />

      <AIAssistant
        role="teacher"
        onSaveAsResource={(content) => {
          navigate("/teacher/resources?draft=" + encodeURIComponent(content.slice(0, 200)));
        }}
      />
    </div>
  );
}
