import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import SectionHeader from "@/components/section-header";
import { Sparkles, Award, Globe, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#F8F5EF] py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-16">
          <SectionHeader
            title="Our Narrative"
            subtitle="About ModelConnect.Africa"
            align="center"
          />

          <div className="space-y-6 text-sm text-[#6B6257] leading-relaxed">
            <p className="font-serif text-lg text-[#1D1A16] italic leading-relaxed text-center max-w-2xl mx-auto">
              "We believe that premium African creative talent belongs on the global runway. ModelConnect.Africa is the bridge that turns digital visual portfolios into international contracts."
            </p>
            
            <p>
              ModelConnect.Africa was founded to solve a critical bottleneck in the African fashion ecosystem. While Africa hosts some of the most visually stunning, expressive, and physically gifted talent on earth, discovery has historically been localized, gatekept, or unorganized.
            </p>
            
            <p>
              By offering a premium, high-contrast, editorial platform, we allow models to display their catalogs with proper statistics, enable top-tier local modeling agencies to aggregate their rosters, and give international luxury fashion labels a secure, validated directory to recruit talent safely.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-[#E7DED1]">
            <div className="text-center space-y-2">
              <div className="mx-auto rounded-full bg-[#1D1A16] p-3 text-[#C8A96A] w-fit">
                <Globe className="h-5 w-5" />
              </div>
              <h4 className="font-serif text-sm font-bold uppercase text-[#1D1A16]">Global Reach</h4>
              <p className="text-[10px] text-[#6B6257] leading-relaxed uppercase tracking-wider">
                Connecting Kigali, Nairobi, Lagos, and Paris.
              </p>
            </div>

            <div className="text-center space-y-2">
              <div className="mx-auto rounded-full bg-[#1D1A16] p-3 text-[#C8A96A] w-fit">
                <Award className="h-5 w-5" />
              </div>
              <h4 className="font-serif text-sm font-bold uppercase text-[#1D1A16]">Verified Roster</h4>
              <p className="text-[10px] text-[#6B6257] leading-relaxed uppercase tracking-wider">
                Strict background checks and physical standards.
              </p>
            </div>

            <div className="text-center space-y-2">
              <div className="mx-auto rounded-full bg-[#1D1A16] p-3 text-[#C8A96A] w-fit">
                <Users className="h-5 w-5" />
              </div>
              <h4 className="font-serif text-sm font-bold uppercase text-[#1D1A16]">Direct Contact</h4>
              <p className="text-[10px] text-[#6B6257] leading-relaxed uppercase tracking-wider">
                Seamless secure communications between partners.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
