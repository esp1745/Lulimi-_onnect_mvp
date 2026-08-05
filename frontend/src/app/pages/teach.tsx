import { Link } from "react-router";
import { Navigation } from "../components/navigation";
import { Footer } from "../components/footer";
import { Button } from "../components/ui/button";
import { CalendarClock, DollarSign, Globe2, Sparkles } from "lucide-react";
import { useAuth } from "../context/auth-context";

const benefits = [
  { icon: Globe2, title: "Reach learners worldwide", description: "Share your language with students across the globe, right from home." },
  { icon: CalendarClock, title: "Teach on your schedule", description: "Set your own availability and let learners book the times that work for you." },
  { icon: DollarSign, title: "Set your own rates", description: "You decide your hourly rate and lesson packages — you're in control." },
  { icon: Sparkles, title: "AI teaching assistant", description: "Draft lesson ideas, quizzes, and vocabulary lists in seconds." },
];

export function Teach() {
  const { user } = useAuth();

  // Where the primary CTA sends people, based on who they are.
  let ctaHref = "/signup?role=teacher&next=/teacher/onboarding";
  let ctaLabel = "Start teaching — it's free";
  if (user?.role === "teacher") {
    ctaHref = "/teacher/onboarding";
    ctaLabel = "Continue your teacher profile";
  } else if (user) {
    ctaHref = "/learner/dashboard";
    ctaLabel = "Go to your dashboard";
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Navigation />

      <section className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="text-xs font-semibold tracking-wider text-[#C4622D] uppercase mb-3">For teachers</div>
        <h1 className="text-4xl md:text-6xl text-[#1A3A35] mb-5" style={{ fontFamily: "Playfair Display, serif" }}>
          Share your language. <em className="text-[#C4622D]">Earn on your terms.</em>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          Join a community of teachers keeping African languages alive. Build a profile, set your schedule and
          rates, and start teaching learners around the world.
        </p>
        <Link to={ctaHref}>
          <Button size="lg" className="rounded-full bg-[#C4622D] hover:bg-[#7A2E1A] text-white px-10 h-12 text-base">
            {ctaLabel}
          </Button>
        </Link>
        {!user && (
          <p className="text-sm text-gray-500 mt-4">
            Already have an account?{" "}
            <Link to="/signin" className="text-[#1A3A35] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        )}
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid sm:grid-cols-2 gap-6">
          {benefits.map((b) => (
            <div key={b.title} className="bg-white rounded-2xl p-6 border border-[#1A3A35]/10">
              <div className="w-11 h-11 rounded-full bg-[#F5C42C]/20 flex items-center justify-center mb-4">
                <b.icon className="w-5 h-5 text-[#7A2E1A]" />
              </div>
              <h3 className="font-semibold text-lg text-[#1A3A35] mb-1">{b.title}</h3>
              <p className="text-gray-600 text-sm">{b.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to={ctaHref}>
            <Button size="lg" className="rounded-full bg-[#1A3A35] hover:bg-[#2D5A45] text-white px-10 h-12 text-base">
              {ctaLabel}
            </Button>
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            Have questions?{" "}
            <Link to="/teacher-faq" className="text-[#C4622D] font-semibold hover:underline">
              Read the teacher FAQ
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
