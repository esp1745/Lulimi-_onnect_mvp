import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Navigation } from "../components/navigation";
import { Footer } from "../components/footer";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import api from "@/lib/api";
import { useAuth } from "../context/auth-context";
import type { Availability } from "@/types";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const TIMEZONES = [
  "Africa/Lusaka",
  "Africa/Harare",
  "Africa/Johannesburg",
  "Africa/Nairobi",
  "Africa/Lagos",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
  "UTC",
];

const EMPTY_SLOT = { day_of_week: 0, start_time: "09:00", end_time: "17:00", timezone: "Africa/Lusaka", is_active: true };

export function TeacherAvailability() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [slots, setSlots] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY_SLOT);
  const [saving, setSaving] = useState(false);

  const fetchSlots = async () => {
    try {
      const { data } = await api.get("/api/teachers/availability/");
      setSlots(data);
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
    if (!authLoading) fetchSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/api/teachers/availability/", form);
      toast.success("Availability slot added.");
      setAdding(false);
      setForm(EMPTY_SLOT);
      fetchSlots();
    } catch {
      toast.error("Could not add slot.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (slot: Availability) => {
    try {
      await api.patch(`/api/teachers/availability/${slot.id}/`, { is_active: !slot.is_active });
      fetchSlots();
    } catch {
      toast.error("Could not update slot.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/teachers/availability/${id}/`);
      toast.success("Slot removed.");
      fetchSlots();
    } catch {
      toast.error("Could not remove slot.");
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: k === "day_of_week" ? Number(e.target.value) : e.target.value }));

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Navigation />
      <div className="max-w-2xl mx-auto w-full px-6 py-10 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1A3A35]" style={{ fontFamily: "Playfair Display, serif" }}>
              Availability
            </h1>
            <p className="text-gray-500 text-sm mt-1">Set the weekly time slots when you are available to teach.</p>
          </div>
          <Button className="bg-[#1A3A35] hover:bg-[#2D5A45] text-white rounded-full" onClick={() => setAdding(true)}>
            + Add slot
          </Button>
        </div>

        {adding && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">New availability slot</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[#1A3A35]">Day</label>
                    <select value={form.day_of_week} onChange={set("day_of_week")} className="w-full rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3A35]/20">
                      {DAYS.map((d, i) => (
                        <option key={d} value={i}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[#1A3A35]">Timezone</label>
                    <select value={form.timezone} onChange={set("timezone")} className="w-full rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3A35]/20">
                      {TIMEZONES.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[#1A3A35]">Start time</label>
                    <input
                      type="time"
                      value={form.start_time}
                      onChange={set("start_time")}
                      className="w-full rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3A35]/20"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[#1A3A35]">End time</label>
                    <input
                      type="time"
                      value={form.end_time}
                      onChange={set("end_time")}
                      className="w-full rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3A35]/20"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button type="submit" className="bg-[#1A3A35] hover:bg-[#2D5A45] text-white rounded-full" disabled={saving}>
                    {saving ? "Saving…" : "Save slot"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setAdding(false);
                      setForm(EMPTY_SLOT);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-0">
            {slots.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p className="mb-2">No availability slots yet.</p>
                <p className="text-sm">Add your first slot so learners can see when you're available.</p>
              </div>
            ) : (
              <div className="divide-y">
                {slots.map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between px-5 py-4 gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${slot.is_active ? "bg-[#2D5A45]" : "bg-gray-300"}`} />
                      <div>
                        <p className="font-medium text-sm text-[#1A3A35]">{DAYS[slot.day_of_week]}</p>
                        <p className="text-xs text-gray-500">
                          {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                          <span className="ml-2 text-gray-400">{slot.timezone}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="outline"
                        className={`text-xs cursor-pointer ${slot.is_active ? "border-[#2D5A45]/40 text-[#2D5A45]" : "text-gray-400"}`}
                        onClick={() => handleToggle(slot)}
                      >
                        {slot.is_active ? "Active" : "Paused"}
                      </Badge>
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(slot.id)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Button variant="outline" onClick={() => navigate("/teacher/dashboard")}>
          ← Back to dashboard
        </Button>
      </div>
      <Footer />
    </div>
  );
}
