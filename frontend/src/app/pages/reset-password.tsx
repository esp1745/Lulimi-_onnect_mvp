import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import api from "@/lib/api";
import lulimiLogoBlack from "@/assets/lulimi-logo-black.png";

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/auth/password-reset/confirm/", { uid, token, new_password: password });
      toast.success("Password reset! You can now sign in.");
      navigate("/signin");
    } catch {
      toast.error("Reset link is invalid or has expired.");
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
        <h1 className="text-4xl mb-8 text-[#1A3A35]" style={{ fontFamily: "Playfair Display, serif" }}>
          Set new password
        </h1>

        {!uid || !token ? (
          <div className="text-center py-10 space-y-3">
            <p className="text-gray-500 text-sm">Invalid reset link. Request a new one.</p>
            <Link to="/forgot-password">
              <Button variant="outline" className="rounded-full">
                Request reset
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1A3A35] mb-2">New password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                className="w-full px-4 py-3 bg-white border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A3A35]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A3A35] mb-2">Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat password"
                required
                className="w-full px-4 py-3 bg-white border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A3A35]/20"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-[#C4622D] hover:bg-[#7A2E1A] text-white rounded-full h-12 text-base">
              {loading ? "Saving…" : "Set new password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
