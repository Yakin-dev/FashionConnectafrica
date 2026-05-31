"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Bell, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const pathname = usePathname();

  // Navigation Links
  const navLinks = [
    { name: "Models", href: "/models" },
    { name: "Agencies", href: "/search?type=agencies" },
    { name: "Castings", href: "/castings" },
    { name: "Marketplace", href: "/marketplace" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  // Dummy notifications
  const notifications = [
    { id: "1", title: "New Casting Call", body: "Vogue Africa published a runway casting in Kigali.", time: "1 hour ago" },
    { id: "2", title: "Profile Approved", body: "Your agency profile is now verified by ModelConnect.", time: "3 hours ago" }
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#E7DED1]/70 bg-[#F8F5EF]/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="group flex items-center gap-1.5 font-serif text-xl font-bold tracking-wider uppercase text-[#1D1A16]">
              <Sparkles className="h-5 w-5 text-[#C8A96A] transition-transform duration-500 group-hover:rotate-45" />
              <span>ModelConnect</span>
              <span className="text-[#C8A96A]">.Africa</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      "text-xs font-semibold uppercase tracking-widest transition-all duration-300 hover:text-[#C8A96A]",
                      isActive ? "text-[#C8A96A] border-b border-[#C8A96A] pb-1" : "text-[#6B6257]"
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-5">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative rounded-full p-2 text-[#6B6257] hover:bg-[#E7DED1]/50 hover:text-[#1D1A16] transition-colors"
                aria-label="View notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-[#C8A96A] ring-2 ring-[#F8F5EF]" />
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 rounded-xl border border-[#E7DED1] bg-white p-4 shadow-xl animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="flex items-center justify-between border-b border-[#E7DED1]/60 pb-2 mb-3">
                    <span className="font-serif font-bold text-sm">Notifications</span>
                    <button className="text-[10px] uppercase font-bold tracking-wider text-[#C8A96A] hover:underline">Mark all read</button>
                  </div>
                  <div className="space-y-3">
                    {notifications.map((n) => (
                      <div key={n.id} className="group relative rounded-lg p-2 hover:bg-[#F8F5EF] transition-colors">
                        <h4 className="text-xs font-semibold text-[#1D1A16]">{n.title}</h4>
                        <p className="text-[11px] text-[#6B6257] mt-0.5">{n.body}</p>
                        <span className="text-[9px] text-[#C8A96A] mt-1 block">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dashboards Toggle / Login / Sign Up */}
            <Link
              href="/login"
              className="text-xs font-semibold uppercase tracking-widest text-[#6B6257] hover:text-[#1D1A16] transition-colors"
            >
              Sign In
            </Link>

            <Link
              href="/role-selection"
              className="group relative flex items-center gap-1.5 overflow-hidden rounded-full bg-[#1D1A16] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-[#C8A96A]"
            >
              <User className="h-3.5 w-3.5" />
              <span>Join Now</span>
            </Link>
          </div>

          {/* Mobile hamburger menu */}
          <div className="flex items-center gap-4 md:hidden">
            {/* Bell on Mobile */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-[#6B6257]"
              aria-label="View notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#C8A96A]" />
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-lg p-2 text-[#1D1A16] hover:bg-[#E7DED1]/50 transition-colors"
              aria-label="Toggle Navigation menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-[#E7DED1] bg-[#F8F5EF] px-4 py-6 shadow-lg animate-in slide-in-from-top duration-300">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "text-xs font-bold uppercase tracking-widest py-2 px-3 rounded-lg transition-colors",
                    isActive ? "bg-[#C8A96A] text-white" : "text-[#6B6257] hover:bg-[#E7DED1]/40"
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
            <div className="mt-4 border-t border-[#E7DED1]/60 pt-4 flex flex-col gap-3">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="text-center text-xs font-bold uppercase tracking-widest py-3 border border-[#1D1A16] rounded-full text-[#1D1A16]"
              >
                Sign In
              </Link>
              <Link
                href="/role-selection"
                onClick={() => setIsOpen(false)}
                className="text-center text-xs font-bold uppercase tracking-widest py-3 bg-[#1D1A16] rounded-full text-white"
              >
                Join Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
