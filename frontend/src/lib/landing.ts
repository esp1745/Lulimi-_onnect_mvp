import api from "@/lib/api";
import type { User } from "@/types";

/**
 * Where a user should land after authenticating — by password *or* Google.
 *
 * Anyone who hasn't finished setting up goes into their role's onboarding
 * instead of a half-empty dashboard: teachers back into the publishing wizard,
 * learners into the short "tell us who you're learning for" flow. Signing in
 * with Google skips the sign-up form, so this is the only place that catches
 * those accounts — it must not be bypassed for them.
 */
export async function landingPathForUser(user: User): Promise<string> {
  if (user.role === "admin") return "/";

  if (user.role === "learner") {
    try {
      const { data } = await api.get("/api/learners/profile/");
      return data?.onboarding_completed ? "/learner/dashboard" : "/learner/onboarding";
    } catch {
      // Can't tell — onboarding is safe either way, and it can be skipped.
      return "/learner/onboarding";
    }
  }

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
