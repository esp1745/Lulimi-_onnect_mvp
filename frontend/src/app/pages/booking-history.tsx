import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Navigation } from "../components/navigation";
import { Footer } from "../components/footer";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import api from "@/lib/api";
import { useAuth } from "../context/auth-context";
import type { Booking } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-[#F5C42C]/20 text-[#7A2E1A]",
  confirmed: "bg-[#2D5A45]/10 text-[#2D5A45]",
  declined: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
  completed: "bg-blue-100 text-blue-700",
};

const STATUS_FILTERS = ["all", "pending", "confirmed", "completed", "declined", "cancelled"];

export function BookingHistory() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const isTeacher = user?.role === "teacher";
  const endpoint = isTeacher ? "/api/bookings/teaching/" : "/api/bookings/my/";

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/signin");
      return;
    }
    if (!authLoading) {
      const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      setLoading(true);
      api
        .get(`${endpoint}${params}`)
        .then((r) => setBookings(r.data))
        .catch(() => toast.error("Could not load booking history."))
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, statusFilter]);

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Navigation />
      <div className="max-w-3xl mx-auto w-full px-6 py-10 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1A3A35]" style={{ fontFamily: "Playfair Display, serif" }}>
              Booking history
            </h1>
            <p className="text-gray-500 text-sm mt-1">Every lesson {isTeacher ? "you've taught or been asked to teach" : "you've booked"}.</p>
          </div>
          <Button variant="outline" onClick={() => navigate(isTeacher ? "/teacher/dashboard" : "/learner/dashboard")}>
            ← Back to dashboard
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-full border capitalize transition-colors ${
                statusFilter === s ? "bg-[#1A3A35] text-white border-[#1A3A35]" : "bg-white text-gray-600 border-[#1A3A35]/20 hover:border-[#1A3A35]/40"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-gray-400">Loading…</div>
            ) : bookings.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No bookings {statusFilter !== "all" ? `with status "${statusFilter}"` : "yet"}.</div>
            ) : (
              <div className="divide-y">
                {bookings.map((b) => (
                  <div key={b.id} className="px-5 py-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-[#1A3A35]">{isTeacher ? b.learner_name : b.teacher_name}</p>
                      <p className="text-xs text-gray-500">
                        {b.language_name} · {new Date(b.start_at).toLocaleString()}
                      </p>
                      {(isTeacher ? b.teacher_notes : b.learner_notes) && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{isTeacher ? b.teacher_notes : b.learner_notes}</p>
                      )}
                    </div>
                    <Badge className={`text-xs border-0 shrink-0 ${STATUS_COLORS[b.status]}`}>{b.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
