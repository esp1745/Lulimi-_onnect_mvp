import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Navigation } from "../components/navigation";
import { Footer } from "../components/footer";
import { filterChipClass } from "../components/TeacherSubNav";
import { DashboardHeader } from "../components/DashboardHeader";
import { Button } from "../components/ui/button";
import { PaymentModal } from "../components/PaymentModal";
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

function BookingRow({
  booking,
  isTeacher,
  onPaid,
}: {
  booking: Booking;
  isTeacher: boolean;
  onPaid: (b: Booking) => void;
}) {
  const [payingOpen, setPayingOpen] = useState(false);
  const isPaid = booking.payment_status === "paid";
  // Learners pay; only lessons still going ahead are worth paying for.
  const payable = !isTeacher && !isPaid && ["pending", "confirmed"].includes(booking.status);
  const notes = isTeacher ? booking.teacher_notes : booking.learner_notes;

  return (
    <div className="px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-sm text-[#1A3A35]">
            {isTeacher ? booking.student_name || booking.learner_name : booking.teacher_name}
          </p>
          {isTeacher && booking.student_name && booking.student_name !== booking.learner_name && (
            <p className="text-xs text-gray-400">Booked by {booking.learner_name}</p>
          )}
          <p className="text-xs text-gray-500">
            {booking.language_name} · {new Date(booking.start_at).toLocaleString()}
          </p>
          {notes && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{notes}</p>}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isTeacher &&
            (isPaid ? (
              <Badge className="text-xs border-0 bg-[#A0B76F]/25 text-[#1A3A35]">
                paid{booking.payment_amount ? ` · $${booking.payment_amount}` : ""}
              </Badge>
            ) : (
              payable && (
                <Button
                  size="sm"
                  className="h-7 text-xs bg-[#A0B76F] hover:bg-[#8aa55a] text-[#1A3A35] font-bold rounded-full"
                  onClick={() => setPayingOpen(true)}
                >
                  Pay now
                </Button>
              )
            ))}
          <Badge className={`text-xs border-0 ${STATUS_COLORS[booking.status]}`}>{booking.status}</Badge>
        </div>
      </div>

      {payingOpen && (
        <PaymentModal
          booking={booking}
          onClose={() => setPayingOpen(false)}
          onPaid={(payment) => {
            setPayingOpen(false);
            toast.success("Payment complete — your lesson is booked.");
            onPaid({ ...booking, payment_status: "paid", payment_amount: payment.amount });
          }}
        />
      )}
    </div>
  );
}

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
        <DashboardHeader
          title="Booking history"
          subtitle={`Every lesson ${isTeacher ? "you've taught or been asked to teach" : "you've booked"}.`}
        />

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide mr-1">Show</span>
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              aria-pressed={statusFilter === s}
              className={`${filterChipClass(statusFilter === s)} capitalize`}
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
                  <BookingRow
                    key={b.id}
                    booking={b}
                    isTeacher={isTeacher}
                    onPaid={(paid) => setBookings((list) => list.map((x) => (x.id === paid.id ? paid : x)))}
                  />
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
