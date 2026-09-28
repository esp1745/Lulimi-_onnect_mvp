import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/auth-context";
import { GoogleIcon } from "./google-icon";
import type { User } from "@/types";

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleAccountsId {
  initialize: (config: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void;
  renderButton: (parent: HTMLElement, options: { theme: string; size: string; width: string; text: string }) => void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCRIPT_SRC = "https://accounts.google.com/gsi/client";

/**
 * Google's own button can't render without a client id, and Google's script
 * can be blocked by an extension or a flaky network. Either way the sign-in
 * area must not silently collapse to nothing — this stands in and explains
 * what's missing instead.
 */
function GoogleButtonPlaceholder({ role }: { role?: "teacher" | "learner" }) {
  const explain = () => {
    toast.error(
      GOOGLE_CLIENT_ID
        ? "Google sign-in couldn't load. Check your connection or any ad blocker, then reload."
        : "Google sign-in isn't set up yet. Add VITE_GOOGLE_CLIENT_ID (frontend) and GOOGLE_OAUTH_CLIENT_ID (backend), then restart.",
      { duration: 6000 }
    );
  };

  return (
    <button
      type="button"
      onClick={explain}
      className="w-full h-12 rounded-full border border-[#1A3A35]/20 bg-white text-[#1A3A35] font-semibold text-sm flex items-center justify-center gap-3 hover:bg-[#A0B76F]/10 hover:border-[#A0B76F] transition-colors"
    >
      <GoogleIcon className="w-5 h-5" />
      {role ? "Sign up with Google" : "Sign in with Google"}
    </button>
  );
}

export default function GoogleSignInButton({
  role,
  onSuccess,
}: {
  role?: "teacher" | "learner";
  onSuccess: (user: User) => void;
}) {
  const { signInWithGoogle } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState(false);
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const handleCredentialResponse = async (response: GoogleCredentialResponse) => {
      try {
        const user = await signInWithGoogle(response.credential, role);
        onSuccessRef.current(user);
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 404) {
          toast.error('No account found for that Google email. Pick "I am a teacher/learner" and try again to sign up.');
        } else {
          toast.error("Could not sign in with Google.");
        }
      }
    };

    const renderButton = () => {
      if (!window.google || !containerRef.current) return;
      containerRef.current.innerHTML = "";
      window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleCredentialResponse });
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: "outline",
        size: "large",
        width: "100%",
        text: role ? "signup_with" : "signin_with",
      });
      setRendered(true);
    };

    const existingScript = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existingScript && window.google) {
      renderButton();
      return;
    }

    const script = existingScript || document.createElement("script");
    if (!existingScript) {
      script.setAttribute("src", SCRIPT_SRC);
      script.setAttribute("async", "true");
      document.body.appendChild(script);
    }
    script.addEventListener("load", renderButton);
    return () => script.removeEventListener("load", renderButton);
  }, [role, signInWithGoogle]);

  if (!GOOGLE_CLIENT_ID) return <GoogleButtonPlaceholder role={role} />;

  return (
    <>
      <div ref={containerRef} className="w-full flex justify-center" />
      {!rendered && <GoogleButtonPlaceholder role={role} />}
    </>
  );
}
