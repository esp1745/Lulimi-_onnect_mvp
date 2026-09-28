import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Navigation } from "../components/navigation";
import { Footer } from "../components/footer";
import { DashboardHeader } from "../components/DashboardHeader";
import { UserAvatar } from "../components/UserAvatar";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import api from "@/lib/api";
import { useAuth } from "../context/auth-context";

const PROFICIENCY_LEVELS = ["beginner", "intermediate", "advanced"];

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

/** Upload a data-URL photo and get back a servable URL. */
async function uploadDataUrlPhoto(dataUrl: string): Promise<string> {
  const blob = await (await fetch(dataUrl)).blob();
  const form = new FormData();
  form.append("file", blob, "learner-photo.jpg");
  const { data } = await api.post("/api/resources/upload/", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.url as string;
}

export function LearnerProfile() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // Same fields onboarding collects, so nothing is only editable there.
  const [form, setForm] = useState({
    goals: "",
    proficiency_level: "",
    profile_photo_url: "",
    booking_for_someone_else: false,
    student_name: "",
  });

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
            profile_photo_url: r.data.profile_photo_url || "",
            booking_for_someone_else: Boolean(r.data.booking_for_someone_else),
            student_name: r.data.student_name || "",
          });
        })
        .finally(() => setLoading(false));
    }
  }, [authLoading, user, navigate]);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, or GIF).");
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      toast.error("That image is over 5MB. Try a smaller one.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setForm((f) => ({ ...f, profile_photo_url: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.booking_for_someone_else && !form.student_name.trim()) {
      toast.error("Tell us who the lessons are for.");
      return;
    }
    setSaving(true);
    try {
      // A data URL can't be stored in a URL field — upload it first.
      let profile_photo_url = form.profile_photo_url;
      if (profile_photo_url.startsWith("data:")) {
        profile_photo_url = await uploadDataUrlPhoto(profile_photo_url);
      }
      await api.patch("/api/learners/profile/", {
        ...form,
        profile_photo_url,
        student_name: form.booking_for_someone_else ? form.student_name.trim() : "",
      });
      setForm((f) => ({ ...f, profile_photo_url }));
      await refreshUser();
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
        <DashboardHeader title="My profile" subtitle="How your teachers see you." />

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Photo & who the lessons are for</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Upload a profile photo"
                className="rounded-full"
              >
                <UserAvatar user={user} photoUrl={form.profile_photo_url} size={64} />
              </button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full border-[#1A3A35]/20 text-[#1A3A35] hover:bg-[#A0B76F]/10 hover:border-[#A0B76F] font-bold"
              >
                {form.profile_photo_url ? "Change photo" : "Upload photo"}
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.booking_for_someone_else}
                onChange={(e) => setForm((f) => ({ ...f, booking_for_someone_else: e.target.checked }))}
                className="mt-1 h-4 w-4 accent-[#A0B76F]"
              />
              <span>
                <span className="block text-sm font-bold text-[#1A3A35]">These lessons are for someone else</span>
                <span className="block text-xs text-gray-500">My child, relative or friend attends instead of me.</span>
              </span>
            </label>

            {form.booking_for_someone_else && (
              <div className="space-y-1">
                <Label htmlFor="student-name">Their name</Label>
                <Input
                  id="student-name"
                  value={form.student_name}
                  onChange={(e) => setForm((f) => ({ ...f, student_name: e.target.value }))}
                  placeholder="e.g. Chanda Mwale"
                />
              </div>
            )}

            <Button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="bg-[#C4622D] hover:bg-[#7A2E1A] text-white rounded-full"
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </CardContent>
        </Card>

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
