import { motion } from "motion/react";
import { CheckCircle2, Info } from "lucide-react";
import type { OnboardingData } from "../../pages/teacher-onboarding";

interface StepGoLiveProps {
  formData: OnboardingData;
  goToStep: (step: number) => void;
}

const checklist = [
  { step: 1, title: "Personal information", description: "Name, photo, headline, and bio" },
  { step: 2, title: "Languages & proficiency", description: "Languages you teach and your expertise" },
  { step: 3, title: "Credentials & experience", description: "Education and teaching background" },
  { step: 4, title: "Intro video", description: "Your introduction to learners" },
  { step: 5, title: "Availability & pricing", description: "When you teach and your rates" },
];

export function StepGoLive({ formData, goToStep }: StepGoLiveProps) {
  const initials =
    formData.firstName && formData.lastName
      ? `${formData.firstName[0]}${formData.lastName[0]}`.toUpperCase()
      : "?";

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="max-w-3xl"
    >
      <div className="inline-flex items-center gap-2 bg-[#F5C42C] text-[#1A3A35] text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
        ! Profile preview - not yet published
      </div>
      <h1 className="text-4xl mb-3 text-[#1A3A35]" style={{ fontFamily: "Playfair Display, serif" }}>
        You're ready to <em className="text-[#C4622D]">go live!</em>
      </h1>
      <p className="text-gray-600 mb-8">
        Review your profile below and publish when you're ready. You can always edit it later.
      </p>

      <div className="bg-white rounded-2xl p-6 border border-[#1A3A35]/10 flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl bg-[#C4622D] flex items-center justify-center text-white text-2xl font-semibold flex-shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <span>
                {formData.city && formData.country
                  ? `${formData.city}, ${formData.country}`
                  : "Location"}
              </span>
              <span className="text-[#F5C42C]">★</span>
              <span className="font-medium text-[#1A3A35]">New teacher</span>
            </div>
            <div className="font-semibold text-lg text-[#1A3A35]">
              {formData.firstName && formData.lastName
                ? `${formData.firstName} ${formData.lastName}`
                : "Your Name"}
            </div>
          </div>
        </div>
        <div className="bg-[#F5F0E8] rounded-xl p-4 text-center flex-shrink-0 w-full sm:w-auto">
          <div className="text-xs text-gray-500 mb-1">Starting at</div>
          <div
            className="text-2xl font-bold text-[#1A3A35] mb-3"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            ${formData.pricing.hourlyRate || "—"}/hr
          </div>
          <button className="w-full bg-[#C4622D] text-white rounded-full px-6 py-2 text-sm font-medium mb-2">
            Book lesson
          </button>
          <button className="w-full border border-[#1A3A35]/20 text-[#1A3A35] rounded-full px-6 py-2 text-sm font-medium">
            Message
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#1A3A35]/10 p-6 mb-8">
        <h3 className="font-semibold text-lg text-[#1A3A35] mb-4">Profile completion checklist</h3>
        <div className="divide-y divide-[#EDE7D9]">
          {checklist.map((item) => (
            <div key={item.step} className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2D5A45]" />
                <div>
                  <div className="font-medium text-[#1A3A35]">{item.title}</div>
                  <div className="text-sm text-gray-500">{item.description}</div>
                </div>
              </div>
              <button
                onClick={() => goToStep(item.step)}
                className="text-sm text-[#1A3A35] font-medium hover:underline"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#1A3A35]/5 border border-[#1A3A35]/10 rounded-xl p-5 flex gap-3 text-sm text-[#1A3A35]">
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p>
          <strong>What happens next?</strong> Once you publish, our team will review your profile
          within 24 hours. You'll receive an email confirmation once you're approved and live on
          the platform. In the meantime, you can continue to refine your profile.
        </p>
      </div>
    </motion.div>
  );
}
