"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import SectionHeader from "@/components/section-header";
import EmptyState from "@/components/empty-state";
import { mockCastings } from "@/lib/mock-data";
import { CheckCircle, MapPin, DollarSign, Calendar, Loader2, AlertCircle, X } from "lucide-react";
import Link from "next/link";

interface DBCasting {
  id: string;
  title: string;
  description: string;
  category: string;
  requirements: string;
  location: string;
  date: string;
  budget: number;
  isActive: boolean;
  agency?: { name: string; logoUrl: string | null } | null;
  _count: { applications: number };
}

const LOCATIONS = ["All", "Kigali", "Nairobi", "Lagos", "Accra", "Johannesburg"];

export default function CastingsPage() {
  const [dbCastings, setDbCastings] = useState<DBCasting[]>([]);
  const [loadingCastings, setLoadingCastings] = useState(true);

  // Apply modal state
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [coverNote, setCoverNote]     = useState("");
  const [applying, setApplying]       = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError]   = useState<string | null>(null);
  const [appliedIds, setAppliedIds]   = useState<Set<string>>(new Set());

  const [filterLocation, setFilterLocation] = useState("All");

  useEffect(() => {
    const fetchCastings = async () => {
      try {
        const res = await fetch("/api/castings?limit=30");
        if (res.ok) {
          const d = await res.json();
          setDbCastings(d.castings ?? []);
        }
      } catch { /* use mock fallback */ } finally {
        setLoadingCastings(false);
      }
    };
    void fetchCastings();
  }, []);

  // Merge DB + mock, deduplicate by id
  const allCastings: DBCasting[] = dbCastings.length > 0
    ? dbCastings
    : mockCastings.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        category: "General",
        requirements: m.requirements,
        location: m.location,
        date: m.date,
        budget: Number(m.budget),
        isActive: true,
        agency: null,
        _count: { applications: 0 },
      }));

  const filtered = allCastings.filter(
    (c) => filterLocation === "All" || c.location.toLowerCase().includes(filterLocation.toLowerCase())
  );

  const activeCasting = allCastings.find((c) => c.id === selectedId);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    setApplying(true); setApplyError(null);
    try {
      const res = await fetch(`/api/castings/${selectedId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to apply");
      setApplySuccess(true);
      setAppliedIds((prev) => new Set([...prev, selectedId]));
      setTimeout(() => { setApplySuccess(false); setSelectedId(null); setCoverNote(""); }, 2500);
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : "Failed to apply");
    } finally { setApplying(false); }
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#F8F5EF] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 border-b border-[#E7DED1]/70 pb-8">
            <SectionHeader title="Casting Briefs" subtitle="Elite Global Runway Openings" />
            <div className="flex gap-3 items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B6257]">Location:</span>
              <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)}
                className="rounded-xl border border-[#E7DED1] bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-[#6B6257] focus:outline-none">
                {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {loadingCastings ? (
            <div className="flex items-center gap-2 text-xs text-[#6B6257] py-12">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading castings...
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState title="No castings available" description="No casting briefs posted yet. Check back soon." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((c) => {
                const alreadyApplied = appliedIds.has(c.id);
                return (
                  <div key={c.id} className="group rounded-2xl border border-[#E7DED1] bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-[#C8A96A]/10 px-3 py-1 text-xs font-bold text-[#C8A96A] uppercase tracking-wider">
                          <DollarSign className="h-3 w-3" />{c.budget.toLocaleString()} USD
                        </span>
                        <span className="text-[10px] font-semibold text-[#6B6257] uppercase tracking-widest flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-[#C8A96A]" />{c.location}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <Link href={`/castings/${c.id}`}>
                          <h3 className="font-serif text-lg font-bold text-[#1D1A16] leading-snug group-hover:text-[#C8A96A] transition-colors cursor-pointer">
                            {c.title}
                          </h3>
                        </Link>
                        <p className="text-xs text-[#6B6257] leading-relaxed line-clamp-3">{c.description}</p>
                      </div>
                      <div className="rounded-xl bg-[#F8F5EF] p-3 text-[11px] text-[#6B6257] leading-relaxed">
                        <strong className="text-[#1D1A16] uppercase font-bold tracking-wider block mb-1">Requirements:</strong>
                        {c.requirements}
                      </div>
                      {c.agency && (
                        <p className="text-[10px] text-[#C8A96A] font-bold uppercase tracking-widest">{c.agency.name}</p>
                      )}
                    </div>
                    <div className="border-t border-[#E7DED1]/60 pt-4 mt-6 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#C8A96A]" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B6257]">
                          {new Date(c.date).toLocaleDateString()}
                        </span>
                      </div>
                      <button
                        onClick={() => { setSelectedId(c.id); setApplyError(null); setApplySuccess(false); }}
                        disabled={alreadyApplied}
                        className={`rounded-full px-5 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${alreadyApplied ? "bg-[#E7DED1] text-[#6B6257] cursor-not-allowed" : "bg-[#1D1A16] text-white hover:bg-[#C8A96A]"}`}>
                        {alreadyApplied ? "Applied" : "Apply Now"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Apply Modal */}
      {selectedId && activeCasting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#F8F5EF] rounded-2xl border border-[#E7DED1] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E7DED1]/70 pb-3 mb-4">
              <h3 className="font-serif text-xl font-bold text-[#1D1A16] uppercase">Apply to Casting</h3>
              <button onClick={() => setSelectedId(null)} className="text-[#6B6257] hover:text-[#1D1A16]">
                <X className="h-5 w-5" />
              </button>
            </div>

            {applySuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="mx-auto rounded-full bg-emerald-100 p-3 text-emerald-600 w-fit">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h4 className="font-serif text-base font-bold uppercase text-[#1D1A16]">Application Submitted!</h4>
                <p className="text-xs text-[#6B6257] uppercase tracking-wider">Your portfolio has been submitted for review.</p>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257]">Casting</span>
                  <p className="text-xs font-bold text-[#1D1A16] uppercase">{activeCasting.title}</p>
                  <p className="text-[10px] text-[#6B6257]">{activeCasting.location} · ${activeCasting.budget.toLocaleString()}</p>
                </div>

                {applyError && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-red-600 text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" /> {applyError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] block">Cover Note</label>
                  <textarea rows={4} value={coverNote} onChange={(e) => setCoverNote(e.target.value)}
                    placeholder="Tell the casting director about your experience and why you fit this casting..."
                    className="w-full rounded-xl border border-[#E7DED1] bg-white p-3 text-xs focus:outline-none resize-none" />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={() => setSelectedId(null)}
                    className="rounded-full border border-[#E7DED1] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#6B6257] hover:bg-white">
                    Cancel
                  </button>
                  <button type="submit" disabled={applying}
                    className="rounded-full bg-[#1D1A16] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] disabled:opacity-60 flex items-center gap-1.5">
                    {applying && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Submit Application
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
