"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import DashboardSidebar from "@/components/dashboard-sidebar";
import StatCard from "@/components/stat-card";
import EmptyState from "@/components/empty-state";
import {
  Users, Shield, BookOpen, UserCheck,
  AlertCircle, Loader2, CheckCircle, XCircle
} from "lucide-react";

interface Agency {
  id: string; name: string; pilotStatus: string; isVerified: boolean;
  user: { name: string; email: string; createdAt: string };
  _count: { models: number; castings: number };
}
interface DBUser { id: string; name: string; email: string; role: string; status: string; createdAt: string }
interface DBCasting { id: string; title: string; location: string; isActive: boolean; _count: { applications: number } }
interface ContactMsg { id: string; name: string; email: string; role: string; subject: string; createdAt: string }

export default function AdminDashboard() {
  const [agencies, setAgencies]     = useState<Agency[]>([]);
  const [users, setUsers]           = useState<DBUser[]>([]);
  const [castings, setCastings]     = useState<DBCasting[]>([]);
  const [contacts, setContacts]     = useState<ContactMsg[]>([]);
  const [loading, setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const sidebarItems = [
    { name: "Platform Admin", href: "/dashboard/admin", icon: Shield },
    { name: "Models Hub",     href: "/models",          icon: Users },
  ];

  const fetchData = async () => {
    try {
      const [agenciesRes, usersRes, castingsRes, contactsRes] = await Promise.all([
        fetch("/api/admin/agencies"),
        fetch("/api/admin/users"),
        fetch("/api/castings?limit=10"),
        fetch("/api/contact"),
      ]);
      if (agenciesRes.ok)  { const d = await agenciesRes.json();  setAgencies(d.agencies ?? []); }
      if (usersRes.ok)     { const d = await usersRes.json();     setUsers(d.users ?? []); }
      if (castingsRes.ok)  { const d = await castingsRes.json();  setCastings(d.castings ?? []); }
      if (contactsRes.ok)  { const d = await contactsRes.json();  setContacts(d.messages ?? []); }
    } catch { /* silent */ } finally { setLoading(false); }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const handleAgencyAction = async (id: string, action: "approve" | "reject" | "activate") => {
    setActionLoading(id + action);
    try {
      const res = await fetch(`/api/admin/agencies/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) fetchData();
    } catch { /* silent */ } finally { setActionLoading(null); }
  };

  const pendingAgencies = agencies.filter((a) => a.pilotStatus === "PENDING");
  const totalApplications = castings.reduce((s, c) => s + (c._count?.applications ?? 0), 0);

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#F8F5EF] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">

            <DashboardSidebar title="System Control" subtitle="Super Administrator Node" items={sidebarItems} role="ADMIN" />

            <div className="flex-1 w-full space-y-8">

              {loading ? (
                <div className="flex items-center gap-2 text-xs text-[#6B6257]">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading admin data...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                  <StatCard title="Total Users"     value={users.length}          change="REGISTERED"    icon={Users} />
                  <StatCard title="Total Agencies"  value={agencies.length}       change="ALL STATUSES"  icon={Shield} />
                  <StatCard title="Castings"        value={castings.length}       change="POSTED"        icon={BookOpen} />
                  <StatCard title="Applications"    value={totalApplications}     change="RECEIVED"      icon={UserCheck} />
                </div>
              )}

              {/* Pending agency requests */}
              <div className="rounded-2xl border border-[#E7DED1] bg-white p-6 shadow-sm space-y-6">
                <h3 className="font-serif text-lg font-bold uppercase tracking-widest text-[#1D1A16] border-b border-[#E7DED1]/70 pb-3 flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-[#C8A96A]" />
                  Pending Agency Requests ({pendingAgencies.length})
                </h3>
                {pendingAgencies.length === 0 ? (
                  <EmptyState title="No pending requests" description="All agency requests have been reviewed." />
                ) : (
                  <div className="space-y-4">
                    {pendingAgencies.map((a) => (
                      <div key={a.id} className="rounded-xl border border-[#E7DED1] bg-[#F8F5EF]/30 p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-xs font-bold text-[#1D1A16] uppercase">{a.name}</h4>
                            <p className="text-[10px] text-[#6B6257] mt-0.5">{a.user.email}</p>
                            <p className="text-[10px] text-[#6B6257]">{a._count.models} models · {a._count.castings} castings</p>
                          </div>
                          <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase">PENDING</span>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => handleAgencyAction(a.id, "reject")}
                            disabled={!!actionLoading}
                            className="rounded-full border border-rose-300 text-rose-600 px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest hover:bg-rose-50 disabled:opacity-60 flex items-center gap-1">
                            {actionLoading === a.id + "reject" && <Loader2 className="h-3 w-3 animate-spin" />}
                            <XCircle className="h-3 w-3" /> Reject
                          </button>
                          <button onClick={() => handleAgencyAction(a.id, "approve")}
                            disabled={!!actionLoading}
                            className="rounded-full bg-[#1D1A16] text-white px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest hover:bg-[#C8A96A] transition-colors disabled:opacity-60 flex items-center gap-1">
                            {actionLoading === a.id + "approve" && <Loader2 className="h-3 w-3 animate-spin" />}
                            <CheckCircle className="h-3 w-3" /> Approve
                          </button>
                          <button onClick={() => handleAgencyAction(a.id, "activate")}
                            disabled={!!actionLoading}
                            className="rounded-full bg-[#C8A96A] text-[#11100E] px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest hover:bg-[#BCA062] transition-colors disabled:opacity-60 flex items-center gap-1">
                            {actionLoading === a.id + "activate" && <Loader2 className="h-3 w-3 animate-spin" />}
                            Approve Profile
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Latest users */}
              <div className="rounded-2xl border border-[#E7DED1] bg-white p-6 shadow-sm space-y-4">
                <h3 className="font-serif text-lg font-bold uppercase tracking-widest text-[#1D1A16] border-b border-[#E7DED1]/70 pb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#C8A96A]" /> Latest Users
                </h3>
                {users.length === 0 ? (
                  <EmptyState title="No users yet" description="Users will appear here once they sign up." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#E7DED1] text-[9px] uppercase font-bold tracking-widest text-[#6B6257]">
                          <th className="pb-3">Name</th><th className="pb-3">Email</th>
                          <th className="pb-3">Role</th><th className="pb-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E7DED1]/50">
                        {users.slice(0, 10).map((u) => (
                          <tr key={u.id}>
                            <td className="py-3 font-bold text-[#1D1A16]">{u.name}</td>
                            <td className="py-3 text-[#6B6257]">{u.email}</td>
                            <td className="py-3"><span className="bg-[#C8A96A]/10 text-[#8B6914] px-2 py-0.5 rounded-full text-[9px] font-bold uppercase">{u.role}</span></td>
                            <td className="py-3"><span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${u.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{u.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Contact messages */}
              {contacts.length > 0 && (
                <div className="rounded-2xl border border-[#E7DED1] bg-white p-6 shadow-sm space-y-4">
                  <h3 className="font-serif text-lg font-bold uppercase tracking-widest text-[#1D1A16] border-b border-[#E7DED1]/70 pb-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-[#C8A96A]" /> Contact Messages ({contacts.length})
                  </h3>
                  <div className="space-y-3">
                    {contacts.slice(0,5).map((m) => (
                      <div key={m.id} className="rounded-xl border border-[#E7DED1] p-4 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#1D1A16] uppercase">{m.name}</span>
                          <span className="text-[9px] text-[#6B6257]">{m.role}</span>
                        </div>
                        <p className="text-[#6B6257] mt-1">{m.subject}</p>
                        <p className="text-[10px] text-[#C8A96A] mt-0.5">{m.email}</p>
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
