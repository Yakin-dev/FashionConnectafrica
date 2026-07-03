"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import Image from "next/image"
import {
  User,
  LayoutDashboard,
  Settings,
  Bell,
  LogOut,
  ChevronDown,
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"

const ROLE_DASHBOARD: Record<string, string> = {
  MODEL: "/dashboard/model",
  AGENCY: "/dashboard/agency",
  CLIENT: "/dashboard/client",
  ADMIN: "/dashboard/admin",
  MARKETPLACE_PROVIDER: "/marketplace",
}

const ROLE_LABEL: Record<string, string> = {
  MODEL: "Model",
  AGENCY: "Agency",
  CLIENT: "Client",
  ADMIN: "Admin",
  MARKETPLACE_PROVIDER: "Provider",
}

export function UserDropdown() {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onOutside)
    return () => document.removeEventListener("mousedown", onOutside)
  }, [])

  if (!user) return null

  const name = user.name ?? "User"
  const email = user.email ?? ""
  const role = user.role ?? "MODEL"
  const avatar = user.avatarUrl ?? undefined
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const dashboardHref = ROLE_DASHBOARD[role] ?? "/"

  async function handleSignOut() {
    setOpen(false)
    await signOut()
  }

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full px-2 py-1.5 hover:bg-[#E7DED1]/50 transition-colors"
        aria-label="Account menu"
      >
        <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-[#C8A96A]/40 bg-[#E7DED1] flex items-center justify-center flex-shrink-0">
          {avatar ? (
            <Image src={avatar} alt={name} width={32} height={32} className="object-cover w-full h-full" />
          ) : (
            <span className="text-[10px] font-bold text-[#6B6257]">{initials}</span>
          )}
        </div>
        <ChevronDown
          className={cn("h-3.5 w-3.5 text-[#6B6257] transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-[#E7DED1] bg-white shadow-2xl overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-4 bg-gradient-to-br from-[#F8F5EF] to-white border-b border-[#E7DED1]">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-[#C8A96A]/40 bg-[#E7DED1] flex items-center justify-center flex-shrink-0">
                {avatar ? (
                  <Image src={avatar} alt={name} width={48} height={48} className="object-cover w-full h-full" />
                ) : (
                  <span className="text-sm font-bold text-[#6B6257]">{initials}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-[#1D1A16] truncate">{name}</p>
                <p className="text-[11px] text-[#6B6257] truncate">{email}</p>
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-[#C8A96A]/15 text-[9px] font-bold uppercase tracking-wider text-[#C8A96A]">
                  {role === "ADMIN" && <Shield className="h-2.5 w-2.5" />}
                  {ROLE_LABEL[role] ?? role}
                </span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="py-2">
            <DropdownLink href={dashboardHref} icon={LayoutDashboard} label="Dashboard" onClick={() => setOpen(false)} />
            <DropdownLink href="/notifications" icon={Bell} label="Notifications" onClick={() => setOpen(false)} />
            <DropdownLink href="/settings/profile" icon={User} label="Profile Settings" onClick={() => setOpen(false)} />
            <DropdownLink href="/settings/account" icon={Settings} label="Account Settings" onClick={() => setOpen(false)} />
          </nav>

          {/* Footer */}
          <div className="border-t border-[#E7DED1] py-2">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs font-semibold uppercase tracking-wider">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function DropdownLink({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href: string
  icon: React.ElementType
  label: string
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F8F5EF] transition-colors group"
    >
      <Icon className="h-4 w-4 text-[#6B6257] group-hover:text-[#C8A96A] transition-colors flex-shrink-0" />
      <span className="text-xs font-semibold uppercase tracking-wider text-[#1D1A16] group-hover:text-[#C8A96A] transition-colors">
        {label}
      </span>
    </Link>
  )
}
