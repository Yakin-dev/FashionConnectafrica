"use client"

// Client component — data is fetched client-side
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import { Loader2, CheckCircle2, XCircle, Clock, Banknote, ArrowRight, AlertCircle } from "lucide-react"
import Link from "next/link"

interface Payment {
  id: string
  plan: string
  amount: number
  amountPaid: number
  status: "PENDING" | "APPROVED" | "REJECTED"
  senderName: string
  senderPhone: string
  transactionId: string | null
  adminNote: string | null
  createdAt: string
  approvedAt: string | null
  rejectedAt: string | null
}

const STATUS_BADGE: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: {
    label: "Pending Verification",
    color: "bg-amber-100 text-amber-700 border-amber-300",
    icon: Clock,
  },
  APPROVED: {
    label: "Approved",
    color: "bg-emerald-100 text-emerald-700 border-emerald-300",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    color: "bg-red-100 text-red-700 border-red-300",
    icon: XCircle,
  },
}

export default function PaymentsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.push("/login?callbackUrl=/payments")
      return
    }

    const fetchPayments = async () => {
      try {
        const res = await fetch("/api/payments/manual")
        if (res.ok) {
          const data = await res.json()
          setPayments(data.payments ?? [])
        }
      } catch { /* silent */ }
      finally { setLoading(false) }
    }

    void fetchPayments()
  }, [user, isLoading, router])

  const lastPayment = payments[0]

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#F8F5EF] py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C8A96A]/10 border border-[#C8A96A]/30 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#C8A96A] mb-4">
              <Banknote className="h-3.5 w-3.5" /> Payment History
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold uppercase text-[#1D1A16]">My Payments</h1>
            <p className="text-sm text-[#6B6257] mt-2">Track your subscription payments and verification status.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-24 text-[#6B6257]">
              <Loader2 className="h-5 w-5 animate-spin text-[#C8A96A]" />
              <span className="text-sm">Loading payments...</span>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-16">
              <Banknote className="h-12 w-12 text-[#C8A96A] mx-auto mb-4" />
              <h3 className="font-serif text-lg font-bold uppercase text-[#1D1A16] mb-2">No Payments Yet</h3>
              <p className="text-sm text-[#6B6257] mb-6">You haven't submitted any subscription payments yet.</p>
              <Link
                href="/upgrade"
                className="inline-flex items-center gap-2 rounded-full bg-[#1D1A16] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] transition-colors"
              >
                View Plans <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Latest payment status card */}
              {lastPayment && (
                <div className={`rounded-2xl border-2 p-6 ${STATUS_BADGE[lastPayment.status].color}`}>
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-white/80">
                      {(() => {
                        const Icon = STATUS_BADGE[lastPayment.status].icon
                        return <Icon className="h-6 w-6" />
                      })()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm uppercase tracking-widest">
                        {STATUS_BADGE[lastPayment.status].label}
                      </h3>
                      <p className="text-xs mt-1 opacity-80">
                        {lastPayment.status === "PENDING" && "Your payment is waiting for manual verification by an administrator. This usually takes 1-24 hours."}
                        {lastPayment.status === "APPROVED" && "Your payment has been verified successfully. Your subscription is now active."}
                        {lastPayment.status === "REJECTED" && lastPayment.adminNote && (
                          <>Reason: {lastPayment.adminNote}</>
                        )}
                      </p>
                      {lastPayment.status === "REJECTED" && (
                        <Link
                          href="/upgrade"
                          className="inline-flex items-center gap-1 mt-3 rounded-full bg-white/80 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-red-700 hover:bg-white transition-colors"
                        >
                          Submit New Payment <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* All payments table */}
              <div className="bg-white rounded-2xl border border-[#E7DED1] shadow-sm overflow-hidden">
                <div className="p-5 border-b border-[#E7DED1]/70">
                  <h3 className="font-serif text-base font-bold uppercase tracking-widest text-[#1D1A16]">
                    Payment History ({payments.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#E7DED1] text-[9px] uppercase font-bold tracking-widest text-[#6B6257]">
                        <th className="p-4">Date</th>
                        <th className="p-4">Plan</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Sender</th>
                        <th className="p-4">Transaction ID</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7DED1]/50">
                      {payments.map((p) => {
                        const badge = STATUS_BADGE[p.status]
                        const Icon = badge.icon
                        return (
                          <tr key={p.id} className="hover:bg-[#F8F5EF]/50 transition-colors">
                            <td className="p-4 text-[#6B6257]">
                              {new Date(p.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4 font-bold text-[#1D1A16] uppercase">
                              {p.plan.replace(/_/g, " ")}
                            </td>
                            <td className="p-4 text-[#6B6257]">
                              RWF {p.amountPaid.toLocaleString()}
                            </td>
                            <td className="p-4">
                              <span className="block text-[#1D1A16]">{p.senderName}</span>
                              <span className="text-[9px] text-[#6B6257]">{p.senderPhone}</span>
                            </td>
                            <td className="p-4 text-[#6B6257] text-[10px]">
                              {p.transactionId || "—"}
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                p.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                                p.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" :
                                "bg-red-100 text-red-700"
                              }`}>
                                <Icon className="h-2.5 w-2.5" />
                                {badge.label}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {lastPayment?.status === "REJECTED" && lastPayment.adminNote && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-red-800 uppercase tracking-wider">Admin Note</p>
                      <p className="text-xs text-red-700 mt-1">{lastPayment.adminNote}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
