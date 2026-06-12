"use client"

import { useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Sparkles, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { GoogleSignInButton } from "@/components/google-sign-in-button"

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "One uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "One number", ok: /[0-9]/.test(password) },
  ]
  const score = checks.filter((c) => c.ok).length
  const color = score === 0 ? "" : score === 1 ? "bg-red-400" : score === 2 ? "bg-yellow-400" : "bg-green-400"

  if (!password) return null
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= score ? color : "bg-[#E7DED1]"}`} />
        ))}
      </div>
      <ul className="space-y-0.5">
        {checks.map((c) => (
          <li key={c.label} className={`flex items-center gap-1.5 text-[10px] ${c.ok ? "text-green-600" : "text-[#6B6257]"}`}>
            <CheckCircle2 className={`h-3 w-3 ${c.ok ? "text-green-500" : "text-[#D0C4B5]"}`} />
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  )
}

function SignupForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = new FormData(e.currentTarget)
    const firstName = form.get("firstName") as string
    const lastName = form.get("lastName") as string
    const email = form.get("email") as string
    const pwd = form.get("password") as string
    const name = `${firstName} ${lastName}`.trim() || firstName

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pwd, name, firstName, lastName }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? "Registration failed")
      setLoading(false)
      return
    }

    const result = await signIn("credentials", {
      email,
      password: pwd,
      redirect: false,
    })

    if (result?.error) {
      setError("Account created but sign-in failed. Please go to login.")
      setLoading(false)
      return
    }

    router.push("/onboarding")
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
          <p className="mt-2 text-[10px] text-[#6B6257] uppercase tracking-widest">Create your account</p>
        </div>

        <div className="bg-white border border-[#E7DED1] rounded-3xl shadow-sm px-8 py-10">
          {error && (
            <div className="mb-6 flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Google sign-up */}
          <GoogleSignInButton />

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-[#E7DED1]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#9B9189]">or sign up with email</span>
            <div className="flex-1 h-px bg-[#E7DED1]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B6257]">First Name</label>
                <input
                  name="firstName"
                  type="text"
                  required
                  autoComplete="given-name"
                  placeholder="Amara"
                  className="w-full rounded-xl border border-[#E7DED1] bg-white px-4 py-2.5 text-sm text-[#1D1A16] placeholder:text-[#D0C4B5] focus:outline-none focus:border-[#C8A96A] transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B6257]">Last Name</label>
                <input
                  name="lastName"
                  type="text"
                  required
                  autoComplete="family-name"
                  placeholder="Diallo"
                  className="w-full rounded-xl border border-[#E7DED1] bg-white px-4 py-2.5 text-sm text-[#1D1A16] placeholder:text-[#D0C4B5] focus:outline-none focus:border-[#C8A96A] transition-colors"
                />
              </div>
            </div>

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
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B6257]">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              <PasswordStrength password={password} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-[#1D1A16] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#6B6257]">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-[#C8A96A] hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-[10px] text-[#9E9189]">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="underline hover:text-[#C8A96A]">Terms</Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-[#C8A96A]">Privacy Policy</Link>.
        </p>
      </div>
    </main>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}
