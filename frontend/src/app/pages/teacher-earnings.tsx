import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { toast } from "sonner";
import { Wallet, Clock, CheckCircle2, TrendingUp, Info } from "lucide-react";
import { Navigation } from "../components/navigation";
import { Footer } from "../components/footer";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { TeacherSubNav } from "../components/TeacherSubNav";
import api from "@/lib/api";
import { useAuth } from "../context/auth-context";
import type { TeacherEarnings as TeacherEarningsData } from "@/types";

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: typeof Wallet;
  accent?: boolean;
}) {
  return (
    <Card className={accent ? "bg-[#A0B76F] border-[#A0B76F]" : ""}>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={`w-4 h-4 ${accent ? "text-[#1A3A35]" : "text-[#A0B76F]"}`} />
          <span className={`text-xs font-semibold ${accent ? "text-[#1A3A35]/80" : "text-gray-500"}`}>{label}</span>
        </div>
        <p className={`text-2xl font-bold ${accent ? "text-[#1A3A35]" : "text-[#1A3A35]"}`}>{value}</p>
        {hint && <p className={`text-xs mt-1 ${accent ? "text-[#1A3A35]/70" : "text-gray-400"}`}>{hint}</p>}
      </CardContent>
    </Card>
  );
}

export function TeacherEarnings() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<TeacherEarningsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/signin");
      return;
    }
    if (!authLoading && user?.role !== "teacher") {
      navigate("/learner/dashboard");
      return;
    }
    if (!authLoading) {
      api
        .get("/api/payments/earnings/")
        .then((r) => setData(r.data))
        .catch(() => toast.error("Could not load earnings."))
        .finally(() => setLoading(false));
    }
  }, [authLoading, user, navigate]);

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>;
  }

  const s = data?.summary;
  const payments = data?.payments ?? [];

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col">
      <Navigation />
      <div className="max-w-5xl mx-auto w-full px-6 py-10 flex-1">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1A3A35]">Earnings</h1>
            <p className="text-gray-500 text-sm">What you've made teaching on Lulimi</p>
          </div>
          <TeacherSubNav />
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total earned" value={`$${s?.total_earned ?? "0.00"}`} hint={`${s?.lessons_paid ?? 0} paid lessons`} icon={Wallet} accent />
          <StatCard label="Pending payout" value={`$${s?.pending_payout ?? "0.00"}`} hint="Held by Lulimi" icon={Clock} />
          <StatCard label="Paid out" value={`$${s?.paid_out ?? "0.00"}`} hint="Already transferred" icon={CheckCircle2} />
          <StatCard label="This month" value={`$${s?.this_month ?? "0.00"}`} icon={TrendingUp} />
        </div>

        {/* How payouts work */}
        <div className="flex items-start gap-3 rounded-2xl bg-white border border-[#1A3A35]/10 p-4 mb-8">
          <Info className="w-4 h-4 text-[#A0B76F] mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-600">
            Learners pay Lulimi when they book. We hold the money and transfer your share to you — your earnings are
            shown after our {" "}
            <span className="font-semibold text-[#1A3A35]">15% platform fee</span>
            {s?.awaiting_payment && s.awaiting_payment !== "0.00" ? (
              <> · <span className="font-semibold text-[#1A3A35]">${s.awaiting_payment}</span> awaiting learner payment</>
            ) : null}
            .
          </p>
        </div>

        {/* Per-lesson breakdown */}
        <h2 className="text-lg font-bold text-[#1A3A35] mb-3">Lesson payments</h2>
        <Card>
          <CardContent className="p-0">
            {payments.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                <p className="font-semibold text-[#1A3A35] mb-1">No payments yet</p>
                <p className="text-sm">Once a learner pays for a lesson, it'll show up here.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#1A3A35]/10">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-4 px-5 py-4 flex-wrap">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-[#1A3A35]">{p.learner_name}</p>
                      <p className="text-xs text-gray-500">
                        {p.language_name} · {new Date(p.start_at).toLocaleString()}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Ref {p.reference}
                        {p.payer_label ? ` · ${p.payer_label}` : ""}
                        {p.method_label ? ` · ${p.method_label}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#1A3A35]">+${p.teacher_earnings}</p>
                        <p className="text-[11px] text-gray-400">
                          ${p.amount} − ${p.platform_fee} fee
                        </p>
                      </div>
                      {p.status === "paid" ? (
                        <Badge
                          className={`text-xs border-0 ${
                            p.payout_status === "paid_out"
                              ? "bg-[#A0B76F]/25 text-[#1A3A35]"
                              : "bg-[#F5C42C]/25 text-[#7A2E1A]"
                          }`}
                        >
                          {p.payout_status === "paid_out" ? "paid out" : "in escrow"}
                        </Badge>
                      ) : (
                        <Badge className="text-xs border-0 bg-gray-100 text-gray-500">{p.status}</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
