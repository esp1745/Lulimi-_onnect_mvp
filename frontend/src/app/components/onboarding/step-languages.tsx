import { motion } from "motion/react";
import { useState } from "react";
import { Search } from "lucide-react";
import * as Flags from "country-flag-icons/react/3x2";
import type { OnboardingData } from "../../pages/teacher-onboarding";

interface StepProps {
  formData: OnboardingData;
  updateFormData: (data: Partial<OnboardingData>) => void;
}

const languageGroups = [
  {
    region: "Zambia",
    languages: [
      { name: "Bemba", country: "ZM" },
      { name: "Nyanja", country: "ZM" },
      { name: "Tonga", country: "ZM" },
      { name: "Lozi", country: "ZM" },
      { name: "Kaonde", country: "ZM" },
      { name: "Luvale", country: "ZM" },
      { name: "Lunda", country: "ZM" },
      { name: "Tumbuka", country: "ZM" },
    ],
  },
  {
    region: "East Africa",
    languages: [
      { name: "Swahili", country: "TZ" },
      { name: "Amharic", country: "ET" },
      { name: "Oromo", country: "ET" },
      { name: "Tigrinya", country: "ER" },
      { name: "Somali", country: "SO" },
      { name: "Kinyarwanda", country: "RW" },
    ],
  },
  {
    region: "West Africa",
    languages: [
      { name: "Yoruba", country: "NG" },
      { name: "Igbo", country: "NG" },
      { name: "Hausa", country: "NG" },
      { name: "Twi", country: "GH" },
      { name: "Wolof", country: "SN" },
      { name: "Fula", country: "SN" },
    ],
  },
  {
    region: "Southern Africa",
    languages: [
      { name: "Zulu", country: "ZA" },
      { name: "Xhosa", country: "ZA" },
      { name: "Shona", country: "ZW" },
      { name: "Sesotho", country: "LS" },
      { name: "Tswana", country: "BW" },
      { name: "Afrikaans", country: "ZA" },
    ],
  },
];

export function StepLanguages({ formData, updateFormData }: StepProps) {
  const [search, setSearch] = useState("");

  const isSelected = (name: string) => formData.selectedLanguages.some((l) => l.name === name);

  const toggleLanguage = (name: string) => {
    if (isSelected(name)) {
      updateFormData({
        selectedLanguages: formData.selectedLanguages.filter((l) => l.name !== name),
      });
    } else {
      updateFormData({
        selectedLanguages: [...formData.selectedLanguages, { name, proficiency: "Fluent" }],
      });
    }
  };

  const filteredGroups = languageGroups
    .map((group) => ({
      ...group,
      languages: group.languages.filter((l) =>
        l.name.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((group) => group.languages.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="max-w-3xl"
    >
      <div className="inline-flex items-center gap-2 bg-[#1A3A35] text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
        Step 2 of 6
      </div>
      <h1 className="text-4xl mb-3 text-[#1A3A35]" style={{ fontFamily: "Playfair Display, serif" }}>
        Which <em className="text-[#C4622D]">languages</em> do you teach?
      </h1>
      <p className="text-gray-600 mb-6">
        Select all the African languages you're qualified to teach. You can choose multiple.
      </p>

      <div className="bg-[#F5C42C]/10 border border-[#F5C42C]/30 rounded-xl px-5 py-3 text-sm text-[#7A2E1A] mb-6">
        💡 Tip: Add all languages you can teach confidently. You'll set proficiency levels next.
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for a language..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-[#EDE7D9] rounded-xl focus:outline-none focus:border-[#1A3A35]"
        />
      </div>

      {filteredGroups.map((group) => (
        <div key={group.region} className="mb-8">
          <h4 className="text-xs font-semibold tracking-wide text-gray-500 mb-3">
            {group.region.toUpperCase()}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {group.languages.map((lang) => {
              const selected = isSelected(lang.name);
              const Flag = Flags[lang.country as keyof typeof Flags];
              return (
                <button
                  key={lang.name}
                  onClick={() => toggleLanguage(lang.name)}
                  className={`flex flex-col items-start gap-3 p-5 rounded-2xl border text-left transition-colors ${
                    selected
                      ? "border-[#1A3A35] bg-[#1A3A35]/5"
                      : "border-[#EDE7D9] bg-white hover:border-[#1A3A35]/30"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <Flag className="w-9 h-6 rounded-[3px] shadow-sm flex-shrink-0" />
                    <span
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selected ? "border-[#1A3A35] bg-[#1A3A35]" : "border-[#1A3A35]/20"
                      }`}
                    >
                      {selected && <span className="w-2 h-2 rounded-full bg-white" />}
                    </span>
                  </div>
                  <span className="font-semibold text-[#1A3A35] text-lg">{lang.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
