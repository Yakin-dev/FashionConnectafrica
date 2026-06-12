"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ServiceCard from "@/components/service-card";
import EmptyState from "@/components/empty-state";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  "All",
  "Fashion Photographer",
  "Makeup Artist",
  "Runway Coach",
  "Studio Rental",
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

import { mockServices } from "@/lib/mock-data";

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [bookedServiceId, setBookedServiceId] = useState<string | null>(null);

  const services = mockServices;

  const filtered = services.filter(
    (s) => selectedCategory === "All" || s.providerRole === selectedCategory
  );

  const handleBookService = (id: string) => {
    setBookedServiceId(id);
    setTimeout(() => setBookedServiceId(null), 3000);
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

          {filtered.length === 0 ? (
            <div className="py-16">
              <EmptyState
                title="No services found"
                description="No creative professionals are listed here yet. List your services from your dashboard."
              />
              <div className="text-center mt-6">
                <Link
                  href="/signup"
                  className="inline-flex rounded-full bg-[#1D1A16] px-7 py-3 text-sm font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] hover:text-[#11100E] transition-colors"
                >
                  List Your Services
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
              {filtered.map((service) => (
                <motion.div key={service.id} variants={fadeUp}>
                  <ServiceCard service={service} onBook={handleBookService} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>

      {/* Booking toast */}
      {bookedServiceId && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: 0 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 z-50 rounded-2xl border border-[#E7DED1] bg-white p-5 shadow-2xl flex items-center gap-3 max-w-xs"
        >
          <div className="rounded-full bg-emerald-100 p-2.5 text-emerald-600 shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#1D1A16]">Inquiry Sent</p>
            <p className="text-xs text-[#6B6257] mt-0.5">The provider will be in touch with details.</p>
          </div>
        </motion.div>
      )}

      <Footer />
    </>
  );
}
