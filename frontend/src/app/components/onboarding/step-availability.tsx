import { motion } from "motion/react";
import { Clock, DollarSign } from "lucide-react";
import type { OnboardingData } from "../../pages/teacher-onboarding";
import { TIMEZONE_OPTIONS, formatTimezoneLabel } from "@/lib/timezones";

interface StepProps {
  formData: OnboardingData;
  updateFormData: (data: Partial<OnboardingData>) => void;
}

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const timeSlots = [
  "Early morning (6-9 AM)",
  "Morning (9 AM-12 PM)",
  "Afternoon (12-5 PM)",
  "Evening (5-9 PM)",
  "Late night (9 PM-12 AM)",
];

type PricingToggleKey = "freeIntro" | "packageDiscounts" | "slidingScale";

const pricingToggles: Array<{ key: PricingToggleKey; title: string; description: string }> = [
  {
    key: "freeIntro",
    title: "Free intro session",
    description: "Offer a 15-minute intro call to attract new students",
  },
  {
    key: "packageDiscounts",
    title: "Package discounts",
    description: "Offer discounts for 5+ or 10+ lesson packages",
  },
  {
    key: "slidingScale",
    title: "Sliding scale pricing",
    description: "Accommodate learners with different budgets",
  },
];

export function StepAvailability({ formData, updateFormData }: StepProps) {
  const toggleDay = (day: string) => {
    const nextDays = formData.availability.days.includes(day)
      ? formData.availability.days.filter((d) => d !== day)
      : [...formData.availability.days, day];
    updateFormData({ availability: { ...formData.availability, days: nextDays } });
  };

  const toggleSlot = (slot: string) => {
    const nextSlots = formData.availability.timeSlots.includes(slot)
      ? formData.availability.timeSlots.filter((s) => s !== slot)
      : [...formData.availability.timeSlots, slot];
    updateFormData({ availability: { ...formData.availability, timeSlots: nextSlots } });
  };

  const togglePricing = (key: PricingToggleKey) => {
    updateFormData({ pricing: { ...formData.pricing, [key]: !formData.pricing[key] } });
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
        Step 5 of 6
      </div>
      <h1 className="text-4xl mb-3 text-[#1A3A35]" style={{ fontFamily: "Playfair Display, serif" }}>
        Set your <em className="text-[#C4622D]">availability</em> & pricing
      </h1>
      <p className="text-gray-600 mb-8">
        Let learners know when you're available and what you charge. You can always update this
        later.
      </p>

      <h4 className="flex items-center gap-2 font-semibold text-[#1A3A35] mb-4">
        <Clock className="w-4 h-4" /> Which days are you available?
      </h4>
      <div className="flex flex-wrap gap-2 mb-8">
        {days.map((day) => (
          <button
            type="button"
            key={day}
            onClick={() => toggleDay(day)}
            className={`px-5 py-2 rounded-full border text-sm font-medium transition-colors ${
              formData.availability.days.includes(day)
                ? "bg-[#1A3A35] border-[#1A3A35] text-white"
                : "border-[#EDE7D9] bg-white text-[#1A3A35] hover:border-[#1A3A35]/30"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      <h4 className="font-semibold text-[#1A3A35] mb-4">What times work best for you?</h4>
      <div className="flex flex-col gap-3 mb-8">
        {timeSlots.map((slot) => (
          <label
            key={slot}
            className="flex items-center justify-between px-5 py-3.5 bg-white border border-[#EDE7D9] rounded-xl cursor-pointer"
          >
            <span className="text-[#1A3A35]">{slot}</span>
            <input
              type="checkbox"
              checked={formData.availability.timeSlots.includes(slot)}
              onChange={() => toggleSlot(slot)}
              className="w-4 h-4 accent-[#1A3A35]"
            />
          </label>
        ))}
      </div>

      <h4 className="font-semibold text-[#1A3A35] mb-3">Your timezone</h4>
      <select
        value={formData.availability.timezone}
        onChange={(e) =>
          updateFormData({ availability: { ...formData.availability, timezone: e.target.value } })
        }
        className="w-full px-4 py-3 bg-white border border-[#EDE7D9] rounded-xl mb-2 focus:outline-none focus:border-[#1A3A35]"
      >
        {TIMEZONE_OPTIONS.map((tz) => (
          <option key={tz.value} value={tz.value}>
            {formatTimezoneLabel(tz)}
          </option>
        ))}
      </select>
      <p className="text-xs text-gray-400 mb-8">
        Learners see your availability converted into their own timezone automatically.
      </p>

      <div className="bg-white border border-[#EDE7D9] rounded-2xl p-6">
        <h4 className="flex items-center gap-2 font-semibold text-[#1A3A35] mb-4">
          <DollarSign className="w-4 h-4" /> Set your pricing
        </h4>

        <label className="block text-sm font-medium text-[#1A3A35] mb-2">Hourly rate (USD)</label>
        <div className="flex items-center bg-[#F5F0E8] border border-[#EDE7D9] rounded-full px-5 py-3 mb-2">
          <span className="text-gray-500 mr-2">$</span>
          <input
            type="number"
            min={0}
            inputMode="decimal"
            // Show an empty field (not a stubborn leading "0") until a rate is
            // entered, so typing "10" doesn't become "010".
            value={formData.pricing.hourlyRate === 0 ? "" : formData.pricing.hourlyRate}
            onChange={(e) => {
              const raw = e.target.value;
              const next = raw === "" ? 0 : Math.max(0, Number(raw));
              updateFormData({
                pricing: { ...formData.pricing, hourlyRate: Number.isNaN(next) ? 0 : next },
              });
            }}
            placeholder="0"
            className="flex-1 bg-transparent focus:outline-none"
          />
        </div>
        <p className="text-xs text-gray-400 mb-5">Most teachers charge between $15-40 per hour</p>

        <div className="divide-y divide-[#EDE7D9]">
          {pricingToggles.map((item) => {
            const active = formData.pricing[item.key];
            return (
              <button
                type="button"
                key={item.key}
                onClick={() => togglePricing(item.key)}
                aria-pressed={active}
                className="flex items-center justify-between gap-4 py-4 w-full text-left"
              >
                <div>
                  <div className="font-medium text-[#1A3A35]">{item.title}</div>
                  <div className="text-sm text-gray-500">{item.description}</div>
                </div>
                <span
                  className={`w-12 h-7 rounded-full relative transition-colors flex-shrink-0 border ${
                    active ? "bg-[#2D5A45] border-[#2D5A45]" : "bg-gray-200 border-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
                      active ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
