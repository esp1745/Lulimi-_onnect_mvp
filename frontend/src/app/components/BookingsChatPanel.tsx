import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import api from "@/lib/api";
import type { AIChatMessage, AIChatConfirmation, AIChatResponse } from "@/types";

function displayTurns(messages: AIChatMessage[]): { role: "user" | "assistant"; text: string }[] {
  const turns: { role: "user" | "assistant"; text: string }[] = [];
  for (const m of messages) {
    if (typeof m.content === "string") {
      if (m.content.trim()) turns.push({ role: m.role, text: m.content });
      continue;
    }
    const text = m.content
      .filter((b) => b.type === "text" && b.text)
      .map((b) => b.text)
      .join("\n");
    if (text.trim()) turns.push({ role: m.role, text });
  }
  return turns;
}

export default function BookingsChatPanel() {
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<AIChatConfirmation | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, confirmation]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    const nextMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    try {
      const { data } = await api.post<AIChatResponse>("/api/ai/bookings-chat/", { messages: nextMessages });
      setMessages(data.messages);
      setConfirmation(data.status === "confirm_required" ? data.confirmation ?? null : null);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(detail || "Could not reach the booking assistant.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (approved: boolean) => {
    if (!confirmation) return;
    setLoading(true);
    try {
      const { data } = await api.post<AIChatResponse>("/api/ai/bookings-chat/", {
        messages,
        confirm: { ...confirmation, approved },
      });
      setMessages(data.messages);
      setConfirmation(data.status === "confirm_required" ? data.confirmation ?? null : null);
      if (approved) toast.success("Done.");
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(detail || "Could not complete that action.");
    } finally {
      setLoading(false);
    }
  };

  const turns = displayTurns(messages);

  return (
    <div className="flex flex-col h-[420px]">
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {turns.length === 0 && (
          <p className="text-xs text-gray-400 py-4 text-center">
            Ask me things like "find me a Bemba teacher" or "when's my next lesson?"
          </p>
        )}
        {turns.map((t, i) => (
          <div key={i} className={`flex ${t.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 text-xs whitespace-pre-wrap ${
                t.role === "user" ? "bg-[#1A3A35] text-white" : "bg-gray-100 text-gray-800"
              }`}
            >
              {t.text}
            </div>
          </div>
        ))}

        {confirmation && (
          <div className="border border-purple-200 bg-purple-50 rounded-xl p-3 space-y-2">
            <p className="text-xs text-gray-700">{confirmation.summary}</p>
            <div className="flex gap-2">
              <Button size="sm" className="h-7 text-xs px-3 bg-purple-600 hover:bg-purple-700 text-white" onClick={() => handleConfirm(true)} disabled={loading}>
                Confirm
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs px-3" onClick={() => handleConfirm(false)} disabled={loading}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {loading && !confirmation && <p className="text-xs text-gray-400">Thinking…</p>}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-gray-100 mt-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your lessons…"
          className="text-xs h-8"
          disabled={loading || !!confirmation}
        />
        <Button type="submit" size="sm" className="h-8 text-xs px-3 bg-purple-600 hover:bg-purple-700 text-white shrink-0" disabled={loading || !!confirmation || !input.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
