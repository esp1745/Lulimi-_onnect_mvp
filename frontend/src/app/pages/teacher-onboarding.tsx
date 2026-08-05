import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Check, Camera, Video, Globe, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { StepPersonalInfo } from "../components/onboarding/step-personal-info";
import { StepLanguages } from "../components/onboarding/step-languages";
import { StepExperience } from "../components/onboarding/step-experience";
import { StepIntroVideo } from "../components/onboarding/step-intro-video";
import { StepAvailability } from "../components/onboarding/step-availability";
import { StepGoLive } from "../components/onboarding/step-go-live";
import { useAuth } from "../context/auth-context";
import { submitOnboarding } from "@/lib/onboardingSubmit";
import { detectTimezone } from "@/lib/timezones";
import lulimiLogoWhite from "@/assets/lulimi-logo-white.png";

export interface OnboardingData {
  // Step 1
  firstName: string;
  lastName: string;
  photoUrl: string;
  headline: string;
  country: string;
  city: string;
  bio: string;
  email: string;

  // Step 2
  selectedLanguages: Array<{ name: string; proficiency: string }>;

  // Step 3
  education: Array<{ degree: string; institution: string; year: string; field: string }>;
  experience: Array<{ role: string; organization: string; startDate: string; endDate: string; description: string }>;
  specializations: string[];

  // Step 4
  introVideoUrl: string;

  // Step 5
  availability: {
    days: string[];
    timeSlots: string[];
    timezone: string;
  };
  pricing: {
    hourlyRate: number;
    freeIntro: boolean;
    packageDiscounts: boolean;
    slidingScale: boolean;
  };
}

const steps = [
  { number: 1, name: "Personal Info", label: "Who you are", icon: Camera },
  { number: 2, name: "Languages", label: "What you teach", icon: Globe },
  { number: 3, name: "Experience", label: "Your background", icon: Sparkles },
  { number: 4, name: "Intro Video", label: "Introduce yourself", icon: Video },
  { number: 5, name: "Availability", label: "When you teach", icon: Check },
  { number: 6, name: "Go Live", label: "Review & publish", icon: Check },
];

