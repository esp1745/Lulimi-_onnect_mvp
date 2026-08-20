import api from "@/lib/api";
import type { User } from "@/types";

/**
 * Where a user should land after authenticating. Teachers whose profile isn't
 * complete yet (no published profile) are sent to onboarding to finish it,
 * rather than a half-empty dashboard.
 */
export async function landingPathForUser(user: User): Promise<string> {
  if (user.role === "admin") return "/";
  if (user.role === "learner") return "/learner/dashboard";

  // Teacher: complete === has a published profile.
  try {
    const { data } = await api.get("/api/teachers/profile/");
    const complete = data?.is_published && data?.headline && data?.bio && (data?.languages?.length ?? 0) > 0;
    return complete ? "/teacher/dashboard" : "/teacher/onboarding";
  } catch {
    return "/teacher/onboarding";
  }
}
