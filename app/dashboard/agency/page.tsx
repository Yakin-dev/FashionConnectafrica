"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import DashboardSidebar from "@/components/dashboard-sidebar";
import StatCard from "@/components/stat-card";
import EmptyState from "@/components/empty-state";
import { mockModels } from "@/lib/mock-data";
import {
  Users, BookOpen, UserPlus, Eye, CheckCircle,
  Clock, AlertCircle, Loader2, ShieldCheck, XCircle
} from "lucide-react";

interface DBModel {
  id: string;
  userId: string;
  gender: string;
  category: string;
  height: number;
  profileImageUrl: string | null;
  user: { name: string; email: string };
}

interface DBCasting {
  id: string;
  title: string;
  location: string;
  date: string;
  budget: number;
  isActive: boolean;
  _count: { applications: number };
}

interface AgencyData {
  id: string;
  name: string;
  pilotStatus: string;
  isVerified: boolean;
  _count?: { models: number; castings: number };
}

const PILOT_BADGE: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING:      { label: "Profile Under Review", color: "bg-amber-100 text-amber-700 border-amber-300", icon: Clock },
  APPROVED:     { label: "Approved",        color: "bg-emerald-100 text-emerald-700 border-emerald-300", icon: ShieldCheck },
  REJECTED:     { label: "Not Approved",        color: "bg-red-100 text-red-700 border-red-300", icon: XCircle },
  PILOT_ACTIVE: { label: "Approved",          color: "bg-[#C8A96A]/20 text-[#8B6914] border-[#C8A96A]/40", icon: CheckCircle },
};

