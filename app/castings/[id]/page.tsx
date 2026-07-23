"use client";

// Client component — data is fetched on the client
import { useState, useEffect, use } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import EmptyState from "@/components/empty-state";
import { mockCastings } from "@/lib/mock-data";
import {
  MapPin, DollarSign, Calendar, Users, Building2,
  CheckCircle, AlertCircle, Loader2, ArrowLeft, X
} from "lucide-react";
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
  createdAt: string;
  agency?: { name: string; logoUrl: string | null } | null;
  client?: { user: { name: string } } | null;
  _count: { applications: number };
}

export default function CastingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [casting, setCasting]       = useState<DBCasting | null>(null);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [coverNote, setCoverNote]   = useState("");
  const [applying, setApplying]     = useState(false);
  const [applied, setApplied]       = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCasting() {
      try {
        // Try DB first — fetch from list and filter
        const res = await fetch("/api/castings?limit=100");
        if (res.ok) {
          const d = await res.json();
          const found = (d.castings as DBCasting[]).find((c) => c.id === id);
          if (found) { setCasting(found); setLoading(false); return; }
        }
      } catch { /* fall through to mock */ }

      // Mock fallback
      const mock = mockCastings.find((c) => c.id === id);
      if (mock) {
        setCasting({
          id: mock.id, title: mock.title, description: mock.description,
          category: "General", requirements: mock.requirements, location: mock.location,
          date: mock.date, budget: Number(mock.budget), isActive: true,
          createdAt: new Date().toISOString(), agency: null, client: null,
          _count: { applications: 0 },
        });
      }
      setLoading(false);
    }
    fetchCasting();
  }, [id]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplying(true); setApplyError(null);
    try {
      const res = await fetch(`/api/castings/${id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to apply");
      setApplied(true);
      setTimeout(() => { setShowModal(false); setCoverNote(""); }, 2500);
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : "Failed to apply");
    } finally { setApplying(false); }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-[#F8F5EF] py-24 flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs text-[#6B6257]">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading casting brief...
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!casting) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-[#F8F5EF] py-24 flex items-center justify-center">
          <EmptyState title="Casting not found" description="This casting brief doesn't exist or has been closed." />
        </main>
        <Footer />
      </>
    );
  }

  const postedBy = casting.agency?.name ?? casting.client?.user?.name ?? "FashionConnect.Africa";

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#F8F5EF] py-12 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">

          {/* Back */}
          <Link href="/castings" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#6B6257] hover:text-[#1D1A16] transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Castings
          </Link>

          {/* Hero card */}
          <div className="rounded-2xl border border-[#E7DED1] bg-white p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2">
                <span className="inline-block text-[9px] font-bold uppercase tracking-widest bg-[#C8A96A]/10 text-[#C8A96A] px-3 py-1 rounded-full">
                  {casting.category}
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold uppercase text-[#1D1A16] leading-tight">
                  {casting.title}
                </h1>
                <div className="flex flex-wrap gap-4 text-[10px] text-[#6B6257] font-semibold uppercase tracking-widest">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-[#C8A96A]" />{casting.location}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-[#C8A96A]" />{new Date(casting.date).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5 text-[#C8A96A]" />{casting.budget.toLocaleString()} USD</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-[#C8A96A]" />{casting._count.applications} Applied</span>
                  <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5 text-[#C8A96A]" />{postedBy}</span>
                </div>
              </div>

              <div className="shrink-0">
                {!casting.isActive ? (
                  <span className="inline-block rounded-full bg-[#E7DED1] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#6B6257]">
                    Closed
                  </span>
                ) : applied ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                    <CheckCircle className="h-3.5 w-3.5" /> Applied
                  </span>
                ) : (
                  <button onClick={() => setShowModal(true)}
                    className="rounded-full bg-[#C8A96A] px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#11100E] hover:bg-[#BCA062] transition-colors shadow-sm">
                    Apply Now
                  </button>
                )}
              </div>
            </div>

            <hr className="border-[#E7DED1]" />

            <div className="space-y-2">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#6B6257]">Description</h2>
              <p className="text-sm text-[#1D1A16] leading-relaxed">{casting.description}</p>
            </div>

            <div className="rounded-xl bg-[#F8F5EF] border border-[#E7DED1] p-5 space-y-2">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#6B6257]">Requirements</h2>
              <p className="text-sm text-[#1D1A16] leading-relaxed">{casting.requirements}</p>
            </div>

            {!casting.isActive ? null : !applied && (
              <button onClick={() => setShowModal(true)}
                className="w-full rounded-full bg-[#1D1A16] py-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] transition-all shadow-sm">
                Submit Your Application
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Apply Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#F8F5EF] rounded-2xl border border-[#E7DED1] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E7DED1]/70 pb-3 mb-4">
              <h3 className="font-serif text-xl font-bold text-[#1D1A16] uppercase">Apply</h3>
              <button onClick={() => setShowModal(false)} className="text-[#6B6257] hover:text-[#1D1A16]"><X className="h-5 w-5" /></button>
            </div>

            {applied ? (
              <div className="py-8 text-center space-y-3">
                <div className="mx-auto rounded-full bg-emerald-100 p-3 text-emerald-600 w-fit"><CheckCircle className="h-8 w-8" /></div>
                <h4 className="font-serif text-base font-bold uppercase text-[#1D1A16]">Application Submitted!</h4>
                <p className="text-xs text-[#6B6257] uppercase tracking-wider">Your portfolio has been sent for review.</p>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4">
                <div className="rounded-xl bg-[#F8F5EF] border border-[#E7DED1] p-3 text-xs">
                  <p className="font-bold text-[#1D1A16] uppercase">{casting.title}</p>
                  <p className="text-[#6B6257] mt-0.5">{casting.location} · ${casting.budget.toLocaleString()}</p>
                </div>

                {applyError && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-red-600 text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />{applyError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] block">Cover Note</label>
                  <textarea rows={4} value={coverNote} onChange={(e) => setCoverNote(e.target.value)}
                    placeholder="Tell the casting director about your experience..."
                    className="w-full rounded-xl border border-[#E7DED1] bg-white p-3 text-xs focus:outline-none resize-none" />
                </div>

                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="rounded-full border border-[#E7DED1] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#6B6257] hover:bg-white">
                    Cancel
                  </button>
                  <button type="submit" disabled={applying}
                    className="rounded-full bg-[#1D1A16] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] disabled:opacity-60 flex items-center gap-1.5">
                    {applying && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Submit
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
