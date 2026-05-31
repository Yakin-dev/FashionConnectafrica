"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface DashboardSidebarProps {
  title: string;
  subtitle: string;
  items: SidebarItem[];
  role: "MODEL" | "AGENCY" | "ADMIN";
}

export default function DashboardSidebar({ title, subtitle, items, role }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 shrink-0 rounded-2xl border border-[#E7DED1] bg-white p-5 shadow-sm space-y-6">
      <div className="border-b border-[#E7DED1]/60 pb-5">
        <div className="flex items-center gap-1.5 font-serif text-sm font-bold tracking-widest uppercase text-[#1D1A16]">
          <Sparkles className="h-4 w-4 text-[#C8A96A]" />
          <span>ModelConnect</span>
        </div>
        <p className="text-[9px] font-bold text-[#C8A96A] tracking-widest uppercase mt-1">
          {role} PANEL
        </p>

        <div className="mt-4">
          <h2 className="text-base font-bold font-serif text-[#1D1A16] truncate">{title}</h2>
          <p className="text-xs text-[#6B6257] truncate mt-0.5">{subtitle}</p>
        </div>
      </div>

      <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible gap-1.5 pb-2 md:pb-0">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap md:whitespace-normal shrink-0 md:shrink",
                isActive
                  ? "bg-[#1D1A16] text-white"
                  : "text-[#6B6257] hover:bg-[#F8F5EF] hover:text-[#1D1A16]"
              )}
            >
              <Icon className="h-4.5 w-4.5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