export function TeacherOnboarding() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPublished, setIsPublished] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    firstName: "",
    lastName: "",
    photoUrl: "",
    headline: "",
    country: "",
    city: "",
    bio: "",
    email: "",
    selectedLanguages: [],
    education: [],
    experience: [],
    specializations: [],
    introVideoUrl: "",
    availability: {
      days: [],
      timeSlots: [],
      timezone: detectTimezone(),
    },
    pricing: {
      hourlyRate: 0,
      freeIntro: false,
      packageDiscounts: false,
      slidingScale: false,
    },
  });

  // Onboarding requires a teacher account. Send visitors to sign-up first
  // (returning here afterwards) so their work is tied to an account and can
  // actually be published — no more "publish errored, redo everything".
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/signup?role=teacher&next=/teacher/onboarding", { replace: true });
    } else if (user.role !== "teacher") {
      toast.error("Only teacher accounts can build a teaching profile.");
      navigate("/learner/dashboard", { replace: true });
    }
  }, [authLoading, user, navigate]);

  // Prefill from the signed-in account so teachers don't retype what we know.
  useEffect(() => {
    if (!user) return;
    const [firstName = "", ...rest] = user.full_name.split(" ");
    setFormData((prev) => ({
      ...prev,
      firstName: prev.firstName || firstName,
      lastName: prev.lastName || rest.join(" "),
      email: prev.email || user.email,
      country: prev.country || user.country || "",
    }));
  }, [user]);

  // Each step change should start at the top, not wherever the last step ended.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  const updateFormData = (data: Partial<OnboardingData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  if (authLoading || !user || user.role !== "teacher") {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>;
  }

  const handlePublish = async () => {
    if (!user) {
      toast.error("Create a teacher account first to publish your profile.");
      navigate("/signup?role=teacher");
      return;
    }
    if (user.role !== "teacher") {
      toast.error("Only teacher accounts can publish a teaching profile.");
      return;
    }
    setPublishing(true);
    try {
      await submitOnboarding(formData);
      setIsPublished(true);
    } catch (err: unknown) {
      const data = (err as { response?: { data?: unknown } })?.response?.data;
      const message = typeof data === "object" && data ? Object.values(data as object).flat().join(" ") : null;
      toast.error(message || "Could not publish your profile. Please check your details and try again.");
    } finally {
      setPublishing(false);
    }
  };

  const progressPercentage = (currentStep / 6) * 100;

  // Generate initials for preview card
  const initials = formData.firstName && formData.lastName
    ? `${formData.firstName[0]}${formData.lastName[0]}`.toUpperCase()
    : "?";

  if (isPublished) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-[#F5F0E8] to-[#F5C42C]/10 flex items-center justify-center px-6"
      >
        <div className="text-center max-w-2xl">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-8xl mb-8"
          >
            🎉
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-5xl mb-6 text-[#1A3A35]"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            You're <em className="text-[#C4622D]">live</em> on Lulimi!
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-gray-600 mb-8 max-w-lg mx-auto"
          >
            Welcome to the community! Your profile is now visible to thousands of learners across the globe.
            Get ready to share your knowledge and make an impact.
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex gap-4 justify-center"
          >
            <Link to="/teacher/dashboard">
              <Button
                size="lg"
                className="bg-[#C4622D] hover:bg-[#7A2E1A] text-white rounded-full px-8"
              >
                Go to my dashboard
              </Button>
            </Link>
            <Link to="/">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-[#1A3A35] text-[#1A3A35] hover:bg-[#1A3A35] hover:text-white rounded-full px-8"
              >
                Back to homepage
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Top Navigation */}
      <div className="bg-[#1A3A35] px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link to="/">
          <img src={lulimiLogoWhite} alt="Lulimi" className="h-9 w-auto" />
        </Link>
        <div className="text-[#F5F0E8]/60 text-sm">
          Progress saved automatically
        </div>
        <Link to="/">
          <Button
            variant="outline"
            className="bg-transparent border border-[#F5F0E8]/30 text-[#F5F0E8] hover:bg-[#F5F0E8]/10 rounded-full px-6"
          >
            Save & exit
          </Button>
        </Link>
      </div>

      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-[280px] bg-[#1A3A35] min-h-[calc(100vh-64px)] p-12 sticky top-[64px] flex flex-col">
          <div className="text-[#F5F0E8]/40 text-xs font-semibold tracking-wider mb-8">
            YOUR JOURNEY
          </div>

          <div className="space-y-2 flex-1">
            {steps.map((step, index) => {
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              const Icon = step.icon;

              return (
                <div key={step.number} className="relative">
                  {index < steps.length - 1 && (
                    <div className="absolute left-4 top-10 w-px h-8 bg-[#F5F0E8]/20" />
                  )}
                  <button
                    onClick={() => goToStep(step.number)}
                    className={`flex items-start gap-3 w-full text-left py-2 transition-all ${
                      isActive ? "opacity-100" : "opacity-50 hover:opacity-75"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                        isCompleted
                          ? "bg-[#2D5A45]"
                          : isActive
                          ? "bg-[#F5C42C]"
                          : "border-2 border-[#F5F0E8]/30"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        <span
                          className={`text-sm font-semibold ${
                            isActive ? "text-[#1A3A35]" : "text-[#F5F0E8]/60"
                          }`}
                        >
                          {step.number}
                        </span>
                      )}
                    </div>
                    <div>
                      <div
                        className={`font-semibold text-sm ${
                          isActive ? "text-[#F5F0E8]" : "text-[#F5F0E8]/60"
                        }`}
                      >
                        {step.name}
                      </div>
                      <div className="text-[#F5F0E8]/40 text-xs">
                        {step.label}
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Live Preview Card */}
          <div className="mt-8 bg-[#F5F0E8] rounded-2xl p-4 border border-[#F5F0E8]/20">
            <div className="text-[#1A3A35] text-xs font-semibold mb-3 opacity-60">
              LIVE PREVIEW
            </div>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-[#C4622D] flex items-center justify-center text-white font-semibold flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-[#1A3A35] truncate">
                  {formData.firstName && formData.lastName
                    ? `${formData.firstName} ${formData.lastName}`
                    : "Your Name"}
                </div>
                <div className="text-xs text-gray-600 truncate">
                  {formData.city && formData.country
                    ? `${formData.city}, ${formData.country}`
                    : "Location"}
                </div>
                {formData.selectedLanguages.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.selectedLanguages.slice(0, 2).map((lang) => (
                      <div
                        key={lang.name}
                        className="bg-[#1A3A35] text-[#F5F0E8] text-[10px] px-2 py-0.5 rounded-full"
                      >
                        {lang.name}
                      </div>
                    ))}
                    {formData.selectedLanguages.length > 2 && (
                      <div className="bg-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-full">
                        +{formData.selectedLanguages.length - 2}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Progress Bar */}
          <div className="h-1 bg-[#F5F0E8]/50">
            <motion.div
              className="h-full bg-gradient-to-r from-[#2D5A45] to-[#E8922A]"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Step Content */}
          <div className="px-12 py-12 pb-32">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <StepPersonalInfo
                  key="step1"
                  formData={formData}
                  updateFormData={updateFormData}
                />
              )}
              {currentStep === 2 && (
                <StepLanguages
                  key="step2"
                  formData={formData}
                  updateFormData={updateFormData}
                />
              )}
              {currentStep === 3 && (
                <StepExperience
                  key="step3"
                  formData={formData}
                  updateFormData={updateFormData}
                />
              )}
              {currentStep === 4 && (
                <StepIntroVideo
                  key="step4"
                  formData={formData}
                  updateFormData={updateFormData}
                />
              )}
              {currentStep === 5 && (
                <StepAvailability
                  key="step5"
                  formData={formData}
                  updateFormData={updateFormData}
                />
              )}
              {currentStep === 6 && (
                <StepGoLive
                  key="step6"
                  formData={formData}
                  goToStep={goToStep}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Action Bar */}
          <div className="fixed bottom-0 left-[280px] right-0 bg-[#F5F0E8] border-t border-[#1A3A35]/10 px-12 py-6 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="border-2 border-[#1A3A35]/20 text-[#1A3A35] hover:bg-[#1A3A35]/5 rounded-full px-8 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Back
            </Button>

            <div className="text-sm text-gray-500">
              Step {currentStep} of 6
            </div>

            {currentStep < 6 ? (
              <Button
                onClick={nextStep}
                className="bg-[#C4622D] hover:bg-[#7A2E1A] text-white rounded-full px-8"
              >
                Continue
              </Button>
            ) : (
              <Button
                onClick={handlePublish}
                disabled={publishing}
                className="bg-gradient-to-r from-[#C4622D] to-[#E8922A] hover:opacity-90 text-white rounded-full px-8"
              >
                {publishing ? "Publishing…" : "Publish my profile"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
