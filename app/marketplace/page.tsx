"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ServiceCard from "@/components/service-card";
import SectionHeader from "@/components/section-header";
import EmptyState from "@/components/empty-state";
import { mockServices } from "@/lib/mock-data";
import { CheckCircle } from "lucide-react";

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [bookedServiceId, setBookedServiceId] = useState<string | null>(null);

  const categories = [
    "All",
    "Fashion Photographer",
    "Makeup Artist",
    "Runway Coach",
    "Studio Rental",
  ];

  const filteredServices = mockServices.filter(
    (s) => selectedCategory === "All" || s.providerRole === selectedCategory
  );

  const handleBookService = (id: string) => {
    setBookedServiceId(id);
    setTimeout(() => {
      setBookedServiceId(null);
    }, 2500);
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#F8F5EF] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-[#E7DED1]/70 pb-8">
            <SectionHeader
              title="Creative Marketplace"
              subtitle="Elite Fashion Services Directory"
            />

            {/* Category Nav buttons */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                    selectedCategory === cat
                      ? "bg-[#1D1A16] text-white"
                      : "bg-white text-[#6B6257] border border-[#E7DED1] hover:bg-[#F8F5EF]"
                  }`}
                >
                  {cat === "All" ? "All Services" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog grid */}
          {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onBook={handleBookService}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No services found"
              description="No creative professionals are listed under this category currently. Try checking another category."
            />
          )}
        </div>
      </main>

      {/* Booking confirmation notice popup */}
      {bookedServiceId && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl border border-[#E7DED1] bg-white p-5 shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
          <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1D1A16] uppercase">Inquiry Received</h4>
            <p className="text-[10px] text-[#6B6257] uppercase tracking-wider mt-0.5">
              The creative expert is notified and will coordinate rates.
            </p>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