export default function AgencyDashboard() {
  const [agency, setAgency]       = useState<AgencyData | null>(null);
  const [dbModels, setDbModels]   = useState<DBModel[]>([]);
  const [castings, setCastings]   = useState<DBCasting[]>([]);
  const [loading, setLoading]     = useState(true);
  const [pilotLoading, setPilotLoading] = useState(false);
  const [addSuccess, setAddSuccess]    = useState(false);
  const [addError, setAddError]        = useState<string | null>(null);
  const [addLoading, setAddLoading]    = useState(false);

  // Add model form
  const [modelName, setModelName]         = useState("");
  const [modelCategory, setModelCategory] = useState("Runway");
  const [modelHeight, setModelHeight]     = useState(175);
  const [modelGender, setModelGender]     = useState("Female");

  const sidebarItems = [
    { name: "Represented Models", href: "/dashboard/agency", icon: Users },
    { name: "Manage Castings",    href: "/castings",         icon: BookOpen },
  ];

  const fetchData = async () => {
    try {
      const [agencyRes, modelsRes, castingsRes] = await Promise.all([
        fetch("/api/agency/me"),
        fetch("/api/agency/models"),
        fetch("/api/castings?mine=true"),
      ]);
      if (agencyRes.ok)   { const d = await agencyRes.json();   setAgency(d.agency); }
      if (modelsRes.ok)   { const d = await modelsRes.json();   setDbModels(d.models ?? []); }
      if (castingsRes.ok) { const d = await castingsRes.json(); setCastings(d.castings ?? []); }
    } catch {
      // DB unavailable — fallback to mock
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const handleRequestPilot = async () => {
    setPilotLoading(true);
    try {
      const res = await fetch("/api/agency/pilot", { method: "POST" });
      if (res.ok) {
        const d = await res.json();
        setAgency((prev) => prev ? { ...prev, pilotStatus: d.agency.pilotStatus } : prev);
      }
    } catch { /* silent */ } finally { setPilotLoading(false); }
  };

  const handleAddModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelName.trim()) return;
    setAddLoading(true);
    setAddError(null);
    try {
      const res = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: modelName, category: modelCategory, height: Number(modelHeight), gender: modelGender }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Failed"); }
      setAddSuccess(true);
      setModelName(""); setModelHeight(175); setModelCategory("Runway"); setModelGender("Female");
      fetchData();
      setTimeout(() => setAddSuccess(false), 3000);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to add model");
    } finally { setAddLoading(false); }
  };

  // Use DB models if available, else fall back to mock
  const displayModels = dbModels.length > 0
    ? dbModels.map((m) => ({ id: m.id, name: m.user.name, category: m.category, height: m.height, avatarUrl: m.profileImageUrl ?? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" }))
    : mockModels.filter((m) => m.agencyName.includes("Kigali")).map((m) => ({ id: m.id, name: m.name, category: m.category, height: m.height, avatarUrl: m.avatarUrl }));

  const pilotStatus = agency?.pilotStatus ?? "PENDING";
  const badge = PILOT_BADGE[pilotStatus] ?? PILOT_BADGE.PENDING;
  const BadgeIcon = badge.icon;

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#F8F5EF] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">

            <DashboardSidebar
              title={agency?.name ?? "Agency Dashboard"}
              subtitle="Agency Control Panel"
              items={sidebarItems}
              role="AGENCY"
            />

            <div className="flex-1 w-full space-y-8">

              {/* Profile Status Banner */}
              <div className={`rounded-2xl border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${badge.color}`}>
                <div className="flex items-center gap-2">
                  <BadgeIcon className="h-4 w-4 shrink-0" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest">{badge.label}</p>
                    <p className="text-[10px] mt-0.5 opacity-80">
                      {pilotStatus === "PENDING" && "Your agency profile is under review."}
                      {pilotStatus === "APPROVED" && "You can now list models and post casting calls."}
                      {pilotStatus === "PILOT_ACTIVE" && "Full access active. List models and post castings."}
                      {pilotStatus === "REJECTED" && "Your request was not approved. Contact support for details."}
                    </p>
                  </div>
                </div>
                {(pilotStatus === "PENDING" || pilotStatus === "REJECTED") && !agency && (
                  <button
                    onClick={handleRequestPilot}
                    disabled={pilotLoading}
                    className="shrink-0 rounded-full bg-[#1D1A16] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] transition-colors disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {pilotLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                    Request Verification
                  </button>
                )}
                {!agency && !loading && (
                  <button
                    onClick={handleRequestPilot}
                    disabled={pilotLoading}
                    className="shrink-0 rounded-full bg-[#1D1A16] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] transition-colors disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {pilotLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                    Request Verification
                  </button>
                )}
              </div>

              {/* Stats */}
              {loading ? (
                <div className="flex items-center gap-2 text-xs text-[#6B6257]">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading dashboard data...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                  <StatCard title="Roster Talent"    value={displayModels.length}    change="HQ MANAGED"  icon={Users} />
                  <StatCard title="Posted Castings"  value={castings.length}         change="ACTIVE"      icon={BookOpen} />
                  <StatCard title="Applications"     value={castings.reduce((a, c) => a + (c._count?.applications ?? 0), 0)} change="RECEIVED" icon={Eye} />
                  <StatCard title="Account Status"     value={pilotStatus.replace("_", " ")} change="CURRENT" icon={ShieldCheck} />
                </div>
              )}

              {/* Roster + Add Model */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Roster Table */}
                <div className="lg:col-span-8 rounded-2xl border border-[#E7DED1] bg-white p-6 shadow-sm space-y-6">
                  <h3 className="font-serif text-lg font-bold uppercase tracking-widest text-[#1D1A16] border-b border-[#E7DED1]/70 pb-3">
                    Represented Models
                  </h3>
                  {displayModels.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#E7DED1] text-[9px] uppercase font-bold tracking-widest text-[#6B6257]">
                            <th className="pb-3">Model</th>
                            <th className="pb-3">Category</th>
                            <th className="pb-3">Height</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E7DED1]/50 text-xs">
                          {displayModels.map((m) => (
                            <tr key={m.id}>
                              <td className="py-3.5 flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full overflow-hidden bg-[#E7DED1] shrink-0">
                                  <img src={m.avatarUrl} alt={m.name} className="object-cover h-full w-full" />
                                </div>
                                <span className="font-bold text-[#1D1A16] uppercase">{m.name}</span>
                              </td>
                              <td className="py-3.5 text-[#6B6257]">{m.category}</td>
                              <td className="py-3.5 text-[#6B6257]">{m.height} cm</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <EmptyState title="No models yet" description="Add your first model using the form." />
                  )}
                </div>

                {/* Add Model Form */}
                <div className="lg:col-span-4 rounded-2xl border border-[#E7DED1] bg-white p-6 shadow-sm space-y-4">
                  <h3 className="font-serif text-lg font-bold uppercase tracking-widest text-[#1D1A16] border-b border-[#E7DED1]/70 pb-3 flex items-center gap-1.5">
                    <UserPlus className="h-4 w-4 text-[#C8A96A]" />
                    <span>Recruit New Face</span>
                  </h3>

                  {addSuccess && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-emerald-700 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" /> Model added successfully!
                    </div>
                  )}
                  {addError && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-red-600 text-[10px] flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" /> {addError}
                    </div>
                  )}

                  <form onSubmit={handleAddModel} className="space-y-4">
                    {[
                      { label: "Model Name", value: modelName, setter: setModelName, type: "text", placeholder: "ENTER NAME" },
                      { label: "Height (cm)", value: modelHeight, setter: (v: string) => setModelHeight(Number(v)), type: "number", placeholder: "175" },
                    ].map(({ label, value, setter, type, placeholder }) => (
                      <div key={label} className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257]">{label}</label>
                        <input type={type} required value={value} onChange={(e) => (setter as (v: string) => void)(e.target.value)}
                          placeholder={placeholder}
                          className="w-full rounded-xl border border-[#E7DED1] bg-[#F8F5EF]/30 p-3 text-xs focus:outline-none focus:bg-white" />
                      </div>
                    ))}

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257]">Gender</label>
                      <select value={modelGender} onChange={(e) => setModelGender(e.target.value)}
                        className="w-full rounded-xl border border-[#E7DED1] bg-[#F8F5EF]/30 p-3 text-xs focus:outline-none">
                        <option>Female</option><option>Male</option><option>Non-binary</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257]">Category</label>
                      <select value={modelCategory} onChange={(e) => setModelCategory(e.target.value)}
                        className="w-full rounded-xl border border-[#E7DED1] bg-[#F8F5EF]/30 p-3 text-xs focus:outline-none">
                        {["Runway","Editorial","Commercial","Fitness","Beauty","Plus-size","Petite"].map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <button type="submit" disabled={addLoading}
                      className="w-full rounded-full bg-[#1D1A16] py-3 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5">
                      {addLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Recruit Talent
                    </button>
                  </form>
                </div>

              </div>

              {/* Posted Castings */}
              {castings.length > 0 && (
                <div className="rounded-2xl border border-[#E7DED1] bg-white p-6 shadow-sm space-y-4">
                  <h3 className="font-serif text-lg font-bold uppercase tracking-widest text-[#1D1A16] border-b border-[#E7DED1]/70 pb-3">
                    My Posted Castings
                  </h3>
                  <div className="space-y-3">
                    {castings.map((c) => (
                      <div key={c.id} className="flex items-center justify-between rounded-xl border border-[#E7DED1] p-4 text-xs">
                        <div>
                          <p className="font-bold text-[#1D1A16] uppercase">{c.title}</p>
                          <p className="text-[#6B6257] mt-0.5">{c.location} · ${c.budget.toLocaleString()}</p>
                        </div>
                        <span className="text-[10px] font-bold text-[#C8A96A] bg-[#C8A96A]/10 px-3 py-1 rounded-full">
                          {c._count.applications} Applications
                        </span>
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
