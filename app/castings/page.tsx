"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CastingCard from "@/components/casting-card";
import SectionHeader from "@/components/section-header";
import EmptyState from "@/components/empty-state";
import { mockCastings, MockCasting } from "@/lib/mock-data";
import { CheckCircle, SlidersHorizontal } from "lucide-react";

export default function CastingsPage() {
  const [castings, setCastings] = useState<MockCasting[]>(mockCastings);
  const [selectedCastingId, setSelectedCastingId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [success, setSuccess] = useState(false);
  const [filterLocation, setFilterLocation] = useState("All");

  const activeCasting = castings.find((c) => c.id === selectedCastingId);

  const handleApplyClick = (id: string) => {
    setSelectedCastingId(id);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCastingId) return;

    setSuccess(true);
    setTimeout(() => {
      // Simulate state update
      setCastings((prev) =>
        prev.map((c) =>
          c.id === selectedCastingId ? { ...c, applicationStatus: "Applied" } : c
        )
      );
      setSuccess(false);
      setSelectedCastingId(null);
      setNotes("");
    }, 2000);
  };

  const filteredCastings = castings.filter(
    (c) => filterLocation === "All" || c.location.includes(filterLocation)
  );

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#F8F5EF] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 border-b border-[#E7DED1]/70 pb-8">
            <SectionHeader
              title="Casting Briefs"
              subtitle="Elite Global Runway Openings"
            />

            <div className="flex gap-3 items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B6257]">Location:</span>
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="rounded-xl border border-[#E7DED1] bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-[#6B6257] focus:outline-none"
              >
                <option value="All">All Cities</option>
                <option value="Kigali">Kigali</option>
                <option value="Nairobi">Nairobi</option>
                <option value="Lagos">Lagos</option>
              </select>
            </div>
          </div>

          {/* Castings Grid */}
          {filteredCastings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCastings.map((c) => (
                <CastingCard key={c.id} casting={c} onApply={handleApplyClick} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No castings available"
              description="There are currently no casting briefs posted for this location. Check back soon for new briefs."
            />
          )}
        </div>
      </main>

      {/* Casting application modal */}
      {selectedCastingId && activeCasting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-[#F8F5EF] rounded-2xl border border-[#E7DED1] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="font-serif text-xl font-bold text-[#1D1A16] uppercase border-b border-[#E7DED1]/70 pb-3">
              Apply to Casting Call
            </h3>

            {success ? (
              <div className="py-8 text-center space-y-3">
                <div className="mx-auto rounded-full bg-emerald-100 p-3 text-emerald-600 w-fit">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h4 className="font-serif text-base font-bold uppercase text-[#1D1A16]">Applied!</h4>
                <p className="text-xs text-[#6B6257] leading-relaxed uppercase tracking-wider">
                  Your modeling stats and portfolio cards have been submitted for review.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] block">Casting Title</span>
                  <span className="text-xs font-bold text-[#1D1A16] block uppercase">{activeCasting.title}</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] block">Cover Notes / Special attributes</label>
                  <textarea
                    rows={4}
                    required
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tell the casting director about your catwalk experience or why you fit their theme..."
                    className="w-full rounded-xl border border-[#E7DED1] bg-white p-3 text-xs focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setSelectedCastingId(null)}
                    className="rounded-full border border-[#E7DED1] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#6B6257] hover:bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-[#1D1A16] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A]"
                  >
                    Submit Application
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
