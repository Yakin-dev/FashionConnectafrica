"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import AgencyCard, { type AgencyCardData } from "@/components/agency-card";
import EmptyState from "@/components/empty-state";
import { motion, type Variants } from "framer-motion";
import { Loader2, Search, Sparkles, Building2 } from "lucide-react";

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<AgencyCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState("");

  useEffect(() => {
    const fetchAgencies = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: "50" });
        if (searchQ.trim()) params.set("q", searchQ.trim());
        const res = await fetch(`/api/agencies?${params}`);
        if (res.ok) {
          const data = await res.json();
          setAgencies(data.agencies ?? []);
        }
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    };
    const t = setTimeout(() => void fetchAgencies(), 200);
    return () => clearTimeout(t);
  }, [searchQ]);

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
              <h1 className="font-serif text-4xl sm:text-5xl font-bold uppercase">Partner Agencies</h1>
              <p className="text-base text-white/60">Browse verified talent agencies and their represented model rosters.</p>
            </motion.div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          {/* Search + info */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6257]" />
              <input
                type="text"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search agencies by name or location..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E7DED1] bg-white text-sm focus:outline-none focus:border-[#C8A96A] transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-[#6B6257]">
              <Building2 className="h-4 w-4 text-[#C8A96A]" />
              <span>{agencies.length} agency{agencies.length !== 1 ? "ies" : "y"}</span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-24 text-[#6B6257]">
              <Loader2 className="h-5 w-5 animate-spin text-[#C8A96A]" />
              <span className="text-sm">Loading agencies...</span>
            </div>
          ) : agencies.length === 0 ? (
            <div className="py-16">
              <EmptyState
                title={searchQ ? "No agencies found" : "No agencies yet"}
                description={
                  searchQ
                    ? "Try a different search term."
                    : "Agencies will appear here once they complete onboarding and are verified."
                }
              />
            </div>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {agencies.map((agency) => (
                <motion.div key={agency.id} variants={fadeUp}>
                  <AgencyCard agency={agency} />
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
