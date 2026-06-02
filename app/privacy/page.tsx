import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import SectionHeader from "@/components/section-header";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#F8F5EF] py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-8">
          <SectionHeader
            title="Privacy Protocols"
            subtitle="Security & Identity Safeguards"
          />

          <div className="bg-white border border-[#E7DED1] rounded-2xl p-8 shadow-sm space-y-6 text-xs sm:text-sm text-[#6B6257] leading-relaxed">
            <h3 className="font-serif text-[#1D1A16] font-bold text-lg uppercase border-b border-[#E7DED1]/70 pb-2">
              Identity Ownership
            </h3>
            <p>
              Your physical attributes, portfolio visual cards, and video reels belong entirely to you or your representing agency. We store all uploaded media files securely inside Cloudinary.
            </p>

            <h3 className="font-serif text-[#1D1A16] font-bold text-lg uppercase border-b border-[#E7DED1]/70 pb-2">
              Data Collections
            </h3>
            <p>
              We compile names, locations, email credentials, category classifications, and physical dimensions (height, waist, hips, shoe sizing) to provide our talent search filters.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
