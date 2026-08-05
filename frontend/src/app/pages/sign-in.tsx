import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import GoogleSignInButton from "../components/GoogleSignInButton";
import { useAuth } from "../context/auth-context";
import type { User } from "@/types";
import lulimiLogoBlack from "@/assets/lulimi-logo-black.png";

function routeForUser(user: User, navigate: ReturnType<typeof useNavigate>, from?: string) {
  // If the user was sent here mid-flow (e.g. booking a specific teacher), take
  // them back where they came from instead of the generic dashboard.
  if (from) {
    navigate(from);
    return;
  }
  if (user.role === "teacher") navigate("/teacher/dashboard");
  else if (user.role === "admin") navigate("/");
  else navigate("/learner/dashboard");
}

export function SignIn() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const user = await signIn(email, password);
      toast.success("Welcome back!");
      routeForUser(user, navigate, from);
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = (user: User) => {
    toast.success("Welcome back!");
    routeForUser(user, navigate, from);
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <div className="px-10 py-8">
        <Link to="/">
          <img src={lulimiLogoBlack} alt="Lulimi" className="h-[27px] w-auto" />
        </Link>
      </div>

      <div className="max-w-[560px] mx-auto px-6 pb-20">
        <h1 className="text-4xl mb-2 text-[#1A3A35]" style={{ fontFamily: "Playfair Display, serif" }}>
          Welcome back
        </h1>
        <p className="text-gray-500 mb-8">
          Don't have an account?{" "}
          <Link to="/signup" className="text-[#C4622D] font-medium hover:underline">
            Sign up free
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#1A3A35] mb-2">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-white border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A3A35]/20"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-[#1A3A35]">Password</label>
              <Link to="/forgot-password" className="text-sm text-[#C4622D] font-medium hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full px-4 py-3 pr-12 bg-white border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A3A35]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C4622D] hover:bg-[#7A2E1A] text-white rounded-full h-12 text-base gap-2"
          >
            {loading ? "Signing in…" : "Sign in"} <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 border-t border-[#1A3A35]/10" />
          <span className="text-sm text-gray-400">or continue with</span>
          <div className="flex-1 border-t border-[#1A3A35]/10" />
        </div>

        <GoogleSignInButton onSuccess={handleGoogleSuccess} />

        <p className="text-center text-sm text-gray-400 mt-8">
          Are you a teacher?{" "}
          <Link to="/teach" className="text-[#1A3A35] font-semibold hover:underline">
            Apply to teach
          </Link>
        </p>
      </div>
    </div>
  );
}
