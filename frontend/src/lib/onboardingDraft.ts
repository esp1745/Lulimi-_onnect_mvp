import type { OnboardingData } from "@/app/pages/teacher-onboarding";

/**
 * Local draft of the teacher onboarding wizard.
 *
 * The backend profile can only hold the fields it has columns for, so the
 * in-progress wizard (availability picks, pricing toggles, city, intro video)
 * is kept here too. Keyed per user so two accounts on one machine don't mix.
 *
 * Every access is wrapped: storage throws in private mode / when site data is
 * blocked, and a missing draft must never break onboarding.
 */
const key = (userId: number) => `lulimi:onboardingDraft:${userId}`;

export function loadDraft(userId: number): Partial<OnboardingData> | null {
  try {
    const raw = localStorage.getItem(key(userId));
    return raw ? (JSON.parse(raw) as Partial<OnboardingData>) : null;
  } catch {
    return null;
  }
}

export function saveDraft(userId: number, data: OnboardingData): boolean {
  try {
    localStorage.setItem(key(userId), JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function clearDraft(userId: number): void {
  try {
    localStorage.removeItem(key(userId));
  } catch {
    /* nothing to clean up */
  }
}
