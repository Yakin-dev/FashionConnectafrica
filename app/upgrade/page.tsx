"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { CheckCircle2, Loader2, Sparkles, Smartphone, AlertCircle, ArrowRight, Shield, Crown } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

const PLANS = {
  FREE: {
    id: "free",
    name: "Free",
    monthly: 0,
    annual: 0,
    monthlyLabel: "RWF 0",
    annualLabel: "RWF 0",
    description: "Build your business presence and explore the platform with essential tools.",
    benefits: [
      "Basic business profile",
      "Standard directory listing",
      "Limited opportunity access",
      "Limited account activity",
    ],
    cta: "Current Plan",
    featured: false,
  },
  PRO: {
    id: "pro_monthly",
    idAnnual: "pro_annual",
    name: "Pro",
    monthly: 15000,
    annual: 171000,
    monthlyLabel: "RWF 15,000",
    annualLabel: "RWF 171,000",
    monthlyPerYear: "RWF 180,000",
    description: "Build a stronger professional presence, publish more work, and increase discoverability.",
    benefits: [
      "Expanded business profile",
      "Portfolio image uploads",
      "More directory visibility",
      "More casting activity",
      "Basic analytics",
      "Pro badge",
      "Standard support",
    ],
    cta: "Upgrade to Pro",
    featured: false,
  },
  ULTIMATE: {
    id: "ultimate_monthly",
    idAnnual: "ultimate_annual",
    name: "Ultimate",
    monthly: 30000,
    annual: 342000,
    monthlyLabel: "RWF 30,000",
    annualLabel: "RWF 342,000",
    monthlyPerYear: "RWF 360,000",
    description: "Designed for established fashion businesses that need priority visibility, larger portfolios, and stronger market presence.",
    benefits: [
      "Highest directory ranking",
      "Featured business badge",
      "Expanded portfolio capacity",
      "Priority featured placement",
      "Advanced listing analytics",
      "Priority support",
      "Eligibility for homepage spotlight",
    ],
    cta: "Upgrade to Ultimate",
    featured: true,
  },
} as const

function UpgradePageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [annual, setAnnual] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reason = searchParams.get("reason")
  const reasonMessages: Record<string, string> = {
    model_profile_limit: "You have reached the 1-model limit on the Free plan. Upgrade to Pro to manage up to 10 represented model profiles.",
    portfolio_upload_limit: "Portfolio media is available with Pro or Ultimate. Upgrade to publish your work and attract stronger inquiries.",
    casting_limit: "You have reached your active opportunity limit. Upgrade to Pro to publish more casting opportunities.",
  }
  const contextualMessage = reason ? reasonMessages[reason] : null

  function formatRWF(amount: number) {
    return `RWF ${amount.toLocaleString("en-RW")}`
  }

  async function handleSubscribe(planId: string) {
    if (!user) {
      router.push(`/login?callbackUrl=/upgrade${reason ? `?reason=${reason}` : ""}`)
      return
    }

    setLoading(planId)
    setError(null)

    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Something went wrong")
        setLoading(null)
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setError("Failed to start subscription. Please try again.")
      setLoading(null)
    }
  }

  return (
    <main className="min-h-screen bg-[#F8F5EF]">
      {/* Mini Nav */}
      <nav className="border-b border-[#E7DED1]/70 bg-[#F8F5EF]/85 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/logo.jpeg" alt="FashionConnect.Africa" width={36} height={36} className="rounded-full object-cover ring-2 ring-[#C8A96A]/30" />
              <span className="font-serif text-lg font-bold tracking-wider uppercase text-[#1D1A16]">
                FashionConnect<span className="text-[#C8A96A]">.Africa</span>
              </span>
            </Link>
            <Link
              href={user ? "/dashboard/agency" : "/login"}
              className="text-xs font-bold uppercase tracking-widest text-[#6B6257] hover:text-[#1D1A16] transition-colors"
            >
              {user ? "Dashboard" : "Sign In"}
            </Link>
          </div>
        </div>
      </nav>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C8A96A]/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#C8A96A] mb-5">
            <Sparkles className="h-3.5 w-3.5" />
            Choose Your Plan
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1D1A16] uppercase leading-tight mb-4">
            Grow Your Fashion<br /><span className="text-[#C8A96A]">Business Presence</span>
          </h1>
          <p className="text-sm text-[#6B6257] max-w-xl mx-auto leading-relaxed">
            Choose a plan that fits your business. All plans include a professional profile.
            Upgrade anytime to unlock more features.
          </p>

          {/* Contextual message */}
          {contextualMessage && (
            <div className="mt-6 max-w-lg mx-auto rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-800 text-left flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
              {contextualMessage}
            </div>
          )}

          {/* Important note */}
          <div className="mt-4 max-w-lg mx-auto rounded-xl bg-[#F8F5EF] border border-[#E7DED1] p-3 text-[10px] text-[#6B6257] text-left flex items-start gap-2">
            <Shield className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[#C8A96A]" />
            Featured visibility helps your business appear more prominently to potential clients and partners. It does not guarantee bookings, selections, contracts, or income.
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-6 max-w-md mx-auto rounded-xl bg-red-50 border border-red-200 p-3.5 text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          {/* Annual toggle */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <span className={`text-sm font-bold uppercase tracking-widest ${!annual ? "text-[#1D1A16]" : "text-[#6B6257]"}`}>
              Monthly
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-14 h-7 rounded-full transition-colors ${annual ? "bg-[#C8A96A]" : "bg-[#E7DED1]"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${annual ? "translate-x-7" : ""}`} />
            </button>
            <span className={`text-sm font-bold uppercase tracking-widest ${annual ? "text-[#1D1A16]" : "text-[#6B6257]"}`}>
              Annual <span className="text-[#C8A96A] text-[10px]">Save 5%</span>
            </span>
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="rounded-3xl border-2 border-[#E7DED1] p-8 bg-white flex flex-col">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#6B6257] mb-1">Free</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="font-serif text-3xl font-bold text-[#1D1A16]">RWF 0</span>
              </div>
              <p className="text-[10px] text-[#6B6257] mb-6 leading-relaxed">{PLANS.FREE.description}</p>
              <ul className="space-y-3 mb-8 flex-1">
                {PLANS.FREE.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-[11px] text-[#6B6257]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#C8A96A] shrink-0 mt-0.5" />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="rounded-full border border-[#E7DED1] py-3 text-center text-[10px] font-bold uppercase tracking-widest text-[#6B6257]">
                Current Plan
              </div>
            </div>

            {/* Pro */}
            <div className="rounded-3xl border-2 border-[#E7DED1] p-8 bg-white flex flex-col relative">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#6B6257] mb-1">Pro</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-serif text-3xl font-bold text-[#1D1A16]">
                  {annual ? formatRWF(PLANS.PRO.annual) : formatRWF(PLANS.PRO.monthly)}
                </span>
                <span className="text-xs text-[#6B6257]">{annual ? "/year" : "/month"}</span>
              </div>
              {annual && (
                <p className="text-[10px] text-emerald-600 mb-1">
                  {formatRWF(14250)}/month — save 5% vs monthly ({formatRWF(PLANS.PRO.monthly * 12)}/yr)
                </p>
              )}
              <p className="text-[10px] text-[#6B6257] mb-6 leading-relaxed">{PLANS.PRO.description}</p>
              <ul className="space-y-3 mb-8 flex-1">
                {PLANS.PRO.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-[11px] text-[#6B6257]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#C8A96A] shrink-0 mt-0.5" />
                    {b}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(annual ? "pro_annual" : "pro_monthly")}
                disabled={loading !== null}
                className="w-full rounded-full bg-[#1D1A16] py-3.5 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading === (annual ? "pro_annual" : "pro_monthly") ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing...</>
                ) : (
                  <>{annual ? "Subscribe Annual" : "Subscribe Monthly"} <ArrowRight className="h-3.5 w-3.5" /></>
                )}
              </button>
              <div className="flex items-center gap-2 mt-3 text-[9px] text-[#6B6257] justify-center">
                <Smartphone className="h-3 w-3 text-[#C8A96A]" />
                MTN MoMo · Card
              </div>
            </div>

            {/* Ultimate */}
            <div className="rounded-3xl border-2 border-[#C8A96A] p-8 bg-white flex flex-col relative shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#C8A96A] px-4 py-1 text-[9px] font-bold uppercase tracking-widest text-[#11100E]">
                  <Crown className="h-3 w-3" /> Best Value
                </span>
              </div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#C8A96A] mb-1 mt-2">Ultimate</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-serif text-3xl font-bold text-[#1D1A16]">
                  {annual ? formatRWF(PLANS.ULTIMATE.annual) : formatRWF(PLANS.ULTIMATE.monthly)}
                </span>
                <span className="text-xs text-[#6B6257]">{annual ? "/year" : "/month"}</span>
              </div>
              {annual && (
                <p className="text-[10px] text-emerald-600 mb-1">
                  {formatRWF(28500)}/month — save 5% vs monthly ({formatRWF(PLANS.ULTIMATE.monthly * 12)}/yr)
                </p>
              )}
              <p className="text-[10px] text-[#6B6257] mb-6 leading-relaxed">{PLANS.ULTIMATE.description}</p>
              <ul className="space-y-3 mb-8 flex-1">
                {PLANS.ULTIMATE.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-[11px] text-[#6B6257]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#C8A96A] shrink-0 mt-0.5" />
                    {b}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(annual ? "ultimate_annual" : "ultimate_monthly")}
                disabled={loading !== null}
                className="w-full rounded-full bg-[#C8A96A] py-3.5 text-[10px] font-bold uppercase tracking-widest text-[#11100E] hover:bg-[#BCA062] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading === (annual ? "ultimate_annual" : "ultimate_monthly") ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing...</>
                ) : (
                  <>{annual ? "Subscribe Annual" : "Subscribe Monthly"} <ArrowRight className="h-3.5 w-3.5" /></>
                )}
              </button>
              <div className="flex items-center gap-2 mt-3 text-[9px] text-[#6B6257] justify-center">
                <Smartphone className="h-3 w-3 text-[#C8A96A]" />
                MTN MoMo · Card
              </div>
            </div>
          </div>

          <p className="text-center text-[10px] text-[#9B9189] mt-8 max-w-md mx-auto">
            By subscribing, you agree to our <Link href="/terms" className="underline hover:text-[#C8A96A]">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-[#C8A96A]">Privacy Policy</Link>. You can cancel anytime.
          </p>
        </div>
      </section>
    </main>
  )
}

export default function UpgradePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F8F5EF]"><Loader2 className="h-8 w-8 animate-spin text-[#C8A96A]" /></div>}>
      <UpgradePageInner />
    </Suspense>
  )
}
