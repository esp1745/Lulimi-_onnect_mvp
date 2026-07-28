import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Navigation } from "../components/navigation";
import { Footer } from "../components/footer";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import api from "@/lib/api";
import { useAuth } from "../context/auth-context";
import type { MessageThread } from "@/types";

export function Messages() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/signin");
      return;
    }
    if (!authLoading) {
      api
        .get("/api/messaging/threads/")
        .then((r) => setThreads(r.data))
        .catch(() => toast.error("Could not load messages."))
        .finally(() => setLoading(false));
    }
  }, [authLoading, user, navigate]);

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Navigation />
      <div className="max-w-2xl mx-auto w-full px-6 py-10">
        <h1 className="text-3xl font-bold text-[#1A3A35] mb-6" style={{ fontFamily: "Playfair Display, serif" }}>
          Messages
        </h1>

        <Card>
          <CardContent className="p-0">
            {threads.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p>No conversations yet.</p>
                <p className="text-sm mt-1">Message a teacher or student from a booking to start one.</p>
              </div>
            ) : (
              <div className="divide-y">
                {threads.map((t) => (
                  <Link
                    key={t.user_id}
                    to={`/messages/${t.user_id}`}
                    state={{ name: t.full_name }}
                    className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-[#1A3A35]/5 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-[#1A3A35]">{t.full_name}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{t.last_message}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-400">{new Date(t.last_message_at).toLocaleDateString()}</span>
                      {t.unread_count > 0 && (
                        <Badge className="bg-[#C4622D] text-white border-0 text-xs">{t.unread_count}</Badge>
                      )}
                    </div>
                  </Link>
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
