"use client";

// Client component — data is fetched client-side
import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import DashboardSidebar from "@/components/dashboard-sidebar";
import StatCard from "@/components/stat-card";
import EmptyState from "@/components/empty-state";
import Link from "next/link";
import dynamic from "next/dynamic";

// Lazy-load the heavy 5-step model creation wizard (only renders when opened)
const ModelCreateWizard = dynamic(() => import("@/components/model-create-wizard"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="rounded-2xl bg-white p-8 shadow-2xl flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-[#C8A96A]" />
        <span className="text-xs font-bold uppercase tracking-widest text-[#6B6257]">Loading wizard...</span>
      </div>
    </div>
  ),
});
import {
  Users, BookOpen, UserPlus, Eye, CheckCircle,
  Clock, AlertCircle, Loader2, ShieldCheck, XCircle,
  ArrowUpRight, Copy, Check, FileText, Lock, Pencil,
  Archive, ArchiveRestore, MessageSquare, X, Save,
  ChevronDown, ChevronUp,
} from "lucide-react";

interface DBModel {
  id: string;
  userId: string;
  gender: string;
  category: string;
  height: number;
  professionalName: string | null;
  profileStatus: string;
  isAvailable: boolean;
  profileImageUrl: string | null;
  user: { name: string; email: string };
  portfolioMedia: { id: string }[];
}

interface DBInquiry {
  id: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string | null;
  preferredDate: string;
  notes: string;
  isRead: boolean;
  createdAt: string;
  model: {
    id: string;
    professionalName: string | null;
    profileImageUrl: string | null;
    category: string;
  };
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
  location?: string;
  logoUrl?: string | null;
  verificationStatus: string;
  pilotStatus: string;
  isVerified: boolean;
  _count?: { models: number; castings: number };
}

const VERIFICATION_BADGE: Record<string, { label: string; color: string; icon: React.ElementType; description: string }> = {
  PENDING_REVIEW: {
    label: "Agency Profile Under Review",
    color: "bg-amber-100 text-amber-700 border-amber-300",
    icon: Clock,
    description: "Complete your agency details and verification requirements. Once approved, you can publish model portfolios and submit represented models to casting opportunities.",
  },
  APPROVED: {
    label: "Verified Agency",
    color: "bg-emerald-100 text-emerald-700 border-emerald-300",
    icon: ShieldCheck,
    description: "Full access active. Publish model portfolios and submit represented models to casting opportunities.",
  },
  REJECTED: {
    label: "Verification Not Approved",
    color: "bg-red-100 text-red-700 border-red-300",
    icon: XCircle,
    description: "Your request was not approved. Contact support for details on how to proceed.",
  },
  DRAFT: {
    label: "Profile Incomplete",
    color: "bg-gray-100 text-gray-700 border-gray-300",
    icon: FileText,
    description: "Complete your agency profile and submit for review to access all features.",
  },
};

function AgencyDashboardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [agency, setAgency]       = useState<AgencyData | null>(null);
  const [dbModels, setDbModels]   = useState<DBModel[]>([]);
  const [castings, setCastings]   = useState<DBCasting[]>([]);
  const [inquiries, setInquiries] = useState<DBInquiry[]>([]);
  const [loading, setLoading]     = useState(true);
  const [copiedId, setCopiedId]   = useState<string | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [archiveConfirm, setArchiveConfirm] = useState<string | null>(null);
  const [archiveLoading, setArchiveLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Edit model modal state
  const [editModelId, setEditModelId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);
  const [showMeasurements, setShowMeasurements] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Show wizard when ?add=true is in the URL
  useEffect(() => {
    if (searchParams.get("add") === "true") {
      setShowWizard(true);
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [searchParams]);

  const sidebarItems = [
    { name: "Represented Models", href: "/dashboard/agency", icon: Users },
    { name: "Castings",           href: "/castings",         icon: BookOpen },
    { name: "Inquiries",          href: "/dashboard/agency#inquiries", icon: MessageSquare },
  ];

  const fetchData = async () => {
    try {
      const [agencyRes, modelsRes, castingsRes, inquiriesRes] = await Promise.all([
        fetch("/api/agency/me"),
        fetch("/api/agency/models"),
        fetch("/api/castings?mine=true"),
        fetch("/api/agency/inquiries"),
      ]);
      if (agencyRes.ok)   { const d = await agencyRes.json();   setAgency(d.agency); }
      if (modelsRes.ok)   { const d = await modelsRes.json();   setDbModels(d.models ?? []); }
      if (castingsRes.ok) { const d = await castingsRes.json(); setCastings(d.castings ?? []); }
      if (inquiriesRes.ok) { const d = await inquiriesRes.json(); setInquiries(d.inquiries ?? []); }
    } catch {
      // DB unavailable
    } finally {
      setLoading(false);
    }
  };

  // Check subscription expiry on load
  useEffect(() => {
    fetch("/api/payments/subscription-status")
      .then((r) => r.json())
      .then((data) => {
        if (data.subscribed && data.currentPeriodEnd) {
          const daysLeft = Math.ceil((new Date(data.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          if (daysLeft <= 5 && daysLeft > 0) {
            showToast(`Your ${data.plan} plan expires in ${daysLeft} day${daysLeft > 1 ? "s" : ""}. Renew to keep premium features.`);
          }
        }
      })
      .catch(() => { /* silent */ });
  }, [showToast]);

  useEffect(() => {
    void fetchData();
  }, []);

  const copyProfileLink = (modelId: string) => {
    const url = `${window.location.origin}/models/${modelId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(modelId);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const handleArchive = async (modelId: string) => {
    setArchiveLoading(modelId);
    try {
      const res = await fetch(`/api/models/${modelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileStatus: "ARCHIVED" }),
      });
      if (res.ok) {
        fetchData();
        showToast("Model profile archived");
      } else {
        const d = await res.json();
        showToast(d.error || "Failed to archive");
      }
    } catch {
      showToast("Failed to archive profile");
    } finally {
      setArchiveLoading(null);
      setArchiveConfirm(null);
    }
  };

  const handleUnarchive = async (modelId: string) => {
    setArchiveLoading(modelId);
    try {
      const res = await fetch(`/api/models/${modelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileStatus: "DRAFT" }),
      });
      if (res.ok) {
        fetchData();
        showToast("Model profile restored");
      }
    } catch {
      showToast("Failed to restore profile");
    } finally {
      setArchiveLoading(null);
    }
  };

  const verificationStatus = agency?.verificationStatus ?? "PENDING_REVIEW";
  const badge = VERIFICATION_BADGE[verificationStatus] ?? VERIFICATION_BADGE.PENDING_REVIEW;
  const BadgeIcon = badge.icon;
  const isVerifiedOrActive = verificationStatus === "APPROVED" || agency?.pilotStatus === "PILOT_ACTIVE";

  const draftModels = dbModels.filter((m) => m.profileStatus === "DRAFT");
  const publishedModels = dbModels.filter((m) => m.profileStatus === "PUBLISHED");
  const hiddenModels = dbModels.filter((m) => m.profileStatus === "HIDDEN" || m.profileStatus === "ARCHIVED");

  const openEditModal = async (modelId: string) => {
    setEditModelId(modelId);
    setEditLoading(true);
    setEditError(null);
    setEditSuccess(null);
    try {
      const res = await fetch(`/api/models/${modelId}`);
      if (!res.ok) throw new Error("Failed to load model data");
      const d = await res.json();
      const m = d.model;
      setEditData({
        professionalName: m.professionalName || "",
        bio: m.bio || m.user?.profile?.bio || "",
        category: m.category || "",
        categories: m.categories || [],
        skills: m.skills || [],
        languages: m.languages || [],
        experienceLevel: m.experienceLevel || "",
        notableCredits: m.notableCredits || "",
        isAvailable: m.isAvailable ?? true,
        location: m.location || m.user?.profile?.location || "",
        height: m.height,
        bustCm: m.bustCm || null,
        chestCm: m.chestCm || null,
        waistCm: m.waistCm || null,
        hipsCm: m.hipsCm || null,
        inseamCm: m.inseamCm || null,
        shoeSize: m.shoeSize || null,
        hairColor: m.hairColor || "",
        eyeColor: m.eyeColor || "",
        nationality: m.nationality || "",
        travelAvailability: m.travelAvailability || "",
        representationStatus: m.representationStatus || "",
        dressSize: m.dressSize || "",
        shoeSizeSystem: m.shoeSizeSystem || "",
      });
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setEditLoading(false);
    }
  };

  const closeEditModal = () => {
    setEditModelId(null);
    setEditData(null);
    setEditError(null);
    setEditSuccess(null);
  };

  const handleEditSave = async () => {
    if (!editModelId || !editData) return;
    setEditSaving(true);
    setEditError(null);
    setEditSuccess(null);
    try {
      const body: Record<string, any> = {
        professionalName: editData.professionalName || null,
        bio: editData.bio || null,
        category: editData.category,
        categories: editData.categories,
        skills: editData.skills,
        languages: editData.languages,
        experienceLevel: editData.experienceLevel || null,
        notableCredits: editData.notableCredits || null,
        isAvailable: editData.isAvailable,
        location: editData.location || null,
        height: editData.height,
        hairColor: editData.hairColor || null,
        eyeColor: editData.eyeColor || null,
        nationality: editData.nationality || null,
        travelAvailability: editData.travelAvailability || null,
        representationStatus: editData.representationStatus || null,
        dressSize: editData.dressSize || null,
        shoeSizeSystem: editData.shoeSizeSystem || null,
      };
      // Send all measurement fields explicitly so they can be cleared
      body.bustCm = editData.bustCm || null;
      body.chestCm = editData.chestCm || null;
      body.waistCm = editData.waistCm || null;
      body.hipsCm = editData.hipsCm || null;
      body.inseamCm = editData.inseamCm || null;
      body.shoeSize = editData.shoeSize || null;

      const res = await fetch(`/api/models/${editModelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to save");
      }
      setEditSuccess("Profile updated successfully!");
      fetchData();
      setTimeout(() => closeEditModal(), 1500);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setEditSaving(false);
    }
  };

  const updateEditField = (field: string, value: any) => {
    setEditData((prev: any) => ({ ...prev, [field]: value }));
  };

  const CATEGORIES_LIST = [
    "Runway", "Commercial", "Editorial", "Fashion", "Fit",
    "Parts", "Plus Size", "Petite", "Mature", "Child",
    "Swimwear", "Lingerie", "Fitness", "Tattoo", "Alternative",
    "Promotional", "Character", "Hand", "Foot", "Art",
  ];

  const SKILLS_LIST = [
    "Acting", "Dancing", "Singing", "Gymnastics", "Martial Arts",
    "Horseback Riding", "Skiing", "Snowboarding", "Surfing", "Swimming",
    "Yoga", "Pilates", "Acro", "Stage Combat", "Improv",
    "Voice Over", "Hosting", "Public Speaking", "Sign Language",
  ];

  // Profile completion estimate
  const hasLogo = !!agency?.logoUrl;
  const profileComplete = agency?.name && agency?.location ? (hasLogo ? 90 : 70) : 40;

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
              logoUrl={agency?.logoUrl}
            />

            <div className="flex-1 w-full space-y-8">

              {/* Verification Status Banner */}
              <div className={`rounded-2xl border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${badge.color}`}>
                <div className="flex items-start gap-3">
                  <BadgeIcon className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest">{badge.label}</p>
                    <p className="text-[10px] mt-0.5 opacity-80 leading-relaxed">{badge.description}</p>
                    {verificationStatus === "PENDING_REVIEW" && (
                      <ul className="mt-2 space-y-1">
                        <li className="text-[10px] flex items-center gap-1.5">
                          <Lock className="h-3 w-3" /> Cannot publish model profiles publicly
                        </li>
                        <li className="text-[10px] flex items-center gap-1.5">
                          <Lock className="h-3 w-3" /> Cannot submit models to casting opportunities
                        </li>
                        <li className="text-[10px] flex items-center gap-1.5 text-emerald-600">
                          <CheckCircle className="h-3 w-3" /> Can create draft model profiles
                        </li>
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              {loading ? (
                <div className="flex items-center gap-2 text-xs text-[#6B6257]">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading dashboard data...
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatCard title="Active Profiles" value={publishedModels.length} change="PUBLISHED" icon={Users} />
                    <StatCard title="Draft Profiles" value={draftModels.length} change="DRAFT" icon={FileText} />
                    <StatCard title="Posted Castings" value={castings.length} change="ACTIVE" icon={BookOpen} />
                    <StatCard title="Applications" value={castings.reduce((a, c) => a + (c._count?.applications ?? 0), 0)} change="RECEIVED" icon={Eye} />
                    <StatCard title="Account Status" value={badge.label === "Agency Profile Under Review" ? "Pending Review" : badge.label} change="CURRENT" icon={ShieldCheck} />
                  </div>

                  {/* Profile Completion Bar */}
                  <div className="rounded-2xl border border-[#E7DED1] bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B6257]">
                        Agency Profile {profileComplete}% Complete
                      </span>
                      <span className="text-[10px] text-[#C8A96A] font-bold">
                        {profileComplete < 100 ? "Complete your profile" : "Complete"}
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#E7DED1] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#C8A96A] rounded-full transition-all duration-500"
                        style={{ width: `${profileComplete}%` }}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Represented Models Section */}
              <div className="rounded-2xl border border-[#E7DED1] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#E7DED1]/70 pb-3 mb-4">
                  <h3 className="font-serif text-lg font-bold uppercase tracking-widest text-[#1D1A16]">
                    Represented Models
                  </h3>
                  <button
                    onClick={() => setShowWizard(true)}
                    className="flex items-center gap-1.5 rounded-full bg-[#1D1A16] px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] transition-colors"
                  >
                    <UserPlus className="h-3 w-3" />
                    <span>Add Represented Model</span>
                  </button>
                </div>

                {dbModels.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#E7DED1] text-[9px] uppercase font-bold tracking-widest text-[#6B6257]">
                          <th className="pb-3 pr-4">Model</th>
                          <th className="pb-3 pr-4">Categories</th>
                          <th className="pb-3 pr-4">Status</th>
                          <th className="pb-3 pr-4">Availability</th>
                          <th className="pb-3 pr-4">Height</th>
                          <th className="pb-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E7DED1]/50 text-xs">
                        {dbModels.map((m) => {
                          const displayName = m.professionalName || m.user.name;
                          const statusColor = m.profileStatus === "PUBLISHED" ? "text-emerald-600 bg-emerald-50" :
                            m.profileStatus === "DRAFT" ? "text-amber-600 bg-amber-50" :
                            m.profileStatus === "ARCHIVED" ? "text-gray-400 bg-gray-50" :
                            "text-gray-500 bg-gray-50";
                          const availColor = m.isAvailable ? "text-emerald-600" : "text-red-500";
                          const isArchived = m.profileStatus === "ARCHIVED";
                          const isHidden = m.profileStatus === "HIDDEN";
                          return (
                            <tr key={m.id} className={isArchived ? "opacity-60" : ""}>
                              <td className="py-3.5 pr-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full overflow-hidden bg-[#E7DED1] shrink-0">
                                    {m.profileImageUrl ? (
                                      <img src={m.profileImageUrl} alt={displayName} className="object-cover h-full w-full" />
                                    ) : (
                                      <div className="h-full w-full flex items-center justify-center text-[10px] font-bold text-[#6B6257]">
                                        {displayName.charAt(0)}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <span className="font-bold text-[#1D1A16] uppercase block">{displayName}</span>
                                    <span className="text-[9px] text-[#6B6257]">{m.user.email}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 pr-4 text-[#6B6257]">
                                <span className="bg-[#F8F5EF] px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">{m.category}</span>
                              </td>
                              <td className="py-3.5 pr-4">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusColor}`}>
                                  {m.profileStatus}
                                </span>
                              </td>
                              <td className={`py-3.5 pr-4 font-bold ${availColor}`}>
                                {m.isAvailable ? "Available" : "Booked"}
                              </td>
                              <td className="py-3.5 pr-4 text-[#6B6257]">{m.height} cm</td>
                              <td className="py-3.5 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => copyProfileLink(m.id)}
                                    className="rounded-lg p-1.5 hover:bg-[#F8F5EF] text-[#6B6257] hover:text-[#C8A96A] transition-colors"
                                    title="Copy profile link"
                                  >
                                    {copiedId === m.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                  </button>
                                  <button
                                    onClick={() => openEditModal(m.id)}
                                    className="rounded-lg p-1.5 hover:bg-[#F8F5EF] text-[#6B6257] hover:text-[#C8A96A] transition-colors"
                                    title="Edit profile"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                  <Link
                                    href={`/models/${m.id}`}
                                    className="rounded-lg p-1.5 hover:bg-[#F8F5EF] text-[#6B6257] hover:text-[#C8A96A] transition-colors"
                                    title="View public profile"
                                  >
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                  </Link>
                                  {/* Toggle hide/show for published/draft profiles */}
                                  {!isArchived && m.profileStatus !== "HIDDEN" && (
                                    <button
                                      onClick={async () => {
                                        try {
                                          const res = await fetch(`/api/models/${m.id}`, {
                                            method: "PATCH",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ profileStatus: "HIDDEN" }),
                                          });
                                          if (res.ok) { fetchData(); showToast("Profile hidden from public view"); }
                                        } catch { showToast("Failed to hide profile"); }
                                      }}
                                      className="rounded-lg p-1.5 hover:bg-[#F8F5EF] text-[#6B6257] hover:text-amber-600 transition-colors"
                                      title="Hide from public"
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                  {m.profileStatus === "HIDDEN" && (
                                    <button
                                      onClick={async () => {
                                        try {
                                          const res = await fetch(`/api/models/${m.id}`, {
                                            method: "PATCH",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ profileStatus: "DRAFT" }),
                                          });
                                          if (res.ok) { fetchData(); showToast("Profile restored to draft"); }
                                        } catch { showToast("Failed to restore profile"); }
                                      }}
                                      className="rounded-lg p-1.5 hover:bg-[#F8F5EF] text-[#6B6257] hover:text-emerald-600 transition-colors"
                                      title="Restore visibility"
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                  {isArchived ? (
                                    <button
                                      onClick={() => handleUnarchive(m.id)}
                                      className="rounded-lg p-1.5 hover:bg-[#F8F5EF] text-[#6B6257] hover:text-emerald-600 transition-colors"
                                      title="Restore from archive"
                                    >
                                      <ArchiveRestore className="h-3.5 w-3.5" />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => setArchiveConfirm(m.id)}
                                      className="rounded-lg p-1.5 hover:bg-[#F8F5EF] text-[#6B6257] hover:text-rose-600 transition-colors"
                                      title="Archive profile"
                                    >
                                      <Archive className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <EmptyState
                      title="No Represented Models Yet"
                      description="Create your first agency-managed model portfolio using the form."
                    />
                    <div className="flex justify-center">
                      <button
                        onClick={() => setShowWizard(true)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#1D1A16] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] transition-colors"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        Create Model Profile
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Posted Castings */}
              {castings.length > 0 && (
                <div className="rounded-2xl border border-[#E7DED1] bg-white p-6 shadow-sm space-y-4">
                  <h3 className="font-serif text-lg font-bold uppercase tracking-widest text-[#1D1A16] border-b border-[#E7DED1]/70 pb-3">
                    Recent Casting Opportunities
                  </h3>
                  <div className="space-y-3">
                    {castings.slice(0, 5).map((c) => (
                      <div key={c.id} className="flex items-center justify-between rounded-xl border border-[#E7DED1] p-4 text-xs">
                        <div>
                          <p className="font-bold text-[#1D1A16] uppercase">{c.title}</p>
                          <p className="text-[#6B6257] mt-0.5">{c.location} · ${c.budget.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-[#C8A96A] bg-[#C8A96A]/10 px-3 py-1 rounded-full">
                            {c._count.applications} Applications
                          </span>
                          {isVerifiedOrActive && (
                            <Link
                              href={`/castings/${c.id}/submit`}
                              className="text-[10px] font-bold uppercase tracking-widest text-[#1D1A16] hover:text-[#C8A96A] transition-colors"
                            >
                              Submit Models
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inquiries Section */}
              {inquiries.length > 0 && (
                <div className="rounded-2xl border border-[#E7DED1] bg-white p-6 shadow-sm" id="inquiries">
                  <h3 className="font-serif text-lg font-bold uppercase tracking-widest text-[#1D1A16] border-b border-[#E7DED1]/70 pb-3 mb-4">
                    Booking Inquiries ({inquiries.length})
                  </h3>
                  <div className="space-y-4">
                    {inquiries.map((inq) => (
                      <div key={inq.id} className="rounded-xl border border-[#E7DED1] p-4 text-xs space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full overflow-hidden bg-[#E7DED1] shrink-0">
                              {inq.model.profileImageUrl ? (
                                <img src={inq.model.profileImageUrl} alt={inq.model.professionalName || ""} className="object-cover h-full w-full" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-[10px] font-bold text-[#6B6257]">
                                  {(inq.model.professionalName || "M").charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-[#1D1A16]">{inq.model.professionalName || "Model"}</p>
                              <span className="text-[9px] text-[#6B6257] bg-[#F8F5EF] px-2 py-0.5 rounded-full uppercase tracking-wider">
                                {inq.model.category}
                              </span>
                            </div>
                          </div>
                          <span className="text-[9px] text-[#6B6257] shrink-0">
                            {new Date(inq.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 bg-[#F8F5EF] rounded-lg p-3">
                          <div>
                            <span className="text-[8px] uppercase font-bold tracking-wider text-[#6B6257] block">From</span>
                            <span className="text-xs font-medium text-[#1D1A16]">{inq.senderName}</span>
                            <span className="text-[9px] text-[#6B6257] block">{inq.senderEmail}</span>
                            {inq.senderPhone && <span className="text-[9px] text-[#6B6257] block">{inq.senderPhone}</span>}
                          </div>
                          <div>
                            <span className="text-[8px] uppercase font-bold tracking-wider text-[#6B6257] block">Preferred Date</span>
                            <span className="text-xs font-medium text-[#1D1A16]">{new Date(inq.preferredDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-[8px] uppercase font-bold tracking-wider text-[#6B6257] block mb-1">Requirements</span>
                          <p className="text-xs text-[#6B6257] leading-relaxed">{inq.notes}</p>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <span className={`inline-block h-1.5 w-1.5 rounded-full ${inq.isRead ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          <span className="text-[9px] text-[#6B6257]">{inq.isRead ? "Read" : "New"}</span>
                          <Link
                            href={`/models/${inq.model.id}`}
                            className="ml-auto text-[9px] font-bold uppercase tracking-widest text-[#C8A96A] hover:text-[#1D1A16] transition-colors flex items-center gap-1"
                          >
                            View Profile <ArrowUpRight className="h-3 w-3" />
                          </Link>
                        </div>
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

      {/* Model Creation Wizard */}
      <ModelCreateWizard
        isOpen={showWizard}
        onClose={() => { setShowWizard(false); }}
        onSuccess={() => { fetchData(); showToast("Model profile created successfully!"); }}
        verificationStatus={verificationStatus}
      />

      {/* Edit Model Modal */}
      {editModelId && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-12 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-[#E7DED1] p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-[#E7DED1]/70 pb-3 mb-4">
              <h3 className="font-serif text-lg font-bold uppercase text-[#1D1A16]">
                {editLoading ? "Loading..." : `Edit Model Profile`}
              </h3>
              <button onClick={closeEditModal} className="text-[#6B6257] hover:text-[#1D1A16]">
                <X className="h-5 w-5" />
              </button>
            </div>

            {editLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-[#C8A96A]" />
              </div>
            ) : editData ? (
              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                {editError && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-600 flex items-start gap-2">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    {editError}
                  </div>
                )}
                {editSuccess && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-600 flex items-start gap-2">
                    <CheckCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    {editSuccess}
                  </div>
                )}

                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] block">Professional Name</label>
                    <input type="text" value={editData.professionalName} onChange={(e) => updateEditField("professionalName", e.target.value)}
                      className="w-full rounded-xl border border-[#E7DED1] bg-white p-2.5 text-xs focus:outline-none focus:border-[#C8A96A]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] block">Nationality</label>
                    <input type="text" value={editData.nationality} onChange={(e) => updateEditField("nationality", e.target.value)}
                      className="w-full rounded-xl border border-[#E7DED1] bg-white p-2.5 text-xs focus:outline-none focus:border-[#C8A96A]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] block">Bio</label>
                  <textarea rows={3} value={editData.bio} onChange={(e) => updateEditField("bio", e.target.value)}
                    className="w-full rounded-xl border border-[#E7DED1] bg-white p-2.5 text-xs focus:outline-none focus:border-[#C8A96A] resize-none" />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] block">Location</label>
                  <input type="text" value={editData.location} onChange={(e) => updateEditField("location", e.target.value)}
                    placeholder="Kigali, Rwanda" className="w-full rounded-xl border border-[#E7DED1] bg-white p-2.5 text-xs focus:outline-none focus:border-[#C8A96A]" />
                </div>

                {/* Categories */}
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] block">Categories</label>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES_LIST.map((cat) => {
                      const selected = editData.categories?.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            const current = editData.categories || [];
                            updateEditField("categories",
                              selected ? current.filter((c: string) => c !== cat) : [...current, cat]
                            );
                          }}
                          className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border transition-colors ${
                            selected
                              ? "bg-[#1D1A16] text-white border-[#1D1A16]"
                              : "bg-white text-[#6B6257] border-[#E7DED1] hover:border-[#C8A96A]"
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] block">Skills</label>
                  <div className="flex flex-wrap gap-1.5">
                    {SKILLS_LIST.map((skill) => {
                      const selected = editData.skills?.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => {
                            const current = editData.skills || [];
                            updateEditField("skills",
                              selected ? current.filter((s: string) => s !== skill) : [...current, skill]
                            );
                          }}
                          className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border transition-colors ${
                            selected
                              ? "bg-[#C8A96A] text-white border-[#C8A96A]"
                              : "bg-white text-[#6B6257] border-[#E7DED1] hover:border-[#C8A96A]"
                          }`}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Languages */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] block">Languages (comma-separated)</label>
                  <input type="text" value={editData.languages?.join(", ") || ""} onChange={(e) => updateEditField("languages", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))}
                    placeholder="English, French, Kinyarwanda" className="w-full rounded-xl border border-[#E7DED1] bg-white p-2.5 text-xs focus:outline-none focus:border-[#C8A96A]" />
                </div>

                {/* Availability & Experience */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-[#F8F5EF] rounded-xl">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257]">Available for Booking</label>
                    <button
                      onClick={() => updateEditField("isAvailable", !editData.isAvailable)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${editData.isAvailable ? "bg-emerald-500" : "bg-[#E7DED1]"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${editData.isAvailable ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] block">Experience Level</label>
                    <select value={editData.experienceLevel} onChange={(e) => updateEditField("experienceLevel", e.target.value)}
                      className="w-full rounded-xl border border-[#E7DED1] bg-white p-2.5 text-xs focus:outline-none focus:border-[#C8A96A]">
                      <option value="">Select...</option>
                      <option value="Newcomer">Newcomer</option>
                      <option value="Emerging">Emerging</option>
                      <option value="Experienced">Experienced</option>
                      <option value="Professional">Professional</option>
                      <option value="Top">Top</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] block">Notable Credits</label>
                  <input type="text" value={editData.notableCredits} onChange={(e) => updateEditField("notableCredits", e.target.value)}
                    placeholder="e.g. Vogue Italia, Paris Fashion Week" className="w-full rounded-xl border border-[#E7DED1] bg-white p-2.5 text-xs focus:outline-none focus:border-[#C8A96A]" />
                </div>

                {/* Travel & Representation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] block">Travel Availability</label>
                    <select value={editData.travelAvailability} onChange={(e) => updateEditField("travelAvailability", e.target.value)}
                      className="w-full rounded-xl border border-[#E7DED1] bg-white p-2.5 text-xs focus:outline-none focus:border-[#C8A96A]">
                      <option value="">Select...</option>
                      <option value="Local only">Local only</option>
                      <option value="Regional">Regional</option>
                      <option value="International">International</option>
                      <option value="Worldwide">Worldwide</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] block">Representation Status</label>
                    <select value={editData.representationStatus} onChange={(e) => updateEditField("representationStatus", e.target.value)}
                      className="w-full rounded-xl border border-[#E7DED1] bg-white p-2.5 text-xs focus:outline-none focus:border-[#C8A96A]">
                      <option value="">Select...</option>
                      <option value="Exclusive">Exclusive</option>
                      <option value="Non-exclusive">Non-exclusive</option>
                      <option value="Mother agency">Mother Agency</option>
                      <option value="Direct">Direct</option>
                    </select>
                  </div>
                </div>

                {/* Measurements Toggle */}
                <button
                  type="button"
                  onClick={() => setShowMeasurements(!showMeasurements)}
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#C8A96A] hover:text-[#1D1A16] transition-colors"
                >
                  {showMeasurements ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  {showMeasurements ? "Hide" : "Show"} Measurements
                </button>

                {showMeasurements && (
                  <div className="space-y-4 p-4 bg-[#F8F5EF] rounded-xl border border-[#E7DED1]">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold uppercase tracking-widest text-[#6B6257] block">Height (cm)</label>
                        <input type="number" value={editData.height || ""} onChange={(e) => updateEditField("height", parseFloat(e.target.value) || 0)}
                          className="w-full rounded-xl border border-[#E7DED1] bg-white p-2 text-xs focus:outline-none focus:border-[#C8A96A]" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold uppercase tracking-widest text-[#6B6257] block">Bust (cm)</label>
                        <input type="number" value={editData.bustCm || ""} onChange={(e) => updateEditField("bustCm", parseFloat(e.target.value) || null)}
                          className="w-full rounded-xl border border-[#E7DED1] bg-white p-2 text-xs focus:outline-none focus:border-[#C8A96A]" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold uppercase tracking-widest text-[#6B6257] block">Chest (cm)</label>
                        <input type="number" value={editData.chestCm || ""} onChange={(e) => updateEditField("chestCm", parseFloat(e.target.value) || null)}
                          className="w-full rounded-xl border border-[#E7DED1] bg-white p-2 text-xs focus:outline-none focus:border-[#C8A96A]" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold uppercase tracking-widest text-[#6B6257] block">Waist (cm)</label>
                        <input type="number" value={editData.waistCm || ""} onChange={(e) => updateEditField("waistCm", parseFloat(e.target.value) || null)}
                          className="w-full rounded-xl border border-[#E7DED1] bg-white p-2 text-xs focus:outline-none focus:border-[#C8A96A]" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold uppercase tracking-widest text-[#6B6257] block">Hips (cm)</label>
                        <input type="number" value={editData.hipsCm || ""} onChange={(e) => updateEditField("hipsCm", parseFloat(e.target.value) || null)}
                          className="w-full rounded-xl border border-[#E7DED1] bg-white p-2 text-xs focus:outline-none focus:border-[#C8A96A]" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold uppercase tracking-widest text-[#6B6257] block">Inseam (cm)</label>
                        <input type="number" value={editData.inseamCm || ""} onChange={(e) => updateEditField("inseamCm", parseFloat(e.target.value) || null)}
                          className="w-full rounded-xl border border-[#E7DED1] bg-white p-2 text-xs focus:outline-none focus:border-[#C8A96A]" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold uppercase tracking-widest text-[#6B6257] block">Shoe Size</label>
                        <input type="number" value={editData.shoeSize || ""} onChange={(e) => updateEditField("shoeSize", parseFloat(e.target.value) || null)}
                          className="w-full rounded-xl border border-[#E7DED1] bg-white p-2 text-xs focus:outline-none focus:border-[#C8A96A]" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold uppercase tracking-widest text-[#6B6257] block">Shoe System</label>
                        <select value={editData.shoeSizeSystem} onChange={(e) => updateEditField("shoeSizeSystem", e.target.value)}
                          className="w-full rounded-xl border border-[#E7DED1] bg-white p-2 text-xs focus:outline-none focus:border-[#C8A96A]">
                          <option value="">Select...</option>
                          <option value="US">US</option>
                          <option value="EU">EU</option>
                          <option value="UK">UK</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold uppercase tracking-widest text-[#6B6257] block">Dress Size</label>
                        <input type="text" value={editData.dressSize} onChange={(e) => updateEditField("dressSize", e.target.value)}
                          className="w-full rounded-xl border border-[#E7DED1] bg-white p-2 text-xs focus:outline-none focus:border-[#C8A96A]" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold uppercase tracking-widest text-[#6B6257] block">Hair Color</label>
                        <input type="text" value={editData.hairColor} onChange={(e) => updateEditField("hairColor", e.target.value)}
                          className="w-full rounded-xl border border-[#E7DED1] bg-white p-2 text-xs focus:outline-none focus:border-[#C8A96A]" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold uppercase tracking-widest text-[#6B6257] block">Eye Color</label>
                        <input type="text" value={editData.eyeColor} onChange={(e) => updateEditField("eyeColor", e.target.value)}
                          className="w-full rounded-xl border border-[#E7DED1] bg-white p-2 text-xs focus:outline-none focus:border-[#C8A96A]" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t border-[#E7DED1]/70">
                  <button onClick={closeEditModal}
                    className="rounded-full border border-[#E7DED1] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#6B6257] hover:bg-[#F8F5EF]">
                    Cancel
                  </button>
                  <button onClick={handleEditSave} disabled={editSaving}
                    className="rounded-full bg-[#1D1A16] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] disabled:opacity-60 flex items-center gap-1.5">
                    {editSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <Save className="h-3.5 w-3.5" />
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[#6B6257]">Failed to load model data.</div>
            )}
          </div>
        </div>
      )}

      {/* Archive Confirmation Dialog */}
      {archiveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-[#E7DED1] p-6 shadow-2xl space-y-4">
            <h3 className="font-serif text-base font-bold uppercase text-[#1D1A16]">Archive Model Profile?</h3>
            <p className="text-xs text-[#6B6257] leading-relaxed">
              This profile will be hidden from public view. You can restore it anytime.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setArchiveConfirm(null)}
                className="rounded-full border border-[#E7DED1] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#6B6257] hover:bg-[#F8F5EF] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleArchive(archiveConfirm)}
                disabled={archiveLoading === archiveConfirm}
                className="rounded-full bg-rose-600 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                {archiveLoading === archiveConfirm && <Loader2 className="h-3 w-3 animate-spin" />}
                Archive
              </button>
            </div>
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

export default function AgencyDashboard() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[#F8F5EF]"><Loader2 className="h-8 w-8 animate-spin text-[#C8A96A]" /></div>}>
      <AgencyDashboardInner />
    </Suspense>
  );
}
