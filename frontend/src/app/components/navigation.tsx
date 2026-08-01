import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "./ui/button";
import NotificationsDropdown from "./NotificationsDropdown";
import api from "@/lib/api";
import { useAuth } from "../context/auth-context";
import lulimiLogo from "@/assets/lulimi-logo.png";
import type { MessageThread } from "@/types";

function MessagesBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = () => {
      api
        .get("/api/messaging/threads/")
        .then(({ data }: { data: MessageThread[] }) => setUnreadCount(data.reduce((sum, t) => sum + t.unread_count, 0)))
        .catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Link to="/messages" className="relative p-2 rounded-full hover:bg-[#1A3A35]/5 transition-colors" aria-label="Messages">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1A3A35]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-[#C4622D] text-white text-[10px] font-bold flex items-center justify-center">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}

const navLinks = [
  { label: "Find a Teacher", to: "/teachers" },
  { label: "Languages", to: "/teachers" },
  { label: "Resources", to: "/resources" },
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
          {navLinks
            .filter((link) => !(user && link.label === "For Teachers"))
            .map((link) => (
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
              <MessagesBadge />
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
