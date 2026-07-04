"use client";
/* eslint-disable */

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon, Menu, X } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
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
  role: "MODEL" | "AGENCY" | "ADMIN" | "CLIENT" | "MARKETPLACE_PROVIDER";
}

export default function DashboardSidebar({ title, subtitle, items, role }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavItems = () => (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href ?? ""}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
              isActive
                ? "bg-[#1D1A16] text-white shadow-sm"
                : "text-[#6B6257] hover:bg-[#F8F5EF] hover:text-[#1D1A16]"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* ── Desktop sidebar ────────────────────────────────────────── */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col rounded-2xl border border-[#E7DED1] bg-white p-5 shadow-sm gap-6 self-start sticky top-6">
        <div className="border-b border-[#E7DED1]/60 pb-5">
          <div className="flex items-center gap-2.5 font-serif text-sm font-bold tracking-widest uppercase text-[#1D1A16]">
            <Image
              src="/logo.jpeg"
              alt="FashionConnect.Africa"
              width={24}
              height={24}
              className="rounded-full object-cover ring-1 ring-[#C8A96A]/30"
            />
            <span>FashionConnect</span>
          </div>
          <p className="text-[10px] font-bold text-[#C8A96A] tracking-widest uppercase mt-1">
            {role} PANEL
          </p>
          <div className="mt-4">
            <h2 className="text-sm font-bold font-serif text-[#1D1A16] truncate">{title}</h2>
            <p className="text-xs text-[#6B6257] truncate mt-0.5">{subtitle}</p>
          </div>
        </div>
        {NavItems()}
      </aside>

      {/* ── Mobile top bar ────────────────────────────────────────── */}
      <div className="md:hidden flex items-center justify-between bg-white border border-[#E7DED1] rounded-2xl px-4 py-3 mb-4 shadow-sm">
        <div>
          <p className="text-xs font-bold font-serif text-[#1D1A16] truncate">{title}</p>
          <p className="text-[10px] font-bold text-[#C8A96A] uppercase tracking-widest">{role} PANEL</p>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-xl bg-[#F8F5EF] p-2.5 text-[#1D1A16]"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* ── Mobile drawer ────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl flex flex-col p-6 gap-6"
            >
              <div className="flex items-center justify-between border-b border-[#E7DED1]/60 pb-5">
                <div>
                  <div className="flex items-center gap-2.5 font-serif text-sm font-bold tracking-widest uppercase text-[#1D1A16]">
                    <Image
                      src="/logo.jpeg"
                      alt="FashionConnect.Africa"
                      width={24}
                      height={24}
                      className="rounded-full object-cover ring-1 ring-[#C8A96A]/30"
                    />
                    <span>FashionConnect</span>
                  </div>
                  <p className="text-[10px] font-bold text-[#C8A96A] tracking-widest uppercase mt-0.5">{role} PANEL</p>
                  <p className="text-sm font-bold font-serif text-[#1D1A16] mt-2">{title}</p>
                  <p className="text-xs text-[#6B6257]">{subtitle}</p>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl bg-[#F8F5EF] p-2"
                  aria-label="Close navigation"
                >
                  <X className="h-5 w-5 text-[#1D1A16]" />
                </button>
              </div>
              {NavItems()}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
