import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { Heart, Users, Calendar, MessageCircle } from "lucide-react";
import Globe from "react-globe.gl";
import { Navigation } from "../components/navigation";
import { Footer } from "../components/footer";
import { Button } from "../components/ui/button";
import { AnimatedCounter } from "../components/animated-counter";
import { JourneySteps } from "../components/journey-steps";
import { StepCards } from "../components/step-cards";
import mockupShareProfile from "@/assets/mockup-share-profile.png";
import mockupSetSchedule from "@/assets/mockup-set-schedule.png";
import mockupGoLive from "@/assets/mockup-go-live.png";

// Cities/languages highlighted on the hero globe, ordered as a loop around
// the continent so the connecting arcs read as one spanning network.
const PINS = [
  { lat: 6.5, lng: 3.4, city: "Lagos", language: "Yoruba · Igbo", color: "#C4622D" },
  { lat: 5.6, lng: -0.2, city: "Accra", language: "Twi", color: "#2D5A45" },
  { lat: 14.7, lng: -17.5, city: "Dakar", language: "Wolof · Fula", color: "#F5C42C" },
  { lat: 12.4, lng: -1.5, city: "Ouagadougou", language: "Bambara", color: "#C4622D" },
  { lat: 15.6, lng: 32.5, city: "Khartoum", language: "Hausa", color: "#2D5A45" },
  { lat: 9.0, lng: 38.7, city: "Addis Ababa", language: "Amharic · Tigrinya", color: "#F5C42C" },
  { lat: 2.0, lng: 45.3, city: "Mogadishu", language: "Somali", color: "#C4622D" },
  { lat: -1.3, lng: 36.8, city: "Nairobi", language: "Swahili", color: "#2D5A45" },
  { lat: -1.9, lng: 29.9, city: "Kigali", language: "Kinyarwanda", color: "#F5C42C" },
  { lat: -4.3, lng: 15.3, city: "Kinshasa", language: "Lingala", color: "#C4622D" },
  { lat: -17.8, lng: 31.0, city: "Harare", language: "Shona", color: "#2D5A45" },
  { lat: -26.2, lng: 28.0, city: "Johannesburg", language: "Zulu · Xhosa", color: "#F5C42C" },
];

// Connects each pin to the next, looping back to the first, so the arcs
// form one continuous ring spanning the highlighted regions.
const ARCS = PINS.map((pin, i) => {
  const next = PINS[(i + 1) % PINS.length];
  return {
    startLat: pin.lat,
    startLng: pin.lng,
    endLat: next.lat,
    endLng: next.lng,
    color: [pin.color, next.color],
  };
});

