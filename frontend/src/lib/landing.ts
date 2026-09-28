import api from "@/lib/api";
import type { User } from "@/types";

/**
 * Where a user should land after authenticating.
 *
 * A teacher who hasn't finished setting up (no published profile, or missing
 * the essentials onboarding collects) goes straight back into the wizard
 * instead of a half-empty dashboard.
 */
export async function landingPathForUser(user: User): Promise<string> {
  if (user.role === "admin") return "/";
  if (user.role === "learner") return "/learner/dashboard";

  try {
    const { data } = await api.get("/api/teachers/profile/");
    const complete = Boolean(
      data?.is_published && data?.headline && data?.bio && (data?.languages?.length ?? 0) > 0
    );
    return complete ? "/teacher/dashboard" : "/teacher/onboarding";
  } catch {
    // Can't tell — send them to onboarding, which is safe either way.
    return "/teacher/onboarding";
  }
}
