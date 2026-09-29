import type { ReactNode } from "react";
import { RoleSubNav } from "./TeacherSubNav";
import { UserAvatar } from "./UserAvatar";
import { useAuth } from "../context/auth-context";

/**
 * The header every signed-in page shares: photo, title, subtitle, whatever
 * action belongs to that page, and the same section nav underneath.
 *
 * Keeping it in one component is what stops the dashboard, earnings,
 * availability, resources and bookings pages from drifting apart.
 */
export function DashboardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  /** Page-specific control, e.g. "+ Add slot". Sits opposite the title. */
  action?: ReactNode;
}) {
  const { user } = useAuth();
  // Learners navigate from the pill row in the site header, so repeating it
  // here would just be the same seven buttons twice on one screen.
  const navInHeader = user?.role === "learner";

  return (
    <div className={navInHeader ? "mb-6" : "mb-8"}>
      <div className={`flex items-center justify-between gap-4 flex-wrap ${navInHeader ? "" : "mb-6"}`}>
        <div className="flex items-center gap-4 min-w-0">
          <UserAvatar user={user} size={64} className="shrink-0" />
          <div className="min-w-0">
            <h1
              className="text-3xl font-bold text-[#1A3A35]"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              {title}
            </h1>
            {subtitle && <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="flex items-center gap-3 shrink-0">{action}</div>}
      </div>
      {!navInHeader && <RoleSubNav />}
    </div>
  );
}
