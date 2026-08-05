import api from "@/lib/api";
import type { OnboardingData } from "@/app/pages/teacher-onboarding";

const DAY_INDEX: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

const SLOT_TIMES: Record<string, [string, string]> = {
  "Early morning (6-9 AM)": ["06:00", "09:00"],
  "Morning (9 AM-12 PM)": ["09:00", "12:00"],
  "Afternoon (12-5 PM)": ["12:00", "17:00"],
  "Evening (5-9 PM)": ["17:00", "21:00"],
  "Late night (9 PM-12 AM)": ["21:00", "23:59"],
};

async function uploadDataUrlPhoto(dataUrl: string): Promise<string> {
  const blob = await (await fetch(dataUrl)).blob();
  const form = new FormData();
  form.append("file", blob, "profile-photo.jpg");
  const { data } = await api.post("/api/resources/upload/", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.url as string;
}

async function syncLanguages(selected: OnboardingData["selectedLanguages"]) {
  const { data: existing } = await api.get("/api/teachers/languages/");
  const existingNames = new Set(existing.map((l: { language_name: string }) => l.language_name));
  await Promise.all(
    selected
      .filter((lang) => !existingNames.has(lang.name))
      .map((lang) =>
        api.post("/api/teachers/languages/", {
          language_name: lang.name,
          proficiency_type: lang.proficiency.toLowerCase(),
        })
      )
  );
}

async function syncAvailability(availability: OnboardingData["availability"]) {
  if (availability.days.length === 0 || availability.timeSlots.length === 0) return;
  // `availability.timezone` is already an IANA id (e.g. "Africa/Lagos").
  const timezone = availability.timezone || "UTC";
  const { data: existing } = await api.get("/api/teachers/availability/");
  await Promise.all(existing.map((slot: { id: number }) => api.delete(`/api/teachers/availability/${slot.id}/`)));

  const requests: Promise<unknown>[] = [];
  for (const day of availability.days) {
    for (const slot of availability.timeSlots) {
      const [start_time, end_time] = SLOT_TIMES[slot] ?? ["09:00", "17:00"];
      requests.push(
        api.post("/api/teachers/availability/", {
          day_of_week: DAY_INDEX[day] ?? 0,
          start_time,
          end_time,
          timezone,
          is_active: true,
        })
      );
    }
  }
  await Promise.all(requests);
}

/** Persists the full onboarding wizard to the backend and publishes the profile. Returns the teacher id. */
export async function submitOnboarding(formData: OnboardingData): Promise<number> {
  let profile_photo_url: string | undefined;
  if (formData.photoUrl.startsWith("data:")) {
    profile_photo_url = await uploadDataUrlPhoto(formData.photoUrl);
  }

  // Only persist a video link if it's a real, shareable URL. A "blob:" object
  // URL from a local file preview would 404 for everyone else, so drop it.
  const intro_video_url =
    formData.introVideoUrl && !formData.introVideoUrl.startsWith("blob:")
      ? formData.introVideoUrl
      : "";

  const { data: profile } = await api.put("/api/teachers/profile/", {
    headline: formData.headline,
    bio: formData.bio,
    city: formData.city,
    education: formData.education.map((e) => ({ degree: e.degree, institution: e.institution })),
    work_experience: formData.experience,
    specializations: formData.specializations,
    intro_video_url,
    price: formData.pricing.hourlyRate || null,
    pricing_info: [
      formData.pricing.freeIntro && "Free intro session",
      formData.pricing.packageDiscounts && "Package discounts available",
      formData.pricing.slidingScale && "Sliding scale pricing available",
    ]
      .filter(Boolean)
      .join(" · "),
    ...(profile_photo_url ? { profile_photo_url } : {}),
  });

  // Country lives on the User account, not the Teacher profile.
  if (formData.country) {
    await api.patch("/api/auth/me/", { country: formData.country }).catch(() => {});
  }

  await syncLanguages(formData.selectedLanguages);
  await syncAvailability(formData.availability);
  await api.post("/api/teachers/profile/publish/", {});
  return profile.id as number;
}
