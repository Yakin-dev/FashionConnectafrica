"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import DashboardSidebar from "@/components/dashboard-sidebar";
import StatCard from "@/components/stat-card";
import EmptyState from "@/components/empty-state";
import { Briefcase, BookOpen, Users, Bell, Loader2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

interface Casting { id: string; title: string; location: string; budget: number; isActive: boolean; _count: { applications: number } }
interface Application { id: string; status: string; coverNote: string | null; appliedAt: string; model: { user: { name: string; email: string } } }
interface Notification { id: string; title: string; message: string; isRead: boolean; createdAt: string }

const STATUS_COLOR: Record<string, string> = {
  PENDING:     "bg-amber-100 text-amber-700",
  SHORTLISTED: "bg-blue-100 text-blue-700",
  APPROVED:    "bg-emerald-100 text-emerald-700",
  REJECTED:    "bg-red-100 text-red-700",
};

export default function ClientDashboard() {
  const [castings, setCastings]         = useState<Casting[]>([]);
  const [selectedCasting, setSelected]  = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading]           = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const sidebarItems = [
    { name: "My Castings",    href: "/dashboard/client", icon: Briefcase },
    { name: "Browse Models",  href: "/models",           icon: Users },
    { name: "Post Casting",   href: "/castings",         icon: BookOpen },
  ];

  const fetchData = useCallback(async () => {
    try {
      const [castingsRes, notifRes] = await Promise.all([
        fetch("/api/castings?mine=true"),
        fetch("/api/notifications?limit=5"),
      ]);
      if (castingsRes.ok) { const d = await castingsRes.json(); setCastings(d.castings ?? []); }
      if (notifRes.ok)    { const d = await notifRes.json();    setNotifications(d.notifications ?? []); }
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const loadApplications = async (castingId: string) => {
    setSelected(castingId);
    const res = await fetch(`/api/castings/${castingId}/applications`);
    if (res.ok) { const d = await res.json(); setApplications(d.applications ?? []); }
  };

  const handleStatusUpdate = async (castingId: string, applicationId: string, status: string) => {
    setActionLoading(applicationId + status);
    try {
      await fetch(`/api/castings/${castingId}/applications`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, status }),
      });
      if (selectedCasting) loadApplications(selectedCasting);
    } catch { /* silent */ } finally { setActionLoading(null); }
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#F8F5EF] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">

            <DashboardSidebar title="Client Dashboard" subtitle="Brand & Client Panel" items={sidebarItems} role="CLIENT" />

            <div className="flex-1 w-full space-y-8">

              {loading ? (
                <div className="flex items-center gap-2 text-xs text-[#6B6257]">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <StatCard title="My Castings"    value={castings.length} change="POSTED" icon={BookOpen} />
                  <StatCard title="Applications"   value={castings.reduce((s, c) => s + (c._count?.applications ?? 0), 0)} change="RECEIVED" icon={Users} />
                  <StatCard title="Notifications"  value={notifications.filter(n => !n.isRead).length} change="UNREAD" icon={Bell} />
                </div>
              )}

              {/* My Castings */}
              <div className="rounded-2xl border border-[#E7DED1] bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#E7DED1]/70 pb-3">
                  <h3 className="font-serif text-lg font-bold uppercase tracking-widest text-[#1D1A16]">My Casting Calls</h3>
                  <Link href="/castings" className="text-[10px] font-bold uppercase tracking-widest text-[#C8A96A] hover:underline">Post New</Link>
                </div>
                {castings.length === 0 ? (
                  <EmptyState title="No castings yet" description="Post your first casting call to find talent." />
                ) : (
                  <div className="space-y-3">
                    {castings.map((c) => (
                      <div key={c.id} className={`rounded-xl border p-4 cursor-pointer transition-colors ${selectedCasting === c.id ? "border-[#C8A96A] bg-[#C8A96A]/5" : "border-[#E7DED1] hover:bg-[#F8F5EF]"}`}
                        onClick={() => loadApplications(c.id)}>
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-[#1D1A16] uppercase">{c.title}</p>
                            <p className="text-[#6B6257] mt-0.5">{c.location} · ${c.budget.toLocaleString()}</p>
                          </div>
                          <span className="text-[10px] font-bold bg-[#C8A96A]/10 text-[#8B6914] px-3 py-1 rounded-full">
                            {c._count.applications} applied
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Applications for selected casting */}
              {selectedCasting && (
                <div className="rounded-2xl border border-[#E7DED1] bg-white p-6 shadow-sm space-y-4">
                  <h3 className="font-serif text-lg font-bold uppercase tracking-widest text-[#1D1A16] border-b border-[#E7DED1]/70 pb-3">
                    Applications
                  </h3>
                  {applications.length === 0 ? (
                    <EmptyState title="No applications yet" description="Models haven't applied to this casting yet." />
                  ) : (
                    <div className="space-y-4">
                      {applications.map((app) => (
                        <div key={app.id} className="rounded-xl border border-[#E7DED1] p-4 space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <div>
                              <p className="font-bold text-[#1D1A16] uppercase">{app.model.user.name}</p>
                              <p className="text-[#6B6257] mt-0.5">{app.model.user.email}</p>
                              {app.coverNote && <p className="text-[#6B6257] mt-1 italic">"{app.coverNote}"</p>}
                            </div>
                            <span className={`text-[9px] font-bold px-3 py-1 rounded-full ${STATUS_COLOR[app.status] ?? "bg-gray-100 text-gray-600"}`}>{app.status}</span>
                          </div>
                          <div className="flex gap-2 justify-end">
                            {["SHORTLISTED","APPROVED","REJECTED"].map((s) => (
                              <button key={s} onClick={() => handleStatusUpdate(selectedCasting, app.id, s)}
                                disabled={!!actionLoading || app.status === s}
                                className={`rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50 ${s === "REJECTED" ? "border border-rose-300 text-rose-600 hover:bg-rose-50" : s === "APPROVED" ? "bg-[#1D1A16] text-white hover:bg-[#C8A96A]" : "border border-[#E7DED1] text-[#6B6257] hover:bg-[#F8F5EF]"}`}>
                                {actionLoading === app.id + s ? <Loader2 className="h-3 w-3 animate-spin" /> : s === "REJECTED" ? <XCircle className="h-3 w-3 inline" /> : s === "APPROVED" ? <CheckCircle className="h-3 w-3 inline" /> : null}
                                {" "}{s.charAt(0) + s.slice(1).toLowerCase()}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
