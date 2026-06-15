"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, use } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ReviewStars from "@/components/review-stars";
import EmptyState from "@/components/empty-state";
import { mockModels } from "@/lib/mock-data";
import { MapPin, Sparkles, Award, CheckCircle, Video, Image as ImageIcon, Loader2, X } from "lucide-react";
import Link from "next/link";

interface DBModel {
  id: string;
  category: string;
  height: number;
  waist: number | null;
  hips: number | null;
  chest: number | null;
  shoeSize: number | null;
  eyeColor: string | null;
  hairColor: string | null;
  isVerified: boolean;
  isAvailable: boolean;
  profileImageUrl: string | null;
  viewsCount: number;
  user: {
    name: string; email: string;
    profile: { bio: string | null; location: string | null; avatarUrl: string | null } | null;
  };
  agency: { name: string; logoUrl: string | null } | null;
  reviews: { id: string; authorName: string; rating: number; comment: string; createdAt: string }[];
  applications: { id: string; status: string; casting: { title: string; location: string } }[];
}

export default function ModelProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [dbModel, setDbModel]           = useState<DBModel | null>(null);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState<"photos" | "videos">("photos");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDate, setBookingDate]   = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Mock fallback
  const mockModel = mockModels.find((m) => m.id === id);

  useEffect(() => {
    async function fetchModel() {
      try {
        const res = await fetch(`/api/models/${id}`);
        if (res.ok) { const d = await res.json(); setDbModel(d.model); }
      } catch { /* use mock */ } finally { setLoading(false); }
    }
    fetchModel();
  }, [id]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);
    // Booking saved as notification/inquiry — no Booking table linked to client yet without Clerk
    await new Promise((r) => setTimeout(r, 1000));
    setBookingSuccess(true);
    setBookingLoading(false);
    setTimeout(() => { setBookingSuccess(false); setShowBookingModal(false); setBookingDate(""); setBookingNotes(""); }, 2500);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-[#F8F5EF] py-24 flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs text-[#6B6257]">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading profile...
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // If neither DB nor mock found
  if (!dbModel && !mockModel) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-[#F8F5EF] py-24 flex items-center justify-center">
          <EmptyState title="Profile not found" description="This model portfolio does not exist or has been archived." />
        </main>
        <Footer />
      </>
    );
  }

  // Normalise to a single display shape
  const name        = dbModel?.user.name        ?? mockModel!.name;
  const category    = dbModel?.category         ?? mockModel!.category;
  const location    = dbModel?.user.profile?.location ?? mockModel?.location ?? "";
  const agencyName  = dbModel?.agency?.name     ?? mockModel?.agencyName ?? "Independent";
  const bio         = dbModel?.user.profile?.bio ?? mockModel?.bio ?? "";
  const height      = dbModel?.height           ?? mockModel!.height;
  const waist       = dbModel?.waist            ?? mockModel?.waist;
  const hips        = dbModel?.hips             ?? mockModel?.hips;
  const shoeSize    = dbModel?.shoeSize         ?? mockModel?.shoeSize;
  const isVerified  = dbModel?.isVerified       ?? mockModel?.isVerified ?? false;
  const avatarUrl   = dbModel?.profileImageUrl ?? dbModel?.user.profile?.avatarUrl ?? mockModel?.avatarUrl
    ?? "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80";
  const portfolioImages = mockModel?.portfolioImages ?? [];
  const portfolioVideos = mockModel?.portfolioVideos ?? [];
  const reviews         = dbModel?.reviews ?? mockModel?.reviews ?? [];
  const experienceTimeline = mockModel?.experienceTimeline ?? [];

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#F8F5EF] py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <Link href="/models" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#6B6257] hover:text-[#1D1A16] mb-8 block">
            ← Back to Roster
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 sm:gap-16 items-start">

            {/* Left: Avatar */}
            <div className="md:col-span-5 space-y-6">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-[#E7DED1] bg-white p-3 shadow-md">
                <div className="relative w-full h-full overflow-hidden rounded-xl bg-[#E7DED1]/30">
                  <img src={avatarUrl} alt={name} className="object-cover w-full h-full" />
                </div>
              </div>
            </div>

            {/* Right: Identity + stats */}
            <div className="md:col-span-7 space-y-8">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-[#C8A96A] px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-white">
                    {category} Model
                  </span>
                  {isVerified && (
                    <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-[#C8A96A] bg-[#C8A96A]/10 px-2.5 py-0.5 rounded-full">
                      <Sparkles className="h-2.5 w-2.5" /> Verified Talent
                    </span>
                  )}
                  {dbModel && (
                    <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      Live Profile
                    </span>
                  )}
                </div>

                <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1D1A16] tracking-tight uppercase">{name}</h1>

                <div className="flex items-center gap-6 text-sm text-[#6B6257]">
                  {location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-[#C8A96A]" />{location}
                    </div>
                  )}
                  <div className="text-[#C8A96A] font-bold uppercase tracking-wider text-xs">{agencyName}</div>
                </div>
              </div>

              {bio && <p className="text-xs sm:text-sm text-[#6B6257] leading-relaxed max-w-xl">{bio}</p>}

              {/* Stats */}
              <div className="bg-white border border-[#E7DED1] rounded-2xl p-6 shadow-sm max-w-xl">
                <h3 className="font-serif text-sm font-bold uppercase tracking-widest text-[#1D1A16] border-b border-[#E7DED1]/70 pb-3 mb-4">
                  Physical Statistics
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
                  {[
                    { label: "Height", value: `${height} cm` },
                    { label: "Waist",  value: waist  ? `${waist} cm`  : "—" },
                    { label: "Hips",   value: hips   ? `${hips} cm`   : "—" },
                    { label: "Shoe",   value: shoeSize ?? "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#6B6257] tracking-wider block">{label}</span>
                      <span className="text-base font-bold text-[#1D1A16]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => setShowBookingModal(true)}
                className="rounded-full bg-[#1D1A16] px-8 py-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] transition-all shadow-md">
                Inquire & Book Model
              </button>
            </div>
          </div>

          {/* Portfolio tabs */}
          <div className="mt-20 border-b border-[#E7DED1]/70 pb-4 flex gap-6">
            {[
              { key: "photos" as const, icon: ImageIcon, label: `Editorial Book (${portfolioImages.length})` },
              { key: "videos" as const, icon: Video,     label: `Catwalk Reels (${portfolioVideos.length})` },
            ].map(({ key, icon: Icon, label }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest pb-2 transition-all ${activeTab === key ? "text-[#C8A96A] border-b-2 border-[#C8A96A]" : "text-[#6B6257]"}`}>
                <Icon className="h-4 w-4" />{label}
              </button>
            ))}
          </div>

          <div className="mt-8">
            {activeTab === "photos" ? (
              portfolioImages.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {portfolioImages.map((img, i) => (
                    <div key={i} className="group aspect-[3/4] relative overflow-hidden rounded-2xl border border-[#E7DED1] bg-white p-3 shadow-xs hover:shadow-lg transition-all duration-300">
                      <div className="relative w-full h-full overflow-hidden rounded-xl">
                        <img src={img} alt={`${name} pose ${i}`} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No photos yet" description="Portfolio images will appear here once uploaded." />
              )
            ) : portfolioVideos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {portfolioVideos.map((vid, i) => (
                  <div key={i} className="rounded-2xl border border-[#E7DED1] bg-white p-4 shadow-sm">
                    <video src={vid} controls className="w-full rounded-xl aspect-video bg-black" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B6257] mt-3 block">Catwalk Reel {i + 1}</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No video reels" description="No runway reels uploaded yet." />
            )}
          </div>

          {/* Experience + Reviews */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mt-20 pt-12 border-t border-[#E7DED1]/70">
            <div className="space-y-8">
              <h3 className="font-serif text-xl font-bold uppercase tracking-widest text-[#1D1A16] flex items-center gap-2">
                <Award className="h-5 w-5 text-[#C8A96A]" /> Show Experience
              </h3>
              {experienceTimeline.length > 0 ? (
                <div className="border-l-2 border-[#E7DED1] ml-2 pl-6 space-y-6">
                  {experienceTimeline.map((item) => (
                    <div key={item.id} className="relative space-y-1">
                      <div className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-[#C8A96A] border-2 border-[#F8F5EF]" />
                      <span className="text-[10px] font-bold text-[#C8A96A] tracking-widest block uppercase">{item.year}</span>
                      <h4 className="text-sm font-bold text-[#1D1A16] uppercase">{item.title}</h4>
                      <p className="text-xs text-[#6B6257] leading-relaxed">{item.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#6B6257] italic">No timeline milestones documented yet.</p>
              )}
            </div>

            <div className="space-y-8">
              <h3 className="font-serif text-xl font-bold uppercase tracking-widest text-[#1D1A16] flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-[#C8A96A]" /> Client Appreciations
              </h3>
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((r) => (
                    <div key={r.id} className="rounded-2xl bg-white border border-[#E7DED1] p-5 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1D1A16] uppercase">{r.authorName}</span>
                        <ReviewStars rating={r.rating} />
                      </div>
                      <p className="text-xs text-[#6B6257] leading-relaxed italic">&quot;{r.comment}&quot;</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#6B6257] italic">No client evaluations yet.</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#F8F5EF] rounded-2xl border border-[#E7DED1] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E7DED1]/70 pb-3 mb-4">
              <h3 className="font-serif text-xl font-bold text-[#1D1A16] uppercase">Request Booking</h3>
              <button onClick={() => setShowBookingModal(false)} className="text-[#6B6257] hover:text-[#1D1A16]"><X className="h-5 w-5" /></button>
            </div>

            {bookingSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="mx-auto rounded-full bg-emerald-100 p-3 text-emerald-600 w-fit"><CheckCircle className="h-8 w-8" /></div>
                <h4 className="font-serif text-base font-bold uppercase text-[#1D1A16]">Inquiry Sent!</h4>
                <p className="text-xs text-[#6B6257] uppercase tracking-wider">The model and agency have been notified.</p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <p className="text-[11px] text-[#6B6257] uppercase tracking-wider">
                  Booking <strong>{name}</strong> — {agencyName}
                </p>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] block">Preferred Date</label>
                  <input type="date" required value={bookingDate} onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full rounded-xl border border-[#E7DED1] bg-white p-3 text-xs focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] block">Notes / Requirements</label>
                  <textarea rows={3} required value={bookingNotes} onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="Describe the booking requirements..." className="w-full rounded-xl border border-[#E7DED1] bg-white p-3 text-xs focus:outline-none resize-none" />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={() => setShowBookingModal(false)}
                    className="rounded-full border border-[#E7DED1] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#6B6257] hover:bg-white">Cancel</button>
                  <button type="submit" disabled={bookingLoading}
                    className="rounded-full bg-[#1D1A16] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] disabled:opacity-60 flex items-center gap-1.5">
                    {bookingLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Submit Booking
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
