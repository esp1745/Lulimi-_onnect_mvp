import type { ReactNode } from "react";
import { Link } from "react-router";
import { Check } from "lucide-react";
import { Navigation } from "../components/navigation";
import { Footer } from "../components/footer";
import { Button } from "../components/ui/button";

/**
 * Lightweight content pages so every footer link goes somewhere real instead
 * of dead-ending on "/". Styled to match the reskin: bold Nunito headings,
 * sage (#A0B76F) accents, brick (#C4622D) CTAs — no serif.
 */
function InfoLayout({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col">
      <Navigation />
      <div className="max-w-3xl mx-auto w-full px-6 py-16 flex-1">
        <div className="inline-flex items-center gap-2 bg-[#A0B76F] text-[#1A3A35] text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-5">
          {eyebrow}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-[#1A3A35] mb-4">{title}</h1>
        {intro && <p className="text-lg text-gray-600 mb-10">{intro}</p>}
        <div className="space-y-5 text-gray-700 leading-relaxed">{children}</div>
      </div>
      <Footer />
    </div>
  );
}

function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-[#1A3A35]/10 p-6">
      <div className="flex items-start gap-3">
        <span className="w-7 h-7 rounded-full bg-[#A0B76F]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Check className="w-4 h-4 text-[#A0B76F]" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-[#1A3A35] mb-1.5">{heading}</h2>
          <div className="space-y-2 text-sm md:text-base">{children}</div>
        </div>
      </div>
    </section>
  );
}

function CtaRow({ children }: { children: ReactNode }) {
  return <div className="pt-2 flex gap-3 flex-wrap">{children}</div>;
}

const emailLink = (addr: string) => (
  <a href={`mailto:${addr}`} className="text-[#C4622D] font-semibold hover:underline">
    {addr}
  </a>
);

export function HowItWorks() {
  return (
    <InfoLayout eyebrow="For learners" title="How Lulimi works" intro="Connecting with an African-language teacher takes three simple steps.">
      <Section heading="1. Find a teacher">
        <p>Browse teachers by language, region, price, and experience. Every profile shows reviews, availability, and an intro.</p>
      </Section>
      <Section heading="2. Book a lesson">
        <p>Pick a time from the teacher's availability and send a request. The teacher confirms and you get the meeting details.</p>
      </Section>
      <Section heading="3. Learn & grow">
        <p>Meet online — a Google Meet link is generated automatically for confirmed lessons — and track everything from your dashboard.</p>
      </Section>
      <CtaRow>
        <Link to="/teachers">
          <Button className="rounded-full bg-[#C4622D] hover:bg-[#7A2E1A] text-white font-bold px-8">Find a teacher</Button>
        </Link>
      </CtaRow>
    </InfoLayout>
  );
}

export function Pricing() {
  return (
    <InfoLayout eyebrow="Pricing" title="Simple, transparent pricing" intro="Lulimi is free to join and browse. You only pay for the lessons you book.">
      <Section heading="For learners">
        <p>Creating an account and browsing teachers is completely free. Each teacher sets their own hourly rate — shown clearly on their profile — and many offer discounted lesson packages and free intro sessions.</p>
      </Section>
      <Section heading="For teachers">
        <p>It's free to create a profile and start teaching. You keep control of your own rates and availability.</p>
      </Section>
      <CtaRow>
        <Link to="/teachers">
          <Button className="rounded-full bg-[#C4622D] hover:bg-[#7A2E1A] text-white font-bold px-8">Browse teachers</Button>
        </Link>
        <Link to="/teacher/onboarding">
          <Button className="rounded-full bg-[#A0B76F] hover:bg-[#8aa55a] text-[#1A3A35] font-semibold px-8">Teach on Lulimi</Button>
        </Link>
      </CtaRow>
    </InfoLayout>
  );
}

export function Contact() {
  return (
    <InfoLayout eyebrow="Company" title="Contact us" intro="We'd love to hear from you.">
      <Section heading="General enquiries">
        <p>Email us at {emailLink("hello@lulimiconnect.com")} and we'll get back to you within two business days.</p>
      </Section>
      <Section heading="Support">
        <p>Need help with your account or a booking? Reach us at {emailLink("support@lulimiconnect.com")}.</p>
      </Section>
    </InfoLayout>
  );
}

export function TeacherFaq() {
  const faqs: [string, string][] = [
    ["Who can teach on Lulimi?", "Anyone with strong knowledge of an African language and a passion for teaching. You set your own rates, schedule, and lesson style."],
    ["How do I get started?", "Create a teacher account, then complete the onboarding wizard: your profile, languages, experience, an intro video, and your availability. Publish when you're ready and you'll appear in the marketplace."],
    ["How do payments work?", "You set your hourly rate and any packages. Payment arrangements are made directly between you and your learners for now."],
    ["How do lessons happen?", "Lessons are online. When you confirm a booking, a Google Meet link is generated automatically (if you connect your Google Calendar) and shared with the learner."],
    ["Can I edit my profile later?", "Yes — everything you enter during onboarding can be updated any time from your profile page."],
  ];
  return (
    <InfoLayout eyebrow="For teachers" title="Teacher FAQ" intro="Common questions about teaching on Lulimi.">
      {faqs.map(([q, a]) => (
        <Section key={q} heading={q}>
          <p>{a}</p>
        </Section>
      ))}
      <CtaRow>
        <Link to="/teacher/onboarding">
          <Button className="rounded-full bg-[#C4622D] hover:bg-[#7A2E1A] text-white font-bold px-8">Start teaching</Button>
        </Link>
      </CtaRow>
    </InfoLayout>
  );
}

export function Community() {
  return (
    <InfoLayout eyebrow="For teachers" title="The Lulimi community" intro="A growing network of teachers preserving and sharing African languages.">
      <Section heading="Learn from each other">
        <p>Teachers on Lulimi share teaching resources, tips, and encouragement. As the community grows, we're building spaces for teachers to connect and collaborate.</p>
      </Section>
      <Section heading="Get involved">
        <p>Want to help shape the community? Email {emailLink("community@lulimiconnect.com")}.</p>
      </Section>
    </InfoLayout>
  );
}

export function Blog() {
  return (
    <InfoLayout eyebrow="Company" title="Blog" intro="Stories about language, culture, and the people teaching on Lulimi.">
      <Section heading="Coming soon">
        <p>Our blog is on the way. In the meantime, follow along on social media for updates, teacher spotlights, and language-learning tips.</p>
      </Section>
    </InfoLayout>
  );
}

export function Careers() {
  return (
    <InfoLayout eyebrow="Company" title="Careers" intro="Help us connect the world with African languages.">
      <Section heading="Open roles">
        <p>We're a small, mission-driven team. We don't have open roles right now, but we're always glad to hear from people who share our mission.</p>
        <p>Introduce yourself at {emailLink("careers@lulimiconnect.com")}.</p>
      </Section>
    </InfoLayout>
  );
}

export function Privacy() {
  return (
    <InfoLayout eyebrow="Legal" title="Privacy Policy" intro="How we handle your information.">
      <Section heading="What we collect">
        <p>We collect only the information needed to run Lulimi — your account details, profile, bookings, and messages. We never sell your personal data.</p>
      </Section>
      <Section heading="Questions">
        <p>This is a short summary for our early release; a full privacy policy is on the way. Email {emailLink("privacy@lulimiconnect.com")}.</p>
      </Section>
    </InfoLayout>
  );
}

export function Terms() {
  return (
    <InfoLayout eyebrow="Legal" title="Terms of Service" intro="The basics of using Lulimi.">
      <Section heading="The agreement">
        <p>By using Lulimi you agree to treat other members with respect, provide accurate information, and use the platform lawfully. Teachers are responsible for the lessons they offer; learners are responsible for the bookings they make.</p>
      </Section>
      <Section heading="Questions">
        <p>This is a short summary for our early release; full terms are on the way. Email {emailLink("legal@lulimiconnect.com")}.</p>
      </Section>
    </InfoLayout>
  );
}

export function Cookie() {
  return (
    <InfoLayout eyebrow="Legal" title="Cookie Policy" intro="How Lulimi uses cookies.">
      <Section heading="Essential only">
        <p>We use essential cookies to keep you signed in and to remember your preferences. We don't use cookies to track you across other websites.</p>
      </Section>
      <Section heading="Questions">
        <p>Email {emailLink("privacy@lulimiconnect.com")}.</p>
      </Section>
    </InfoLayout>
  );
}
