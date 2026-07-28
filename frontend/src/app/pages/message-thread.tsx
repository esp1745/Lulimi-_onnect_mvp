import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { toast } from "sonner";
import { Navigation } from "../components/navigation";
import { Footer } from "../components/footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import api from "@/lib/api";
import { useAuth } from "../context/auth-context";
import type { Message } from "@/types";

export function MessageThread() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { userId } = useParams();
  const location = useLocation();
  const counterpartName = (location.state as { name?: string } | null)?.name;

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const { data } = await api.get(`/api/messaging/threads/${userId}/`);
      setMessages(data);
    } catch {
      toast.error("Could not load messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/signin");
      return;
    }
    if (!authLoading) {
      fetchMessages();
      api.post(`/api/messaging/threads/${userId}/read/`, {}).catch(() => {});
      const interval = setInterval(fetchMessages, 10000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setSending(true);
    try {
      const { data } = await api.post(`/api/messaging/threads/${userId}/`, { text: trimmed });
      setMessages((m) => [...m, data]);
      setText("");
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(detail || "Could not send message.");
    } finally {
      setSending(false);
    }
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col">
      <Navigation />
      <div className="max-w-2xl mx-auto w-full px-6 py-10 flex-1 flex flex-col">
        <Button variant="outline" size="sm" className="self-start mb-4" onClick={() => navigate("/messages")}>
          ← Back to messages
        </Button>

        <h1 className="text-2xl font-bold text-[#1A3A35] mb-4" style={{ fontFamily: "Playfair Display, serif" }}>
          {counterpartName || "Chat"}
        </h1>

        <div className="bg-white rounded-2xl border border-[#1A3A35]/10 flex-1 flex flex-col min-h-[400px]">
          <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[500px]">
            {messages.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No messages yet. Say hello!</p>
            ) : (
              messages.map((m) => {
                const isOwn = m.sender === user?.id;
                return (
                  <div key={m.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                        isOwn ? "bg-[#1A3A35] text-white" : "bg-[#F5F0E8] text-[#1A3A35]"
                      }`}
                    >
                      <p>{m.text}</p>
                      <p className={`text-[10px] mt-1 ${isOwn ? "text-white/60" : "text-gray-400"}`}>
                        {new Date(m.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} className="flex gap-2 p-3 border-t border-[#1A3A35]/10">
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" className="flex-1" />
            <Button type="submit" className="bg-[#1A3A35] hover:bg-[#2D5A45] text-white rounded-full" disabled={sending || !text.trim()}>
              Send
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
