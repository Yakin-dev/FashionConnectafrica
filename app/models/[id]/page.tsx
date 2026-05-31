"use client";

import { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ReviewStars from "@/components/review-stars";
import EmptyState from "@/components/empty-state";
import { mockModels } from "@/lib/mock-data";
import { MapPin, Sparkles, Phone, Mail, Award, CheckCircle, Video, Image as ImageIcon } from "lucide-react";

export default function ModelProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const model = mockModels.find((m) => m.id === resolvedParams.id);

  // Tabs for portfolio items
  const [activeTab, setActiveTab] = useState<"photos" | "videos">("photos");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  if (!model) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-[#F8F5EF] py-24 flex items-center justify-center">
          <EmptyState
            title="Profile not found"
            description="The editorial model portfolio you are looking for does not exist or has been archived."
          />
        </main>
        <Footer />
      </>
    );
  }

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setShowBookingModal(false);
      setBookingDate("");
      setBookingNotes("");
    }, 2500);
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#F8F5EF] py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header Layout: 2 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 sm:gap-16 items-start">
            
            {/* Left Side: Avatar Banner */}
            <div className="md:col-span-5 space-y-6">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-[#E7DED1] bg-white p-3 shadow-md">
                <div className="relative w-full h-full overflow-hidden rounded-xl bg-[#E7DED1]/30">
                  <img
                    src={model.avatarUrl}
                    alt={model.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            </div>

            {/* Right Side: Identity, stats and specs */}
            <div className="md:col-span-7 space-y-8">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-[#C8A96A] px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-white">
                    {model.category} Model
                  </span>
                  {model.isVerified && (
                    <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-[#C8A96A] bg-[#C8A96A]/10 px-2.5 py-0.5 rounded-full">
                      <Sparkles className="h-2.5 w-2.5" />
                      <span>Verified Talent</span>
                    </span>
                  )}
                </div>

                <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1D1A16] tracking-tight uppercase">
                  {model.name}
                </h1>

                <div className="flex items-center gap-6 text-sm text-[#6B6257]">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-[#C8A96A]" />
                    <span>{model.location}</span>
                  </div>
                  <div className="text-[#C8A96A] font-bold uppercase tracking-wider text-xs">
                    {model.agencyName}
                  </div>
                </div>
              </div>

              {/* Bio block */}
              <p className="text-xs sm:text-sm text-[#6B6257] leading-relaxed max-w-xl">
                {model.bio}
              </p>

              {/* Statistics grid layout */}
              <div className="bg-white border border-[#E7DED1] rounded-2xl p-6 shadow-sm max-w-xl">
                <h3 className="font-serif text-sm font-bold uppercase tracking-widest text-[#1D1A16] border-b border-[#E7DED1]/70 pb-3 mb-4">
                  Physical Statistics
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#6B6257] tracking-wider block">Height</span>
                    <span className="text-base font-bold text-[#1D1A16]">{model.height} cm</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#6B6257] tracking-wider block">Waist</span>
                    <span className="text-base font-bold text-[#1D1A16]">{model.waist || "-"} cm</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#6B6257] tracking-wider block">Hips</span>
                    <span className="text-base font-bold text-[#1D1A16]">{model.hips || "-"} cm</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#6B6257] tracking-wider block">Shoe Size</span>
                    <span className="text-base font-bold text-[#1D1A16]">{model.shoeSize}</span>
                  </div>
                </div>
              </div>

              {/* CTA Booking Button */}
              <button
                onClick={() => setShowBookingModal(true)}
                className="rounded-full bg-[#1D1A16] px-8 py-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] transition-all shadow-md"
              >
                Inquire & Book model
              </button>
            </div>
          </div>

          {/* Tab portfolio navigation */}
          <div className="mt-20 border-b border-[#E7DED1]/70 pb-4 flex gap-6">
            <button
              onClick={() => setActiveTab("photos")}
              className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest pb-2 transition-all ${
                activeTab === "photos" ? "text-[#C8A96A] border-b-2 border-[#C8A96A]" : "text-[#6B6257]"
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              <span>Editorial Book ({model.portfolioImages.length})</span>
            </button>
            
            <button
              onClick={() => setActiveTab("videos")}
              className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest pb-2 transition-all ${
                activeTab === "videos" ? "text-[#C8A96A] border-b-2 border-[#C8A96A]" : "text-[#6B6257]"
              }`}
            >
              <Video className="h-4 w-4" />
              <span>Catwalk Reels ({model.portfolioVideos.length})</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-8">
            {activeTab === "photos" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {model.portfolioImages.map((img, i) => (
                  <div key={i} className="group aspect-[3/4] relative overflow-hidden rounded-2xl border border-[#E7DED1] bg-white p-3 shadow-xs hover:shadow-lg transition-all duration-300">
                    <div className="relative w-full h-full overflow-hidden rounded-xl">
                      <img
                        src={img}
                        alt={`${model.name} pose ${i}`}
                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : model.portfolioVideos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {model.portfolioVideos.map((vid, i) => (
                  <div key={i} className="rounded-2xl border border-[#E7DED1] bg-white p-4 shadow-sm">
                    <video src={vid} controls className="w-full rounded-xl aspect-video bg-black" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B6257] mt-3 block">
                      Catwalk Motion Card {i + 1}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No video reels"
                description="This talent has not uploaded any runway catwalk reels to their portfolio yet."
              />
            )}
          </div>

          {/* Double section layout: Experience and Reviews */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mt-20 pt-12 border-t border-[#E7DED1]/70">
            {/* Experience timeline */}
            <div className="space-y-8">
              <h3 className="font-serif text-xl font-bold uppercase tracking-widest text-[#1D1A16] flex items-center gap-2">
                <Award className="h-5 w-5 text-[#C8A96A]" />
                <span>Show Experience</span>
              </h3>
              
              {model.experienceTimeline.length > 0 ? (
                <div className="border-l-2 border-[#E7DED1] ml-2 pl-6 space-y-6">
                  {model.experienceTimeline.map((item) => (
                    <div key={item.id} className="relative space-y-1">
                      <div className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-[#C8A96A] border-2 border-[#F8F5EF]" />
                      <span className="text-[10px] font-bold text-[#C8A96A] tracking-widest block uppercase">
                        {item.year}
                      </span>
                      <h4 className="text-sm font-bold text-[#1D1A16] uppercase">{item.title}</h4>
                      <p className="text-xs text-[#6B6257] leading-relaxed">{item.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#6B6257] italic">No timeline milestones documented yet.</p>
              )}
            </div>

            {/* Client Reviews */}
            <div className="space-y-8">
              <h3 className="font-serif text-xl font-bold uppercase tracking-widest text-[#1D1A16] flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-[#C8A96A]" />
                <span>Client Appreciations</span>
              </h3>

              {model.reviews.length > 0 ? (
                <div className="space-y-6">
                  {model.reviews.map((r) => (
                    <div key={r.id} className="rounded-2xl bg-white border border-[#E7DED1] p-5 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1D1A16] uppercase">{r.authorName}</span>
                        <ReviewStars rating={r.rating} />
                      </div>
                      <p className="text-xs text-[#6B6257] leading-relaxed italic">
                        "{r.comment}"
                      </p>
                      <span className="text-[9px] text-[#6B6257] block tracking-widest uppercase">
                        Booking date: {r.date}
                      </span>
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

      {/* Booking request modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-[#F8F5EF] rounded-2xl border border-[#E7DED1] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="font-serif text-xl font-bold text-[#1D1A16] uppercase border-b border-[#E7DED1]/70 pb-3">
              Request Booking Session
            </h3>

            {bookingSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="mx-auto rounded-full bg-emerald-100 p-3 text-emerald-600 w-fit">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h4 className="font-serif text-base font-bold uppercase text-[#1D1A16]">Inquiry Sent!</h4>
                <p className="text-xs text-[#6B6257] leading-relaxed uppercase tracking-wider">
                  The model and agency have been notified. We will reach back shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="mt-4 space-y-4">
                <p className="text-[11px] text-[#6B6257] leading-relaxed uppercase tracking-wider">
                  You are booking <strong>{model.name}</strong> represented by {model.agencyName}.
                </p>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] block">Preferred Session Date</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full rounded-xl border border-[#E7DED1] bg-white p-3 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] block">Inquiry / Dress Specifications</label>
                  <textarea
                    rows={3}
                    required
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="Provide details about the runway silhouette, theme, and durations..."
                    className="w-full rounded-xl border border-[#E7DED1] bg-white p-3 text-xs focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="rounded-full border border-[#E7DED1] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#6B6257] hover:bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-[#1D1A16] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A]"
                  >
                    Submit Booking
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
