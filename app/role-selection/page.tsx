"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, User, Briefcase, Building } from "lucide-react";

export default function RoleSelectionPage() {
  const router = useRouter();

  const handleRoleSelect = (role: string) => {
    // Simulate immediate onboarding path selection
    router.push(`/dashboard/${role.toLowerCase()}`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F8F5EF] p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl bg-white border border-[#E7DED1] rounded-3xl p-8 sm:p-12 shadow-sm space-y-8">
        
        {/* Brand */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-1.5 font-serif text-xl font-bold tracking-wider uppercase text-[#1D1A16]">
            <Sparkles className="h-5 w-5 text-[#C8A96A]" />
            <span>ModelConnect</span>
            <span className="text-[#C8A96A]">.Africa</span>
          </Link>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold uppercase text-[#1D1A16] mt-4">Select your role</h2>
          <p className="text-[10px] text-[#6B6257] uppercase tracking-widest">How will you participate in the fashion network?</p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Model Card */}
          <button
            onClick={() => handleRoleSelect("MODEL")}
            className="group border border-[#E7DED1] bg-[#F8F5EF]/20 hover:bg-white hover:shadow-xl hover:border-transparent rounded-2xl p-6 text-center space-y-4 transition-all duration-300"
          >
            <div className="mx-auto rounded-full bg-[#1D1A16] p-4 text-[#C8A96A] group-hover:bg-[#C8A96A] group-hover:text-[#1D1A16] transition-colors w-fit">
              <User className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-sm font-bold uppercase text-[#1D1A16]">Model</h3>
            <p className="text-[10px] text-[#6B6257] leading-relaxed uppercase tracking-wider">
              Upload editorial books, catalog statistics, apply to international runway castings.
            </p>
          </button>

          {/* Agency Card */}
          <button
            onClick={() => handleRoleSelect("AGENCY")}
            className="group border border-[#E7DED1] bg-[#F8F5EF]/20 hover:bg-white hover:shadow-xl hover:border-transparent rounded-2xl p-6 text-center space-y-4 transition-all duration-300"
          >
            <div className="mx-auto rounded-full bg-[#1D1A16] p-4 text-[#C8A96A] group-hover:bg-[#C8A96A] group-hover:text-[#1D1A16] transition-colors w-fit">
              <Building className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-sm font-bold uppercase text-[#1D1A16]">Agency</h3>
            <p className="text-[10px] text-[#6B6257] leading-relaxed uppercase tracking-wider">
              Publish model rosters, approve profiles, post casting briefs, monitor show analytics.
            </p>
          </button>

          {/* Client Card */}
          <button
            onClick={() => handleRoleSelect("MODEL")} // Clients browse model catalog routes
            className="group border border-[#E7DED1] bg-[#F8F5EF]/20 hover:bg-white hover:shadow-xl hover:border-transparent rounded-2xl p-6 text-center space-y-4 transition-all duration-300"
          >
            <div className="mx-auto rounded-full bg-[#1D1A16] p-4 text-[#C8A96A] group-hover:bg-[#C8A96A] group-hover:text-[#1D1A16] transition-colors w-fit">
              <Briefcase className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-sm font-bold uppercase text-[#1D1A16]">Client / Brand</h3>
            <p className="text-[10px] text-[#6B6257] leading-relaxed uppercase tracking-wider">
              Browse elite catalogs, secure contracts, request bookings, find creative makeup/stylists.
            </p>
          </button>
        </div>
      </div>
    </main>
  );
}
