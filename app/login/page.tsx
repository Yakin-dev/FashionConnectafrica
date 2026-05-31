"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("MODEL"); // Default role simulation
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate redirection depending on role selection dropdown for developers
    const path = `/dashboard/${role.toLowerCase()}`;
    router.push(path);
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
          <h2 className="font-serif text-2xl font-bold uppercase text-[#1D1A16] mt-4">Welcome back</h2>
          <p className="text-[10px] text-[#6B6257] uppercase tracking-widest">Sign in to your elite modeling workspace</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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
              placeholder="ENTER PASSWORD"
              className="w-full rounded-xl border border-[#E7DED1] bg-white p-3 text-xs focus:outline-none"
            />
          </div>

          {/* Quick Dashboard Entry Selector for evaluation */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] block">Simulate Role Panel</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-[#E7DED1] bg-white p-3 text-xs focus:outline-none"
            >
              <option value="MODEL">Model Dashboard</option>
              <option value="AGENCY">Agency Dashboard</option>
              <option value="ADMIN">Platform Administrator</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-[#1D1A16] py-3.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] transition-all flex items-center justify-center gap-2"
          >
            <span>Enter Workspace</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="text-center pt-4 border-t border-[#E7DED1]/60">
          <p className="text-[10px] text-[#6B6257] uppercase tracking-wider">
            Don't have an account?{" "}
            <Link href="/signup" className="text-[#C8A96A] font-bold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
