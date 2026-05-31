"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/role-selection");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F8F5EF] p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white border border-[#E7DED1] rounded-3xl p-8 shadow-sm space-y-6">
        
        {/* Brand */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-1.5 font-serif text-xl font-bold tracking-wider uppercase text-[#1D1A16]">
            <Sparkles className="h-5 w-5 text-[#C8A96A]" />
            <span>ModelConnect</span>
            <span className="text-[#C8A96A]">.Africa</span>
          </Link>
          <h2 className="font-serif text-2xl font-bold uppercase text-[#1D1A16] mt-4">Create Account</h2>
          <p className="text-[10px] text-[#6B6257] uppercase tracking-widest">Connect with premium fashion networks</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] block">Full Name / Entity Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ENTER NAME"
              className="w-full rounded-xl border border-[#E7DED1] bg-white p-3 text-xs focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] block">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ENTER EMAIL"
              className="w-full rounded-xl border border-[#E7DED1] bg-white p-3 text-xs focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] block">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="CREATE PASSWORD"
              className="w-full rounded-xl border border-[#E7DED1] bg-white p-3 text-xs focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-[#1D1A16] py-3.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] transition-all flex items-center justify-center gap-2"
          >
            <span>Proceed to Roles</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="text-center pt-4 border-t border-[#E7DED1]/60">
          <p className="text-[10px] text-[#6B6257] uppercase tracking-wider">
            Already have an account?{" "}
            <Link href="/login" className="text-[#C8A96A] font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
