import { useEffect, useState } from "react";
import { toast } from "sonner";
import { X, CreditCard, Smartphone, Lock, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "./ui/button";
import api from "@/lib/api";
import type { Booking, Payment } from "@/types";

/**
 * SIMULATED payment gateway.
 *
 * This mimics a hosted checkout (card / mobile money) so the booking flow can
 * be demoed end to end — no money moves and no card data is stored or sent
 * anywhere real. The backend marks the payment paid on submit. Replacing this
 * with a live provider means swapping the confirm call for their SDK/redirect.
 */

type Method = "card" | "mtn_momo" | "airtel_money";

const METHODS: { key: Method; label: string; hint: string; icon: typeof CreditCard }[] = [
  { key: "card", label: "Card", hint: "Visa / Mastercard", icon: CreditCard },
  { key: "mtn_momo", label: "MTN MoMo", hint: "Mobile money", icon: Smartphone },
  { key: "airtel_money", label: "Airtel Money", hint: "Mobile money", icon: Smartphone },
];

function formatCard(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

export function PaymentModal({
  booking,
  onClose,
  onPaid,
}: {
  booking: Booking;
  onClose: () => void;
  onPaid: (payment: Payment) => void;
}) {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState<Method>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  // Start checkout as soon as the sheet opens so we can show the real amount.
  useEffect(() => {
    api
      .post("/api/payments/checkout/", { booking_id: booking.id })
      .then(({ data }) => setPayment(data))
      .catch((err) => {
        const detail = err?.response?.data?.detail;
        toast.error(detail || "Could not start checkout.");
        onClose();
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking.id]);

  const handlePay = async () => {
    if (!payment) return;
    setProcessing(true);
    try {
      const { data } = await api.post(`/api/payments/${payment.reference}/confirm/`, {
        method,
        card_number: cardNumber,
        mobile_number: mobileNumber,
      });
      setDone(true);
      // Let the success state land before handing back to the page.
      setTimeout(() => onPaid(data), 1100);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(detail || "Payment could not be completed.");
      setProcessing(false);
    }
  };

  const cardReady = cardNumber.replace(/\D/g, "").length >= 12 && expiry.length >= 4 && cvc.length >= 3;
  const momoReady = mobileNumber.replace(/\D/g, "").length >= 9;
  const canPay = method === "card" ? cardReady : momoReady;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={processing ? undefined : onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-[440px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-[#1A3A35]">Secure checkout</h2>
            <p className="text-sm text-gray-500">
              {booking.language_name} lesson with {booking.teacher_name}
            </p>
          </div>
          {!processing && (
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-400 text-sm">Preparing checkout…</div>
        ) : done ? (
          <div className="p-10 text-center">
            <CheckCircle2 className="w-14 h-14 text-[#A0B76F] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#1A3A35] mb-1">Payment successful</h3>
            <p className="text-sm text-gray-500">
              Your lesson is booked. Receipt {payment?.reference}.
            </p>
          </div>
        ) : (
          <>
            <div className="p-6 space-y-6">
              {/* Amount summary */}
              <div className="bg-[#F5F0E8] rounded-2xl p-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-gray-600">Total due</span>
                  <span className="text-2xl font-bold text-[#1A3A35]">
                    ${payment?.amount} <span className="text-sm font-semibold text-gray-500">{payment?.currency}</span>
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>{new Date(booking.start_at).toLocaleString()}</span>
                  <span>Ref {payment?.reference}</span>
                </div>
              </div>

              {/* Method picker */}
              <div>
                <p className="text-sm font-bold text-[#1A3A35] mb-3">Payment method</p>
                <div className="grid grid-cols-3 gap-2">
                  {METHODS.map((m) => {
                    const Icon = m.icon;
                    const active = method === m.key;
                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => setMethod(m.key)}
                        className={`rounded-xl border p-3 text-left transition-all ${
                          active ? "bg-[#A0B76F]/15 border-[#A0B76F]" : "bg-white border-[#1A3A35]/15 hover:border-[#A0B76F]"
                        }`}
                      >
                        <Icon className={`w-4 h-4 mb-1.5 ${active ? "text-[#1A3A35]" : "text-gray-500"}`} />
                        <div className="text-xs font-bold text-[#1A3A35] leading-tight">{m.label}</div>
                        <div className="text-[10px] text-gray-500">{m.hint}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Card / mobile fields */}
              {method === "card" ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#1A3A35] mb-1.5">Card number</label>
                    <input
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCard(e.target.value))}
                      placeholder="4242 4242 4242 4242"
                      inputMode="numeric"
                      className="w-full px-4 py-3 bg-white border border-[#1A3A35]/15 rounded-xl text-sm focus:outline-none focus:border-[#A0B76F]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#1A3A35] mb-1.5">Expiry</label>
                      <input
                        value={expiry}
                        onChange={(e) => {
                          const d = e.target.value.replace(/\D/g, "").slice(0, 4);
                          setExpiry(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
                        }}
                        placeholder="MM/YY"
                        inputMode="numeric"
                        className="w-full px-4 py-3 bg-white border border-[#1A3A35]/15 rounded-xl text-sm focus:outline-none focus:border-[#A0B76F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1A3A35] mb-1.5">CVC</label>
                      <input
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        placeholder="123"
                        inputMode="numeric"
                        className="w-full px-4 py-3 bg-white border border-[#1A3A35]/15 rounded-xl text-sm focus:outline-none focus:border-[#A0B76F]"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-[#1A3A35] mb-1.5">Mobile money number</label>
                  <input
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="+260 97 123 4567"
                    inputMode="tel"
                    className="w-full px-4 py-3 bg-white border border-[#1A3A35]/15 rounded-xl text-sm focus:outline-none focus:border-[#A0B76F]"
                  />
                  <p className="text-xs text-gray-500 mt-2">You'll get a prompt on your phone to approve the payment.</p>
                </div>
              )}

              <div className="flex items-start gap-2 rounded-xl bg-[#A0B76F]/10 p-3">
                <ShieldCheck className="w-4 h-4 text-[#A0B76F] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600">
                  Lulimi holds your payment and releases it to your teacher after the lesson.
                </p>
              </div>

              {/* Demo notice — this is a simulated gateway, be honest about it. */}
              <p className="text-[11px] text-center text-gray-400 border-t border-gray-100 pt-3">
                Demo mode — this is a simulated payment. No real card is charged and no card details are stored.
              </p>
            </div>

            <div className="px-6 pb-6">
              <Button
                onClick={handlePay}
                disabled={!canPay || processing}
                className={`w-full rounded-full h-12 text-sm font-bold gap-2 ${
                  canPay && !processing
                    ? "bg-[#A0B76F] hover:bg-[#8aa55a] text-[#1A3A35]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Lock className="w-4 h-4" />
                {processing ? "Processing…" : `Pay $${payment?.amount ?? ""}`}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
