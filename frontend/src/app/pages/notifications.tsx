import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Navigation } from "../components/navigation";
import { Footer } from "../components/footer";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import api from "@/lib/api";
import { useAuth } from "../context/auth-context";
import type { Notification } from "@/types";

export function Notifications() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Notification | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/signin");
      return;
    }
    if (!authLoading) {
      api
        .get("/api/notifications/")
        .then((r) => setNotifications(r.data))
        .catch(() => toast.error("Could not load notifications."))
        .finally(() => setLoading(false));
    }
  }, [authLoading, user, navigate]);

  const openNotification = async (n: Notification) => {
    setSelected(n);
    if (!n.read_at) {
      try {
        await api.post(`/api/notifications/${n.id}/read/`, {});
        setNotifications((ns) =>
          ns.map((x) => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x))
        );
      } catch {
        /* keep UI as-is */
      }
    }
  };

  const markAllRead = async () => {
    try {
      await api.post("/api/notifications/read-all/", {});
      setNotifications((ns) => ns.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
    } catch {
      toast.error("Could not update notifications.");
    }
  };

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col">
      <Navigation />
      <div className="max-w-2xl mx-auto w-full px-6 py-10 flex-1">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#1A3A35]" style={{ fontFamily: "Playfair Display, serif" }}>
            Notifications
          </h1>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              Mark all read
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <p className="p-8 text-center text-gray-400">No notifications yet.</p>
            ) : (
              <div className="divide-y divide-[#1A3A35]/10">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => openNotification(n)}
                    className={`w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-[#1A3A35]/5 transition-colors ${
                      !n.read_at ? "bg-[#1A3A35]/5" : ""
                    }`}
                  >
                    <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${!n.read_at ? "bg-[#C4622D]" : "bg-transparent"}`} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-[#1A3A35]">{n.title}</span>
                      <span className="block text-xs text-gray-500 truncate mt-0.5">{n.body}</span>
                      <span className="block text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />

      {/* Notification detail popup */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-[#1A3A35]"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-[#1A3A35] pr-8 mb-1">{selected.title}</h2>
            <p className="text-xs text-gray-400 mb-4">{new Date(selected.created_at).toLocaleString()}</p>
            <p className="text-sm text-gray-700 whitespace-pre-line">{selected.body}</p>
            <div className="mt-6 flex justify-end">
              <Button className="bg-[#1A3A35] hover:bg-[#2D5A45] text-white rounded-full" onClick={() => setSelected(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
