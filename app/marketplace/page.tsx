"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import EmptyState from "@/components/empty-state";
import { motion, type Variants } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  "All",
  "Photographer",
  "Content Studio",
  "Runway Coach",
  "Makeup Artist",
  "Stylist",
];

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

interface Provider {
  id: string;
  businessName: string;
  serviceCategory: string;
  location: string;
  user: { name: string; avatarUrl: string | null };
  verified?: boolean;
}

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/marketplace-providers");
        if (res.ok) {
          const data = await res.json();
          setProviders(data.providers ?? []);
        }
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    };
    void fetchProviders();
  }, []);

  const filtered = providers.filter(
    (p) =>
      selectedCategory === "All" ||
      p.serviceCategory.toLowerCase().includes(selectedCategory.toLowerCase())
  );

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
                <Sparkles className="h-3.5 w-3.5" /> Kigali Creative Services
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold uppercase">Creative Marketplace</h1>
              <p className="text-base text-white/60">Hire vetted fashion professionals in Kigali.</p>
            </motion.div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-10">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all ${
                  selectedCategory === cat
                    ? "bg-[#1D1A16] text-white shadow-sm"
                    : "bg-white border border-[#E7DED1] text-[#6B6257] hover:border-[#1D1A16] hover:text-[#1D1A16]"
                }`}
              >
                {cat === "All" ? "All Services" : cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-24 text-[#6B6257]">
              <Loader2 className="h-5 w-5 animate-spin text-[#C8A96A]" />
              <span className="text-sm">Loading services...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16">
              <EmptyState
                title={selectedCategory !== "All" ? `No ${selectedCategory}s listed yet` : "No services yet"}
                description={
                  selectedCategory !== "All"
                    ? `No ${selectedCategory.toLowerCase()} professionals have listed their services yet. Check back soon.`
                    : "Be the first creative professional to list your services on ModelConnect Africa."
                }
              />
              <div className="text-center mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/signup"
                  className="inline-flex rounded-full bg-[#1D1A16] px-7 py-3 text-sm font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] hover:text-[#11100E] transition-colors"
                >
                  List Your Services
                </Link>
                {selectedCategory !== "All" && (
                  <button
                    onClick={() => setSelectedCategory("All")}
                    className="inline-flex rounded-full border border-[#E7DED1] bg-white px-7 py-3 text-sm font-bold uppercase tracking-widest text-[#6B6257] hover:border-[#1D1A16] hover:text-[#1D1A16] transition-colors"
                  >
                    View All
                  </button>
                )}
              </div>
            </div>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filtered.map((provider) => (
                <motion.div key={provider.id} variants={fadeUp}>
                  <div className="bg-white border border-[#E7DED1] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="h-14 w-14 rounded-xl bg-[#F8F5EF] flex items-center justify-center shrink-0 overflow-hidden">
                        {provider.user.avatarUrl ? (
                          <img src={provider.user.avatarUrl} alt={provider.businessName} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-2xl font-serif font-bold text-[#C8A96A]">
                            {provider.businessName.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#1D1A16] truncate">{provider.businessName}</p>
                        <p className="text-xs text-[#C8A96A] font-semibold uppercase tracking-wider mt-0.5">{provider.serviceCategory}</p>
                        <p className="text-xs text-[#6B6257] mt-1">{provider.location}</p>
                      </div>
                    </div>
                    <Link
                      href={`/marketplace/${provider.id}`}
                      className="mt-4 flex w-full items-center justify-center rounded-full border border-[#1D1A16] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-[#1D1A16] hover:bg-[#1D1A16] hover:text-white transition-colors"
                    >
                      View Profile
                    </Link>
                  </div>
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
