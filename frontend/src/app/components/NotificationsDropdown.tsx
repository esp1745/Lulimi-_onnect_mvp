import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import type { Notification } from "@/types";

export default function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get("/api/notifications/");
      setNotifications(data.slice(0, 15));
      setUnreadCount(data.filter((n: Notification) => !n.read_at).length);
    } catch {
      /* leave state as-is */
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markAllRead = async () => {
    try {
      await api.post("/api/notifications/read-all/", {});
      setNotifications((ns) => ns.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
      setUnreadCount(0);
    } catch {
      /* no-op */
    }
  };

  const markRead = async (id: number) => {
    try {
      await api.post(`/api/notifications/${id}/read/`, {});
      setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      /* no-op */
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-full hover:bg-[#1A3A35]/5 transition-colors"
        aria-label="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1A3A35]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-[#C4622D] text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-[#1A3A35]/10 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A3A35]/10">
            <span className="font-semibold text-sm text-[#1A3A35]">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-[#C4622D] hover:underline">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-[#1A3A35]/10">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.read_at && markRead(n.id)}
                  className={`px-4 py-3 cursor-pointer hover:bg-[#1A3A35]/5 transition-colors ${!n.read_at ? "bg-[#1A3A35]/5" : ""}`}
                >
                  <div className="flex items-start gap-2">
                    {!n.read_at && <span className="mt-1.5 h-2 w-2 rounded-full bg-[#C4622D] shrink-0" />}
                    <div className={!n.read_at ? "" : "pl-4"}>
                      <p className="text-sm font-medium text-[#1A3A35]">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
