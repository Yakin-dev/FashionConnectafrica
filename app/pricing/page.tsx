"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { CheckCircle2, Loader2, Sparkles, Smartphone, CreditCard, ArrowRight, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

const BENEFITS = [
  "Showcase your portfolio to top agencies and brands",
  "Get featured in Kigali's fashion directory",
  "Apply for exclusive casting calls and opportunities",
  "Access detailed profile analytics and insights",
  "Priority support and dedicated account management",
  "List your creative services in the marketplace",
]

function PaymentSuccess() {
  const router = useRouter()

  return (
    <div className="text-center py-8">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
      >
        <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-5" />
      </motion.div>
      <h2 className="font-serif text-2xl font-bold text-[#1D1A16] uppercase mb-3">
        Payment Successful!
      </h2>
      <p className="text-sm text-[#6B6257] mb-6 max-w-sm mx-auto leading-relaxed">
        Your subscription is now active. You can start showcasing your work and connecting with opportunities.
      </p>
      <button
        onClick={() => router.push("/onboarding")}
        className="inline-flex items-center gap-2 rounded-full bg-[#1D1A16] px-7 py-3.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] transition-all"
      >
        Go to Dashboard <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  )
}

function PricingPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [annual, setAnnual] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [paymentVerified, setPaymentVerified] = useState(false)
  const [paymentVerifying, setPaymentVerifying] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  // Read search params outside effect for stable deps
  const successParam = searchParams.get("success")
  const txRefParam = searchParams.get("tx_ref")

  // Handle post-payment redirect
  useEffect(() => {
    if (successParam === "true" && txRefParam) {
      setPaymentVerifying(true)

      fetch(`/api/payments/verify?tx_ref=${encodeURIComponent(txRefParam)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            setPaymentVerified(true)
          } else {
            setPaymentError("Payment could not be verified. Please contact support if you were charged.")
          }
        })
        .catch(() => {
          setPaymentError("Could not verify payment status. Please contact support.")
        })
        .finally(() => {
          setPaymentVerifying(false)
        })
    }
  }, [successParam, txRefParam])

  const monthlyPrice = 15000
  const annualPrice = 150000

  function formatRWF(amount: number) {
    return `RWF ${amount.toLocaleString("en-RW")}`
  }

  async function handleSubscribe(plan: "marketplace_monthly" | "marketplace_annual") {
    if (!user) {
      router.push("/login?callbackUrl=/pricing")
      return
    }

    setLoading(plan)
    setError(null)

    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
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
      {/* Nav */}
      <nav className="border-b border-[#E7DED1]/70 bg-[#F8F5EF]/85 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
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
            <Link
              href={user ? "/dashboard/model" : "/login"}
              className="text-xs font-bold uppercase tracking-widest text-[#6B6257] hover:text-[#1D1A16] transition-colors"
            >
              {user ? "Dashboard" : "Sign In"}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C8A96A]/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#C8A96A] mb-5">
            <Sparkles className="h-3.5 w-3.5" />
            Professional Plan
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1D1A16] uppercase leading-tight mb-4">
            Showcase Your Work<br />
            <span className="text-[#C8A96A]">Grow Your Business</span>
          </h1>
          <p className="text-sm text-[#6B6257] max-w-xl mx-auto leading-relaxed">
            Subscribe to unlock your professional presence on FashionConnect.Africa. 
            Fashion designers, photographers, and creative professionals pay a small monthly fee 
            to showcase their work and connect with opportunities.
          </p>
        </div>
      </section>

      {/* Pricing Toggle */}
      <section className="pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Post-payment verification loading */}
          {paymentVerifying && (
            <div className="mb-6 max-w-md mx-auto rounded-xl bg-[#F8F5EF] border border-[#E7DED1] p-6 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#C8A96A] mx-auto mb-3" />
              <p className="text-sm text-[#6B6257]">Verifying your payment...</p>
            </div>
          )}

          {/* Payment success */}
          {paymentVerified && <PaymentSuccess />}

          {/* Payment verification error */}
          {paymentError && !paymentVerified && (
            <div className="mb-6 max-w-md mx-auto rounded-xl bg-red-50 border border-red-200 p-3.5 text-sm text-red-600 text-center flex items-center gap-2 justify-center">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {paymentError}
            </div>
          )}

          {/* Only show pricing cards when not in post-payment flow */}
          {!paymentVerified && !paymentVerifying && (<>
          {error && (
            <div className="mb-6 max-w-md mx-auto rounded-xl bg-red-50 border border-red-200 p-3.5 text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <span className={`text-sm font-bold uppercase tracking-widest ${!annual ? "text-[#1D1A16]" : "text-[#6B6257]"}`}>
              Monthly
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                annual ? "bg-[#C8A96A]" : "bg-[#E7DED1]"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
                  annual ? "translate-x-7" : ""
                }`}
              />
            </button>
            <span className={`text-sm font-bold uppercase tracking-widest ${annual ? "text-[#1D1A16]" : "text-[#6B6257]"}`}>
              Annual{" "}
              <span className="text-[#C8A96A] text-[10px]">Save ~17%</span>
            </span>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Monthly */}
            <div className={`rounded-3xl border-2 p-8 bg-white transition-all ${
              !annual ? "border-[#C8A96A] shadow-lg" : "border-[#E7DED1]"
            }`}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#6B6257] mb-2">Marketplace Premium</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-serif text-4xl font-bold text-[#1D1A16]">{formatRWF(monthlyPrice)}</span>
                <span className="text-xs text-[#6B6257]">/month</span>
              </div>
              <div className="flex items-center gap-2 mb-4 text-[10px] text-[#6B6257]">
                <Smartphone className="h-3.5 w-3.5 text-[#C8A96A]" />
                <span>MTN MoMo · Airtel Money · Visa · Mastercard</span>
              </div>
              <button
                onClick={() => handleSubscribe("marketplace_monthly")}
                disabled={loading === "marketplace_monthly"}
                className="w-full rounded-full bg-[#1D1A16] py-3.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading === "marketplace_monthly" ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                ) : (
                  "Subscribe Monthly"
                )}
              </button>
            </div>

            {/* Annual (highlighted) */}
            <div className={`rounded-3xl border-2 p-8 bg-white transition-all ${
              annual ? "border-[#C8A96A] shadow-lg" : "border-[#E7DED1]"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#6B6257]">Marketplace Premium</h3>
                <span className="rounded-full bg-[#C8A96A]/20 px-3 py-1 text-[10px] font-bold text-[#C8A96A] uppercase tracking-widest">
                  Best Value
                </span>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-serif text-4xl font-bold text-[#1D1A16]">{formatRWF(annualPrice)}</span>
                <span className="text-xs text-[#6B6257]">/year</span>
              </div>
              <p className="text-[10px] text-[#6B6257] mb-1">
                {formatRWF(12500)}/month — save ~17% vs monthly
              </p>
              <div className="flex items-center gap-2 mb-4 text-[10px] text-[#6B6257]">
                <CreditCard className="h-3.5 w-3.5 text-[#C8A96A]" />
                <span>MTN MoMo · Airtel Money · Visa · Mastercard</span>
              </div>
              <button
                onClick={() => handleSubscribe("marketplace_annual")}
                disabled={loading === "marketplace_annual"}
                className="w-full rounded-full bg-[#C8A96A] py-3.5 text-xs font-bold uppercase tracking-widest text-[#11100E] hover:bg-[#BCA062] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading === "marketplace_annual" ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                ) : (
                  "Subscribe Annually"
                )}
              </button>
            </div>
          </div>

          {/* Benefits */}
          <div className="max-w-2xl mx-auto mt-12">
            <h3 className="font-serif text-lg font-bold text-[#1D1A16] uppercase text-center mb-6">
              What&apos;s Included
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BENEFITS.map((b) => (
                <div key={b} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#C8A96A] shrink-0 mt-0.5" />
                  <span className="text-sm text-[#6B6257]">{b}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-[10px] text-[#9B9189] mt-8 max-w-md mx-auto">
            By subscribing, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-[#C8A96A]">Terms of Service</Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-[#C8A96A]">Privacy Policy</Link>.
            You can cancel anytime. No questions asked.
          </p>
          </>)}
        </div>
      </section>
    </main>
  )
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F8F5EF]">
        <Loader2 className="h-8 w-8 animate-spin text-[#C8A96A]" />
      </div>
    }>
      <PricingPageInner />
    </Suspense>
  )
}
