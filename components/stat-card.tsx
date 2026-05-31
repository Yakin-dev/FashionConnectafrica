import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down";
  icon: LucideIcon;
}

export default function StatCard({ title, value, change, trend, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-[#E7DED1] bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B6257]">{title}</span>
        <div className="rounded-full bg-[#F8F5EF] p-2.5 text-[#C8A96A]">
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl font-bold font-serif text-[#1D1A16]">{value}</span>
        {change && (
          <span
            className={`text-[10px] font-bold uppercase tracking-wider ${
              trend === "up" ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {change}
          </span>
        )}
      </div>
    </div>
  );
}
