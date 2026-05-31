import { AlertCircle } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-[#E7DED1] rounded-2xl bg-white/40 backdrop-blur-sm">
      <AlertCircle className="h-8 w-8 text-[#C8A96A] mb-4" />
      <h3 className="font-serif text-lg font-bold text-[#1D1A16] uppercase">{title}</h3>
      <p className="text-xs text-[#6B6257] mt-2 max-w-sm leading-relaxed">{description}</p>
    </div>
  );
}
