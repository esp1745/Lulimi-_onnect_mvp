import { motion } from "motion/react";
import { Plus, X } from "lucide-react";
import type { OnboardingData } from "../../pages/teacher-onboarding";

interface StepProps {
  formData: OnboardingData;
  updateFormData: (data: Partial<OnboardingData>) => void;
}

const specializationOptions = [
  "Beginner Learners",
  "Business Language",
  "Conversational Practice",
  "Grammar & Writing",
  "Exam Preparation",
  "Kids & Teens",
  "Cultural Immersion",
  "Pronunciation",
];

export function StepExperience({ formData, updateFormData }: StepProps) {
  const addEducation = () => {
    updateFormData({
      education: [...formData.education, { degree: "", institution: "", year: "", field: "" }],
    });
  };

  const updateEducation = (index: number, field: "degree" | "institution", value: string) => {
    const updated = [...formData.education];
    updated[index] = { ...updated[index], [field]: value };
    updateFormData({ education: updated });
  };

  const removeEducation = (index: number) => {
    updateFormData({ education: formData.education.filter((_, i) => i !== index) });
  };

  const addExperience = () => {
    updateFormData({
      experience: [
        ...formData.experience,
        { role: "", organization: "", startDate: "", endDate: "", description: "" },
      ],
    });
  };

  const updateExperience = (index: number, field: "role" | "organization", value: string) => {
    const updated = [...formData.experience];
    updated[index] = { ...updated[index], [field]: value };
    updateFormData({ experience: updated });
  };

  const removeExperience = (index: number) => {
    updateFormData({ experience: formData.experience.filter((_, i) => i !== index) });
  };

  const toggleSpecialization = (spec: string) => {
    if (formData.specializations.includes(spec)) {
      updateFormData({ specializations: formData.specializations.filter((s) => s !== spec) });
    } else {
      updateFormData({ specializations: [...formData.specializations, spec] });
    }
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
        Step 3 of 6
      </div>
      <h1 className="text-4xl mb-3 text-[#1A3A35]" style={{ fontFamily: "Playfair Display, serif" }}>
        Share your <em className="text-[#C4622D]">experience</em>
      </h1>
      <p className="text-gray-600 mb-10">
        Your credentials help learners understand your background and expertise.
      </p>

      <h3 className="font-semibold text-[#1A3A35] mb-4">Education</h3>
      {formData.education.length > 0 && (
        <div className="flex flex-col gap-3 mb-4">
          {formData.education.map((edu, idx) => (
            <div key={idx} className="bg-white border border-[#EDE7D9] rounded-xl p-4 relative">
              <button
                onClick={() => removeEducation(idx)}
                className="absolute top-3 right-3 text-gray-400 hover:text-[#C4622D]"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={edu.degree}
                  onChange={(e) => updateEducation(idx, "degree", e.target.value)}
                  placeholder="Degree"
                  className="px-3 py-2 border border-[#EDE7D9] rounded-lg focus:outline-none focus:border-[#1A3A35]"
                />
                <input
                  value={edu.institution}
                  onChange={(e) => updateEducation(idx, "institution", e.target.value)}
                  placeholder="Institution"
                  className="px-3 py-2 border border-[#EDE7D9] rounded-lg focus:outline-none focus:border-[#1A3A35]"
                />
              </div>
            </div>
          ))}
        </div>
      )}
      <button
        onClick={addEducation}
        className="w-full border-2 border-dashed border-[#1A3A35]/20 rounded-xl py-5 flex items-center justify-center gap-2 text-[#1A3A35] font-medium hover:bg-[#1A3A35]/5 mb-10"
      >
        <Plus className="w-4 h-4" /> Add education
      </button>

      <h3 className="font-semibold text-[#1A3A35] mb-4">Teaching Experience</h3>
      {formData.experience.length > 0 && (
        <div className="flex flex-col gap-3 mb-4">
          {formData.experience.map((exp, idx) => (
            <div key={idx} className="bg-white border border-[#EDE7D9] rounded-xl p-4 relative">
              <button
                onClick={() => removeExperience(idx)}
                className="absolute top-3 right-3 text-gray-400 hover:text-[#C4622D]"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={exp.role}
                  onChange={(e) => updateExperience(idx, "role", e.target.value)}
                  placeholder="Role"
                  className="px-3 py-2 border border-[#EDE7D9] rounded-lg focus:outline-none focus:border-[#1A3A35]"
                />
                <input
                  value={exp.organization}
                  onChange={(e) => updateExperience(idx, "organization", e.target.value)}
                  placeholder="Organization"
                  className="px-3 py-2 border border-[#EDE7D9] rounded-lg focus:outline-none focus:border-[#1A3A35]"
                />
              </div>
            </div>
          ))}
        </div>
      )}
      <button
        onClick={addExperience}
        className="w-full border-2 border-dashed border-[#1A3A35]/20 rounded-xl py-5 flex items-center justify-center gap-2 text-[#1A3A35] font-medium hover:bg-[#1A3A35]/5 mb-10"
      >
        <Plus className="w-4 h-4" /> Add teaching experience
      </button>

      <h3 className="font-semibold text-[#1A3A35] mb-2">Teaching Specializations</h3>
      <p className="text-sm text-gray-500 mb-4">
        Select the areas where you excel. This helps learners find the right match.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {specializationOptions.map((spec) => {
          const selected = formData.specializations.includes(spec);
          return (
            <button
              key={spec}
              onClick={() => toggleSpecialization(spec)}
              className={`flex items-center justify-between px-5 py-4 rounded-xl border transition-colors ${
                selected
                  ? "border-[#1A3A35] bg-[#1A3A35]/5"
                  : "border-[#EDE7D9] bg-white hover:border-[#1A3A35]/30"
              }`}
            >
              <span className="font-medium text-[#1A3A35]">{spec}</span>
              <span
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  selected ? "border-[#1A3A35] bg-[#1A3A35]" : "border-[#1A3A35]/20"
                }`}
              >
                {selected && <span className="w-2 h-2 rounded-full bg-white" />}
              </span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
