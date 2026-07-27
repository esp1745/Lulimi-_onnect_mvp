import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Video, Lightbulb, Mic, Languages, Heart } from "lucide-react";
import { toast } from "sonner";
import type { OnboardingData } from "../../pages/teacher-onboarding";

interface StepProps {
  formData: OnboardingData;
  updateFormData: (data: Partial<OnboardingData>) => void;
}

const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

const tips = [
  {
    icon: Lightbulb,
    title: "Good lighting",
    description: "Natural light or a well-lit room makes you look professional",
  },
  {
    icon: Mic,
    title: "Clear audio",
    description: "Find a quiet space and speak clearly into your device",
  },
  {
    icon: Languages,
    title: "Speak the language",
    description: "Introduce yourself in the language you teach",
  },
  {
    icon: Heart,
    title: "Be yourself",
    description: "Show your personality and teaching style authentically",
  },
];

export function StepIntroVideo({ formData, updateFormData }: StepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      toast.error("Please upload an MP4, MOV, or WebM video.");
      return;
    }
    if (file.size > MAX_VIDEO_SIZE) {
      toast.error("Video is too large. Max size is 100MB.");
      return;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    updateFormData({ introVideoUrl: objectUrl });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="max-w-3xl"
    >
      <div className="inline-flex items-center gap-2 bg-[#1A3A35] text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
        Step 4 of 6
      </div>
      <h1 className="text-4xl mb-3 text-[#1A3A35]" style={{ fontFamily: "Playfair Display, serif" }}>
        Record your <em className="text-[#C4622D]">intro video</em>
      </h1>
      <p className="text-gray-600 mb-6">
        A short video helps learners connect with you before booking. Aim for 60-90 seconds.
      </p>

      <div className="bg-[#1A3A35]/5 border border-[#1A3A35]/10 rounded-xl px-5 py-3 text-sm text-[#1A3A35] mb-8">
        🎥 <strong>What to include:</strong> Greet learners in the language you teach, share what
        makes your teaching unique, and mention your teaching style or specialties.
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        onChange={handleFileSelect}
        className="hidden"
      />

      {formData.introVideoUrl && (
        <video src={formData.introVideoUrl} controls className="w-full rounded-2xl mb-4 bg-black" />
      )}

      <div className="border-2 border-dashed border-[#1A3A35]/20 rounded-2xl py-14 flex flex-col items-center justify-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-[#1A3A35]/5 flex items-center justify-center">
          <Video className="w-7 h-7 text-[#1A3A35]/50" />
        </div>
        <div className="text-center">
          <div className="font-semibold text-[#1A3A35] mb-1">
            {formData.introVideoUrl ? "Replace your intro video" : "Upload your intro video"}
          </div>
          <div className="text-sm text-gray-500">
            MP4, MOV, or WebM • Max 100 MB • 60-90 seconds recommended
          </div>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="bg-[#1A3A35] text-white rounded-full px-6 py-2.5 text-sm font-medium hover:bg-[#2D5A45]"
        >
          Choose file
        </button>
      </div>

      <h4 className="font-semibold text-[#1A3A35] mb-4">Tips for a great intro video</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {tips.map((tip) => (
          <div key={tip.title} className="bg-white border border-[#EDE7D9] rounded-xl p-5">
            <div className="w-9 h-9 rounded-full bg-[#F5C42C]/20 flex items-center justify-center mb-3">
              <tip.icon className="w-4 h-4 text-[#7A2E1A]" />
            </div>
            <div className="font-semibold text-[#1A3A35] mb-1">{tip.title}</div>
            <div className="text-sm text-gray-500">{tip.description}</div>
          </div>
        ))}
      </div>

      <h4 className="font-semibold text-[#1A3A35] mb-2">Or paste a video link</h4>
      <p className="text-sm text-gray-500 mb-3">
        Already have a video on YouTube, Loom, or Vimeo? Paste the link here.
      </p>
      <input
        value={formData.introVideoUrl}
        onChange={(e) => updateFormData({ introVideoUrl: e.target.value })}
        placeholder="https://youtube.com/watch?v=..."
        className="w-full px-4 py-3 bg-white border border-[#EDE7D9] rounded-xl focus:outline-none focus:border-[#1A3A35]"
      />
    </motion.div>
  );
}
