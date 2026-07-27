import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/auth-context";
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

export default function GoogleSignInButton({
  role,
  onSuccess,
}: {
  role?: "teacher" | "learner";
  onSuccess: (user: User) => void;
}) {
  const { signInWithGoogle } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
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

  if (!GOOGLE_CLIENT_ID) return null;

  return <div ref={containerRef} className="w-full flex justify-center" />;
}
