import { Link, useNavigate } from "react-router";
import { Button } from "./ui/button";
import NotificationsDropdown from "./NotificationsDropdown";
import { useAuth } from "../context/auth-context";
import lulimiLogo from "@/assets/lulimi-logo.png";

const navLinks = [
  { label: "Find a Teacher", to: "/teachers" },
  { label: "Languages", to: "/teachers" },
  { label: "For Teachers", to: "/teacher/onboarding" },
  { label: "About", to: "/about" },
];

function dashboardPath(role: string) {
  return role === "teacher" ? "/teacher/dashboard" : "/learner/dashboard";
}

export function Navigation() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F5F0E8]/95 backdrop-blur border-b border-[#1A3A35]/10">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/">
          <img src={lulimiLogo} alt="Lulimi" className="h-9 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-sm font-medium text-[#1A3A35]/80 hover:text-[#1A3A35] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <NotificationsDropdown />
              <Link to={dashboardPath(user.role)}>
                <span className="text-sm font-medium text-[#1A3A35]/80 hidden sm:inline hover:text-[#1A3A35]">
                  Hi, {user.full_name.split(" ")[0]}
                </span>
              </Link>
              <Button
                variant="outline"
                className="rounded-full border-[#1A3A35]/20 text-[#1A3A35] hover:bg-[#1A3A35]/5"
                onClick={handleSignOut}
              >
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link to="/signin">
                <Button
                  variant="outline"
                  className="rounded-full border-[#1A3A35]/20 text-[#1A3A35] hover:bg-[#1A3A35]/5"
                >
                  Log in
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="rounded-full bg-[#1A3A35] hover:bg-[#2D5A45] text-white">
                  Get started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
