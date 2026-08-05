import { useState, useEffect } from "react";
import { Navigation } from "../components/navigation";
import { Footer } from "../components/footer";
import { Button } from "../components/ui/button";
import { AnimatedCounter } from "../components/animated-counter";
import { HeroVideoBackground } from "../components/hero-video-background";
import { JourneySteps } from "../components/journey-steps";
import { Link } from "react-router";
import { useAuth } from "../context/auth-context";
import api from "@/lib/api";

const heroVideos = [
  "/videos/hero-bg-1.mp4",
  "/videos/hero-bg-2.mp4",
  "/videos/hero-bg-3.mp4",
  "/videos/hero-bg-4.mp4",
  "/videos/hero-bg-5.mp4",
];

const LANGUAGES = [
  { name: "Twi", native: "Twi", word: "Akwaaba", meaning: "Welcome" },
  { name: "Tigrinya", native: "Tigrinya", word: "Selam", meaning: "Peace" },
  { name: "Xhosa", native: "isiXhosa", word: "Molo", meaning: "Hello" },
  { name: "Somali", native: "Soomaali", word: "Nabad", meaning: "Peace" },
  { name: "Shona", native: "chiShona", word: "Mhoro", meaning: "Hello" },
  { name: "Bambara", native: "Bamanankan", word: "I ni ce", meaning: "Hello" },
  { name: "Kinyarwanda", native: "Ikinyarwanda", word: "Muraho", meaning: "Hello" },
  { name: "Swahili", native: "Kiswahili", word: "Jambo", meaning: "Hello" },
  { name: "Yoruba", native: "Yorùbá", word: "Ẹ káàbọ̀", meaning: "Welcome" },
  { name: "Amharic", native: "Amarigna", word: "Selam", meaning: "Peace" },
  { name: "Zulu", native: "isiZulu", word: "Sawubona", meaning: "Hello" },
  { name: "Hausa", native: "Hausa", word: "Sannu", meaning: "Hello" },
  { name: "Igbo", native: "Igbo", word: "Ndewo", meaning: "Hello" },
  { name: "Wolof", native: "Wolof", word: "Nanga def", meaning: "Hello" },
  { name: "Lingala", native: "Lingála", word: "Mbote", meaning: "Hello" },
  { name: "Fula", native: "Pulaar", word: "Jam tan", meaning: "Peace" },
];

const languageStrip = [...LANGUAGES, ...LANGUAGES, ...LANGUAGES];

