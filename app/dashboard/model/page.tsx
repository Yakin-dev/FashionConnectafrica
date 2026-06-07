"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import DashboardSidebar from "@/components/dashboard-sidebar";
import StatCard from "@/components/stat-card";
import UploadBox from "@/components/upload-box";
import EmptyState from "@/components/empty-state";
import { mockModels } from "@/lib/mock-data";
import {
  User, BookOpen, MessageSquare, TrendingUp, Sparkles,
  CheckCircle, Bell, Loader2, AlertCircle
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
  const fallback = mockModels[0];

  const [dbModel, setDbModel]             = useState<DBModel | null>(null);
  const [notifications, setNotifications] = useState<DBNotification[]>([]);
  const [loading, setLoading]             = useState(true);
  const [saveLoading, setSaveLoading]     = useState(false);
  const [saveSuccess, setSaveSuccess]     = useState(false);
  const [saveError, setSaveError]         = useState<string | null>(null);

  const [editHeight, setEditHeight]     = useState<number>(fallback.height);
  const [editCategory, setEditCategory] = useState<string>(fallback.category);
  const [editBio, setEditBio]           = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>(fallback.portfolioImages);

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
        if (d.model) {
          setDbModel(d.model);
          setEditHeight(d.model.height);
          setEditCategory(d.model.category);
          setEditBio(d.model.user?.profile?.bio ?? "");
        }
      }
      if (notifRes.ok) {
        const d = await notifRes.json();
        setNotifications(d.notifications ?? []);
      }
    } catch { /* use fallback */ } finally { setLoading(false); }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    void (async () => { await fetchData(); })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbModel) return;
    setSaveLoading(true); setSaveError(null);
    try {
      const res = await fetch(`/api/models/${dbModel.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ height: editHeight, category: editCategory, bio: editBio }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setSaveSuccess(true);
      fetchData();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
    } finally { setSaveLoading(false); }
  };

  const handleMarkNotifRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  };

  const handlePhotoUploaded = (url: string) => {
    setUploadedPhotos((prev) => [url, ...prev]);
  };

  const name       = dbModel?.user.name       ?? fallback.name;
  const category   = dbModel?.category        ?? fallback.category;
  const completion = dbModel?.profileCompletion ?? fallback.profileCompletion;
  const views      = dbModel?.viewsCount      ?? fallback.viewsCount;
  const verified   = dbModel?.isVerified      ?? fallback.isVerified;
  const applications = dbModel?.applications  ?? [];

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#F8F5EF] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">

            <DashboardSidebar title={name} subtitle={`${category} Model`} items={sidebarItems} role="MODEL" />

            <div className="flex-1 w-full space-y-8">

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
                  <StatCard title="Applications"    value={applications.length}    change="SUBMITTED"                icon={BookOpen} />
                  <StatCard title="Notifications"   value={notifications.filter(n=>!n.isRead).length} change="UNREAD" icon={Bell} />
                </div>
              )}

              {/* Edit Profile + Upload */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                <div className="lg:col-span-7 rounded-2xl border border-[#E7DED1] bg-white p-6 sm:p-8 shadow-sm space-y-6">
                  <h3 className="font-serif text-lg font-bold uppercase tracking-widest text-[#1D1A16] border-b border-[#E7DED1]/70 pb-3">
                    Physical Specifications
                  </h3>

                  {saveSuccess && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-emerald-700 text-xs flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" /> Profile updated!
                    </div>
                  )}
                  {saveError && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-red-600 text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" /> {saveError}
                    </div>
                  )}

                  <form onSubmit={handleProfileSave} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257]">Height (cm)</label>
                        <input type="number" value={editHeight} onChange={(e) => setEditHeight(Number(e.target.value))}
                          className="w-full rounded-xl border border-[#E7DED1] bg-[#F8F5EF]/30 p-3 text-xs focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257]">Category</label>
                        <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}
                          className="w-full rounded-xl border border-[#E7DED1] bg-[#F8F5EF]/30 p-3 text-xs focus:outline-none">
                          {["Runway","Editorial","Commercial","Fitness","Beauty","Plus-size","Petite","Influencer"].map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257]">Bio</label>
                      <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={3}
                        placeholder="Your bio..." className="w-full rounded-xl border border-[#E7DED1] bg-[#F8F5EF]/30 p-3 text-xs focus:outline-none resize-none" />
                    </div>
                    <button type="submit" disabled={saveLoading || !dbModel}
                      className="rounded-full bg-[#1D1A16] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] transition-all disabled:opacity-60 flex items-center gap-1.5">
                      {saveLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Save Specifications
                    </button>
                    {!dbModel && <p className="text-[10px] text-[#6B6257]">Sign in with Clerk to save changes to the database.</p>}
                  </form>
                </div>

                <div className="lg:col-span-5 rounded-2xl border border-[#E7DED1] bg-white p-6 shadow-sm space-y-4">
                  <h3 className="font-serif text-lg font-bold uppercase tracking-widest text-[#1D1A16] border-b border-[#E7DED1]/70 pb-3">
                    Add to Editorial Book
                  </h3>
                  <UploadBox label="Editorial Photo" onUploadSuccess={handlePhotoUploaded} />
                </div>
              </div>

              {/* Portfolio */}
              <div className="rounded-2xl border border-[#E7DED1] bg-white p-6 shadow-sm space-y-4">
                <h3 className="font-serif text-lg font-bold uppercase tracking-widest text-[#1D1A16] border-b border-[#E7DED1]/70 pb-3">
                  My Editorial Book ({uploadedPhotos.length} Photos)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {uploadedPhotos.map((url, i) => (
                    <div key={i} className="aspect-[3/4] relative overflow-hidden rounded-xl bg-[#F8F5EF] border border-[#E7DED1]/60">
                      <img src={url} alt={`Book page ${i}`} className="object-cover w-full h-full" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Applications */}
              <div className="rounded-2xl border border-[#E7DED1] bg-white p-6 shadow-sm space-y-4">
                <h3 className="font-serif text-lg font-bold uppercase tracking-widest text-[#1D1A16] border-b border-[#E7DED1]/70 pb-3">
                  My Applications
                </h3>
                {applications.length === 0 ? (
                  <EmptyState title="No applications yet" description="Browse castings and apply to opportunities." />
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
