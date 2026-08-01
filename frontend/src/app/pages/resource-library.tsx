import { useState, useEffect } from "react";
import { Navigation } from "../components/navigation";
import { Footer } from "../components/footer";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import api from "@/lib/api";
import type { Resource } from "@/types";

const ZAMBIAN_LANGUAGES = ["Bemba", "Nyanja", "Tonga", "Lozi", "Kaonde", "Luvale", "Lunda", "Tumbuka"];

const TYPE_LABELS: Record<string, string> = {
  text: "📝 Text",
  pdf: "📄 PDF",
  audio: "🔊 Audio",
  image: "🖼️ Image",
  link: "🔗 Link",
};

export function ResourceLibrary() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = language ? `?language=${encodeURIComponent(language)}` : "";
    api
      .get(`/api/resources/public/${params}`)
      .then((r) => setResources(r.data))
      .catch(() => setResources([]))
      .finally(() => setLoading(false));
  }, [language]);

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Navigation />
      <div className="max-w-3xl mx-auto w-full px-6 py-10 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1A3A35]" style={{ fontFamily: "Playfair Display, serif" }}>
            Resource library
          </h1>
          <p className="text-gray-500 text-sm mt-1">Free vocabulary lists, audio, and lesson materials shared publicly by our teachers.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setLanguage("")}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              language === "" ? "bg-[#1A3A35] text-white border-[#1A3A35]" : "bg-white text-gray-600 border-[#1A3A35]/20 hover:border-[#1A3A35]/40"
            }`}
          >
            All languages
          </button>
          {ZAMBIAN_LANGUAGES.map((l) => (
            <button
              key={l}
              onClick={() => setLanguage(l)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                language === l ? "bg-[#1A3A35] text-white border-[#1A3A35]" : "bg-white text-gray-600 border-[#1A3A35]/20 hover:border-[#1A3A35]/40"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-gray-400">Loading…</div>
            ) : resources.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p className="mb-2">No public resources {language ? `for ${language} ` : ""}yet.</p>
                <p className="text-sm">Check back soon, or try a different language.</p>
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
                        <p className="text-xs text-gray-400 mt-1">by {r.teacher_name}</p>
                        {r.description && <p className="text-xs text-gray-500 mt-1">{r.description}</p>}
                        {r.content_text && <p className="text-xs text-gray-600 mt-1 line-clamp-3">{r.content_text}</p>}
                      </div>
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
