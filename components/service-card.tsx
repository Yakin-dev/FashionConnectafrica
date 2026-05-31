import Image from "next/image";
import { Star, MapPin } from "lucide-react";
import { MockService } from "@/lib/mock-data";

interface ServiceCardProps {
  service: MockService;
  onBook?: (serviceId: string) => void;
}

export default function ServiceCard({ service, onBook }: ServiceCardProps) {
  return (
    <div className="group rounded-2xl border border-[#E7DED1] bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between">
      <div>
        {/* Service Banner Image */}
        <div className="relative aspect-[16/10] w-full bg-[#E7DED1]/30 overflow-hidden">
          <Image
            src={service.imageUrl}
            alt={service.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <span className="absolute top-4 left-4 rounded-full bg-[#1D1A16]/80 backdrop-blur-md px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-[#F8F5EF]">
            {service.providerRole}
          </span>
        </div>

        {/* Content details */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#C8A96A] uppercase tracking-widest">
              {service.providerName}
            </span>
            <div className="flex items-center gap-1 text-xs">
              <Star className="h-3.5 w-3.5 fill-[#C8A96A] text-[#C8A96A]" />
              <span className="font-bold text-[#1D1A16]">{service.rating}</span>
            </div>
          </div>

          <h3 className="font-serif text-base font-bold text-[#1D1A16] leading-snug group-hover:text-[#C8A96A] transition-colors">
            {service.title}
          </h3>

          <p className="text-xs text-[#6B6257] leading-relaxed line-clamp-2">
            {service.description}
          </p>
        </div>
      </div>

      {/* Pricing and booking */}
      <div className="border-t border-[#E7DED1]/60 p-5 pt-4 flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <span className="text-[9px] text-[#6B6257] uppercase font-bold tracking-widest block">Starting at</span>
          <span className="text-base font-bold text-[#1D1A16]">${service.price}</span>
        </div>

        <button
          onClick={() => onBook?.(service.id)}
          className="rounded-full bg-[#1D1A16] px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] transition-all"
        >
          Book Service
        </button>
      </div>
    </div>
  );
}
