"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, User } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { UserDropdown } from "@/components/user-dropdown"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user, isLoading } = useAuth()
  const isSignedIn = !!user

  const navLinks = [
    { name: "Models", href: "/models" },
    { name: "Agencies", href: "/agencies" },
    { name: "Castings", href: "/castings" },
    { name: "Marketplace", href: "/marketplace" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  const role = user?.role ?? "MODEL"
  const ROLE_DASHBOARD: Record<string, string> = {
    MODEL: "/dashboard/model",
    AGENCY: "/dashboard/agency",
    CLIENT: "/dashboard/client",
    ADMIN: "/dashboard/admin",
    MARKETPLACE_PROVIDER: "/marketplace",
  }
  const dashboardHref = ROLE_DASHBOARD[role] ?? "/"

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#E7DED1]/70 bg-[#F8F5EF]/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="group flex items-center gap-2.5">
              <Image
                src="/logo.jpeg"
                alt="FashionConnect.Africa"
                width={36}
                height={36}
                className="rounded-full object-cover ring-2 ring-[#C8A96A]/30"
              />
              <span className="font-serif text-lg font-bold tracking-wider uppercase text-[#1D1A16]">
                FashionConnect<span className="text-[#C8A96A]">.Africa</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">

              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href.split("?")[0]))
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
                )
              })}
            </div>
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-5">
            {!isLoading && isSignedIn ? (
              <>
                <Link
                  href={dashboardHref}
                  className="text-xs font-semibold uppercase tracking-widest text-[#6B6257] hover:text-[#1D1A16] transition-colors"
                >
                  Dashboard
                </Link>
                <UserDropdown />
              </>
            ) : (
              <Link
                href="/signup"
                className="flex items-center gap-1.5 overflow-hidden rounded-full bg-[#1D1A16] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] transition-all"
              >
                <User className="h-3.5 w-3.5" />
                <span>Join Now</span>
              </Link>
            )}
          </div>

          {/* Mobile */}
          <div className="flex items-center gap-4 md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-lg p-2 text-[#1D1A16] hover:bg-[#E7DED1]/50 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-[#E7DED1] bg-[#F8F5EF] px-4 py-6 shadow-lg">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
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
              )
            })}
            <div className="mt-4 border-t border-[#E7DED1]/60 pt-4 flex flex-col gap-3">
              {!isLoading && isSignedIn ? (
                <div className="flex items-center justify-between px-2">
                  <Link
                    href={dashboardHref}
                    onClick={() => setIsOpen(false)}
                    className="text-xs font-bold uppercase tracking-widest text-[#1D1A16]"
                  >
                    Dashboard
                  </Link>
                  <UserDropdown />
                </div>
              ) : (
                <Link
                    href="/signup"
                    onClick={() => setIsOpen(false)}
                    className="text-center text-xs font-bold uppercase tracking-widest py-3 bg-[#1D1A16] rounded-full text-white"
                  >
                    Join Now
                  </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
