"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import DashboardSidebar from "@/components/dashboard-sidebar";
import StatCard from "@/components/stat-card";
import EmptyState from "@/components/empty-state";
import {
  User, MessageSquare, BookOpen, TrendingUp, Bell,
  Copy, CheckCircle, ExternalLink, Loader2, Sparkles
} from "lucide-react";

interface DBModel {
  id: string;
  category: string;
  height: number;
  profileCompletion: number;
  viewsCount: number;
  isVerified: boolean;
  isAvailable: boolean;
  profileImageUrl: string | null;
  user: { name: string; email: string; profile?: { bio?: string; location?: string } | null };
  agency: { name: string } | null;
  applications: Array<{
    id: string; status: string; appliedAt: string;
    casting: { title: string; location: string };
  }>;
}

interface DBNotification {
  id: string; title: string; message: string;
  type: string; isRead: boolean; actionUrl: string | null; createdAt: string;
}

const STATUS_COLOR: Record<string, string> = {
  PENDING:     "bg-amber-100 text-amber-700",
  SHORTLISTED: "bg-blue-100 text-blue-700",
  APPROVED:    "bg-emerald-100 text-emerald-700",
  REJECTED:    "bg-red-100 text-red-700",
  APPLIED:     "bg-[#C8A96A]/10 text-[#8B6914]",
};

export default function ModelDashboard() {
  const [dbModel, setDbModel]             = useState<DBModel | null>(null);
  const [notifications, setNotifications] = useState<DBNotification[]>([]);
  const [loading, setLoading]             = useState(true);
  const [copied, setCopied]               = useState(false);

  const sidebarItems = [
    { name: "My Profile",   href: "/dashboard/model", icon: User },
    { name: "Messages",     href: "/messages",        icon: MessageSquare },
    { name: "Castings Hub", href: "/castings",        icon: BookOpen },
  ];

  const fetchData = async () => {
    try {
      const [modelRes, notifRes] = await Promise.all([
        fetch("/api/user/me"),
        fetch("/api/notifications?limit=5"),
      ]);
      if (modelRes.ok) {
        const d = await modelRes.json();
        if (d.model) setDbModel(d.model);
      }
      if (notifRes.ok) {
        const d = await notifRes.json();
        setNotifications(d.notifications ?? []);
      }
    } catch { /* use empty state */ } finally { setLoading(false); }
  };

  useEffect(() => {
    void (async () => { await fetchData(); })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyProfileLink = () => {
    if (!dbModel) return;
    const url = `${window.location.origin}/models/${dbModel.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleMarkNotifRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  };

  const name       = dbModel?.user.name       ?? "Model";
  const category   = dbModel?.category        ?? "";
  const completion = dbModel?.profileCompletion ?? 0;
  const views      = dbModel?.viewsCount      ?? 0;
  const verified   = dbModel?.isVerified      ?? false;
  const applications = dbModel?.applications  ?? [];
  const agencyName   = dbModel?.agency?.name  ?? null;

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#F8F5EF] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">

            <DashboardSidebar title={name} subtitle={`${category} Model`} items={sidebarItems} role="MODEL" />

            <div className="flex-1 w-full space-y-8">

              {/* Managed by Agency Banner */}
              <div className="rounded-2xl border border-[#C8A96A]/30 bg-[#C8A96A]/5 p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-[#C8A96A]/10 p-2">
                      <Sparkles className="h-5 w-5 text-[#C8A96A]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-[#1D1A16]">
                        Profile Managed by {agencyName ?? "Your Agency"}
                      </p>
                      <p className="text-[10px] text-[#6B6257] mt-0.5">
                        Your agency handles all profile updates. Contact them for changes.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={copyProfileLink}
                      className="rounded-full bg-[#1D1A16] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] transition-colors flex items-center gap-1.5"
                    >
                      {copied ? (
                        <><CheckCircle className="h-3.5 w-3.5" /> Copied!</>
                      ) : (
                        <><Copy className="h-3.5 w-3.5" /> Copy Profile Link</>
                      )}
                    </button>
                    {dbModel && (
                      <a
                        href={`/models/${dbModel.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-[#E7DED1] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#6B6257] hover:text-[#1D1A16] hover:bg-white transition-colors flex items-center gap-1.5"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> View Public Profile
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Verification badge */}
              {verified && (
                <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2 w-fit">
                  <CheckCircle className="h-3.5 w-3.5" /> Profile Verified
                </div>
              )}

              {/* Profile completion */}
              <div className="rounded-2xl border border-[#E7DED1] bg-white p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D1A16] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-[#C8A96A]" /> Profile Completion
                  </span>
                  <span className="text-xs font-bold text-[#C8A96A]">{completion}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#F8F5EF] overflow-hidden">
                  <div className="h-full bg-[#C8A96A] transition-all duration-700" style={{ width: `${completion}%` }} />
                </div>
              </div>

              {/* Stats */}
              {loading ? (
                <div className="flex items-center gap-2 text-xs text-[#6B6257]">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <StatCard title="Profile Views"   value={views}                  change="+18% THIS WEEK" trend="up" icon={TrendingUp} />
                  <StatCard title="Applications"    value={applications.length}    change="SUBMITTED"      icon={BookOpen} />
                  <StatCard title="Notifications"   value={notifications.filter(n=>!n.isRead).length} change="UNREAD" icon={Bell} />
                </div>
              )}

              {/* Applications */}
              <div className="rounded-2xl border border-[#E7DED1] bg-white p-6 shadow-sm space-y-4">
                <h3 className="font-serif text-lg font-bold uppercase tracking-widest text-[#1D1A16] border-b border-[#E7DED1]/70 pb-3">
                  My Applications
                </h3>
                {applications.length === 0 ? (
                  <EmptyState title="No applications yet" description="Your agency applies to casting opportunities on your behalf." />
                ) : (
                  <div className="space-y-3">
                    {applications.map((app) => (
                      <div key={app.id} className="flex items-center justify-between rounded-xl border border-[#E7DED1] p-4 text-xs">
                        <div>
                          <p className="font-bold text-[#1D1A16] uppercase">{app.casting.title}</p>
                          <p className="text-[#6B6257] mt-0.5">{app.casting.location}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${STATUS_COLOR[app.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {app.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notifications */}
              {notifications.length > 0 && (
                <div className="rounded-2xl border border-[#E7DED1] bg-white p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E7DED1]/70 pb-3">
                    <h3 className="font-serif text-lg font-bold uppercase tracking-widest text-[#1D1A16]">
                      Recent Notifications
                    </h3>
                    <a href="/notifications" className="text-[10px] font-bold uppercase tracking-widest text-[#C8A96A] hover:underline">View All</a>
                  </div>
                  <div className="space-y-3">
                    {notifications.map((n) => (
                      <div key={n.id} onClick={() => handleMarkNotifRead(n.id)}
                        className={`rounded-xl p-3 cursor-pointer transition-colors ${n.isRead ? "bg-white border border-[#E7DED1]" : "bg-[#C8A96A]/5 border border-[#C8A96A]/20"}`}>
                        <p className="text-xs font-bold text-[#1D1A16]">{n.title}</p>
                        <p className="text-[11px] text-[#6B6257] mt-0.5">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
