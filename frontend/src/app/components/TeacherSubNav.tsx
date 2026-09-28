import { Link, useLocation, useNavigate } from "react-router";
import { LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "../context/auth-context";

/**
 * Shared section nav used across every signed-in area. The page you're on is
 * highlighted green, the rest stay neutral, and log out sits at the end — the
 * header avatar opens your profile rather than signing you out.
 */

/** One shape for every tab — same height, padding, radius and weight. */
const TAB_BASE = "h-9 px-4 rounded-full text-sm font-bold transition-colors";

/** Active / inactive pill styling, shared by every tab row in the app. */
export const tabClass = (active: boolean) =>
  `${TAB_BASE} ${
    active
      ? "bg-[#A0B76F] hover:bg-[#8aa55a] text-[#1A3A35] border border-[#A0B76F]"
      : "bg-white text-[#1A3A35] border border-[#1A3A35]/20 hover:bg-[#A0B76F]/10 hover:border-[#A0B76F]"
  }`;

const TEACHER_LINKS = [
  { label: "Dashboard", to: "/teacher/dashboard" },
  { label: "Edit profile", to: "/teacher/profile" },
  { label: "Availability", to: "/teacher/availability" },
  { label: "Resources", to: "/teacher/resources" },
  { label: "Earnings", to: "/teacher/earnings" },
  { label: "Bookings", to: "/bookings" },
];

const LEARNER_LINKS = [
  { label: "Dashboard", to: "/learner/dashboard" },
  { label: "My profile", to: "/learner/profile" },
  { label: "Find a teacher", to: "/teachers" },
  { label: "Bookings", to: "/bookings" },
  { label: "Messages", to: "/messages" },
  { label: "Resources", to: "/resources" },
];

function SubNav({ links }: { links: { label: string; to: string }[] }) {
  const { pathname } = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex gap-2 flex-wrap items-center">
      {links.map((link) => {
        const active = pathname === link.to;
        return (
          <Link key={link.to} to={link.to}>
            <Button
              size="sm"
              variant={active ? "default" : "outline"}
              aria-current={active ? "page" : undefined}
              className={tabClass(active)}
            >
              {link.label}
            </Button>
          </Link>
        );
      })}

      <Button
        size="sm"
        variant="outline"
        onClick={handleSignOut}
        className={`${TAB_BASE} bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 gap-1.5`}
      >
        <LogOut className="w-3.5 h-3.5" />
        Log out
      </Button>
    </div>
  );
}

export function TeacherSubNav() {
  return <SubNav links={TEACHER_LINKS} />;
}

export function LearnerSubNav() {
  return <SubNav links={LEARNER_LINKS} />;
}

/** Picks the right nav for whoever is signed in. */
export function RoleSubNav() {
  const { user } = useAuth();
  if (!user) return null;
  return user.role === "teacher" ? <TeacherSubNav /> : <LearnerSubNav />;
}
