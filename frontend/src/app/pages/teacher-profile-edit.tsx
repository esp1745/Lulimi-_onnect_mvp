import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Navigation } from "../components/navigation";
import { Footer } from "../components/footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import PhoneNumberInput from "../components/PhoneNumberInput";
import GoogleCalendarCard from "../components/GoogleCalendarCard";
import { TeacherSubNav } from "../components/TeacherSubNav";
import api from "@/lib/api";
import { useAuth } from "../context/auth-context";
import { COUNTRY_CODES } from "@/lib/countryCodes";
import type { Teacher } from "@/types";

// Same options the onboarding wizard offers, so the two stay in step.
const SPECIALIZATION_OPTIONS = [
  "Beginner Learners",
  "Business Language",
  "Conversational Practice",
  "Grammar & Writing",
  "Exam Preparation",
  "Kids & Teens",
  "Cultural Immersion",
  "Pronunciation",
];

interface EducationRow {
  degree: string;
  institution: string;
}
interface ExperienceRow {
  role: string;
  organization: string;
  startDate: string;
  endDate: string;
  description: string;
}

export function TeacherProfileEdit() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [newLang, setNewLang] = useState({ language_name: "", proficiency_type: "fluent" });
  const [newPackage, setNewPackage] = useState({ title: "", description: "", hours: "", price: "", savings: "" });
  const photoInputRef = useRef<HTMLInputElement>(null);
  // `country` lives on the User record, so it's saved separately from the rest.
  const [country, setCountry] = useState("");
  const [form, setForm] = useState({
    headline: "",
    bio: "",
    lesson_format: "online",
    years_experience: "",
    price: "",
    pricing_info: "",
    profile_photo_url: "",
    intro_audio_url: "",
    whatsapp_number: "",
    teaching_levels: [] as string[],
    age_groups: [] as string[],
    specializations: [] as string[],
    education: [] as EducationRow[],
    work_experience: [] as ExperienceRow[],
    certifications: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/signin");
      return;
    }
    if (!authLoading && user?.role !== "teacher") {
      navigate("/learner/dashboard");
      return;
    }
    if (!authLoading) {
      api
        .get("/api/teachers/profile/")
        .then((r) => {
          setTeacher(r.data);
          setCountry(r.data.country || "");
          setForm({
            headline: r.data.headline || "",
            bio: r.data.bio || "",
            lesson_format: r.data.lesson_format || "online",
            years_experience: r.data.years_experience || "",
            price: r.data.price ?? "",
            pricing_info: r.data.pricing_info || "",
            profile_photo_url: r.data.profile_photo_url || "",
            intro_audio_url: r.data.intro_audio_url || "",
            whatsapp_number: r.data.whatsapp_number || "",
            teaching_levels: r.data.teaching_levels || [],
            age_groups: r.data.age_groups || [],
            specializations: r.data.specializations || [],
            education: r.data.education || [],
            work_experience: r.data.work_experience || [],
            certifications: r.data.certifications || "",
          });
        })
        .finally(() => setLoading(false));
    }
  }, [authLoading, user, navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        // Empty number fields must go as null, not "" (which fails validation).
        years_experience: form.years_experience === "" ? null : form.years_experience,
        price: form.price === "" ? null : form.price,
        // Drop blank rows so we don't persist empty cards.
        education: form.education.filter((r) => r.degree.trim() || r.institution.trim()),
        work_experience: form.work_experience.filter((r) => r.role.trim() || r.organization.trim()),
      };
      const { data } = await api.put("/api/teachers/profile/", payload);
      // Country belongs to the account, not the teaching profile.
      if (country !== (teacher?.country ?? "")) {
        await api.patch("/api/auth/me/", { country }).catch(() => {});
      }
      setTeacher({ ...data, country });
      toast.success("Profile saved.");
    } catch {
      toast.error("Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  const toggleSpecialization = (spec: string) =>
    setForm((f) => ({
      ...f,
      specializations: f.specializations.includes(spec)
        ? f.specializations.filter((s) => s !== spec)
        : [...f.specializations, spec],
    }));

  const addEducation = () => setForm((f) => ({ ...f, education: [...f.education, { degree: "", institution: "" }] }));
  const updateEducation = (i: number, key: keyof EducationRow, value: string) =>
    setForm((f) => ({ ...f, education: f.education.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)) }));
  const removeEducation = (i: number) =>
    setForm((f) => ({ ...f, education: f.education.filter((_, idx) => idx !== i) }));

  const addExperience = () =>
    setForm((f) => ({
      ...f,
      work_experience: [...f.work_experience, { role: "", organization: "", startDate: "", endDate: "", description: "" }],
    }));
  const updateExperience = (i: number, key: keyof ExperienceRow, value: string) =>
    setForm((f) => ({ ...f, work_experience: f.work_experience.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)) }));
  const removeExperience = (i: number) =>
    setForm((f) => ({ ...f, work_experience: f.work_experience.filter((_, idx) => idx !== i) }));

  const refreshTeacher = async () => {
    const { data } = await api.get("/api/teachers/profile/");
    setTeacher(data);
  };

  const handleAddLanguage = async () => {
    if (!newLang.language_name.trim()) return;
    try {
      await api.post("/api/teachers/languages/", newLang);
      await refreshTeacher();
      setNewLang({ language_name: "", proficiency_type: "fluent" });
      toast.success("Language added.");
    } catch {
      toast.error("Could not add language.");
    }
  };

  const handleRemoveLanguage = async (id: number) => {
    try {
      await api.delete(`/api/teachers/languages/${id}/`);
      await refreshTeacher();
    } catch {
      toast.error("Could not remove language.");
    }
  };

  const handleAddPackage = async () => {
    if (!newPackage.title.trim() || !newPackage.hours || !newPackage.price) return;
    try {
      await api.post("/api/teachers/packages/", {
        title: newPackage.title,
        description: newPackage.description,
        hours: newPackage.hours,
        price: newPackage.price,
        savings: newPackage.savings || null,
      });
      await refreshTeacher();
      setNewPackage({ title: "", description: "", hours: "", price: "", savings: "" });
      toast.success("Package added.");
    } catch {
      toast.error("Could not add package.");
    }
  };

  const handleRemovePackage = async (id: number) => {
    try {
      await api.delete(`/api/teachers/packages/${id}/`);
      await refreshTeacher();
    } catch {
      toast.error("Could not remove package.");
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post("/api/resources/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((f) => ({ ...f, profile_photo_url: data.url }));
      toast.success("Photo uploaded.");
    } catch {
      toast.error("Could not upload photo. Make sure it is a JPG, PNG, or WebP.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePublish = async () => {
    try {
      await api.post("/api/teachers/profile/publish/", {});
      toast.success("Profile submitted for review.");
      await refreshTeacher();
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(detail || "Could not submit profile.");
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const toggleArrayItem = (key: "teaching_levels" | "age_groups", value: string) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value],
    }));

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Navigation />
      <div className="max-w-2xl mx-auto w-full px-6 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#1A3A35]" style={{ fontFamily: "Playfair Display, serif" }}>
            Edit profile
          </h1>
          <div className="flex items-center gap-3">
            {teacher?.approval_status && (
              <Badge variant="outline" className="capitalize">
                {teacher.approval_status}
              </Badge>
            )}
            {teacher?.approval_status !== "approved" && (
              <Button size="sm" className="bg-[#C4622D] hover:bg-[#7A2E1A] text-white rounded-full" onClick={handlePublish}>
                Submit for review
              </Button>
            )}
          </div>
        </div>

        <TeacherSubNav />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <Label>Headline</Label>
                <Input value={form.headline} onChange={set("headline")} placeholder="e.g. Native Yoruba speaker with 5 years teaching experience" />
              </div>
              <div className="space-y-1">
                <Label>Bio</Label>
                <Textarea value={form.bio} onChange={set("bio")} placeholder="Tell students about yourself, your teaching style, and your experience…" rows={5} />
              </div>
              <div className="space-y-1">
                <Label>Lesson format</Label>
                <select
                  value={form.lesson_format}
                  onChange={set("lesson_format")}
                  className="w-full rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3A35]/20"
                >
                  <option value="online">Online</option>
                  <option value="in_person">In person</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Years of experience</Label>
                  <Input type="number" value={form.years_experience} onChange={set("years_experience")} placeholder="e.g. 5" min={0} />
                </div>
                <div className="space-y-1">
                  <Label>Hourly rate (USD)</Label>
                  <Input
                    type="number"
                    min={0}
                    inputMode="decimal"
                    value={form.price}
                    onChange={set("price")}
                    placeholder="e.g. 25"
                  />
                  <p className="text-xs text-gray-400">What learners are charged per hour.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Country</Label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-sm bg-white border border-[#1A3A35]/15 focus:outline-none focus:ring-2 focus:ring-[#1A3A35]/20"
                  >
                    <option value="">Select your country</option>
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Pricing notes</Label>
                  <Input value={form.pricing_info} onChange={set("pricing_info")} placeholder="e.g. Free intro session" />
                </div>
              </div>

              <div className="space-y-1">
                <Label>Teaching levels</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {["beginner", "intermediate", "advanced"].map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => toggleArrayItem("teaching_levels", l)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors capitalize ${
                        form.teaching_levels.includes(l)
                          ? "bg-[#1A3A35] text-white border-[#1A3A35]"
                          : "bg-white text-gray-600 border-[#1A3A35]/20 hover:border-[#1A3A35]/40"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <Label>Age groups</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {["children", "teens", "adults", "seniors"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleArrayItem("age_groups", g)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors capitalize ${
                        form.age_groups.includes(g)
                          ? "bg-[#1A3A35] text-white border-[#1A3A35]"
                          : "bg-white text-gray-600 border-[#1A3A35]/20 hover:border-[#1A3A35]/40"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <Label>
                  Certifications <span className="text-gray-400 font-normal">(optional, one per line)</span>
                </Label>
                <Textarea value={form.certifications} onChange={set("certifications")} placeholder={"e.g. TEFL certified\nBA in Linguistics"} rows={2} />
              </div>

              <div className="space-y-1">
                <Label>Profile photo</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 cursor-pointer" onClick={() => photoInputRef.current?.click()}>
                    <AvatarImage src={form.profile_photo_url} />
                    <AvatarFallback className="text-xl font-bold">
                      {user?.full_name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button type="button" variant="outline" size="sm" disabled={uploadingPhoto} onClick={() => photoInputRef.current?.click()}>
                      {uploadingPhoto ? "Uploading…" : "Upload photo"}
                    </Button>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG or WebP. Max 5MB.</p>
                  </div>
                  <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handlePhotoUpload} />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Intro audio URL</Label>
                <Input value={form.intro_audio_url} onChange={set("intro_audio_url")} placeholder="https://… (mp3 or wav)" />
              </div>
              <div className="space-y-1">
                <Label>
                  WhatsApp number <span className="text-gray-400 font-normal">(optional)</span>
                </Label>
                <PhoneNumberInput value={form.whatsapp_number} onChange={(v) => setForm((f) => ({ ...f, whatsapp_number: v }))} />
                <p className="text-xs text-gray-400">Shown to learners as a "Message on WhatsApp" button on your public profile.</p>
              </div>
              <Button type="submit" className="bg-[#C4622D] hover:bg-[#7A2E1A] text-white rounded-full" disabled={saving}>
                {saving ? "Saving…" : "Save profile"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Same ground the onboarding "Experience" step covers, so teachers can
            edit everything they entered during registration. */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Background</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Education</Label>
              {form.education.map((edu, idx) => (
                <div key={idx} className="relative rounded-xl border border-[#1A3A35]/10 p-3">
                  <button
                    type="button"
                    onClick={() => removeEducation(idx)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                    aria-label="Remove education"
                  >
                    ×
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-6">
                    <Input
                      value={edu.degree}
                      onChange={(e) => updateEducation(idx, "degree", e.target.value)}
                      placeholder="Degree / qualification"
                    />
                    <Input
                      value={edu.institution}
                      onChange={(e) => updateEducation(idx, "institution", e.target.value)}
                      placeholder="Institution"
                    />
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addEducation}>
                + Add education
              </Button>
            </div>

            <div className="space-y-3">
              <Label>Teaching experience</Label>
              {form.work_experience.map((exp, idx) => (
                <div key={idx} className="relative rounded-xl border border-[#1A3A35]/10 p-3 space-y-2">
                  <button
                    type="button"
                    onClick={() => removeExperience(idx)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                    aria-label="Remove experience"
                  >
                    ×
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-6">
                    <Input
                      value={exp.role}
                      onChange={(e) => updateExperience(idx, "role", e.target.value)}
                      placeholder="Role"
                    />
                    <Input
                      value={exp.organization}
                      onChange={(e) => updateExperience(idx, "organization", e.target.value)}
                      placeholder="Organization"
                    />
                  </div>
                  <Textarea
                    value={exp.description}
                    onChange={(e) => updateExperience(idx, "description", e.target.value)}
                    placeholder="What did you do? (optional)"
                    rows={2}
                  />
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addExperience}>
                + Add experience
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Specializations</Label>
              <div className="flex flex-wrap gap-2">
                {SPECIALIZATION_OPTIONS.map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => toggleSpecialization(spec)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      form.specializations.includes(spec)
                        ? "bg-[#A0B76F] text-[#1A3A35] border-[#A0B76F] font-semibold"
                        : "bg-white text-gray-600 border-[#1A3A35]/20 hover:border-[#A0B76F]"
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="button"
              className="bg-[#C4622D] hover:bg-[#7A2E1A] text-white rounded-full"
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? "Saving…" : "Save background"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Languages taught</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {teacher?.languages.map((l) => (
                <Badge key={l.id} variant="outline" className="gap-1 pr-1">
                  {l.language_name} · {l.proficiency_type}
                  <button onClick={() => handleRemoveLanguage(l.id)} className="ml-1 text-gray-400 hover:text-red-500">
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newLang.language_name}
                onChange={(e) => setNewLang((n) => ({ ...n, language_name: e.target.value }))}
                placeholder="Language name"
                className="flex-1"
              />
              <select
                value={newLang.proficiency_type}
                onChange={(e) => setNewLang((n) => ({ ...n, proficiency_type: e.target.value }))}
                className="rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3A35]/20"
              >
                <option value="native">Native</option>
                <option value="fluent">Fluent</option>
                <option value="professional">Professional</option>
              </select>
              <Button type="button" onClick={handleAddLanguage} className="bg-[#1A3A35] hover:bg-[#2D5A45] text-white rounded-full">
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Packages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {teacher?.packages && teacher.packages.length > 0 && (
              <div className="space-y-2">
                {teacher.packages.map((p) => (
                  <div key={p.id} className="flex items-start justify-between gap-3 rounded-xl border border-[#1A3A35]/10 p-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#1A3A35]">
                        {p.title} · {p.hours}h · ${p.price}
                        {p.savings && <span className="text-[#2D5A45]"> (save ${p.savings})</span>}
                      </p>
                      {p.description && <p className="text-xs text-gray-500 mt-1">{p.description}</p>}
                    </div>
                    <button onClick={() => handleRemovePackage(p.id)} className="text-gray-400 hover:text-red-500 shrink-0">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={newPackage.title}
                onChange={(e) => setNewPackage((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. 10-hour package"
                className="col-span-2"
              />
              <Input
                value={newPackage.description}
                onChange={(e) => setNewPackage((p) => ({ ...p, description: e.target.value }))}
                placeholder="Description (optional)"
                className="col-span-2"
              />
              <Input
                type="number"
                min={1}
                value={newPackage.hours}
                onChange={(e) => setNewPackage((p) => ({ ...p, hours: e.target.value }))}
                placeholder="Hours"
              />
              <Input
                type="number"
                min={0}
                value={newPackage.price}
                onChange={(e) => setNewPackage((p) => ({ ...p, price: e.target.value }))}
                placeholder="Price ($)"
              />
              <Input
                type="number"
                min={0}
                value={newPackage.savings}
                onChange={(e) => setNewPackage((p) => ({ ...p, savings: e.target.value }))}
                placeholder="Savings ($, optional)"
                className="col-span-2"
              />
            </div>
            <Button type="button" onClick={handleAddPackage} className="bg-[#1A3A35] hover:bg-[#2D5A45] text-white rounded-full">
              Add package
            </Button>
          </CardContent>
        </Card>

        <GoogleCalendarCard
          connectedDescription="Confirmed lessons automatically get a Google Meet link and show up on your calendar."
          disconnectedDescription="Connect your Google Calendar to auto-create Meet links and keep your availability in sync."
        />
      </div>
      <Footer />
    </div>
  );
}
