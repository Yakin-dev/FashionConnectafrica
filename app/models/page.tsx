"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ModelCard from "@/components/model-card";
import EmptyState from "@/components/empty-state";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { Loader2, Search, Sparkles, SlidersHorizontal } from "lucide-react";

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

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function ModelsPage() {
  const [dbModels, setDbModels] = useState<DBModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState("");
  const [filterCat, setFilterCat] = useState("All");

  useEffect(() => {
    const fetchModels = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: "40" });
        if (filterCat !== "All") params.set("category", filterCat);
        if (searchQ.trim()) params.set("q", searchQ.trim());
        const res = await fetch(`/api/models?${params}`);
        if (res.ok) { const d = await res.json(); setDbModels(d.models ?? []); }
      } catch { /* silent */ } finally { setLoading(false); }
    };
    const t = setTimeout(() => void fetchModels(), 300);
    return () => clearTimeout(t);
  }, [filterCat, searchQ]);

  const displayModels = dbModels.map((m) => ({
    id: m.id,
    name: m.user.name,
    agencyName: m.agency?.name ?? "Independent",
    avatarUrl: m.profileImageUrl ?? "",
    gender: "Female" as const,
    category: m.category as "Runway" | "Editorial" | "Commercial" | "Fitness" | "Beauty" | "Plus-size" | "Petite" | "Influencer",
    height: m.height,
    waist: 60,
    hips: 89,
    shoeSize: 39,
    location: "Kigali, Rwanda",
    isVerified: m.isVerified,
    profileCompletion: 80,
    viewsCount: m.viewsCount,
    experienceYears: 0,
    bio: "",
    portfolioImages: [],
    portfolioVideos: [],
    reviews: (m.reviews || []).map((r) => ({ id: "", authorName: "", rating: r.rating, comment: "", date: "" })),
    experienceTimeline: [],
  }));

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
                <Sparkles className="h-3.5 w-3.5" /> Kigali, Rwanda
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold uppercase">Model Roster</h1>
              <p className="text-base text-white/60">Browse verified models and portfolios.</p>
            </motion.div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">

          {/* Search + filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6257]" />
              <input
                type="text"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search by name..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E7DED1] bg-white text-sm focus:outline-none focus:border-[#C8A96A] transition-colors"
              />
            </div>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-xl border border-[#E7DED1] bg-white px-5 py-3 text-sm font-semibold text-[#6B6257] hover:border-[#1D1A16] hover:text-[#1D1A16] transition-colors w-fit"
            >
              <SlidersHorizontal className="h-4 w-4" /> Advanced Filter
            </Link>
          </div>

          {/* Category pills */}
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
              <span className="text-sm">Loading models...</span>
            </div>
          ) : displayModels.length === 0 ? (
            <div className="py-16">
              <EmptyState
                title={searchQ || filterCat !== "All" ? "No models found" : "No models yet"}
                description={
                  searchQ || filterCat !== "All"
                    ? "Try a different search or category."
                    : "Be the first to join the roster. Create your model profile today."
                }
              />
              {!searchQ && filterCat === "All" && (
                <div className="text-center mt-6">
                  <Link
                    href="/signup"
                    className="inline-flex rounded-full bg-[#1D1A16] px-7 py-3 text-sm font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] hover:text-[#11100E] transition-colors"
                  >
                    Join as Model
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            >
              {displayModels.map((model) => (
                <motion.div key={model.id} variants={fadeUp}>
                  <ModelCard model={model} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
