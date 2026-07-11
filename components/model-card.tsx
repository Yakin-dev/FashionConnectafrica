"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { generateModelCardAltText, getCloudinaryBlurUrl } from "@/lib/images"
import { Sparkles, MapPin, Eye, Heart } from "lucide-react";
import { MockModel } from "@/lib/mock-data";

interface ModelCardProps {
  model: MockModel & { slug?: string };
}

export default function ModelCard({ model }: ModelCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#E7DED1] bg-white p-4 shadow-sm hover:shadow-xl transition-all duration-500">
      {/* Favorite Button */}
      <button
        onClick={() => setIsFavorite(!isFavorite)}
        className="absolute top-6 right-6 z-10 rounded-full p-2.5 bg-white/80 backdrop-blur-md text-[#6B6257] hover:text-[#C8A96A] hover:bg-white transition-all shadow-sm"
        aria-label="Add to favorites"
      >
        <Heart className={`h-4.5 w-4.5 ${isFavorite ? "fill-[#C8A96A] text-[#C8A96A]" : ""}`} />
      </button>

      {/* Model Image Section */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#E7DED1]/40">
        <Image
          src={model.avatarUrl}
          alt={generateModelCardAltText(model.name, model.category, model.location)}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading="lazy"
          placeholder={getCloudinaryBlurUrl(model.avatarUrl) ? "blur" : undefined}
          blurDataURL={getCloudinaryBlurUrl(model.avatarUrl)}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Editorial category badge */}
        <span className="absolute bottom-4 left-4 rounded-full bg-[#1D1A16]/80 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#F8F5EF]">
          {model.category}
        </span>
        {/* Quick view overlap */}
        <div className="absolute inset-0 bg-[#1D1A16]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Link
            href={`/models/${(model as any).slug || model.id}`}
            className="flex items-center gap-1.5 rounded-full bg-[#F8F5EF] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-[#1D1A16] hover:bg-[#C8A96A] hover:text-white transition-all shadow-lg"
          >
            <Eye className="h-4 w-4" />
            <span>Editorial View</span>
          </Link>
        </div>
      </div>

      {/* Meta Content */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-[#1D1A16] flex items-center gap-1.5">
            <span>{model.name}</span>
            {model.isVerified && (
              <span title="Verified Elite Talent">
                <Sparkles className="h-3.5 w-3.5 text-[#C8A96A]" />
              </span>
            )}
          </h3>
          <span className="text-[10px] font-semibold text-[#6B6257] uppercase tracking-widest">
            {model.height}cm
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-[#6B6257]">
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-[#C8A96A]" />
            <span>{model.location}</span>
          </div>
          <span className="text-[10px] font-bold text-[#C8A96A] tracking-wider uppercase">
            {model.agencyName}
          </span>
        </div>

        {/* stats parameters */}
        <div className="border-t border-[#E7DED1]/60 pt-3 mt-1 flex items-center justify-between text-[10px] font-medium text-[#6B6257] uppercase tracking-wider">
          <span>Waist: {model.waist || "-"}</span>
          <span>Hips: {model.hips || "-"}</span>
          <span>Shoe: {model.shoeSize || "-"}</span>
        </div>
      </div>
    </div>
  );
}
