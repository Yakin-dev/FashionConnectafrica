import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ModelCard from "@/components/model-card";
import SectionHeader from "@/components/section-header";
import { mockModels } from "@/lib/mock-data";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";

export const metadata = {
  title: "Elite Models Catalog | ModelConnect.Africa",
  description: "Browse curated elite African modelling talent from Kigali, Lagos, Nairobi, and Johannesburg. View stats, profiles and book now.",
};

export default function ModelsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#F8F5EF] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 border-b border-[#E7DED1]/70 pb-8">
            <SectionHeader
              title="The Roster"
              subtitle="Africa's Leading Visual Stories"
            />

            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-full border border-[#1D1A16] px-6 py-3 text-xs font-bold uppercase tracking-widest text-[#1D1A16] hover:bg-[#1D1A16] hover:text-white transition-all w-fit"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filter & Search Roster</span>
            </Link>
          </div>

          {/* Catalog grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {mockModels.map((model) => (
              <ModelCard key={model.id} model={model} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
