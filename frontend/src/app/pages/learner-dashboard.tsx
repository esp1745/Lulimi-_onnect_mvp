import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Navigation } from "../components/navigation";
import { Footer } from "../components/footer";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import GoogleCalendarCard from "../components/GoogleCalendarCard";
import api from "@/lib/api";
import { useAuth } from "../context/auth-context";
import { buildGoogleCalendarUrl } from "@/lib/googleCalendar";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import type { LearnerDashboard as LearnerDashboardData, Resource, Booking } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-[#F5C42C]/20 text-[#7A2E1A]",
  confirmed: "bg-[#2D5A45]/10 text-[#2D5A45]",
  declined: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
  completed: "bg-blue-100 text-blue-700",
};

function BookingRow({ booking, onCancel }: { booking: Booking; onCancel?: () => void }) {
  return (
    <div className="py-3 border-b last:border-0">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-sm text-[#1A3A35]">{booking.teacher_name}</p>
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
            {booking.teacher_whatsapp_number && (
              <a
                href={buildWhatsAppLink(
                  booking.teacher_whatsapp_number,
                  `Hi ${booking.teacher_name}, this is regarding my ${booking.language_name} lesson request on Lulimi Connect.`
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
          {onCancel && (
            <Button size="sm" variant="outline" className="h-7 text-xs text-red-500 border-red-200 hover:bg-red-50" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <div className="py-3 border-b last:border-0">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-sm text-[#1A3A35]">{resource.title}</p>
          <p className="text-xs text-gray-500">
            {resource.language_name} · {resource.resource_type}
          </p>
        </div>
        {resource.file_url && (
          <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" className="h-7 text-xs">
              Open
            </Button>
          </a>
        )}
      </div>
      {resource.resource_type === "audio" && resource.file_url && <audio controls src={resource.file_url} className="w-full mt-2 h-8" />}
      {resource.content_text && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{resource.content_text}</p>}
    </div>
  );
}

export function LearnerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<LearnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/signin");
      return;
    }
    if (!authLoading && user?.role === "teacher") {
      navigate("/teacher/dashboard");
      return;
    }
    if (!authLoading) {
      api
        .get("/api/learners/dashboard/")
        .then((r) => setDashboard(r.data))
        .catch(() => toast.error("Could not load dashboard."))
        .finally(() => setLoading(false));
    }
  }, [authLoading, user, navigate]);

  const handleCancel = async (id: number) => {
    try {
      await api.post(`/api/bookings/${id}/cancel/`, {});
      toast.success("Booking cancelled.");
      const { data } = await api.get("/api/learners/dashboard/");
      setDashboard(data);
    } catch {
      toast.error("Could not cancel booking.");
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
            <p className="text-gray-500 text-sm">Your learning dashboard</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link to="/learner/profile">
              <Button variant="outline" size="sm">
                Edit profile
              </Button>
            </Link>
            <Link to="/teachers">
              <Button className="bg-[#C4622D] hover:bg-[#7A2E1A] text-white rounded-full" size="sm">
                Find a teacher
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Pending requests</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard?.pending_requests.length === 0 ? (
                <p className="text-sm text-gray-400">No pending requests.</p>
              ) : (
                dashboard?.pending_requests.map((b) => <BookingRow key={b.id} booking={b} onCancel={() => handleCancel(b.id)} />)
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Upcoming lessons</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard?.upcoming_lessons.length === 0 ? (
                <div className="text-sm text-gray-400 py-2">
                  No upcoming lessons.{" "}
                  <Link to="/teachers" className="text-[#2D5A45] hover:underline">
                    Find a teacher →
                  </Link>
                </div>
              ) : (
                dashboard?.upcoming_lessons.map((b) => <BookingRow key={b.id} booking={b} onCancel={() => handleCancel(b.id)} />)
              )}
            </CardContent>
          </Card>

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
                    <p className="font-medium text-sm text-[#1A3A35]">{b.teacher_name}</p>
                    <p className="text-xs text-gray-500">
                      {b.language_name} · {new Date(b.start_at).toLocaleString()}
                    </p>
                    <Badge className={`text-xs border-0 mt-1 ${STATUS_COLORS[b.status]}`}>{b.status}</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

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

          <div className="md:col-span-2">
            <GoogleCalendarCard
              connectedDescription="Lessons you book automatically get added to your calendar too."
              disconnectedDescription="Connect your Google Calendar to automatically add booked lessons to your own calendar."
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
