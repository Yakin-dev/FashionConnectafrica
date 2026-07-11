import type { Metadata } from "next"
import Link from "next/link"
import { Mail, ArrowLeft } from "lucide-react"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Forgot Password | FashionConnect.Africa",
  description: "Reset your FashionConnect.Africa account password. Account recovery for fashion professionals in Rwanda and across Africa.",
  robots: { index: false, follow: false },
}

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#F8F5EF] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 font-serif text-xl font-bold tracking-wider uppercase text-[#1D1A16]">
            <Image
              src="/logo.jpeg"
              alt="FashionConnect.Africa"
              width={36}
              height={36}
              className="rounded-full object-cover ring-2 ring-[#C8A96A]/30"
            />
            <span>FashionConnect</span>
            <span className="text-[#C8A96A]">.Africa</span>
          </Link>
          <p className="mt-2 text-[10px] text-[#6B6257] uppercase tracking-widest">Account recovery</p>
        </div>

        <div className="bg-white border border-[#E7DED1] rounded-3xl shadow-sm px-8 py-10 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-[#F8F5EF] border border-[#E7DED1] flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-[#C8A96A]" />
          </div>

          <h1 className="font-serif text-xl font-bold uppercase mb-3">Password Reset</h1>
          <p className="text-sm text-[#6B6257] mb-6 leading-relaxed">
            Password reset will be available soon. Please contact support for account recovery.
          </p>

          <div className="rounded-xl bg-[#F8F5EF] border border-[#E7DED1] p-4 mb-6">
            <p className="text-[11px] text-[#6B6257]">
              In the meantime, you can submit a support request through our{" "}
              <Link href="/contact" className="font-semibold text-[#C8A96A] hover:underline">
                Contact page
              </Link>{" "}
              and we will assist you directly.
            </p>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1D1A16] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] transition-all w-full"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Login
          </Link>
        </div>
      </div>
    </main>
  )
}
