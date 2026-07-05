"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Loader2, Lock } from "lucide-react"
import Link from "next/link"
import { requiresSubscription } from "@/lib/subscription"

interface SubscriptionGuardProps {
  children: React.ReactNode
  intent?: string | null
}

export function SubscriptionGuard({ children, intent }: SubscriptionGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    // If not a professional intent, allow through
    if (intent && !requiresSubscription(intent)) {
      setSubscribed(true)
      setChecking(false)
      return
    }

    // Check subscription status
    fetch("/api/payments/subscription-status")
      .then((r) => r.json())
      .then((data) => {
        setSubscribed(data.subscribed ?? false)
      })
      .catch(() => {
        setSubscribed(false)
      })
      .finally(() => {
        setChecking(false)
      })
  }, [intent])

  if (isLoading || checking) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#C8A96A]" />
      </div>
    )
  }

  if (!subscribed && intent && requiresSubscription(intent)) {
    return (
      <div className="flex items-center justify-center py-20 px-4">
        <div className="max-w-md text-center bg-white rounded-3xl border border-[#E7DED1] p-10 shadow-sm">
          <div className="mx-auto w-14 h-14 rounded-full bg-[#F8F5EF] border border-[#E7DED1] flex items-center justify-center mb-5">
            <Lock className="h-6 w-6 text-[#C8A96A]" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[#1D1A16] uppercase mb-3">
            Subscription Required
          </h2>
          <p className="text-sm text-[#6B6257] mb-6 leading-relaxed">
            To showcase your work and access professional features, you need an active subscription.
            Choose a plan that works for you.
          </p>
          <Link
            href="/upgrade"
            className="inline-flex items-center gap-2 rounded-full bg-[#1D1A16] px-7 py-3.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] transition-all"
          >
            View Plans
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
