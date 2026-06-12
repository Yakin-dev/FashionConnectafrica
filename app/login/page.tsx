"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Sparkles, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"
import { GoogleSignInButton } from "@/components/google-sign-in-button"

const ROLE_DASHBOARD: Record<string, string> = {
  MODEL: "/dashboard/model",
  AGENCY: "/dashboard/agency",
  CLIENT: "/dashboard/client",
  ADMIN: "/dashboard/admin",
  MARKETPLACE_PROVIDER: "/marketplace",
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? ""
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = new FormData(e.currentTarget)
    const email = form.get("email") as string
    const password = form.get("password") as string

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Invalid email or password. Please try again.")
      setLoading(false)
      return
    }

    const sessionRes = await fetch("/api/auth/session")
    const session = await sessionRes.json()
    const user = session?.user as any

    if (callbackUrl && callbackUrl.startsWith("/")) {
      router.push(callbackUrl)
      return
    }

    if (!user?.onboardingCompleted) {
      router.push("/onboarding")
      return
    }

    const dest = ROLE_DASHBOARD[user?.role ?? "MODEL"] ?? "/"
    router.push(dest)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#F8F5EF] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 font-serif text-xl font-bold tracking-wider uppercase text-[#1D1A16]">
            <Sparkles className="h-5 w-5 text-[#C8A96A]" />
            <span>ModelConnect</span>
            <span className="text-[#C8A96A]">.Africa</span>
          </Link>
          <p className="mt-2 text-[10px] text-[#6B6257] uppercase tracking-widest">Welcome back</p>
        </div>

        <div className="bg-white border border-[#E7DED1] rounded-3xl shadow-sm px-8 py-10">
          {error && (
            <div className="mb-6 flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Google sign-in */}
          <GoogleSignInButton callbackUrl={callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/auth/redirect"} />

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-[#E7DED1]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#9B9189]">or</span>
            <div className="flex-1 h-px bg-[#E7DED1]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B6257]">Email Address</label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-xl border border-[#E7DED1] bg-white px-4 py-2.5 text-sm text-[#1D1A16] placeholder:text-[#D0C4B5] focus:outline-none focus:border-[#C8A96A] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B6257]">Password</label>
                <Link href="/forgot-password" className="text-[10px] text-[#C8A96A] hover:underline font-semibold">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-[#E7DED1] bg-white px-4 py-2.5 pr-10 text-sm text-[#1D1A16] placeholder:text-[#D0C4B5] focus:outline-none focus:border-[#C8A96A] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6257] hover:text-[#1D1A16]"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-[#1D1A16] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#6B6257]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-bold text-[#C8A96A] hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
