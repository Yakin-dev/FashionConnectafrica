"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import SectionHeader from "@/components/section-header";
import UploadBox from "@/components/upload-box";
import { mockModels } from "@/lib/mock-data";
import { CheckCircle, Calendar, MapPin, Tag } from "lucide-react";

export default function EventUploadPage() {
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [taggedModelIds, setTaggedModelIds] = useState<string[]>([]);
  const [eventImageUrl, setEventImageUrl] = useState("");
  
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleModelTagToggle = (id: string) => {
    setTaggedModelIds((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!eventImageUrl) {
      setValidationError("An event editorial photo must be uploaded before submitting.");
      return;
    }

    if (taggedModelIds.length === 0) {
      setValidationError("At least one model must be tagged in the event photo.");
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setEventName("");
      setEventDate("");
      setEventLocation("");
      setTaggedModelIds([]);
      setEventImageUrl("");
    }, 3000);
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#F8F5EF] py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          
          <div className="bg-white border border-[#E7DED1] rounded-3xl p-8 sm:p-12 shadow-sm space-y-8">
            <SectionHeader
              title="Publish Event"
              subtitle="Tag Talent & Upload Show Reels"
            />

            {success ? (
              <div className="py-12 text-center space-y-4">
                <div className="mx-auto rounded-full bg-emerald-100 p-4 text-emerald-600 w-fit">
                  <CheckCircle className="h-10 w-10" />
                </div>
                <h3 className="font-serif text-xl font-bold uppercase text-[#1D1A16]">Event Live!</h3>
                <p className="text-xs text-[#6B6257] leading-relaxed max-w-sm mx-auto uppercase tracking-wider">
                  The editorial images are cataloged, and the profiles of tagged models have been updated automatically.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Event Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B6257]">Show / Event Name</label>
                  <input
                    type="text"
                    required
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="E.G. KIGALI AUTUMN HAUTE COUTURE 2026"
                    className="w-full rounded-xl border border-[#E7DED1] bg-white p-3.5 text-xs font-semibold focus:outline-none"
                  />
                </div>

                {/* Date & Location Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B6257]">Date of Event</label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full rounded-xl border border-[#E7DED1] bg-white p-3.5 text-xs font-semibold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B6257]">Venue / Location</label>
                    <input
                      type="text"
                      required
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e.target.value)}
                      placeholder="CITY, COUNTRY (E.G. LAGOS, NIGERIA)"
                      className="w-full rounded-xl border border-[#E7DED1] bg-white p-3.5 text-xs font-semibold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Upload Image Box */}
                <UploadBox
                  label="Editorial Event Image"
                  onUploadSuccess={(url) => setEventImageUrl(url)}
                />

                {/* Multi-Tag Models */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B6257] block">Tag Roster Talent</label>
                  <div className="flex flex-wrap gap-2.5 max-h-40 overflow-y-auto p-4 border border-[#E7DED1] rounded-2xl bg-[#F8F5EF]/30">
                    {mockModels.map((model) => {
                      const isSelected = taggedModelIds.includes(model.id);
                      return (
                        <button
                          type="button"
                          key={model.id}
                          onClick={() => handleModelTagToggle(model.id)}
                          className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all border flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-[#C8A96A] text-white border-transparent"
                              : "bg-white text-[#6B6257] border-[#E7DED1] hover:bg-[#F8F5EF]"
                          }`}
                        >
                          <Tag className="h-3 w-3" />
                          <span>{model.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {validationError && (
                  <div className="text-[10px] font-bold text-rose-600 uppercase tracking-widest text-center">
                    {validationError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full rounded-full bg-[#1D1A16] py-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] transition-all"
                >
                  Publish Show Event
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
