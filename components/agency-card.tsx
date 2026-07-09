import Image from "next/image";
import Link from "next/link";
import { MapPin, Sparkles, ArrowRight } from "lucide-react";

export interface AgencyCardData {
  id: string;
  name: string;
  logoUrl: string | null;
  location: string;
  description: string | null;
  isVerified: boolean;
  modelCount: string | null;
  _count?: { models: number; castings: number };
  user?: { name: string; email: string; avatarUrl?: string | null };
}

interface AgencyCardProps {
  agency: AgencyCardData;
}

export default function AgencyCard({ agency }: AgencyCardProps) {
  const modelsCount = agency._count?.models ?? Number(agency.modelCount) ?? 0;
  const fallbackLetter = agency.name?.charAt(0)?.toUpperCase() ?? "A";

  return (
    <div className="group rounded-2xl border border-[#E7DED1] bg-white p-5 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between">
      <div className="space-y-4">
        {/* Logo and verified */}
        <div className="flex items-center justify-between">
          <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-[#E7DED1]/30 flex items-center justify-center">
            {agency.logoUrl ? (
              <Image
                src={agency.logoUrl}
                alt={agency.name}
                fill
                className="object-cover"
              />
            ) : (
              <span className="text-xl font-serif font-bold text-[#C8A96A]">
                {fallbackLetter}
              </span>
            )}
          </div>
          {agency.isVerified && (
            <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-[#C8A96A] bg-[#C8A96A]/10 px-2 py-0.5 rounded-full">
              <Sparkles className="h-2.5 w-2.5" />
              <span>Partner</span>
            </span>
          )}
        </div>

        {/* Agency Information */}
        <div className="space-y-1.5">
          <h3 className="font-serif text-lg font-bold text-[#1D1A16] group-hover:text-[#C8A96A] transition-colors">
            {agency.name}
          </h3>
          <div className="flex items-center gap-1 text-xs text-[#6B6257]">
            <MapPin className="h-3.5 w-3.5 text-[#C8A96A]" />
            <span>{agency.location || "Kigali, Rwanda"}</span>
          </div>
          {agency.description && (
            <p className="text-xs text-[#6B6257] leading-relaxed pt-1">
              {agency.description}
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-[#E7DED1]/60 pt-4 mt-5 flex items-center justify-between">
        <span className="text-[10px] font-bold text-[#1D1A16] uppercase tracking-wider">
          {modelsCount} {modelsCount === 1 ? "Model" : "Models"} Represented
        </span>
        <Link
          href={`/search?type=agencies&q=${encodeURIComponent(agency.name)}`}
          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#C8A96A] group-hover:translate-x-1 transition-transform"
        >
          <span>View Roster</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
