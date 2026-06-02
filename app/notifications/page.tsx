"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import EmptyState from "@/components/empty-state";
import { Bell, Loader2, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface Notification {
  id: string; title: string; message: string;
  type: string; isRead: boolean; actionUrl: string | null; createdAt: string;
}

const TYPE_COLOR: Record<string, string> = {
  CASTING:     "bg-[#C8A96A]/10 text-[#8B6914]",
  APPLICATION: "bg-blue-100 text-blue-700",
  BOOKING:     "bg-purple-100 text-purple-700",
  PROFILE:     "bg-emerald-100 text-emerald-700",
  ADMIN:       "bg-red-100 text-red-700",
  SYSTEM:      "bg-gray-100 text-gray-600",
};

const TABS = ["All", "Unread", "CASTING", "APPLICATION", "BOOKING", "ADMIN"];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading]             = useState(true);
  const [activeTab, setActiveTab]         = useState("All");
  const [markingAll, setMarkingAll]       = useState(false);
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (activeTab === "Unread") params.set("unread", "true");
      else if (activeTab !== "All") params.set("type", activeTab);
      params.set("limit", "50");

      const res = await fetch(`/api/notifications?${params}`);
      if (res.ok) { const d = await res.json(); setNotifications(d.notifications ?? []); }
    } catch { /* silent */ } finally { setLoading(false); }
  }, [activeTab]);

  useEffect(() => { setLoading(true); fetchNotifications(); }, [fetchNotifications]);

  const handleClick = async (n: Notification) => {
    if (!n.isRead) {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: n.id }),
      });
      setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, isRead: true } : x));
    }
    if (n.actionUrl) router.push(n.actionUrl);
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setMarkingAll(false);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#F8F5EF] py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold uppercase text-[#1D1A16]">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-xs text-[#6B6257] mt-1">{unreadCount} unread</p>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={handleMarkAll} disabled={markingAll}
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#C8A96A] hover:underline disabled:opacity-60">
                {markingAll ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5" />}
                Mark All Read
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 flex-wrap">
            {TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === tab ? "bg-[#1D1A16] text-white" : "bg-white border border-[#E7DED1] text-[#6B6257] hover:border-[#1D1A16]"}`}>
                {tab}
              </button>
            ))}
          </div>

          {/* List */}
          {loading ? (
            <div className="flex items-center gap-2 text-xs text-[#6B6257] py-8">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <EmptyState title="No notifications" description="You're all caught up. Check back later." />
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div key={n.id} onClick={() => handleClick(n)}
                  className={`rounded-2xl border p-4 cursor-pointer transition-all hover:shadow-sm ${n.isRead ? "bg-white border-[#E7DED1]" : "bg-[#C8A96A]/5 border-[#C8A96A]/30"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        {!n.isRead && <span className="h-2 w-2 rounded-full bg-[#C8A96A] shrink-0" />}
                        <p className="text-xs font-bold text-[#1D1A16]">{n.title}</p>
                      </div>
                      <p className="text-[11px] text-[#6B6257]">{n.message}</p>
                      <p className="text-[10px] text-[#C8A96A]">{new Date(n.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${TYPE_COLOR[n.type] ?? "bg-gray-100 text-gray-600"}`}>
                      {n.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
