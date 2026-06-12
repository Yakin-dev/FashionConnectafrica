"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import EmptyState from "@/components/empty-state";
import { motion, type Variants } from "framer-motion";
import { CheckCircle, MapPin, DollarSign, Calendar, Loader2, AlertCircle, X, Sparkles } from "lucide-react";
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

const CATEGORIES = ["All", "Runway", "Editorial", "Commercial", "Fitness", "Beauty"];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function CastingsPage() {
  const [dbCastings, setDbCastings] = useState<DBCasting[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState("All");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [coverNote, setCoverNote] = useState("");
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchCastings = async () => {
      try {
        const res = await fetch("/api/castings?limit=30");
        if (res.ok) {
          const d = await res.json();
          setDbCastings(d.castings ?? []);
        }
      } catch { /* silent */ } finally {
        setLoading(false);
      }
    };
    void fetchCastings();
  }, []);

  const filtered = dbCastings.filter(
    (c) => filterCat === "All" || c.category?.toLowerCase() === filterCat.toLowerCase()
  );

  const activeCasting = dbCastings.find((c) => c.id === selectedId);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    setApplying(true);
    setApplyError(null);
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
    } finally {
      setApplying(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#F8F5EF]">

        {/* Page header */}
        <div className="bg-[#1D1A16] py-14 sm:py-20 text-white text-center">
          <div className="mx-auto max-w-3xl px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-3"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C8A96A]/10 border border-[#C8A96A]/30 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#C8A96A]">
                <Sparkles className="h-3.5 w-3.5" /> Kigali Opportunities
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold uppercase">Casting Briefs</h1>
              <p className="text-base text-white/60">Open casting opportunities in Kigali, Rwanda.</p>
            </motion.div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-10">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all ${
                  filterCat === cat
                    ? "bg-[#1D1A16] text-white shadow-sm"
                    : "bg-white border border-[#E7DED1] text-[#6B6257] hover:border-[#1D1A16] hover:text-[#1D1A16]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-24 text-[#6B6257]">
              <Loader2 className="h-5 w-5 animate-spin text-[#C8A96A]" />
              <span className="text-sm">Loading castings...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16">
              <EmptyState
                title="No castings yet"
                description="No casting briefs have been posted yet. Agencies can post castings from their dashboard."
              />
              <div className="text-center mt-6">
                <Link
                  href="/signup"
                  className="inline-flex rounded-full bg-[#1D1A16] px-7 py-3 text-sm font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] hover:text-[#11100E] transition-colors"
                >
                  Join as Agency
                </Link>
              </div>
            </div>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filtered.map((c) => {
                const alreadyApplied = appliedIds.has(c.id);
                return (
                  <motion.div
                    key={c.id}
                    variants={fadeUp}
                    className="group rounded-2xl border border-[#E7DED1] bg-white p-6 shadow-sm hover:shadow-xl hover:border-[#C8A96A]/30 transition-all duration-400 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#C8A96A]/10 px-3 py-1 text-xs font-bold text-[#C8A96A] uppercase tracking-wider">
                          <DollarSign className="h-3 w-3" />{c.budget.toLocaleString()} RWF
                        </span>
                        <span className="flex items-center gap-1 text-xs text-[#6B6257]">
                          <MapPin className="h-3.5 w-3.5 text-[#C8A96A] shrink-0" />
                          {c.location}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <Link href={`/castings/${c.id}`}>
                          <h3 className="font-serif text-lg font-bold text-[#1D1A16] leading-snug group-hover:text-[#C8A96A] transition-colors cursor-pointer">
                            {c.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-[#6B6257] leading-relaxed line-clamp-3">{c.description}</p>
                      </div>

                      {c.requirements && (
                        <div className="rounded-xl bg-[#F8F5EF] p-3.5">
                          <p className="text-xs font-bold uppercase tracking-wider text-[#1D1A16] mb-1">Requirements</p>
                          <p className="text-xs text-[#6B6257] leading-relaxed">{c.requirements}</p>
                        </div>
                      )}

                      {c.agency && (
                        <p className="text-xs text-[#C8A96A] font-bold uppercase tracking-widest">{c.agency.name}</p>
                      )}
                    </div>

                    <div className="border-t border-[#E7DED1]/60 pt-4 mt-5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-[#C8A96A]" />
                        <span className="text-xs text-[#6B6257]">
                          {new Date(c.date).toLocaleDateString("en-RW", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <button
                        onClick={() => { setSelectedId(c.id); setApplyError(null); setApplySuccess(false); }}
                        disabled={alreadyApplied}
                        className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                          alreadyApplied
                            ? "bg-[#E7DED1] text-[#6B6257] cursor-not-allowed"
                            : "bg-[#1D1A16] text-white hover:bg-[#C8A96A] hover:text-[#11100E]"
                        }`}
                      >
                        {alreadyApplied ? "Applied ✓" : "Apply Now"}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </main>

      {/* Apply Modal */}
      {selectedId && activeCasting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="w-full max-w-md bg-white rounded-2xl border border-[#E7DED1] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#E7DED1]/70 pb-4 mb-5">
              <h3 className="font-serif text-xl font-bold text-[#1D1A16] uppercase">Apply to Casting</h3>
              <button onClick={() => setSelectedId(null)} className="rounded-xl p-1.5 hover:bg-[#F8F5EF] text-[#6B6257] hover:text-[#1D1A16] transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {applySuccess ? (
              <div className="py-10 text-center space-y-4">
                <div className="mx-auto rounded-full bg-emerald-100 p-4 text-emerald-600 w-fit">
                  <CheckCircle className="h-9 w-9" />
                </div>
                <h4 className="font-serif text-lg font-bold uppercase text-[#1D1A16]">Application Submitted!</h4>
                <p className="text-sm text-[#6B6257]">Your portfolio has been submitted for review.</p>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-5">
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#6B6257]">Casting</p>
                  <p className="text-sm font-bold text-[#1D1A16]">{activeCasting.title}</p>
                  <p className="text-xs text-[#6B6257]">{activeCasting.location} · {activeCasting.budget.toLocaleString()} RWF</p>
                </div>

                {applyError && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-red-600 text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" /> {applyError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#6B6257] block">Cover Note</label>
                  <textarea
                    rows={4}
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    placeholder="Tell the casting director about your experience and why you're a great fit..."
                    className="w-full rounded-xl border border-[#E7DED1] bg-[#F8F5EF] p-3.5 text-sm focus:outline-none focus:border-[#C8A96A] focus:bg-white resize-none transition-colors"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    className="rounded-full border border-[#E7DED1] px-5 py-2.5 text-sm font-bold uppercase tracking-widest text-[#6B6257] hover:bg-[#F8F5EF] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={applying}
                    className="rounded-full bg-[#1D1A16] px-5 py-2.5 text-sm font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] hover:text-[#11100E] disabled:opacity-60 flex items-center gap-2 transition-colors"
                  >
                    {applying && <Loader2 className="h-4 w-4 animate-spin" />}
                    Submit Application
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}

      <Footer />
    </>
  );
}
