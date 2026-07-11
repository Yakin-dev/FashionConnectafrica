"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import EmptyState from "@/components/empty-state";
import { motion, type Variants } from "framer-motion";
import {
  MapPin, Loader2, Sparkles, Building2, Users, BookOpen,
  Shield, ExternalLink, ArrowUpRight, Eye,
} from "lucide-react";

interface PortfolioMedia {
  id: string;
  url: string;
  mediaType: string;
  sortOrder: number;
  isCover: boolean;
}

interface DBModel {
  id: string;
  professionalName: string | null;
  category: string;
  height: number;
  isVerified: boolean;
  isAvailable: boolean;
  profileImageUrl: string | null;
  profileStatus: string;
  user: { name: string; email: string };
  portfolioMedia: PortfolioMedia[];
}

interface DBAgency {
  id: string;
  name: string;
  logoUrl: string | null;
  location: string;
  description: string | null;
  isVerified: boolean;
  subscriptionTier?: string | null;
  user: { name: string; email: string; avatarUrl: string | null };
  _count: { models: number; castings: number };
  models: DBModel[];
}

interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

const MODELS_PER_PAGE = 6;

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function AgencyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [agency, setAgency] = useState<DBAgency | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchAgency() {
      setPageLoading(true);
      try {
        const res = await fetch(`/api/agencies/${id}?page=${page}&pageSize=${MODELS_PER_PAGE}`);
        if (res.ok) {
          const d = await res.json();
          setAgency(d.agency);
          setPagination(d.pagination);
        }
      } catch {
        /* silent */
      } finally {
        setLoading(false);
        setPageLoading(false);
      }
    }
    fetchAgency();
  }, [id, page]);

  const goToPage = (p: number) => {
    if (pagination && (p < 1 || p > pagination.totalPages)) return;
    setPage(p);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-[#F8F5EF] py-24 flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs text-[#6B6257]">
            <Loader2 className="h-5 w-5 animate-spin text-[#C8A96A]" /> Loading agency profile...
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!agency) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-[#F8F5EF] py-24 flex items-center justify-center">
          <EmptyState title="Agency not found" description="This agency profile does not exist or has been removed." />
        </main>
        <Footer />
      </>
    );
  }

  const models = agency.models ?? [];
  const publishedCount = pagination?.total ?? agency._count?.models ?? 0;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#F8F5EF] min-h-screen">

        {/* ── Hero Section ──────────────────────────────────────────── */}
        <div className="relative bg-[#1D1A16] overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1D1A16] via-[#1D1A16] to-[#2D2924]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #C8A96A 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C0A08]/80 via-transparent to-transparent" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
              {/* Agency Logo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="shrink-0"
              >
                <div className="relative h-28 w-28 sm:h-36 sm:w-36 overflow-hidden rounded-2xl border-2 border-[#C8A96A]/30 bg-[#E7DED1]/20 shadow-2xl flex items-center justify-center">
                  {agency.logoUrl ? (
                    <Image
                      src={agency.logoUrl}
                      alt={agency.name}
                      width={144}
                      height={144}
                      className="object-contain h-full w-full p-2"
                    />
                  ) : (
                    <span className="text-5xl font-serif font-bold text-[#C8A96A]">
                      {agency.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </motion.div>

              {/* Agency Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="text-center md:text-left flex-1"
              >
                <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start mb-3">
                  {agency.subscriptionTier === "ULTIMATE" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#C8A96A] to-amber-400 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-[#11100E] shadow-sm">
                      <Sparkles className="h-3 w-3" /> Ultimate
                    </span>
                  )}
                  {agency.subscriptionTier === "PRO" && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#C8A96A]/50 bg-[#C8A96A]/10 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-[#C8A96A]">
                      <Sparkles className="h-3 w-3" /> Pro
                    </span>
                  )}
                  {agency.isVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-emerald-400">
                      <Shield className="h-3 w-3" /> Verified Partner
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#C8A96A]/10 border border-[#C8A96A]/30 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-[#C8A96A]">
                    <Building2 className="h-3 w-3" /> Model Agency
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-white/70">
                    <Users className="h-3 w-3" /> {publishedCount} Model{publishedCount !== 1 ? "s" : ""}
                  </span>
                </div>

                <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white uppercase leading-tight">
                  {agency.name}
                </h1>

                <div className="flex flex-wrap items-center gap-4 mt-3 justify-center md:justify-start">
                  <span className="flex items-center gap-1.5 text-sm text-white/70">
                    <MapPin className="h-4 w-4 text-[#C8A96A]" />
                    {agency.location || "Kigali, Rwanda"}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-white/70">
                    <BookOpen className="h-4 w-4 text-[#C8A96A]" />
                    {agency._count?.castings ?? 0} Casting{agency._count?.castings !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* CTA */}
                <div className="flex flex-wrap gap-3 mt-6 justify-center md:justify-start">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 rounded-full bg-[#C8A96A] px-6 py-3 text-xs font-bold uppercase tracking-widest text-[#11100E] hover:bg-[#BCA062] transition-colors shadow-lg"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Contact Agency
                  </Link>
                  <Link
                    href="/agencies"
                    className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-colors"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" /> All Agencies
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* ── Content ──────────────────────────────────────────────── */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left: About */}
            <div className="lg:col-span-4 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-white border border-[#E7DED1] rounded-2xl p-6 shadow-sm"
              >
                <h2 className="font-serif text-sm font-bold uppercase tracking-widest text-[#1D1A16] border-b border-[#E7DED1]/70 pb-3 mb-4">
                  About
                </h2>
                <p className="text-sm text-[#6B6257] leading-relaxed">
                  {agency.description || "No description provided."}
                </p>
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white border border-[#E7DED1] rounded-2xl p-6 shadow-sm space-y-4"
              >
                <h2 className="font-serif text-sm font-bold uppercase tracking-widest text-[#1D1A16] border-b border-[#E7DED1]/70 pb-3 mb-2">
                  Agency Stats
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-[#F8F5EF] rounded-xl">
                    <p className="font-serif text-2xl font-bold text-[#C8A96A]">{publishedCount}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] mt-0.5">
                      Model{publishedCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-[#F8F5EF] rounded-xl">
                    <p className="font-serif text-2xl font-bold text-[#C8A96A]">{agency._count?.castings ?? 0}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] mt-0.5">
                      Casting{agency._count?.castings !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                {agency.user?.name && (
                  <div className="border-t border-[#E7DED1]/60 pt-3 mt-2">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257]">Account Manager</p>
                    <p className="text-xs font-bold text-[#1D1A16] mt-0.5">{agency.user.name}</p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right: Represented Models */}
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center justify-between border-b border-[#E7DED1]/70 pb-3 mb-6">
                  <h2 className="font-serif text-xl font-bold uppercase tracking-widest text-[#1D1A16]">
                    Represented Models
                  </h2>
                  <span className="text-xs text-[#6B6257]">
                    {publishedCount} model{publishedCount !== 1 ? "s" : ""}
                  </span>
                </div>

                {models.length === 0 ? (
                  <div className="py-12">
                    <EmptyState
                      title="No models yet"
                      description="This agency hasn't published any model profiles yet. Check back soon."
                    />
                  </div>
                ) : (
                  <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                  >
                    {models.map((model) => {
                      const displayName = model.professionalName || model.user.name;
                      const coverImage = model.portfolioMedia?.[0]?.url || model.profileImageUrl;
                      const category = model.category || "Model";

                      return (
                        <motion.div key={model.id} variants={fadeUp}>
                          <Link
                            href={`/models/${model.id}`}
                            className="group block rounded-2xl border border-[#E7DED1] bg-white p-3 shadow-sm hover:shadow-xl hover:border-[#C8A96A]/40 transition-all duration-500"
                          >
                            {/* Model Image */}
                            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#E7DED1]/30 mb-3">
                              {coverImage ? (
                                <Image
                                  src={coverImage}
                                  alt={displayName}
                                  fill
                                  sizes="(max-width: 640px) 50vw, 33vw"
                                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <span className="text-3xl font-serif font-bold text-[#C8A96A]/40">
                                    {displayName.charAt(0)}
                                  </span>
                                </div>
                              )}
                              {/* Category badge */}
                              <span className="absolute bottom-3 left-3 rounded-full bg-[#1D1A16]/80 backdrop-blur-md px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-white">
                                {category}
                              </span>
                              {/* Hover overlay */}
                              <div className="absolute inset-0 bg-[#1D1A16]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <span className="flex items-center gap-1.5 rounded-full bg-[#F8F5EF] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#1D1A16] group-hover:bg-[#C8A96A] group-hover:text-white transition-all shadow-lg">
                                  <Eye className="h-3.5 w-3.5" /> View Profile
                                </span>
                              </div>
                            </div>

                            {/* Model Info */}
                            <div className="px-1 pb-1 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <h3 className="font-serif text-sm font-bold text-[#1D1A16] truncate flex items-center gap-1.5">
                                  {displayName}
                                  {model.isVerified && (
                                    <Sparkles className="h-3 w-3 text-[#C8A96A] shrink-0" />
                                  )}
                                </h3>
                                <span className="text-[10px] font-semibold text-[#6B6257]">{model.height}cm</span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-[#6B6257]">
                                <span className={`inline-block h-1.5 w-1.5 rounded-full ${model.isAvailable ? "bg-emerald-500" : "bg-red-400"}`} />
                                {model.isAvailable ? "Available" : "Booked"}
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10 flex flex-col items-center gap-4">
                    {/* Page indicator */}
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B6257]">
                      Page {page} of {totalPages}
                    </p>

                    <div className="flex items-center gap-2">
                      {/* Prev */}
                      <button
                        onClick={() => goToPage(page - 1)}
                        disabled={page <= 1 || pageLoading}
                        className="rounded-full border border-[#E7DED1] bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#6B6257] hover:bg-[#1D1A16] hover:text-white hover:border-[#1D1A16] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#6B6257] disabled:hover:border-[#E7DED1]"
                      >
                        Previous
                      </button>

                      {/* Page numbers */}
                      <div className="flex items-center gap-1.5">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          // Show pages around current page
                          let pageNum: number;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (page <= 3) {
                            pageNum = i + 1;
                          } else if (page >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = page - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => goToPage(pageNum)}
                              disabled={pageLoading}
                              className={`h-9 w-9 rounded-full text-xs font-bold transition-all ${
                                pageNum === page
                                  ? "bg-[#1D1A16] text-white shadow-sm"
                                  : "border border-[#E7DED1] bg-white text-[#6B6257] hover:bg-[#F8F5EF] hover:text-[#1D1A16]"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      {/* Next */}
                      <button
                        onClick={() => goToPage(page + 1)}
                        disabled={page >= totalPages || pageLoading}
                        className="rounded-full border border-[#E7DED1] bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#6B6257] hover:bg-[#1D1A16] hover:text-white hover:border-[#1D1A16] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#6B6257] disabled:hover:border-[#E7DED1]"
                      >
                        Next
                      </button>
                    </div>

                    {/* Loading overlay for page transitions */}
                    {pageLoading && (
                      <div className="flex items-center gap-2 text-xs text-[#6B6257]">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-[#C8A96A]" />
                        Loading page {page}...
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
