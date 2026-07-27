import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import api from "@/lib/api";
import lulimiLogoBlack from "@/assets/lulimi-logo-black.png";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/auth/password-reset/", {
        email,
        reset_url: `${window.location.origin}/reset-password`,
      });
      setSent(true);
    } catch {
      toast.error("Could not send reset email. Check the address and try again.");
    } finally {
      setLoading(false);
    }
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
          Reset your password
        </h1>

        {sent ? (
          <div className="text-center py-10 space-y-3">
            <div className="text-4xl">📬</div>
            <p className="font-medium text-[#1A3A35]">Check your inbox</p>
            <p className="text-sm text-gray-500">
              If an account exists for <span className="font-medium">{email}</span>, you'll receive a reset link shortly.
            </p>
            <Link to="/signin">
              <Button variant="outline" className="mt-4 rounded-full">
                Back to sign in
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 mt-8">
            <p className="text-sm text-gray-500">Enter your email and we'll send you a link to reset your password.</p>
            <div>
              <label className="block text-sm font-medium text-[#1A3A35] mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 bg-white border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A3A35]/20"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-[#C4622D] hover:bg-[#7A2E1A] text-white rounded-full h-12 text-base">
              {loading ? "Sending…" : "Send reset link"}
            </Button>
            <p className="text-center text-sm text-gray-500">
              Remember it?{" "}
              <Link to="/signin" className="text-[#C4622D] font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