// Builds the pin marker element, with a pulsing ripple ring on the active pin.
function makePinEl(color: string, active: boolean): HTMLElement {
  const wrap = document.createElement("div");
  wrap.style.cssText = `
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    transform: translate(-50%, -100%);
    pointer-events: none;
  `;

  const size = active ? 32 : 22;
  wrap.innerHTML = `
    <svg width="${size}" height="${size * 1.3}" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg"
      style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.5)); transition: all 0.3s;">
      <path d="M16 0C9.37 0 4 5.37 4 12c0 9 12 22 12 22s12-13 12-22C28 5.37 22.63 0 16 0z"
        fill="${color}" stroke="white" stroke-width="${active ? 2.5 : 2}"/>
      <circle cx="16" cy="12" r="5" fill="white" opacity="0.9"/>
    </svg>
    ${active ? `<div style="
      position: absolute;
      top: -6px;
      left: 50%;
      transform: translateX(-50%);
      width: ${size + 14}px;
      height: ${size + 14}px;
      border-radius: 50%;
      border: 2px solid ${color};
      opacity: 0.5;
      animation: pin-ripple 1.4s ease-out infinite;
    "></div>` : ""}
  `;

  return wrap;
}

function AfricaGlobe({ activeIndex }: { activeIndex: number }) {
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(480);
  const [ready, setReady] = useState(false);
  const orbitRef = useRef<number | null>(null);

  useEffect(() => {
    function measure() {
      if (!containerRef.current) return;
      setSize(containerRef.current.offsetWidth);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Pan to Africa on load, then lock user interaction — the camera drives itself.
  useEffect(() => {
    const timer = setTimeout(() => {
      globeRef.current?.pointOfView({ lat: 2, lng: 18, altitude: 1.55 }, 1600);
      const controls = globeRef.current?.controls();
      if (controls) {
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.enableRotate = false;
      }
      setReady(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Gentle automatic camera orbit around Africa.
  useEffect(() => {
    if (!ready) return;
    let t = 0;
    const tick = () => {
      t += 0.006;
      const lat = 2 + Math.sin(t * 0.28) * 12;
      const lng = 18 + Math.sin(t * 0.55) * 22;
      globeRef.current?.pointOfView({ lat, lng, altitude: 1.55 });
      orbitRef.current = requestAnimationFrame(tick);
    };
    orbitRef.current = requestAnimationFrame(tick);
    return () => {
      if (orbitRef.current) cancelAnimationFrame(orbitRef.current);
    };
  }, [ready]);

  const htmlElementsData = PINS.map((p, i) => ({ ...p, i }));
  const htmlElement = useCallback(
    (d: any) => makePinEl(d.color, d.i === activeIndex),
    [activeIndex]
  );

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center">
      <Globe
        ref={globeRef}
        width={size}
        height={size}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundColor="rgba(0,0,0,0)"
        showAtmosphere={false}
        htmlElementsData={htmlElementsData}
        htmlElement={htmlElement}
        htmlAltitude={0.02}
        arcsData={ARCS}
        arcColor="color"
        arcStroke={0.4}
        arcDashLength={0.4}
        arcDashGap={2}
        arcDashAnimateTime={4000}
        arcAltitudeAutoScale={0.35}
      />
    </div>
  );
}

const teacherSteps = [
  {
    number: "01",
    badgeColor: "#2D5A45",
    image: mockupShareProfile,
    title: "Share your profile",
    description: "Tell us about your teaching experience and the languages you speak.",
  },
  {
    number: "02",
    badgeColor: "#C4622D",
    image: mockupSetSchedule,
    title: "Set your schedule",
    description: "Choose when you're available. You stay in control.",
  },
  {
    number: "03",
    badgeColor: "#F5C42C",
    image: mockupGoLive,
    title: "Teach your way",
    description: "Connect with committed learners. Less chaos, more teaching.",
  },
];

const learnerSteps = [
  { icon: Users, step: "Step 1", title: "Browse teachers", description: "Find a teacher who speaks your heritage language and fits your learning style." },
  { icon: Calendar, step: "Step 2", title: "Book a class", description: "Choose a time that works for you. Learn solo or with family." },
  { icon: MessageCircle, step: "Step 3", title: "Start learning", description: "Connect via Google Meet or WhatsApp and begin your journey home." },
];

export function About() {
  const [activePin, setActivePin] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActivePin((p) => (p + 1) % PINS.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const pin = PINS[activePin];

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero */}
      <section className="relative pt-16 pb-12 overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center min-h-[560px]">
          {/* Text */}
          <div className="w-full lg:w-[52%] px-6 md:px-16 lg:pl-20 lg:pr-8 z-10">
            <div className="bg-[#2D5A45] text-[#F5F0E8] text-xs font-semibold px-4 py-2 rounded-full inline-flex items-center gap-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#F5C42C]"></span>
              ABOUT LULIMI
            </div>

            <h1
              className="text-5xl lg:text-6xl leading-[1.1] mb-6 text-[#1A3A35]"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              Reconnecting the world with <em className="text-[#C4622D] not-italic">African languages</em>
            </h1>

            <p className="text-[17px] text-gray-600 max-w-[480px] leading-relaxed mb-10">
              Lulimi exists so that no one loses their language to distance. We connect learners
              everywhere with certified African language teachers for real, one-on-one instruction —
              not generic apps or algorithms.
            </p>

            {/* Active pin ticker */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 bg-white border border-black/5 rounded-2xl px-4 py-3 shadow-sm">
                <svg width="16" height="22" viewBox="0 0 32 42" fill="none">
                  <path d="M16 0C9.37 0 4 5.37 4 12c0 9 12 22 12 22s12-13 12-22C28 5.37 22.63 0 16 0z"
                    fill={pin.color} stroke="white" strokeWidth="2" />
                  <circle cx="16" cy="12" r="5" fill="white" opacity="0.9" />
                </svg>
                <div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider">Now highlighting</div>
                  <div className="text-sm font-semibold text-[#1A3A35]">
                    {pin.city} — <span style={{ color: pin.color }}>{pin.language}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-1.5">
                {PINS.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Highlight ${PINS[i].city}`}
                    onClick={() => setActivePin(i)}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: i === activePin ? 20 : 6,
                      height: 6,
                      background: i === activePin ? PINS[i].color : "#D1C9BB",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Globe — sits within the right half, desktop only */}
          <div
            className="hidden lg:block absolute top-1/2 -translate-y-1/2"
            style={{ width: 480, height: 480, right: 80 }}
          >
            <AfricaGlobe activeIndex={activePin} />
          </div>

          {/* Globe — centered, full width on mobile */}
          <div className="lg:hidden w-full mt-8 px-4" style={{ height: 340 }}>
            <AfricaGlobe activeIndex={activePin} />
          </div>
        </div>
      </section>

      <style>{`
        @keyframes pin-ripple {
          0%   { transform: translateX(-50%) scale(0.8); opacity: 0.6; }
          100% { transform: translateX(-50%) scale(2.2); opacity: 0; }
        }
      `}</style>

      <JourneySteps />

      {/* How it works for teachers */}
      <section className="py-20 px-6 bg-[#EAF2EA]">
        <div className="container mx-auto max-w-[1100px] text-center">
          <h2 className="text-4xl font-bold mb-3 text-[#1A3A35]" style={{ fontFamily: "Playfair Display, serif" }}>
            How it works for teachers
          </h2>
          <p className="text-gray-600 mb-14">Start teaching in three simple steps</p>

          <div className="mb-12">
            <StepCards steps={teacherSteps} />
          </div>

          <Link to="/teacher/onboarding">
            <Button className="bg-[#2D5A45] hover:bg-[#1A3A35] text-white rounded-full px-8">
              Join as a teacher
            </Button>
          </Link>
        </div>
      </section>

      {/* How it works for learners */}
      <section className="py-20 px-6 bg-[#FDF3E7]">
        <div className="container mx-auto max-w-[1100px] text-center">
          <h2 className="text-4xl font-bold mb-3 text-[#1A3A35]" style={{ fontFamily: "Playfair Display, serif" }}>
            How it works for learners
          </h2>
          <p className="text-gray-600 mb-14">Reconnect with your heritage language</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-12">
            {learnerSteps.map((item) => (
              <div key={item.title} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[#C4622D] flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs font-semibold text-[#C4622D] mb-2">{item.step}</div>
                <h3 className="font-bold text-lg text-[#1A3A35] mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 max-w-[260px]">{item.description}</p>
              </div>
            ))}
          </div>

          <Link to="/teachers">
            <Button
              variant="outline"
              className="border-2 border-[#1A3A35] text-[#1A3A35] hover:bg-[#1A3A35] hover:text-white rounded-full px-8"
            >
              Find a teacher
            </Button>
          </Link>
        </div>
      </section>

      {/* Community first */}
      <section className="py-24 px-6 bg-[#F5F0E8]">
        <div className="container mx-auto max-w-[640px] text-center">
          <Heart className="w-10 h-10 text-[#2D5A45] mx-auto mb-6" strokeWidth={1.5} />
          <h2 className="text-3xl font-bold mb-5 text-[#1A3A35]" style={{ fontFamily: "Playfair Display, serif" }}>
            Community first, not marketplace first
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Lulimi Connect isn't just another tutoring platform. We're building something different —
            a community where African language teachers are respected, supported, and empowered.
            Every lesson taught helps preserve languages and connect generations.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 bg-[#1A3A35]">
        <div className="container mx-auto max-w-[720px] grid grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
              <AnimatedCounter value={240} suffix="+" suffixClassName="text-2xl" />
            </div>
            <div className="text-[13px] text-white/60">Certified teachers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
              <AnimatedCounter value={52} />
            </div>
            <div className="text-[13px] text-white/60">African languages</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
              <AnimatedCounter value={8400} suffix="+" suffixClassName="text-2xl" />
            </div>
            <div className="text-[13px] text-white/60">Learners worldwide</div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-[1200px]">
          <div
            className="relative overflow-hidden rounded-[28px] p-14"
            style={{ background: "linear-gradient(135deg, #C4622D 0%, #7A2E1A 100%)" }}
          >
            <div
              className="absolute top-0 right-0 w-96 h-96 rounded-full"
              style={{ background: "rgba(255, 255, 255, 0.06)", transform: "translate(30%, -30%)" }}
            />
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <h2
                  className="text-[32px] text-white font-bold mb-3 leading-tight"
                  style={{ fontFamily: "Playfair Display, serif" }}
                >
                  Ready to get started?
                </h2>
                <p className="text-white/75 text-base max-w-lg">
                  Whether you want to learn or teach, Lulimi is where your language journey begins.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 flex-shrink-0">
                <Link to="/teachers">
                  <Button
                    size="lg"
                    className="bg-[#F5C42C] hover:bg-[#E8922A] text-[#1A3A35] rounded-full px-8 text-base font-semibold"
                  >
                    Find a teacher
                  </Button>
                </Link>
                <Link to="/teacher/onboarding">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white hover:text-[#1A3A35] rounded-full px-8 text-base font-semibold"
                  >
                    Become a teacher
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
