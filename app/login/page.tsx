import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#F8F5EF] p-4">
      <div className="mb-6 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-serif text-xl font-bold tracking-wider uppercase text-[#1D1A16]"
        >
          <Sparkles className="h-5 w-5 text-[#C8A96A]" />
          <span>ModelConnect</span>
          <span className="text-[#C8A96A]">.Africa</span>
        </Link>
        <p className="mt-2 text-[10px] text-[#6B6257] uppercase tracking-widest">
          Welcome back
        </p>
      </div>
      <SignIn
        forceRedirectUrl="/api/auth/redirect"
        fallbackRedirectUrl="/api/auth/redirect"
        appearance={{
          elements: {
            rootBox: "w-full max-w-md",
            card: "bg-white border border-[#E7DED1] rounded-3xl shadow-sm",
            headerTitle: "font-serif text-[#1D1A16] uppercase",
            headerSubtitle: "text-[#6B6257] text-xs",
            formButtonPrimary:
              "bg-[#1D1A16] hover:bg-[#C8A96A] rounded-full text-xs font-bold uppercase tracking-widest",
            footerActionLink: "text-[#C8A96A] font-bold",
          },
        }}
      />
    </main>
  );
}
