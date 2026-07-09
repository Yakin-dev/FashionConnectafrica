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
  AlertCircle, Loader2, CheckCircle, XCircle, Trash2,
  Mail, Search, CreditCard, CalendarDays,
  Ban,
} from "lucide-react";

interface Agency {
  id: string; name: string; pilotStatus: string; isVerified: boolean;
  user: { name: string; email: string; createdAt: string };
  _count: { models: number; castings: number };
}
interface ExtendedUser {
  id: string; name: string; email: string; role: string; status: string;
  username: string | null; avatarUrl: string | null;
  onboardingCompleted: boolean; createdAt: string; updatedAt: string;
  profile: { location: string | null; phoneNumber: string | null; bio: string | null } | null;
  model: {
    id: string; professionalName: string | null; category: string;
    categories: string[]; profileStatus: string; isAvailable: boolean;
    height: number; experienceLevel: string | null; location: string | null;
    agency: { name: string } | null;
  } | null;
  agency: {
    id: string; name: string; location: string; isVerified: boolean;
    verificationStatus: string; pilotStatus: string; modelCount: string | null;
    _count: { models: number; castings: number };
  } | null;
  client: { company: string | null; purpose: string | null; location: string | null } | null;
  businessProfile: { role: string; businessName: string | null; verificationStatus: string; city: string | null } | null;
  marketplaceProvider: { businessName: string; serviceCategory: string; location: string } | null;
  subscription: {
    plan: string; status: string; amount: number; currency: string;
    currentPeriodStart: string | null; currentPeriodEnd: string | null; createdAt: string;
  } | null;
  _count: { sentMessages: number; notifications: number; contactMessages: number };
}
interface DBCasting { id: string; title: string; location: string; isActive: boolean; _count: { applications: number } }
interface ContactMsg { id: string; name: string; email: string; role: string; subject: string; createdAt: string }
interface AdminPayment {
  id: string; status: "PENDING" | "APPROVED" | "REJECTED";
  plan: string; amount: number; amountPaid: number;
  senderName: string; senderPhone: string;
  transactionId: string | null; adminNote: string | null;
  screenshotUrl: string | null; notes: string | null;
  createdAt: string; approvedAt: string | null; rejectedAt: string | null;
  user: { id: string; name: string; email: string };
}

