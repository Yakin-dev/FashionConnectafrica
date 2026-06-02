"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ModelCard from "@/components/model-card";
import SectionHeader from "@/components/section-header";
import EmptyState from "@/components/empty-state";
import { mockModels } from "@/lib/mock-data";
import Link from "next/link";
import { SlidersHorizontal, Loader2, Search } from "lucide-react";

interface DBModel {
  id: string;
  category: string;
  height: number;
  isVerified: boolean;
  isAvailable: boolean;
  profileImageUrl: string | null;
  viewsCount: number;
  user: { name: string; email: string };
  agency: { name: string } | null;
  reviews: { rating: number }[];
}

const CATEGORIES = ["All", "Runway", "Editorial", "Commercial", "Fitness", "Beauty", "Plus-size", "Petite"];

export default function ModelsPage() {
  const [dbModels, setDbModels]         = useState<DBModel[]>([]);
  const [loading, setLoading]           = useState(true);
  const [searchQ, setSearchQ]           = useState("");
  const [filterCat, setFilterCat]       = useState("All");

  const fetchModels = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: "40" });
      if (filterCat !== "All") params.set("category", filterCat);
      if (searchQ.trim()) params.set("q", searchQ.trim());
      const res = await fetch(`/api/models?${params}`);
      if (res.ok) { const d = await res.json(); setDbModels(d.models ?? []); }
    } catch { /* mock fallback */ } finally { setLoading(false); }
  }, [filterCat, searchQ]);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(fetchModels, 300);
    return () => clearTimeout(t);
  }, [fetchModels]);

  // Build display list — DB first, mock if empty
  const displayModels = dbModels.length > 0
    ? dbModels.map((m) => ({
        id: m.id,
        name: m.user.name,
        agencyName: m.agency?.name ?? "Independent",
        avatarUrl: m.profileImageUrl ?? "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=400&q=80",
        gender: "Female" as const,
        category: m.category as any,
        height: m.height,
        waist: 60,
        hips: 89,
        shoeSize: 39,
        location: "",
        isVerified: m.isVerified,
        profileCompletion: 80,
        viewsCount: m.viewsCount,
        experienceYears: 0,
        bio: "",
        portfolioImages: [],
        portfolioVideos: [],
        reviews: m.reviews.map((r) => ({ id: "", authorName: "", rating: r.rating, comment: "", date: "" })),
        experienceTimeline: [],
      }))
    : mockModels.filter((m) => {
        const matchCat = filterCat === "All" || m.category === filterCat;
        const matchQ   = !searchQ.trim() || m.name.toLowerCase().includes(searchQ.toLowerCase());
        return matchCat && matchQ;
      });

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#F8F5EF] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 border-b border-[#E7DED1]/70 pb-8">
            <SectionHeader title="The Roster" subtitle="Africa's Leading Visual Stories" />
            <Link href="/search"
              className="inline-flex items-center gap-2 rounded-full border border-[#1D1A16] px-6 py-3 text-xs font-bold uppercase tracking-widest text-[#1D1A16] hover:bg-[#1D1A16] hover:text-white transition-all w-fit">
              <SlidersHorizontal className="h-4 w-4" /> Filter & Search
            </Link>
          </div>

          {/* Search + Category filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6257]" />
              <input type="text" value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search models..." className="w-full pl-9 pr-4 py-3 rounded-xl border border-[#E7DED1] bg-white text-xs focus:outline-none focus:border-[#C8A96A]" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => setFilterCat(cat)}
                  className={`rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${filterCat === cat ? "bg-[#1D1A16] text-white" : "bg-white border border-[#E7DED1] text-[#6B6257] hover:border-[#1D1A16]"}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-xs text-[#6B6257] py-12">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading models...
            </div>
          ) : displayModels.length === 0 ? (
            <EmptyState title="No models found" description="No models match your search. Try different filters." />
          ) : (
            <>
              {dbModels.length === 0 && (
                <p className="text-[10px] text-[#6B6257] uppercase tracking-widest mb-6 font-bold">
                  Showing sample profiles — sign in to see live roster
                </p>
              )}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {displayModels.map((model) => (
                  <ModelCard key={model.id} model={model} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
