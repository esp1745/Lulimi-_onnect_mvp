import mockupBrowseFilter from "@/assets/mockup-browse-filter.png";
import mockupBookTrial from "@/assets/mockup-book-trial.png";
import mockupLearnConsistently from "@/assets/mockup-learn-consistently.png";
import { StepCards } from "./step-cards";

const steps = [
  {
    number: "01",
    badgeColor: "#C4622D",
    image: mockupBrowseFilter,
    title: "Browse & filter",
    description: "Explore teachers by language, availability, teaching style, and budget. Read genuine reviews.",
  },
  {
    number: "02",
    badgeColor: "#1A3A35",
    image: mockupBookTrial,
    title: "Book a free trial",
    description: "Try a 30-minute introductory lesson before committing. No surprises.",
  },
  {
    number: "03",
    badgeColor: "#E8922A",
    image: mockupLearnConsistently,
    title: "Learn consistently",
    description: "Follow a personalised curriculum, track progress, and stay accountable with your teacher.",
  },
];

export function JourneySteps() {
  return (
    <section className="py-24 px-6 bg-[#F5F0E8]">
      <div className="container mx-auto max-w-[1100px] text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="w-8 h-px bg-[#1A3A35]/30" />
          <span className="text-xs font-semibold tracking-wide text-[#2D5A45]">SIMPLE &amp; PERSONAL</span>
          <span className="w-8 h-px bg-[#1A3A35]/30" />
        </div>
        <h2
          className="text-4xl mb-16 text-[#1A3A35]"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          Your language journey, in three steps
        </h2>

        <StepCards steps={steps} />
      </div>
    </section>
  );
}