export default function AdminDashboard() {
  const [agencies, setAgencies]               = useState<Agency[]>([]);
  const [users, setUsers]                     = useState<ExtendedUser[]>([]);
  const [castings, setCastings]               = useState<DBCasting[]>([]);
  const [contacts, setContacts]               = useState<ContactMsg[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [actionLoading, setActionLoading]      = useState<string | null>(null);
  const [searchQuery, setSearchQuery]          = useState("");
  const [roleFilter, setRoleFilter]            = useState("ALL");
  const [statusFilter, setStatusFilter]        = useState("ALL");

  // Delete state
  const [deleteConfirm, setDeleteConfirm]     = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading]     = useState(false);

  // Payment management state
  const [payments, setPayments]               = useState<AdminPayment[]>([]);
  const [paymentActionLoading, setPaymentActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal]         = useState<{ id: string; senderName: string } | null>(null);
  const [rejectReason, setRejectReason]       = useState("");

  // Email modal state
  const [emailModalUser, setEmailModalUser]   = useState<ExtendedUser | null>(null);
  const [emailSubject, setEmailSubject]       = useState("");
  const [emailMessage, setEmailMessage]       = useState("");
  const [emailSending, setEmailSending]       = useState(false);
  const [emailSuccess, setEmailSuccess]       = useState(false);

  // Toast
  const [toast, setToast]                     = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const sidebarItems = [
    { name: "Platform Admin", href: "/dashboard/admin", icon: Shield },
    { name: "Models Hub",     href: "/models",          icon: Users },
  ];

  const fetchData = async () => {
    try {
      const [agenciesRes, usersRes, castingsRes, contactsRes, paymentsRes] = await Promise.all([
        fetch("/api/admin/agencies"),
        fetch("/api/admin/users"),
        fetch("/api/castings?limit=10"),
        fetch("/api/contact"),
        fetch("/api/admin/payments"),
      ]);
      if (agenciesRes.ok)  { const d = await agenciesRes.json();  setAgencies(d.agencies ?? []); }
      if (usersRes.ok)     { const d = await usersRes.json();     setUsers(d.users ?? []); }
      if (castingsRes.ok)  { const d = await castingsRes.json();  setCastings(d.castings ?? []); }
      if (contactsRes.ok)  { const d = await contactsRes.json();  setContacts(d.messages ?? []); }
      if (paymentsRes.ok)  { const d = await paymentsRes.json();  setPayments(d.payments ?? []); }
    } catch { /* silent */ } finally { setLoading(false); }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  // Payment approve/reject handler
  const handlePaymentAction = async (id: string, action: "approve" | "reject") => {
    if (action === "reject" && !rejectReason) return;
    setPaymentActionLoading(id + action);
    try {
      const res = await fetch(`/api/admin/payments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, adminNote: action === "reject" ? rejectReason : undefined }),
      });
      if (res.ok) {
        showToast(action === "approve" ? "Payment approved — subscription activated" : "Payment rejected");
        fetchData();
      } else {
        const d = await res.json();
        showToast(d.error || "Failed to update payment");
      }
    } catch { /* silent */ } finally {
      setPaymentActionLoading(null);
      setRejectModal(null);
      setRejectReason("");
    }
  };

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

  // Delete handler
  const handleDeleteUser = async (userId: string) => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        showToast("User deleted successfully");
        fetchData();
      } else {
        const d = await res.json();
        showToast(d.error || "Failed to delete user");
      }
    } catch {
      showToast("Failed to delete user");
    } finally {
      setDeleteLoading(false);
      setDeleteConfirm(null);
    }
  };

  // Email handler
  const handleSendEmail = async () => {
    if (!emailModalUser || !emailSubject || !emailMessage) return;
    setEmailSending(true);
    setEmailSuccess(false);
    try {
      const res = await fetch(`/api/admin/users/${emailModalUser.id}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: emailSubject, message: emailMessage }),
      });
      if (res.ok) {
        setEmailSuccess(true);
        showToast(`Email sent to ${emailModalUser.email}`);
        setTimeout(() => { setEmailModalUser(null); setEmailSubject(""); setEmailMessage(""); setEmailSuccess(false); }, 1500);
      } else {
        const d = await res.json();
        showToast(d.error || "Failed to send email");
      }
    } catch {
      showToast("Failed to send email");
    } finally {
      setEmailSending(false);
    }
  };

  const openEmailModal = (user: ExtendedUser) => {
    setEmailModalUser(user);
    setEmailSubject(`Upgrade Your FashionConnect.Africa Subscription`);
    setEmailMessage(
`Hi ${user.name},

We noticed your current subscription is ${user.subscription?.plan?.replace(/_/g, " ") || "Free"}.

Upgrading your plan unlocks premium features including:
• Expanded portfolio capacity
• Priority listing visibility
• Advanced analytics
• Priority support

Visit your dashboard to explore available plans.

Best,
FashionConnect.Africa Team`
    );
    setEmailSuccess(false);
  };

  const pendingAgencies = agencies.filter((a) => a.pilotStatus === "PENDING");
  const totalApplications = castings.reduce((s, c) => s + (c._count?.applications ?? 0), 0);

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch = !searchQuery ||
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchesStatus = statusFilter === "ALL" || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const subscriptionStats = {
    active: users.filter((u) => u.subscription?.status === "ACTIVE").length,
    expired: users.filter((u) => u.subscription?.status === "EXPIRED").length,
    free: users.filter((u) => !u.subscription || u.subscription.status !== "ACTIVE").length,
  };

  const roleColors: Record<string, string> = {
    ADMIN: "bg-purple-100 text-purple-700",
    AGENCY: "bg-blue-100 text-blue-700",
    MODEL: "bg-emerald-100 text-emerald-700",
    CLIENT: "bg-amber-100 text-amber-700",
    MARKETPLACE_PROVIDER: "bg-pink-100 text-pink-700",
    MAKEUP_ARTIST: "bg-rose-100 text-rose-700",
    FASHION_STYLIST: "bg-indigo-100 text-indigo-700",
    HAIR_STYLIST: "bg-orange-100 text-orange-700",
    VIDEOGRAPHER: "bg-cyan-100 text-cyan-700",
  };

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
                <>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                    <StatCard title="Total Users"     value={users.length}           change="REGISTERED"   icon={Users} />
                    <StatCard title="Total Agencies"  value={agencies.length}        change="ALL STATUSES" icon={Shield} />
                    <StatCard title="Castings"        value={castings.length}        change="POSTED"       icon={BookOpen} />
                    <StatCard title="Applications"    value={totalApplications}      change="RECEIVED"     icon={UserCheck} />
                    <StatCard title="Active Subs"     value={subscriptionStats.active}  change={`${subscriptionStats.free} FREE`} icon={CreditCard} />
                  </div>

                  {/* Subscription Overview Bar */}
                  <div className="rounded-2xl border border-[#E7DED1] bg-white p-4 shadow-sm flex flex-wrap items-center gap-4 text-xs">
                    <span className="font-bold uppercase tracking-widest text-[#1D1A16] flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-[#C8A96A]" /> Subscription Overview
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-[#6B6257]">{subscriptionStats.active} Active</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-400" />
                      <span className="text-[#6B6257]">{subscriptionStats.expired} Expired</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-gray-300" />
                      <span className="text-[#6B6257]">{subscriptionStats.free} Free / No Plan</span>
                    </span>
                  </div>
                </>
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

              {/* Pending Payments Section */}
              <div className="rounded-2xl border border-[#E7DED1] bg-white p-6 shadow-sm space-y-4">
                <h3 className="font-serif text-lg font-bold uppercase tracking-widest text-[#1D1A16] border-b border-[#E7DED1]/70 pb-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-[#C8A96A]" />
                  Manual Payment Approvals ({payments.filter(p => p.status === "PENDING").length} pending)
                </h3>
                {payments.length === 0 ? (
                  <EmptyState title="No payments yet" description="Users will see their payment submissions here." />
                ) : payments.filter(p => p.status === "PENDING").length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-xs text-[#6B6257]">All payments have been processed.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#E7DED1] text-[9px] uppercase font-bold tracking-widest text-[#6B6257]">
                          <th className="pb-3 pr-3">User</th>
                          <th className="pb-3 pr-3">Plan</th>
                          <th className="pb-3 pr-3">Sender</th>
                          <th className="pb-3 pr-3">Amount</th>
                          <th className="pb-3 pr-3">Phone</th>
                          <th className="pb-3 pr-3">Txn ID</th>
                          <th className="pb-3 pr-3">Date</th>
                          <th className="pb-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E7DED1]/50">
                        {payments.filter(p => p.status === "PENDING").map((p) => (
                          <tr key={p.id} className="hover:bg-[#F8F5EF]/50 transition-colors">
                            <td className="py-3 pr-3">
                              <span className="font-bold text-[#1D1A16] block">{p.user.name}</span>
                              <span className="text-[9px] text-[#6B6257]">{p.user.email}</span>
                            </td>
                            <td className="py-3 pr-3">
                              <span className="bg-[#C8A96A]/10 text-[#8B6914] px-2 py-0.5 rounded-full text-[9px] font-bold uppercase">
                                {p.plan.replace(/_/g, " ")}
                              </span>
                            </td>
                            <td className="py-3 pr-3 font-bold text-[#1D1A16]">{p.senderName}</td>
                            <td className="py-3 pr-3 text-[#6B6257]">RWF {p.amountPaid.toLocaleString()}</td>
                            <td className="py-3 pr-3 text-[#6B6257]">{p.senderPhone}</td>
                            <td className="py-3 pr-3 text-[10px] text-[#6B6257]">{p.transactionId || "—"}</td>
                            <td className="py-3 pr-3 text-[10px] text-[#6B6257]">{new Date(p.createdAt).toLocaleDateString()}</td>
                            <td className="py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handlePaymentAction(p.id, "approve")}
                                  disabled={!!paymentActionLoading}
                                  className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
                                  title="Approve payment"
                                >
                                  {paymentActionLoading === p.id + "approve" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                </button>
                                <button
                                  onClick={() => setRejectModal({ id: p.id, senderName: p.senderName })}
                                  disabled={!!paymentActionLoading}
                                  className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                                  title="Reject payment"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* All Users Management */}
              <div className="rounded-2xl border border-[#E7DED1] bg-white p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E7DED1]/70 pb-4">
                  <h3 className="font-serif text-lg font-bold uppercase tracking-widest text-[#1D1A16] flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#C8A96A]" />
                    All Users ({filteredUsers.length})
                  </h3>
                  <div className="flex flex-wrap gap-2 items-center">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#6B6257]" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-40 lg:w-56 rounded-lg border border-[#E7DED1] bg-[#F8F5EF]/50 py-2 pl-9 pr-3 text-[10px] font-semibold text-[#1D1A16] placeholder-[#6B6257] focus:outline-none focus:ring-1 focus:ring-[#C8A96A]"
                      />
                    </div>
                    {/* Role filter */}
                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
                      className="rounded-lg border border-[#E7DED1] bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#6B6257] focus:outline-none">
                      <option value="ALL">All Roles</option>
                      <option value="ADMIN">Admin</option>
                      <option value="AGENCY">Agency</option>
                      <option value="MODEL">Model</option>
                      <option value="CLIENT">Client</option>
                      <option value="MARKETPLACE_PROVIDER">Marketplace</option>
                      <option value="MAKEUP_ARTIST">Makeup Artist</option>
                      <option value="FASHION_STYLIST">Fashion Stylist</option>
                      <option value="HAIR_STYLIST">Hair Stylist</option>
                      <option value="VIDEOGRAPHER">Videographer</option>
                    </select>
                    {/* Status filter */}
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                      className="rounded-lg border border-[#E7DED1] bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#6B6257] focus:outline-none">
                      <option value="ALL">All Statuses</option>
                      <option value="ACTIVE">Active</option>
                      <option value="PENDING">Pending</option>
                      <option value="SUSPENDED">Suspended</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                </div>

                {filteredUsers.length === 0 ? (
                  <EmptyState title="No users found" description="No users match your search or filter criteria." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#E7DED1] text-[9px] uppercase font-bold tracking-widest text-[#6B6257]">
                          <th className="pb-3 pr-3">User</th>
                          <th className="pb-3 pr-3">Role</th>
                          <th className="pb-3 pr-3">Status</th>
                          <th className="pb-3 pr-3">Subscription</th>
                          <th className="pb-3 pr-3">Plan Ends</th>
                          <th className="pb-3 pr-3">Joined</th>
                          <th className="pb-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E7DED1]/50">
                        {filteredUsers.map((u) => {
                          const sub = u.subscription;
                          const isActiveSub = sub?.status === "ACTIVE";
                          const planEnd = sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : null;
                          const daysLeft = planEnd ? Math.ceil((planEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
                          const isExpiringSoon = daysLeft !== null && daysLeft <= 7 && daysLeft > 0;

                          // Get secondary info
                          const secondaryInfo =
                            u.agency?.name ||
                            u.businessProfile?.businessName ||
                            u.marketplaceProvider?.businessName ||
                            u.model?.professionalName ||
                            u.client?.company ||
                            "";

                          return (
                            <tr key={u.id} className="hover:bg-[#F8F5EF]/50 transition-colors">
                              <td className="py-3 pr-3">
                                <div>
                                  <span className="font-bold text-[#1D1A16] block">{u.name}</span>
                                  <span className="text-[9px] text-[#6B6257]">{u.email}</span>
                                  {secondaryInfo && (
                                    <span className="text-[9px] text-[#C8A96A] block">{secondaryInfo}</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 pr-3">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${roleColors[u.role] || "bg-gray-100 text-gray-700"}`}>
                                  {u.role.replace(/_/g, " ")}
                                </span>
                              </td>
                              <td className="py-3 pr-3">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                  u.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" :
                                  u.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                                  u.status === "SUSPENDED" ? "bg-red-100 text-red-700" :
                                  "bg-gray-100 text-gray-700"
                                }`}>
                                  {u.status === "SUSPENDED" && <Ban className="h-2.5 w-2.5" />}
                                  {u.status}
                                </span>
                              </td>
                              <td className="py-3 pr-3">
                                {sub ? (
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                    isActiveSub ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                  }`}>
                                    {isActiveSub ? <CheckCircle className="h-2.5 w-2.5" /> : <XCircle className="h-2.5 w-2.5" />}
                                    {sub.plan?.replace(/_/g, " ") || "FREE"}
                                  </span>
                                ) : (
                                  <span className="text-[#6B6257] text-[9px]">—</span>
                                )}
                              </td>
                              <td className="py-3 pr-3">
                                {planEnd ? (
                                  <span className={`text-[10px] flex items-center gap-1 ${
                                    isExpiringSoon ? "text-amber-600 font-bold" :
                                    daysLeft && daysLeft <= 0 ? "text-red-600 font-bold" :
                                    "text-[#6B6257]"
                                  }`}>
                                    <CalendarDays className="h-3 w-3" />
                                    {daysLeft && daysLeft <= 0 ? "Expired" : planEnd.toLocaleDateString()}
                                    {isExpiringSoon && <span className="text-[8px]">({daysLeft}d left)</span>}
                                  </span>
                                ) : (
                                  <span className="text-[#6B6257] text-[9px]">—</span>
                                )}
                              </td>
                              <td className="py-3 pr-3 text-[10px] text-[#6B6257]">
                                {new Date(u.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  {/* Send Email */}
                                  <button
                                    onClick={() => openEmailModal(u)}
                                    className="rounded-lg p-1.5 hover:bg-[#F8F5EF] text-[#6B6257] hover:text-[#C8A96A] transition-colors"
                                    title="Send email reminder"
                                  >
                                    <Mail className="h-3.5 w-3.5" />
                                  </button>
                                  {/* Delete User */}
                                  <button
                                    onClick={() => setDeleteConfirm(u.id)}
                                    className="rounded-lg p-1.5 hover:bg-[#F8F5EF] text-[#6B6257] hover:text-rose-600 transition-colors"
                                    title="Delete user"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
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

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-[#E7DED1] p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold uppercase text-[#1D1A16]">Delete User?</h3>
                <p className="text-xs text-[#6B6257]">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-xs text-[#6B6257] leading-relaxed">
              This will permanently delete the user and all associated data including their profile, models, castings, messages, and subscription records.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-full border border-[#E7DED1] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#6B6257] hover:bg-[#F8F5EF] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(deleteConfirm)}
                disabled={deleteLoading}
                className="rounded-full bg-rose-600 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                {deleteLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-[#E7DED1] p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold uppercase text-[#1D1A16]">Reject Payment</h3>
                <p className="text-xs text-[#6B6257]">Payment from: {rejectModal.senderName}</p>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B6257] block mb-1">Reason for Rejection *</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-[#E7DED1] bg-[#F8F5EF]/50 p-3 text-xs font-semibold text-[#1D1A16] focus:outline-none focus:ring-1 focus:ring-[#C8A96A] resize-none"
                placeholder="Explain why the payment is being rejected..."
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setRejectModal(null); setRejectReason(""); }}
                className="rounded-full border border-[#E7DED1] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#6B6257] hover:bg-[#F8F5EF] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePaymentAction(rejectModal.id, "reject")}
                disabled={!rejectReason || !!paymentActionLoading}
                className="rounded-full bg-rose-600 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                {paymentActionLoading === rejectModal.id + "reject" && <Loader2 className="h-3 w-3 animate-spin" />}
                Reject Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Email Modal */}
      {emailModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-[#E7DED1] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#C8A96A]/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-[#C8A96A]" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold uppercase text-[#1D1A16]">Send Email</h3>
                  <p className="text-[10px] text-[#6B6257]">To: {emailModalUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => { setEmailModalUser(null); setEmailSubject(""); setEmailMessage(""); setEmailSuccess(false); }}
                className="rounded-full p-1.5 hover:bg-[#F8F5EF] text-[#6B6257]"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {emailSuccess ? (
              <div className="flex flex-col items-center py-8 text-emerald-600">
                <CheckCircle className="h-10 w-10 mb-2" />
                <p className="text-sm font-bold uppercase tracking-widest">Email Sent!</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B6257] block mb-1">Subject</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full rounded-xl border border-[#E7DED1] bg-[#F8F5EF]/50 p-3 text-xs font-semibold text-[#1D1A16] focus:outline-none focus:ring-1 focus:ring-[#C8A96A]"
                      placeholder="Email subject..."
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B6257] block mb-1">Message</label>
                    <textarea
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      rows={8}
                      className="w-full rounded-xl border border-[#E7DED1] bg-[#F8F5EF]/50 p-3 text-xs font-semibold text-[#1D1A16] focus:outline-none focus:ring-1 focus:ring-[#C8A96A] resize-none"
                      placeholder="Write your message..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    onClick={() => { setEmailModalUser(null); setEmailSubject(""); setEmailMessage(""); setEmailSuccess(false); }}
                    className="rounded-full border border-[#E7DED1] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#6B6257] hover:bg-[#F8F5EF] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendEmail}
                    disabled={emailSending || !emailSubject || !emailMessage}
                    className="rounded-full bg-[#1D1A16] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    {emailSending && <Loader2 className="h-3 w-3 animate-spin" />}
                    {emailSending ? "Sending..." : "Send Email"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-[#1D1A16] text-white rounded-full px-5 py-2.5 shadow-2xl text-[10px] font-bold uppercase tracking-widest">
            {toast}
          </div>
        </div>
      )}
    </>
  );
}
