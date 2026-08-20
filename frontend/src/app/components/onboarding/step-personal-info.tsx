import { useRef } from "react";
import { motion } from "motion/react";
import { Camera, Upload } from "lucide-react";
import { toast } from "sonner";
import { COUNTRY_CODES } from "@/lib/countryCodes";
import type { OnboardingData } from "../../pages/teacher-onboarding";

interface StepProps {
  formData: OnboardingData;
  updateFormData: (data: Partial<OnboardingData>) => void;
}

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

export function StepPersonalInfo({ formData, updateFormData }: StepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, or GIF).");
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      toast.error("Image is too large. Max size is 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateFormData({ photoUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="max-w-2xl"
    >
      <div className="inline-flex items-center gap-2 bg-[#1A3A35] text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
        Step 1 of 6
      </div>
      <h1 className="text-4xl mb-3 text-[#1A3A35]" style={{ fontFamily: "Playfair Display, serif" }}>
        Tell us about <em className="text-[#C4622D]">yourself</em>
      </h1>
      <p className="text-gray-600 mb-10">
        Help learners get to know you. This information will appear on your public profile.
      </p>

      <div className="flex items-start gap-6 mb-10">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-28 h-28 rounded-2xl border-2 border-dashed border-[#1A3A35]/20 flex flex-col items-center justify-center gap-2 text-[#1A3A35]/40 flex-shrink-0 overflow-hidden hover:border-[#1A3A35]/40 transition-colors"
        >
          {formData.photoUrl ? (
            <img src={formData.photoUrl} alt="Profile preview" className="w-full h-full object-cover" />
          ) : (
            <>
              <Camera className="w-6 h-6" />
              <Upload className="w-4 h-4" />
            </>
          )}
        </button>
        <div>
          <h3 className="font-semibold text-[#1A3A35] mb-1">Profile photo</h3>
          <p className="text-sm text-gray-500 mb-3">
            A clear, friendly headshot helps build trust with learners
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="border border-[#1A3A35]/20 rounded-full px-5 py-2 text-sm font-medium text-[#1A3A35] hover:bg-[#1A3A35]/5"
          >
            {formData.photoUrl ? "Change photo" : "Upload photo"}
          </button>
          <p className="text-xs text-gray-400 mt-2">
            JPG, PNG, or GIF • Max 5MB • Square ratio recommended
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-[#1A3A35] mb-2">First name</label>
          <input
            value={formData.firstName}
            onChange={(e) => updateFormData({ firstName: e.target.value })}
            placeholder="Enter your first name"
            className="w-full px-4 py-3 bg-white border border-[#EDE7D9] rounded-xl focus:outline-none focus:border-[#1A3A35]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1A3A35] mb-2">Last name</label>
          <input
            value={formData.lastName}
            onChange={(e) => updateFormData({ lastName: e.target.value })}
            placeholder="Enter your last name"
            className="w-full px-4 py-3 bg-white border border-[#EDE7D9] rounded-xl focus:outline-none focus:border-[#1A3A35]"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-[#1A3A35] mb-2">Professional headline</label>
        <input
          value={formData.headline}
          onChange={(e) => updateFormData({ headline: e.target.value })}
          placeholder="e.g., Native Swahili speaker with 10+ years teaching experience"
          className="w-full px-4 py-3 bg-white border border-[#EDE7D9] rounded-xl focus:outline-none focus:border-[#1A3A35]"
        />
        <p className="text-xs text-gray-400 mt-1.5">
          A one-line summary that appears at the top of your profile
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-[#1A3A35] mb-2">Country</label>
          <select
            value={formData.country}
            onChange={(e) => updateFormData({ country: e.target.value })}
            className="w-full px-4 py-3 bg-white border border-[#EDE7D9] rounded-xl focus:outline-none focus:border-[#1A3A35]"
          >
            <option value="">Select your country</option>
            {COUNTRY_CODES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1A3A35] mb-2">City</label>
          <input
            value={formData.city}
            onChange={(e) => updateFormData({ city: e.target.value })}
            placeholder="e.g., Nairobi"
            className="w-full px-4 py-3 bg-white border border-[#EDE7D9] rounded-xl focus:outline-none focus:border-[#1A3A35]"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-[#1A3A35] mb-2">About you</label>
        <textarea
          value={formData.bio}
          onChange={(e) => updateFormData({ bio: e.target.value.slice(0, 500) })}
          maxLength={500}
          rows={5}
          placeholder="Share your story, teaching philosophy, and what makes your approach unique. What should learners know about you?"
          className="w-full px-4 py-3 bg-white border border-[#EDE7D9] rounded-xl focus:outline-none focus:border-[#1A3A35] resize-none"
        />
        <p className="text-xs text-gray-400 mt-1.5">{formData.bio.length} / 500 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1A3A35] mb-2">Email address</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => updateFormData({ email: e.target.value })}
          placeholder="your@email.com"
          className="w-full px-4 py-3 bg-white border border-[#EDE7D9] rounded-xl focus:outline-none focus:border-[#1A3A35]"
        />
        <p className="text-xs text-gray-400 mt-1.5">For booking confirmations and important updates</p>
      </div>
    </motion.div>
  );
}