export function Homepage() {
  const { user } = useAuth();
  const dashboardPath = user?.role === "teacher" ? "/teacher/dashboard" : "/learner/dashboard";
  const firstName = user?.full_name.split(" ")[0];

  // Languages currently taught, straight from teacher profiles.
  const [liveLanguages, setLiveLanguages] = useState<{ language_name: string; teacher_count: number }[]>([]);
  useEffect(() => {
    api
      .get("/api/teachers/marketplace/languages/")
      .then(({ data }) => setLiveLanguages(data))
      .catch(() => setLiveLanguages([]));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFDF8] via-[#F5F0E8] to-[#F5F0E8]">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[680px] flex items-center py-24 px-6">
        <HeroVideoBackground videos={heroVideos} />

        <div className="relative z-10 container mx-auto max-w-[860px]">
          {/* Green Pill Tag */}
          <div className="flex justify-center mb-6">
            <div className="bg-[#2D5A45] text-[#F5F0E8] text-xs font-semibold px-4 py-2 rounded-full inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F5C42C]"></span>
              {firstName ? `WELCOME BACK, ${firstName.toUpperCase()}` : "AFRICAN LANGUAGE EDUCATION PLATFORM"}
            </div>
          </div>

          {/* Headline */}
          <h1
            className="text-5xl lg:text-6xl text-center leading-tight mb-6 text-white"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Learn{" "}
            <em className="text-[#F5C42C]" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.45)" }}>
              African languages
            </em>{" "}
            from expert teachers
          </h1>

          {/* Subheading */}
          <p className="text-[17px] text-white/80 text-center max-w-[540px] mx-auto mb-10 leading-relaxed">
            Connect with certified educators teaching Swahili, Yoruba, Amharic, Zulu, and 50+ more African languages. One-on-one coaching tailored to you.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Link to="/teachers">
              <Button
                size="lg"
                className="bg-[#C4622D] hover:bg-[#7A2E1A] text-white rounded-full px-8 text-base"
              >
                Find a teacher
              </Button>
            </Link>
            {user ? (
              <Link to={dashboardPath}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-[#1A3A35] rounded-full px-8 text-base"
                >
                  Go to my dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/teach">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-[#1A3A35] rounded-full px-8 text-base"
                >
                  Become a teacher
                </Button>
              </Link>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-white/20 mb-12"></div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-[720px] mx-auto">
            <div className="text-center">
              <div
                className="text-4xl font-bold text-white mb-2"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                <AnimatedCounter value={240} suffix="+" suffixClassName="text-2xl" />
              </div>
              <div className="text-[13px] text-white/70">Certified teachers</div>
            </div>
            <div className="text-center">
              <div
                className="text-4xl font-bold text-white mb-2"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                <AnimatedCounter value={52} />
              </div>
              <div className="text-[13px] text-white/70">African languages</div>
            </div>
            <div className="text-center">
              <div
                className="text-4xl font-bold text-white mb-2"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                <AnimatedCounter value={8400} suffix="+" suffixClassName="text-2xl" />
              </div>
              <div className="text-[13px] text-white/70">Learners worldwide</div>
            </div>
          </div>
        </div>
      </section>

      {/* Scrolling Language Strip */}
      <div className="bg-[#1A3A35] py-5 overflow-hidden">
        <div className="whitespace-nowrap animate-scroll flex items-center">
          {languageStrip.map((lang, i) => (
            <span key={`${lang.name}-${i}`} className="inline-flex items-center gap-6 px-6">
              <span className="inline-flex flex-col items-center leading-tight">
                <span className="text-[#C4622D] text-lg font-bold" style={{ fontFamily: "Playfair Display, serif" }}>
                  {lang.word}
                </span>
                <span className="text-[#F5F0E8]/50 text-[10px] uppercase tracking-wide mt-0.5">
                  {lang.meaning} · <span className="font-bold text-[#F5F0E8]/80">{lang.name}</span>
                </span>
              </span>
              <span className="text-[#C4622D]/30 text-xl">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Languages available right now — driven by real teacher profiles */}
      {liveLanguages.length > 0 && (
        <section className="py-16 px-6 bg-gradient-to-b from-[#FFFDF8] to-[#F5F0E8]">
          <div className="container mx-auto max-w-[1000px] text-center">
            <div className="text-xs uppercase tracking-wide text-[#C4622D] font-semibold mb-3">
              Available now
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A3A35] mb-3" style={{ fontFamily: "Playfair Display, serif" }}>
              Languages you can learn today
            </h2>
            <p className="text-gray-600 mb-8">Tap a language to meet the teachers who speak it.</p>
            <div className="flex flex-wrap justify-center gap-3">
              {liveLanguages.map((l) => (
                <Link
                  key={l.language_name}
                  to={`/teachers?language=${encodeURIComponent(l.language_name)}`}
                  className="group inline-flex items-center gap-2 bg-white border border-[#1A3A35]/10 rounded-full pl-5 pr-4 py-2.5 shadow-sm hover:shadow-md hover:border-[#C4622D]/40 transition-all"
                >
                  <span className="font-semibold text-[#1A3A35] group-hover:text-[#C4622D] transition-colors">
                    {l.language_name}
                  </span>
                  <span className="text-xs font-medium text-[#7A2E1A] bg-[#F5C42C]/30 rounded-full px-2 py-0.5">
                    {l.teacher_count}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <JourneySteps />

      {/* CTA Banner — only relevant to visitors who aren't already teachers */}
      {user?.role !== "teacher" && (
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-[1200px]">
          <div
            className="relative overflow-hidden rounded-[28px] p-14"
            style={{
              background: 'linear-gradient(135deg, #C4622D 0%, #7A2E1A 100%)',
            }}
          >
            {/* Decorative Circle */}
            <div
              className="absolute top-0 right-0 w-96 h-96 rounded-full"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                transform: 'translate(30%, -30%)',
              }}
            />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <h2
                  className="text-[32px] text-white font-bold mb-3 leading-tight"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  Are you a teacher? Share your gift with the world.
                </h2>
                <p className="text-white/75 text-base max-w-lg">
                  Join our global community of language educators and help learners connect with their heritage.
                </p>
              </div>

              <Link to="/teach">
                <Button
                  size="lg"
                  className="bg-[#F5C42C] hover:bg-[#E8922A] text-[#1A3A35] rounded-full px-8 text-base font-semibold flex-shrink-0"
                >
                  Apply to teach on Lulimi →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      )}

      <Footer />

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.3333%);
          }
        }

        .animate-scroll {
          animation: scroll 55s linear infinite;
        }
      `}</style>
    </div>
  );
}
