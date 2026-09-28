import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Camera, Check, ArrowRight } from "lucide-react";
import { Navigation } from "../components/navigation";
import { Footer } from "../components/footer";
import { UserAvatar } from "../components/UserAvatar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import api from "@/lib/api";
import { useAuth } from "../context/auth-context";

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

const PROFICIENCY_LEVELS = [
  { value: "beginner", label: "Beginner", hint: "Starting from scratch" },
  { value: "intermediate", label: "Intermediate", hint: "I can hold a simple conversation" },
  { value: "advanced", label: "Advanced", hint: "I want to polish and go deeper" },
];

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

/**
 * The short learner setup: photo, who the lessons are actually for, and what
 * they want out of them. It's deliberately one screen — learners aren't
 * building a public profile, teachers just need enough to prepare a lesson.
 */
export function LearnerOnboarding() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    photoUrl: "",
    bookingForSomeoneElse: false,
    studentName: "",
    goals: "",
    proficiencyLevel: "",
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/signup?role=learner", { replace: true });
      return;
    }
    if (user.role === "teacher") {
      navigate("/teacher/onboarding", { replace: true });
      return;
    }
    api
      .get("/api/learners/profile/")
      .then(({ data }) => {
        setForm({
          photoUrl: data.profile_photo_url || "",
          bookingForSomeoneElse: Boolean(data.booking_for_someone_else),
          studentName: data.student_name || "",
          goals: data.goals || "",
          proficiencyLevel: data.proficiency_level || "",
        });
      })
      .catch(() => {
        /* nothing saved yet — a blank form is correct */
      })
      .finally(() => setLoading(false));
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
    reader.onloadend = () => setForm((f) => ({ ...f, photoUrl: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const save = async (complete: boolean) => {
    if (complete && form.bookingForSomeoneElse && !form.studentName.trim()) {
      toast.error("Tell us who the lessons are for.");
      return;
    }
    setSaving(true);
    try {
      // Data URLs can't go in a URLField, so upload first and store the link.
      let profile_photo_url = form.photoUrl;
      if (profile_photo_url.startsWith("data:")) {
        profile_photo_url = await uploadDataUrlPhoto(profile_photo_url);
      }

      await api.patch("/api/learners/profile/", {
        profile_photo_url,
        booking_for_someone_else: form.bookingForSomeoneElse,
        student_name: form.bookingForSomeoneElse ? form.studentName.trim() : "",
        goals: form.goals,
        proficiency_level: form.proficiencyLevel,
        ...(complete ? { onboarding_completed: true } : {}),
      });

      await refreshUser();
      toast.success(complete ? "You're all set." : "Progress saved.");
      navigate("/learner/dashboard");
    } catch {
      toast.error("Could not save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>;
  }

  const displayName = form.bookingForSomeoneElse && form.studentName.trim() ? form.studentName.trim() : user?.full_name;

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Navigation />

      <div className="max-w-2xl mx-auto w-full px-6 py-12">
        <div className="inline-flex items-center gap-2 bg-[#A0B76F]/25 text-[#1A3A35] text-xs font-bold px-4 py-1.5 rounded-full mb-6">
          One quick step
        </div>
        <h1 className="text-4xl font-bold text-[#1A3A35] mb-3" style={{ fontFamily: "Playfair Display, serif" }}>
          Complete your <em className="text-[#C4622D]">profile</em>
        </h1>
        <p className="text-gray-600 mb-8">
          This is all your teacher sees before a first lesson. It takes a minute, and you can change any of it later.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            save(true);
          }}
          className="space-y-6"
        >
          {/* Photo */}
          <div className="bg-white rounded-2xl border border-[#1A3A35]/10 p-6">
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative rounded-full group shrink-0"
                aria-label="Upload a profile photo"
              >
                <UserAvatar user={user} photoUrl={form.photoUrl} name={displayName} size={80} />
                <span className="absolute inset-0 rounded-full bg-[#1A3A35]/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </span>
              </button>
              <div>
                <h3 className="font-bold text-[#1A3A35] mb-1">Profile photo</h3>
                <p className="text-sm text-gray-500 mb-3">A face makes a first lesson far less awkward. JPG, PNG or GIF, up to 5MB.</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full border-[#1A3A35]/20 text-[#1A3A35] hover:bg-[#A0B76F]/10 hover:border-[#A0B76F] font-bold"
                >
                  {form.photoUrl ? "Change photo" : "Upload photo"}
                </Button>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
          </div>

          {/* Who is this for */}
          <div className="bg-white rounded-2xl border border-[#1A3A35]/10 p-6 space-y-4">
            <div>
              <h3 className="font-bold text-[#1A3A35] mb-1">Who are these lessons for?</h3>
              <p className="text-sm text-gray-500">
                Plenty of parents, guardians and sponsors book on someone else&apos;s behalf. Your teacher needs to know who to expect.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { forElse: false, label: "They're for me", hint: "I'm the one learning" },
                { forElse: true, label: "They're for someone else", hint: "My child, relative or friend" },
              ].map((option) => {
                const active = form.bookingForSomeoneElse === option.forElse;
                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, bookingForSomeoneElse: option.forElse }))}
                    aria-pressed={active}
                    className={`text-left rounded-xl border p-4 transition-colors ${
                      active
                        ? "border-[#A0B76F] bg-[#A0B76F]/15"
                        : "border-[#1A3A35]/15 bg-white hover:border-[#A0B76F]"
                    }`}
                  >
                    <span className="flex items-center gap-2 font-bold text-sm text-[#1A3A35]">
                      {active && <Check className="w-4 h-4 text-[#1A3A35]" />}
                      {option.label}
                    </span>
                    <span className="block text-xs text-gray-500 mt-1">{option.hint}</span>
                  </button>
                );
              })}
            </div>

            {form.bookingForSomeoneElse && (
              <div className="space-y-1">
                <Label htmlFor="student-name">Their name</Label>
                <Input
                  id="student-name"
                  value={form.studentName}
                  onChange={(e) => setForm((f) => ({ ...f, studentName: e.target.value }))}
                  placeholder="e.g. Chanda Mwale"
                />
                <p className="text-xs text-gray-500">This is the name your teacher will see on the lesson.</p>
              </div>
            )}
          </div>

          {/* Goal */}
          <div className="bg-white rounded-2xl border border-[#1A3A35]/10 p-6 space-y-4">
            <div>
              <h3 className="font-bold text-[#1A3A35] mb-1">What&apos;s the goal?</h3>
              <p className="text-sm text-gray-500">The clearer this is, the better your teacher can plan that first lesson.</p>
            </div>

            <Textarea
              value={form.goals}
              onChange={(e) => setForm((f) => ({ ...f, goals: e.target.value }))}
              placeholder="e.g. Learn conversational Bemba before visiting family in Kitwe next year"
              rows={4}
            />

            <div className="space-y-2">
              <Label>Where are you starting from? (optional)</Label>
              <div className="grid sm:grid-cols-3 gap-2">
                {PROFICIENCY_LEVELS.map((level) => {
                  const active = form.proficiencyLevel === level.value;
                  return (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({ ...f, proficiencyLevel: active ? "" : level.value }))
                      }
                      aria-pressed={active}
                      className={`text-left rounded-xl border p-3 transition-colors ${
                        active
                          ? "border-[#A0B76F] bg-[#A0B76F]/15"
                          : "border-[#1A3A35]/15 bg-white hover:border-[#A0B76F]"
                      }`}
                    >
                      <span className="block font-bold text-sm text-[#1A3A35]">{level.label}</span>
                      <span className="block text-xs text-gray-500 mt-0.5">{level.hint}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#C4622D] hover:bg-[#7A2E1A] text-white rounded-full h-12 px-8 font-bold gap-2"
            >
              {saving ? "Saving…" : "Finish and start learning"}
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={saving}
              onClick={() => save(false)}
              className="rounded-full text-[#1A3A35]/70 hover:text-[#1A3A35] font-semibold"
            >
              Skip for now
            </Button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
