"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, User, Briefcase, Building, Store, Loader2 } from "lucide-react";

const roles = [
  {
    key: "MODEL",
    label: "Model",
    icon: User,
    description: "Upload editorial books, apply to castings, get discovered by top agencies.",
    redirect: "/dashboard/model",
  },
  {
    key: "AGENCY",
    label: "Agency",
    icon: Building,
    description: "Publish model rosters, post casting briefs, manage talent, monitor analytics.",
    redirect: "/dashboard/agency",
  },
  {
    key: "CLIENT",
    label: "Client / Brand",
    icon: Briefcase,
    description: "Browse elite catalogs, post casting calls, request bookings.",
    redirect: "/dashboard/client",
  },
  {
    key: "MARKETPLACE_PROVIDER",
    label: "Creative Provider",
    icon: Store,
    description: "List photographer, makeup, styling, studio, or coaching services.",
    redirect: "/marketplace",
  },
];

export default function RoleSelectionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRoleSelect = async (role: string, redirect: string) => {
    setLoading(role);
    setError(null);
    try {
      // First sync user to DB
      await fetch("/api/user/sync", { method: "POST" });
      // Then save selected role
      const res = await fetch("/api/user/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save role");
      }
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(null);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F8F5EF] p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-3xl bg-white border border-[#E7DED1] rounded-3xl p-8 sm:p-12 shadow-sm space-y-8">
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-serif text-xl font-bold tracking-wider uppercase text-[#1D1A16]"
          >
            <Sparkles className="h-5 w-5 text-[#C8A96A]" />
            <span>ModelConnect</span>
            <span className="text-[#C8A96A]">.Africa</span>
          </Link>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold uppercase text-[#1D1A16] mt-4">
            Select Your Role
          </h2>
          <p className="text-[10px] text-[#6B6257] uppercase tracking-widest">
            How will you participate in the fashion network?
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-600 text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {roles.map(({ key, label, icon: Icon, description, redirect }) => (
            <button
              key={key}
              onClick={() => handleRoleSelect(key, redirect)}
              disabled={!!loading}
              className="group border border-[#E7DED1] bg-[#F8F5EF]/20 hover:bg-white hover:shadow-xl hover:border-transparent rounded-2xl p-6 text-center space-y-4 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div className="mx-auto rounded-full bg-[#1D1A16] p-4 text-[#C8A96A] group-hover:bg-[#C8A96A] group-hover:text-[#1D1A16] transition-colors w-fit">
                {loading === key ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Icon className="h-6 w-6" />
                )}
              </div>
              <h3 className="font-serif text-sm font-bold uppercase text-[#1D1A16]">
                {label}
              </h3>
              <p className="text-[10px] text-[#6B6257] leading-relaxed uppercase tracking-wider">
                {description}
              </p>
              {key === "AGENCY" && (
                <span className="inline-block text-[9px] font-bold uppercase tracking-widest bg-[#C8A96A]/10 text-[#C8A96A] px-3 py-1 rounded-full">
                  Pilot Access Required
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
