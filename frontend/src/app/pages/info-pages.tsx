import type { ReactNode } from "react";
import { Link } from "react-router";
import { Navigation } from "../components/navigation";
import { Footer } from "../components/footer";
import { Button } from "../components/ui/button";

/**
 * Lightweight content pages so every footer/nav link goes somewhere real
 * instead of dead-ending on "/". Each page shares the same layout for a
 * consistent feel with the rest of the site.
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
    <div className="min-h-screen bg-[#F5F0E8]">
      <Navigation />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-xs font-semibold tracking-wider text-[#C4622D] uppercase mb-3">{eyebrow}</div>
        <h1 className="text-4xl md:text-5xl text-[#1A3A35] mb-4" style={{ fontFamily: "Playfair Display, serif" }}>
          {title}
        </h1>
        {intro && <p className="text-lg text-gray-600 mb-10">{intro}</p>}
        <div className="space-y-6 text-gray-700 leading-relaxed">{children}</div>
      </div>
      <Footer />
    </div>
  );
}

function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-[#1A3A35] mb-2">{heading}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    ["1. Find a teacher", "Browse teachers by language, region, price, and experience. Every profile shows reviews, availability, and an intro."],
    ["2. Book a lesson", "Pick a time from the teacher's availability and send a request. The teacher confirms and you get the meeting details."],
    ["3. Learn & grow", "Meet online (a Google Meet link is generated automatically for confirmed lessons) and keep track of everything from your dashboard."],
  ];
  return (
    <InfoLayout eyebrow="For learners" title="How Lulimi works" intro="Connecting with an African-language teacher takes three simple steps.">
      {steps.map(([h, b]) => (
        <Section key={h} heading={h}>
          <p>{b}</p>
        </Section>
      ))}
      <div className="pt-4">
        <Link to="/teachers">
          <Button className="rounded-full bg-[#C4622D] hover:bg-[#7A2E1A] text-white px-8">Find a teacher</Button>
        </Link>
      </div>
    </InfoLayout>
  );
}

export function Pricing() {
  return (
    <InfoLayout
      eyebrow="Pricing"
      title="Simple, transparent pricing"
      intro="Lulimi is free to join and browse. You only pay for the lessons you book."
    >
      <Section heading="For learners">
        <p>Creating an account and browsing teachers is completely free. Each teacher sets their own hourly rate — shown clearly on their profile — and many offer discounted lesson packages and free intro sessions.</p>
      </Section>
      <Section heading="For teachers">
        <p>It's free to create a profile and start teaching. You keep control of your own rates and availability.</p>
      </Section>
      <div className="pt-4 flex gap-3 flex-wrap">
        <Link to="/teachers">
          <Button className="rounded-full bg-[#C4622D] hover:bg-[#7A2E1A] text-white px-8">Browse teachers</Button>
        </Link>
        <Link to="/teach">
          <Button variant="outline" className="rounded-full border-[#1A3A35]/20 text-[#1A3A35] px-8">Teach on Lulimi</Button>
        </Link>
      </div>
    </InfoLayout>
  );
}

export function Contact() {
  return (
    <InfoLayout eyebrow="Company" title="Contact us" intro="We'd love to hear from you.">
      <Section heading="General enquiries">
        <p>
          Email us at{" "}
          <a href="mailto:hello@lulimiconnect.com" className="text-[#C4622D] font-medium hover:underline">
            hello@lulimiconnect.com
          </a>{" "}
          and we'll get back to you within two business days.
        </p>
      </Section>
      <Section heading="Support">
        <p>
          Need help with your account or a booking? Reach us at{" "}
          <a href="mailto:support@lulimiconnect.com" className="text-[#C4622D] font-medium hover:underline">
            support@lulimiconnect.com
          </a>
          .
        </p>
      </Section>
    </InfoLayout>
  );
}

export function TeacherFaq() {
  const faqs = [
    ["Who can teach on Lulimi?", "Anyone with strong knowledge of an African language and a passion for teaching. You set your own rates, schedule, and lesson style."],
    ["How do I get started?", "Create a teacher account, then complete the onboarding wizard: your profile, languages, experience, an intro video, and your availability. Once you publish, our team reviews your profile before it goes live."],
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
      <div className="pt-4">
        <Link to="/teach">
          <Button className="rounded-full bg-[#C4622D] hover:bg-[#7A2E1A] text-white px-8">Start teaching</Button>
        </Link>
      </div>
    </InfoLayout>
  );
}

export function Community() {
  return (
    <InfoLayout
      eyebrow="For teachers"
      title="The Lulimi community"
      intro="A growing network of teachers preserving and sharing African languages."
    >
      <Section heading="Learn from each other">
        <p>Teachers on Lulimi share teaching resources, tips, and encouragement. As the community grows, we're building spaces for teachers to connect and collaborate.</p>
      </Section>
      <Section heading="Get involved">
        <p>
          Want to help shape the community? Email{" "}
          <a href="mailto:community@lulimiconnect.com" className="text-[#C4622D] font-medium hover:underline">
            community@lulimiconnect.com
          </a>
          .
        </p>
      </Section>
    </InfoLayout>
  );
}

export function ResourcesInfo() {
  return (
    <InfoLayout
      eyebrow="For teachers"
      title="Teaching resources"
      intro="Tools and materials to help you teach effectively on Lulimi."
    >
      <Section heading="Lesson materials">
        <p>Teachers can upload and share audio, PDFs, and images with their students directly from their dashboard, and attach resources to specific lessons.</p>
      </Section>
      <Section heading="AI teaching assistant">
        <p>Signed-in teachers get an AI assistant that helps draft lesson ideas, vocabulary lists, pronunciation exercises, quizzes, and homework — always review AI-generated content before sharing it with students.</p>
      </Section>
      <div className="pt-4">
        <Link to="/teach">
          <Button className="rounded-full bg-[#C4622D] hover:bg-[#7A2E1A] text-white px-8">Become a teacher</Button>
        </Link>
      </div>
    </InfoLayout>
  );
}

export function Blog() {
  return (
    <InfoLayout eyebrow="Company" title="Blog" intro="Stories about language, culture, and the people teaching on Lulimi.">
      <p>Our blog is coming soon. In the meantime, follow along on social media for updates, teacher spotlights, and language-learning tips.</p>
    </InfoLayout>
  );
}

export function Careers() {
  return (
    <InfoLayout eyebrow="Company" title="Careers" intro="Help us connect the world with African languages.">
      <p>We're a small, mission-driven team. We don't have open roles right now, but we're always glad to hear from people who share our mission.</p>
      <p>
        Introduce yourself at{" "}
        <a href="mailto:careers@lulimiconnect.com" className="text-[#C4622D] font-medium hover:underline">
          careers@lulimiconnect.com
        </a>
        .
      </p>
    </InfoLayout>
  );
}

export function Privacy() {
  return (
    <InfoLayout eyebrow="Legal" title="Privacy Policy" intro="How we handle your information.">
      <p>We collect only the information needed to run Lulimi — your account details, profile, bookings, and messages. We never sell your personal data.</p>
      <p>This is a short summary for our early release; a full privacy policy is on the way. Questions? Email <a href="mailto:privacy@lulimiconnect.com" className="text-[#C4622D] font-medium hover:underline">privacy@lulimiconnect.com</a>.</p>
    </InfoLayout>
  );
}

export function Terms() {
  return (
    <InfoLayout eyebrow="Legal" title="Terms of Service" intro="The basics of using Lulimi.">
      <p>By using Lulimi you agree to treat other members with respect, provide accurate information, and use the platform lawfully. Teachers are responsible for the lessons they offer; learners are responsible for the bookings they make.</p>
      <p>This is a short summary for our early release; full terms are on the way. Questions? Email <a href="mailto:legal@lulimiconnect.com" className="text-[#C4622D] font-medium hover:underline">legal@lulimiconnect.com</a>.</p>
    </InfoLayout>
  );
}

export function Cookie() {
  return (
    <InfoLayout eyebrow="Legal" title="Cookie Policy" intro="How Lulimi uses cookies.">
      <p>We use essential cookies to keep you signed in and to remember your preferences. We don't use cookies to track you across other websites.</p>
      <p>Questions? Email <a href="mailto:privacy@lulimiconnect.com" className="text-[#C4622D] font-medium hover:underline">privacy@lulimiconnect.com</a>.</p>
    </InfoLayout>
  );
}
