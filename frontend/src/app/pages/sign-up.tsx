import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import GoogleSignInButton from "../components/GoogleSignInButton";
import { useAuth } from "../context/auth-context";
import type { User } from "@/types";
import lulimiLogoBlack from "@/assets/lulimi-logo-black.png";

type Role = "student" | "teacher";

function apiRole(role: Role): "learner" | "teacher" {
  return role === "student" ? "learner" : "teacher";
}

export function SignUp() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState<Role>(searchParams.get("role") === "teacher" ? "teacher" : "student");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!agreed) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);
    try {
      await signUp({
        full_name: `${firstName.trim()} ${lastName.trim()}`,
        email,
        password,
        role: apiRole(role),
      });
      toast.success("Account created! Welcome to Lulimi.");
      navigate(role === "teacher" ? "/teacher/onboarding" : "/");
    } catch (err: unknown) {
      const data = (err as { response?: { data?: unknown } })?.response?.data;
      setError(typeof data === "object" && data ? Object.values(data).flat().join(" ") : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = (user: User) => {
    toast.success("Account ready!");
    navigate(user.role === "teacher" ? "/teacher/onboarding" : "/");
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
          Create your account
        </h1>
        <p className="text-gray-500 mb-8">
          Already have an account?{" "}
          <Link to="/signin" className="text-[#C4622D] font-medium hover:underline">
            Sign in
          </Link>
        </p>

        <div className="inline-flex bg-white rounded-full p-1 mb-8 border border-[#1A3A35]/10">
          {(
            [
              { key: "student", label: "I'm A Student" },
              { key: "teacher", label: "I'm A Teacher" },
            ] as { key: Role; label: string }[]
          ).map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setRole(option.key)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                role === option.key ? "bg-[#1A3A35] text-white" : "text-gray-500 hover:text-[#1A3A35]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1A3A35] mb-2">First name</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Amara"
                className="w-full px-4 py-3 bg-white border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A3A35]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A3A35] mb-2">Last name</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Diallo"
                className="w-full px-4 py-3 bg-white border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A3A35]/20"
              />
            </div>
          </div>

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
            <label className="block text-sm font-medium text-[#1A3A35] mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
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

          <div className="flex items-start gap-2">
            <Checkbox
              id="agree"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked === true)}
              className="mt-0.5"
            />
            <label htmlFor="agree" className="text-sm text-gray-600 cursor-pointer">
              I agree to the{" "}
              <Link to="/" className="text-[#C4622D] font-medium hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/" className="text-[#C4622D] font-medium hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C4622D] hover:bg-[#7A2E1A] text-white rounded-full h-12 text-base gap-2"
          >
            {loading ? "Creating account…" : "Start learning"} <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 border-t border-[#1A3A35]/10" />
          <span className="text-sm text-gray-400">or continue with</span>
          <div className="flex-1 border-t border-[#1A3A35]/10" />
        </div>

        <GoogleSignInButton role={apiRole(role)} onSuccess={handleGoogleSuccess} />
      </div>
    </div>
  );
}
