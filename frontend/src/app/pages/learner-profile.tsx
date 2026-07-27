import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Navigation } from "../components/navigation";
import { Footer } from "../components/footer";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import api from "@/lib/api";
import { useAuth } from "../context/auth-context";

const PROFICIENCY_LEVELS = ["beginner", "intermediate", "advanced"];

export function LearnerProfile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ goals: "", proficiency_level: "" });

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
        .get("/api/learners/profile/")
        .then((r) => {
          setForm({
            goals: r.data.goals || "",
            proficiency_level: r.data.proficiency_level || "",
          });
        })
        .finally(() => setLoading(false));
    }
  }, [authLoading, user, navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/api/learners/profile/", form);
      toast.success("Profile saved.");
    } catch {
      toast.error("Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Navigation />
      <div className="max-w-2xl mx-auto w-full px-6 py-10 space-y-6">
        <h1 className="text-3xl font-bold text-[#1A3A35]" style={{ fontFamily: "Playfair Display, serif" }}>
          Edit profile
        </h1>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Learning goals</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <Label>Goals</Label>
                <Textarea
                  value={form.goals}
                  onChange={(e) => setForm((f) => ({ ...f, goals: e.target.value }))}
                  placeholder="What do you want to achieve? e.g. Learn conversational Bemba for a family visit"
                  rows={5}
                />
              </div>
              <div className="space-y-1">
                <Label>Current proficiency level</Label>
                <select
                  value={form.proficiency_level}
                  onChange={(e) => setForm((f) => ({ ...f, proficiency_level: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3A35]/20"
                >
                  <option value="">Not set</option>
                  {PROFICIENCY_LEVELS.map((l) => (
                    <option key={l} value={l} className="capitalize">
                      {l.charAt(0).toUpperCase() + l.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="bg-[#C4622D] hover:bg-[#7A2E1A] text-white rounded-full" disabled={saving}>
                {saving ? "Saving…" : "Save profile"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Button variant="outline" onClick={() => navigate("/learner/dashboard")}>
          ← Back to dashboard
        </Button>
      </div>
      <Footer />
    </div>
  );
}
