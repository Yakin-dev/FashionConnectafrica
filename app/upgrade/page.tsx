"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Loader2, Sparkles, AlertCircle, ArrowRight, ArrowLeft, Shield, Crown, Copy, Check, Smartphone, X, Banknote, Upload } from "lucide-react"
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
    cta: "Subscribe with MTN MoMo",
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
    cta: "Subscribe with MTN MoMo",
    featured: true,
  },
} as const

type PlanKey = "pro_monthly" | "pro_annual" | "ultimate_monthly" | "ultimate_annual"

const PLAN_DETAILS: Record<PlanKey, { label: string; amount: number; tier: string }> = {
  pro_monthly: { label: "Pro Monthly", amount: 15000, tier: "PRO" },
  pro_annual: { label: "Pro Annual", amount: 171000, tier: "PRO" },
  ultimate_monthly: { label: "Ultimate Monthly", amount: 30000, tier: "ULTIMATE" },
  ultimate_annual: { label: "Ultimate Annual", amount: 342000, tier: "ULTIMATE" },
}

function UpgradePageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, refreshUser } = useAuth()
  const [annual, setAnnual] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Payment modal state
  const [paymentModal, setPaymentModal] = useState<{ plan: PlanKey; tierName: string } | null>(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [senderName, setSenderName] = useState("")
  const [senderPhone, setSenderPhone] = useState("")
  const [transactionId, setTransactionId] = useState("")
  const [amountPaid, setAmountPaid] = useState("")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  // Screenshot upload
  const [screenshotUrl, setScreenshotUrl] = useState("")
  const [screenshotUploading, setScreenshotUploading] = useState(false)

  const reason = searchParams.get("reason")
  const reasonMessages: Record<string, string> = {
    model_profile_limit: "You have reached the 1-model limit on the Free plan. Upgrade to Pro to manage up to 10 represented model profiles.",
    portfolio_upload_limit: "Portfolio media is available with Pro or Ultimate. Upgrade to publish your work and attract stronger inquiries.",
    casting_limit: "You have reached your active opportunity limit. Upgrade to Pro to publish more casting opportunities.",
  }
  const contextualMessage = reason ? reasonMessages[reason] : null

  const copyNumber = () => {
    navigator.clipboard.writeText("0790305483")
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  function formatRWF(amount: number) {
    return `RWF ${amount.toLocaleString("en-RW")}`
  }

  function openPaymentModal(tierName: string, isAnnual: boolean) {
    const planKey: PlanKey = isAnnual
      ? (tierName === "Pro" ? "pro_annual" : "ultimate_annual")
      : (tierName === "Pro" ? "pro_monthly" : "ultimate_monthly")

    setPaymentModal({ plan: planKey, tierName })
    setSenderName(user?.name || "")
    setSenderPhone("")
    setTransactionId("")
    setAmountPaid(String(PLAN_DETAILS[planKey].amount))
    setNotes("")
    setSubmitSuccess(false)
    setSubmitError(null)
    setShowPaymentForm(false)
    setScreenshotUrl("")
  }

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setSubmitError("Only JPEG, PNG, WebP images are allowed")
      return
    }
    setScreenshotUploading(true)
    setSubmitError(null)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")
      setScreenshotUrl(data.url)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Screenshot upload failed")
    } finally {
      setScreenshotUploading(false)
    }
  }

  async function handleSubmitPayment() {
    if (!paymentModal) return
    setSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch("/api/payments/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: paymentModal.plan,
          senderName,
          senderPhone,
          transactionId: transactionId || undefined,
          amountPaid: Number(amountPaid),
          screenshotUrl: screenshotUrl || undefined,
          notes: notes || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setSubmitError(data.error || "Failed to submit payment")
        setSubmitting(false)
        return
      }

      setSubmitSuccess(true)
      setSubmitting(false)
    } catch {
      setSubmitError("Network error. Please try again.")
      setSubmitting(false)
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
            Choose a plan that fits your business. Pay securely via MTN Mobile Money.
            Your subscription will be activated after manual verification.
          </p>

          {contextualMessage && (
            <div className="mt-6 max-w-lg mx-auto rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-800 text-left flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
              {contextualMessage}
            </div>
          )}

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
                onClick={() => openPaymentModal("Pro", annual)}
                className="w-full rounded-full bg-[#1D1A16] py-3.5 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] transition-all flex items-center justify-center gap-2"
              >
                <Smartphone className="h-3.5 w-3.5" />
                {annual ? "Subscribe Annual" : "Subscribe Monthly"}
              </button>
              <div className="flex items-center gap-2 mt-3 text-[9px] text-[#6B6257] justify-center">
                <Smartphone className="h-3 w-3 text-[#C8A96A]" />
                MTN MoMo Only
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
                onClick={() => openPaymentModal("Ultimate", annual)}
                className="w-full rounded-full bg-[#C8A96A] py-3.5 text-[10px] font-bold uppercase tracking-widest text-[#11100E] hover:bg-[#BCA062] transition-all flex items-center justify-center gap-2"
              >
                <Smartphone className="h-3.5 w-3.5" />
                {annual ? "Subscribe Annual" : "Subscribe Monthly"}
              </button>
              <div className="flex items-center gap-2 mt-3 text-[9px] text-[#6B6257] justify-center">
                <Smartphone className="h-3 w-3 text-[#C8A96A]" />
                MTN MoMo Only
              </div>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="mt-12 max-w-xl mx-auto bg-white rounded-3xl border-2 border-[#E7DED1] p-8">
            <div className="text-center mb-6">
              <Banknote className="h-8 w-8 text-[#C8A96A] mx-auto mb-2" />
              <h3 className="font-serif text-lg font-bold uppercase tracking-widest text-[#1D1A16]">How to Pay</h3>
              <p className="text-xs text-[#6B6257] mt-1">Follow these steps to complete your subscription</p>
            </div>
            <ol className="space-y-3 text-sm text-[#6B6257]">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#1D1A16] text-white text-[11px] font-bold flex items-center justify-center shrink-0">1</span>
                <span>Choose your plan above and click <strong className="text-[#1D1A16]">Subscribe with MTN MoMo</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#1D1A16] text-white text-[11px] font-bold flex items-center justify-center shrink-0">2</span>
                <span>Send the exact amount to <strong className="text-[#1D1A16]">0790305483</strong> (UNITY FASHION MANAGEMENT Ltd) via MTN Mobile Money</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#1D1A16] text-white text-[11px] font-bold flex items-center justify-center shrink-0">3</span>
                <span>Fill in the payment details form with your sender name, phone number, and transaction reference</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#1D1A16] text-white text-[11px] font-bold flex items-center justify-center shrink-0">4</span>
                <span>Wait for admin verification — you'll be notified once your payment is approved</span>
              </li>
            </ol>
          </div>

          <p className="text-center text-[10px] text-[#9B9189] mt-8 max-w-md mx-auto">
            By subscribing, you agree to our <Link href="/terms" className="underline hover:text-[#C8A96A]">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-[#C8A96A]">Privacy Policy</Link>.
          </p>
        </div>
      </section>

      {/* Payment Confirmation Modal — Step 1: Show payment card */}
      <AnimatePresence>
        {paymentModal && !showPaymentForm && !submitSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm mx-auto bg-white rounded-3xl border border-[#E7DED1] shadow-2xl overflow-hidden"
            >
              <div className="bg-[#1D1A16] p-5 text-center relative">
                <button
                  onClick={() => { setPaymentModal(null); setShowPaymentForm(false); setSubmitError(null); }}
                  className="absolute top-3 right-3 rounded-full p-1 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                <Smartphone className="h-8 w-8 text-[#C8A96A] mx-auto mb-1" />
                <h3 className="font-bold text-sm uppercase tracking-widest text-white">MTN Mobile Money</h3>
                <p className="text-[10px] text-white/50 mt-0.5">{paymentModal.tierName} Plan</p>
              </div>

              <div className="p-6 space-y-5">
                {/* Payment Card Body */}
                <div className="bg-[#F8F5EF] rounded-2xl border border-[#E7DED1] p-5 space-y-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257]">Send To</p>
                      <p className="text-xs font-bold text-[#1D1A16] mt-0.5">1780513</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257]">Account</p>
                      <p className="text-xs font-bold text-[#1D1A16] mt-0.5">UNITY FASHION MANAGEMENT Ltd</p>
                    </div>
                    <div className="flex justify-between items-center border-t border-[#E7DED1] pt-3">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257]">Amount</p>
                      <p className="font-bold text-sm text-[#1D1A16]">{formatRWF(PLAN_DETAILS[paymentModal.plan].amount)}</p>
                    </div>
                  </div>

                  <button
                    onClick={copyNumber}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#E7DED1] bg-white py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#C8A96A] hover:bg-[#F8F5EF] transition-colors"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Number Copied" : "Copy Number"}
                  </button>
                </div>

                <button
                  onClick={() => setShowPaymentForm(true)}
                  className="w-full rounded-full bg-[#1D1A16] py-3.5 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  I've Made the Payment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Confirmation Modal — Step 2: Show form after user clicks "I've Made the Payment" */}
      <AnimatePresence>
        {paymentModal && showPaymentForm && !submitSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm mx-auto bg-white rounded-3xl border border-[#E7DED1] shadow-2xl overflow-auto max-h-[90vh]"
            >
              <div className="bg-[#1D1A16] p-4 text-center relative">
                <button
                  onClick={() => setShowPaymentForm(false)}
                  className="absolute top-3 left-3 rounded-full p-1 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <h3 className="font-bold text-xs uppercase tracking-widest text-white">Confirm Payment</h3>
                <p className="text-[9px] text-white/50 mt-0.5">{paymentModal.tierName} — {formatRWF(PLAN_DETAILS[paymentModal.plan].amount)}</p>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] block mb-1.5">Sender Name *</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full rounded-xl border border-[#E7DED1] bg-[#F8F5EF]/50 px-4 py-2.5 text-xs text-[#1D1A16] focus:outline-none focus:border-[#C8A96A] focus:bg-white transition-colors"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] block mb-1.5">Phone Number Used *</label>
                  <input
                    type="tel"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    className="w-full rounded-xl border border-[#E7DED1] bg-[#F8F5EF]/50 px-4 py-2.5 text-xs text-[#1D1A16] focus:outline-none focus:border-[#C8A96A] focus:bg-white transition-colors"
                    placeholder="0790305483"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] block mb-1.5">Transaction ID (optional)</label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full rounded-xl border border-[#E7DED1] bg-[#F8F5EF]/50 px-4 py-2.5 text-xs text-[#1D1A16] focus:outline-none focus:border-[#C8A96A] focus:bg-white transition-colors"
                    placeholder="MTN MoMo reference"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] block mb-1.5">Amount Paid *</label>
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    className="w-full rounded-xl border border-[#E7DED1] bg-[#F8F5EF]/50 px-4 py-2.5 text-xs text-[#1D1A16] focus:outline-none focus:border-[#C8A96A] focus:bg-white transition-colors"
                  />
                </div>

                {/* Screenshot Upload */}
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] block mb-1.5">Payment Screenshot (optional)</label>
                  <div className="border-2 border-dashed border-[#E7DED1] rounded-xl p-4 text-center hover:border-[#C8A96A] transition-colors">
                    {screenshotUrl ? (
                      <div className="space-y-2">
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-[#F8F5EF] border border-[#E7DED1]">
                          <img src={screenshotUrl} alt="Payment screenshot" className="object-contain w-full h-full" />
                        </div>
                        <button
                          onClick={() => setScreenshotUrl("")}
                          className="text-[9px] text-rose-600 font-bold uppercase tracking-widest hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center gap-2">
                        {screenshotUploading ? (
                          <Loader2 className="h-8 w-8 animate-spin text-[#C8A96A]" />
                        ) : (
                          <>
                            <Upload className="h-6 w-6 text-[#C8A96A]" />
                            <span className="text-[10px] font-bold text-[#6B6257] uppercase tracking-wider">
                              Upload screenshot
                            </span>
                            <span className="text-[8px] text-[#9B9189]">JPEG, PNG, WebP</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleScreenshotUpload}
                          className="hidden"
                          disabled={screenshotUploading}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] block mb-1.5">Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-[#E7DED1] bg-[#F8F5EF]/50 px-4 py-2.5 text-xs text-[#1D1A16] focus:outline-none focus:border-[#C8A96A] focus:bg-white transition-colors resize-none"
                    placeholder="Any additional info..."
                  />
                </div>

                {submitError && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-[10px] text-red-600">{submitError}</div>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setShowPaymentForm(false)}
                    className="flex-1 rounded-full border border-[#E7DED1] py-2.5 text-[9px] font-bold uppercase tracking-widest text-[#6B6257] hover:bg-[#F8F5EF] transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmitPayment}
                    disabled={submitting || !senderName || !senderPhone || !amountPaid}
                    className="flex-1 rounded-full bg-[#1D1A16] py-2.5 text-[9px] font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
                    {submitting ? "Sending..." : "Submit Payment"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Success Modal */}
      <AnimatePresence>
        {submitSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm mx-auto bg-white rounded-3xl border border-[#E7DED1] shadow-2xl overflow-hidden p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
              >
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="font-serif text-lg font-bold uppercase text-[#1D1A16] mb-2">Payment Submitted!</h3>
              <p className="text-xs text-[#6B6257] mb-6 leading-relaxed">
                Your {paymentModal?.tierName} subscription payment is pending verification.
                We'll notify you once approved.
              </p>
              <div className="flex gap-3 justify-center">
                <Link
                  href="/payments"
                  onClick={() => { setPaymentModal(null); setShowPaymentForm(false); setSubmitSuccess(false); }}
                  className="rounded-full bg-[#1D1A16] px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] transition-colors"
                >
                  Track Status
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
