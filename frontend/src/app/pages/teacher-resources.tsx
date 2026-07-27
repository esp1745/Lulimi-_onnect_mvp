import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { Navigation } from "../components/navigation";
import { Footer } from "../components/footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import api from "@/lib/api";
import { useAuth } from "../context/auth-context";
import type { Resource } from "@/types";

const ZAMBIAN_LANGUAGES = ["Bemba", "Nyanja", "Tonga", "Lozi", "Kaonde", "Luvale", "Lunda", "Tumbuka", "Other"];

const TYPE_LABELS: Record<string, string> = {
  text: "📝 Text",
  pdf: "📄 PDF",
  audio: "🔊 Audio",
  image: "🖼️ Image",
  link: "🔗 Link",
};

const EMPTY_FORM = {
  title: "",
  description: "",
  language_name: "Bemba",
  resource_type: "text",
  visibility: "teacher_only",
  content_text: "",
  file_url: "",
};

export function TeacherResources() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchResources = async () => {
    try {
      const { data } = await api.get("/api/resources/");
      setResources(data);
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
    if (!authLoading) {
      fetchResources();
      const draft = searchParams.get("draft");
      if (draft) {
        setAdding(true);
        setForm((f) => ({ ...f, content_text: draft, resource_type: "text", title: "AI-generated content" }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post("/api/resources/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((f) => ({ ...f, file_url: data.url, resource_type: data.resource_type }));
      toast.success("File uploaded.");
    } catch {
      toast.error("Upload failed. Allowed: PDF, MP3, WAV, JPG, PNG.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/api/resources/", form);
      toast.success("Resource saved.");
      setAdding(false);
      setForm(EMPTY_FORM);
      fetchResources();
    } catch {
      toast.error("Could not save resource.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/resources/${id}/`);
      toast.success("Resource deleted.");
      fetchResources();
    } catch {
      toast.error("Could not delete resource.");
    }
  };

  const handleVisibilityChange = async (id: number, visibility: string) => {
    try {
      await api.patch(`/api/resources/${id}/`, { visibility });
      fetchResources();
    } catch {
      toast.error("Could not update visibility.");
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const needsFile = ["pdf", "audio", "image"].includes(form.resource_type);
  const needsText = form.resource_type === "text";
  const needsUrl = form.resource_type === "link";

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Navigation />
      <div className="max-w-3xl mx-auto w-full px-6 py-10 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1A3A35]" style={{ fontFamily: "Playfair Display, serif" }}>
              Resources
            </h1>
            <p className="text-gray-500 text-sm mt-1">Upload and manage your teaching materials.</p>
          </div>
          <Button className="bg-[#1A3A35] hover:bg-[#2D5A45] text-white rounded-full" onClick={() => setAdding(true)}>
            + Add resource
          </Button>
        </div>

        {adding && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">New resource</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2">
                    <Label>Title</Label>
                    <Input value={form.title} onChange={set("title")} placeholder="e.g. Bemba greetings vocabulary list" required />
                  </div>
                  <div className="space-y-1">
                    <Label>Language</Label>
                    <select value={form.language_name} onChange={set("language_name")} className="w-full rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3A35]/20">
                      {ZAMBIAN_LANGUAGES.map((l) => (
                        <option key={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label>Type</Label>
                    <select value={form.resource_type} onChange={set("resource_type")} className="w-full rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3A35]/20">
                      <option value="text">Text</option>
                      <option value="pdf">PDF</option>
                      <option value="audio">Audio</option>
                      <option value="image">Image</option>
                      <option value="link">Link</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>
                    Description <span className="text-gray-400 font-normal">(optional)</span>
                  </Label>
                  <Input value={form.description} onChange={set("description")} placeholder="Brief description of this resource" />
                </div>

                {needsFile && (
                  <div className="space-y-1">
                    <Label>{form.resource_type === "audio" ? "Audio file" : form.resource_type === "pdf" ? "PDF file" : "Image file"}</Label>
                    <div className="flex gap-3 items-center">
                      <Button type="button" variant="outline" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                        {uploading ? "Uploading…" : "Choose file"}
                      </Button>
                      {form.file_url && <span className="text-xs text-[#2D5A45]">✓ File uploaded</span>}
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept={form.resource_type === "audio" ? ".mp3,.wav,.m4a,.ogg" : form.resource_type === "pdf" ? ".pdf" : ".jpg,.jpeg,.png,.gif,.webp"}
                        onChange={handleFileUpload}
                      />
                    </div>
                    {form.resource_type === "audio" && form.file_url && <audio controls src={form.file_url} className="w-full mt-2" />}
                  </div>
                )}

                {needsText && (
                  <div className="space-y-1">
                    <Label>Content</Label>
                    <Textarea value={form.content_text} onChange={set("content_text")} placeholder="Type your lesson notes, vocabulary list, or other text content…" rows={6} required />
                  </div>
                )}

                {needsUrl && (
                  <div className="space-y-1">
                    <Label>URL</Label>
                    <Input value={form.file_url} onChange={set("file_url")} placeholder="https://…" type="url" required />
                  </div>
                )}

                <div className="space-y-1">
                  <Label>Visibility</Label>
                  <select value={form.visibility} onChange={set("visibility")} className="w-full rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3A35]/20">
                    <option value="teacher_only">Private — only you</option>
                    <option value="student_shared">Shared with students</option>
                    <option value="public">Public — visible to all</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="bg-[#1A3A35] hover:bg-[#2D5A45] text-white rounded-full" disabled={saving || (needsFile && !form.file_url)}>
                    {saving ? "Saving…" : "Save resource"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setAdding(false);
                      setForm(EMPTY_FORM);
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
            {resources.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p className="mb-2">No resources yet.</p>
                <p className="text-sm">Add vocabulary lists, audio clips, PDFs, or lesson notes.</p>
              </div>
            ) : (
              <div className="divide-y">
                {resources.map((r) => (
                  <div key={r.id} className="px-5 py-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-[#1A3A35]">{r.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {TYPE_LABELS[r.resource_type]}
                          </Badge>
                          <Badge variant="outline" className="text-xs text-gray-500">
                            {r.language_name}
                          </Badge>
                        </div>
                        {r.description && <p className="text-xs text-gray-500 mt-1">{r.description}</p>}
                        {r.content_text && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{r.content_text}</p>}
                      </div>
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0" onClick={() => handleDelete(r.id)}>
                        Delete
                      </Button>
                    </div>

                    {r.resource_type === "audio" && r.file_url && <audio controls src={r.file_url} className="w-full h-8" />}

                    {r.resource_type === "image" && r.file_url && <img src={r.file_url} alt={r.title} className="max-h-40 rounded-md object-cover" />}

                    {["pdf", "link"].includes(r.resource_type) && r.file_url && (
                      <a href={r.file_url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          Open {r.resource_type === "pdf" ? "PDF" : "link"} →
                        </Button>
                      </a>
                    )}

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Visibility:</span>
                      <select
                        value={r.visibility}
                        onChange={(e) => handleVisibilityChange(r.id, e.target.value)}
                        className="text-xs rounded px-2 py-1 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1A3A35]/20"
                      >
                        <option value="teacher_only">Private</option>
                        <option value="student_shared">Shared with students</option>
                        <option value="public">Public</option>
                      </select>
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
