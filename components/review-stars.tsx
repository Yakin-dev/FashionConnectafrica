import { Star } from "lucide-react";

interface ReviewStarsProps {
  rating: number;
}

export default function ReviewStars({ rating }: ReviewStarsProps) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < rating ? "fill-[#C8A96A] text-[#C8A96A]" : "text-[#E7DED1] fill-[#E7DED1]/20"
          }`}
        />
      ))}
    </div>
  );
}
