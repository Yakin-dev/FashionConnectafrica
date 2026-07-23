"use client";

import { Calendar, MapPin, DollarSign, User } from "lucide-react";
import { MockCasting } from "@/lib/mock-data";

interface CastingCardProps {
  casting: MockCasting;
  onApply?: (castingId: string) => void;
}

export default function CastingCard({ casting, onApply }: CastingCardProps) {
  return (
    <div className="group rounded-2xl border border-[#E7DED1] bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between">
      <div className="space-y-4">
        {/* Header: budget and location */}
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex items-center gap-0.5 rounded-full bg-[#C8A96A]/10 px-3 py-1 text-xs font-bold text-[#C8A96A] uppercase tracking-wider">
            <DollarSign className="h-3 w-3" />
            <span>{casting.budget} USD</span>
          </span>
          <span className="text-[10px] font-semibold text-[#6B6257] uppercase tracking-widest flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-[#C8A96A]" />
            <span>{casting.location}</span>
          </span>
        </div>

        {/* Title and descriptions */}
        <div className="space-y-2">
          <h3 className="font-serif text-lg font-bold text-[#1D1A16] leading-snug group-hover:text-[#C8A96A] transition-colors">
            {casting.title}
          </h3>
          <p className="text-xs text-[#6B6257] leading-relaxed line-clamp-3">
            {casting.description}
          </p>
        </div>

        {/* Requirements info panel */}
        <div className="rounded-xl bg-[#F8F5EF] p-3 text-[11px] text-[#6B6257] leading-relaxed">
          <strong className="text-[#1D1A16] uppercase font-bold tracking-wider block mb-1">Requirements:</strong>
          {casting.requirements}
        </div>
      </div>

      {/* Footer and apply actions */}
      <div className="border-t border-[#E7DED1]/60 pt-4 mt-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#C8A96A]" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B6257]">
            Deadline: {casting.date}
          </span>
        </div>

        {onApply ? (
          <button
            onClick={() => onApply(casting.id)}
            disabled={casting.applicationStatus === "Applied"}
            className={`rounded-full px-5 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
              casting.applicationStatus === "Applied"
                ? "bg-[#E7DED1] text-[#6B6257] cursor-not-allowed"
                : "bg-[#1D1A16] text-white hover:bg-[#C8A96A]"
            }`}
            aria-label={casting.applicationStatus === "Applied" ? `Already applied to ${casting.title}` : `Apply to ${casting.title}`}
          >
            {casting.applicationStatus === "Applied" ? "Applied" : "Apply Now"}
          </button>
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#C8A96A]">
            Status: {casting.applicationStatus}
          </span>
        )}
      </div>
    </div>
  );
}
