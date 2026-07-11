import type { Metadata } from "next"
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import SectionHeader from "@/components/section-header";

export const metadata: Metadata = {
  title: "Terms of Service | FashionConnect.Africa",
  description: "Review the terms of engagement for using FashionConnect.Africa — booking contracts, profile accuracy requirements, and platform rules for fashion professionals.",
  alternates: { canonical: "/terms" },
  openGraph: { title: "Terms of Service | FashionConnect.Africa", url: "/terms" },
}

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#F8F5EF] py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-8">
          <SectionHeader
            title="Terms of Engagement"
            subtitle="Operational Rules"
          />

          <div className="bg-white border border-[#E7DED1] rounded-2xl p-8 shadow-sm space-y-6 text-xs sm:text-sm text-[#6B6257] leading-relaxed">
            <h3 className="font-serif text-[#1D1A16] font-bold text-lg uppercase border-b border-[#E7DED1]/70 pb-2">
              Booking Contracts
            </h3>
            <p>
              FashionConnect.Africa operates exclusively as a directory and workspace platform. Actual booking finances, contract completions, and runway agreements remain the sole responsibility of the agencies, models, and clients.
            </p>

            <h3 className="font-serif text-[#1D1A16] font-bold text-lg uppercase border-b border-[#E7DED1]/70 pb-2">
              Accuracy of Stats
            </h3>
            <p>
              Models and managing agencies are required to supply precise, up-to-date physical statistics. Falsification of dimensions, verified marks, or work logs will result in immediate profile suspension.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
