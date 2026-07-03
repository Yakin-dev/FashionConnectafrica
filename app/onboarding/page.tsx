"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ArrowRight, ArrowLeft, CheckCircle2,
  User, Building, Briefcase, Camera, Scissors, Video,
} from "lucide-react";

const ROLES = [
  {
    id: "photographer",
    title: "Photographer",
    desc: "I'm a fashion or editorial photographer",
    icon: Camera,
  },
  {
    id: "designer",
    title: "Fashion Designer",
    desc: "I'm a designer who needs models for shows or campaigns",
    icon: Scissors,
  },
  {
    id: "studio",
    title: "Content Studio Owner",
    desc: "I own a studio where models shoot portfolios and reels",
    icon: Video,
  },
  {
    id: "agency",
    title: "Model Agency",
    desc: "I manage a modeling agency or talent roster",
    icon: Building,
  },
  {
    id: "client",
    title: "Brand / Client",
    desc: "I represent a brand or business looking to hire talent",
    icon: Briefcase,
  },
];

const slideVariants = {
  enter: { opacity: 0, x: 32 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -32 },
};

const inputClass =
  "w-full rounded-xl border border-[#E7DED1] bg-[#F8F5EF] px-4 py-3 text-sm text-[#1D1A16] placeholder-[#9B9189] focus:outline-none focus:border-[#C8A96A] focus:bg-white transition-colors";

const labelClass = "block text-xs font-bold uppercase tracking-widest text-[#6B6257] mb-1.5";

export default function OnboardingPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purpose, setPurpose] = useState("");
  const [intentData, setIntentData] = useState<Record<string, string>>({});

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setIntentData((prev) => ({ ...prev, [key]: e.target.value }));

  const handleRoleSelect = (id: string) => {
    setPurpose(id);
    setStep(2);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purpose, intentData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      await refreshUser();
      router.push(data.redirectUrl);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const selectedRole = ROLES.find((r) => r.id === purpose);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F8F5EF] px-4 py-10 font-sans text-[#1D1A16]">
      <div className="w-full max-w-xl bg-white border border-[#E7DED1] rounded-3xl shadow-2xl overflow-hidden">

        {/* Progress bar */}
        <div className="h-1 bg-[#F8F5EF]">
          <motion.div
            className="h-full bg-[#C8A96A]"
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        <div className="p-8 sm:p-10">

          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <Sparkles className="h-5 w-5 text-[#C8A96A]" />
            <span className="font-serif text-lg font-bold uppercase tracking-widest text-[#1D1A16]">
              FashionConnect<span className="text-[#C8A96A]">.Africa</span>
            </span>
          </div>

          {/* Step counter */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  s <= step ? "bg-[#1D1A16] text-white" : "bg-[#E7DED1] text-[#6B6257]"
                }`}>
                  {s}
                </div>
                {s < 3 && <div className={`h-px w-8 transition-colors ${s < step ? "bg-[#C8A96A]" : "bg-[#E7DED1]"}`} />}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-200 p-3.5 text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">

            {/* ── Step 1: Choose role ───────────────────────────────── */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <h2 className="font-serif text-2xl font-bold text-center uppercase mb-1">Welcome</h2>
                <p className="text-sm text-[#6B6257] text-center mb-7">What is your role in the fashion industry?</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ROLES.map((role) => {
                    const Icon = role.icon;
                    return (
                      <button
                        key={role.id}
                        onClick={() => handleRoleSelect(role.id)}
                        className="flex items-start gap-4 p-4 text-left border border-[#E7DED1] rounded-2xl hover:border-[#C8A96A] hover:bg-[#F8F5EF] transition-all group"
                      >
                        <div className="rounded-xl bg-[#F8F5EF] group-hover:bg-[#C8A96A]/10 p-2.5 shrink-0 mt-0.5 transition-colors">
                          <Icon className="h-5 w-5 text-[#6B6257] group-hover:text-[#C8A96A] transition-colors" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1D1A16] uppercase tracking-wide">{role.title}</p>
                          <p className="text-xs text-[#6B6257] mt-0.5 leading-relaxed">{role.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Role details ──────────────────────────────── */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {selectedRole && (
                  <div className="flex items-center gap-3 bg-[#F8F5EF] rounded-2xl px-4 py-3 mb-6 border border-[#E7DED1]">
                    <selectedRole.icon className="h-5 w-5 text-[#C8A96A] shrink-0" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-[#C8A96A]">Selected Role</p>
                      <p className="text-sm font-bold text-[#1D1A16]">{selectedRole.title}</p>
                    </div>
                  </div>
                )}

                <h2 className="font-serif text-xl font-bold text-center uppercase mb-1">A bit more detail</h2>
                <p className="text-sm text-[#6B6257] text-center mb-7">This helps us set up your dashboard correctly.</p>

                <div className="space-y-4">

                  {/* Photographer */}
                  {purpose === "photographer" && (
                    <>
                      <div>
                        <label className={labelClass}>Your Name / Brand</label>
                        <input type="text" className={inputClass} placeholder="e.g. Kwame Studio" value={intentData.businessName || ""} onChange={set("businessName")} />
                      </div>
                      <div>
                        <label className={labelClass}>Photography Specialty</label>
                        <select className={inputClass} value={intentData.specialty || ""} onChange={set("specialty")}>
                          <option value="" disabled>Select specialty</option>
                          <option value="Editorial">Editorial</option>
                          <option value="Runway">Runway / Catwalk</option>
                          <option value="Commercial">Commercial / Brand</option>
                          <option value="Beauty">Beauty / Cosmetics</option>
                          <option value="Lifestyle">Lifestyle</option>
                          <option value="Portfolio">Model Portfolio</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Fashion Designer */}
                  {purpose === "designer" && (
                    <>
                      <div>
                        <label className={labelClass}>Label / Brand Name</label>
                        <input type="text" className={inputClass} placeholder="e.g. Keza Couture" value={intentData.companyName || ""} onChange={set("companyName")} />
                      </div>
                      <div>
                        <label className={labelClass}>Design Focus</label>
                        <select className={inputClass} value={intentData.designFocus || ""} onChange={set("designFocus")}>
                          <option value="" disabled>Select your focus</option>
                          <option value="Haute Couture">Haute Couture</option>
                          <option value="Ready-to-Wear">Ready-to-Wear</option>
                          <option value="Accessories">Accessories</option>
                          <option value="Bridal">Bridal</option>
                          <option value="Streetwear">Streetwear</option>
                          <option value="African Print">African Print / Ankara</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Content Studio Owner */}
                  {purpose === "studio" && (
                    <>
                      <div>
                        <label className={labelClass}>Studio Name</label>
                        <input type="text" className={inputClass} placeholder="e.g. Studio 250 Kigali" value={intentData.businessName || ""} onChange={set("businessName")} />
                      </div>
                      <div>
                        <label className={labelClass}>Studio Services</label>
                        <select className={inputClass} value={intentData.service || ""} onChange={set("service")}>
                          <option value="" disabled>What does your studio offer?</option>
                          <option value="Photography">Photography only</option>
                          <option value="Video & Reels">Video & Reels only</option>
                          <option value="Photography & Video">Photography & Video / Reels</option>
                          <option value="Full Production">Full production (photo + video + makeup)</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Model Agency */}
                  {purpose === "agency" && (
                    <>
                      <div>
                        <label className={labelClass}>Agency Name</label>
                        <input type="text" className={inputClass} placeholder="e.g. Kigali Elite Models" value={intentData.agencyName || ""} onChange={set("agencyName")} />
                      </div>
                      <div>
                        <label className={labelClass}>Location</label>
                        <input type="text" className={inputClass} placeholder="e.g. Kigali, Rwanda" value={intentData.location || ""} onChange={set("location")} />
                      </div>
                    </>
                  )}

                  {/* Brand / Client */}
                  {purpose === "client" && (
                    <>
                      <div>
                        <label className={labelClass}>Company / Brand Name</label>
                        <input type="text" className={inputClass} placeholder="e.g. Rwanda Breweries" value={intentData.companyName || ""} onChange={set("companyName")} />
                      </div>
                      <div>
                        <label className={labelClass}>What are you looking for?</label>
                        <select className={inputClass} value={intentData.clientPurpose || ""} onChange={set("clientPurpose")}>
                          <option value="" disabled>Select goal</option>
                          <option value="Hire models">Hire models for a campaign</option>
                          <option value="Post casting">Post a casting call</option>
                          <option value="Browse portfolios">Browse model portfolios</option>
                          <option value="Hire creative services">Hire creative services</option>
                        </select>
                      </div>
                    </>
                  )}

                </div>

                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 text-[#6B6257] hover:text-[#1D1A16] font-semibold text-sm uppercase tracking-wider transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex items-center gap-2 bg-[#1D1A16] hover:bg-[#C8A96A] text-white px-7 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-colors shadow-lg"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Confirm ───────────────────────────────────── */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 18 }}
                >
                  <CheckCircle2 className="w-16 h-16 text-[#C8A96A] mx-auto mb-5" />
                </motion.div>

                <h2 className="font-serif text-2xl font-bold mb-3 uppercase">You&apos;re all set!</h2>

                {selectedRole && (
                  <div className="inline-flex items-center gap-2 bg-[#F8F5EF] border border-[#E7DED1] rounded-full px-5 py-2 mb-4">
                    <selectedRole.icon className="h-4 w-4 text-[#C8A96A]" />
                    <span className="text-sm font-bold text-[#1D1A16]">{selectedRole.title}</span>
                  </div>
                )}

                <p className="text-sm text-[#6B6257] mb-8 leading-relaxed max-w-sm mx-auto">
                  Your profile will be set up as a <strong className="text-[#1D1A16]">{selectedRole?.title}</strong>. You&apos;ll be taken to your personalized dashboard now.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => setStep(2)}
                    disabled={loading}
                    className="px-6 py-3 border border-[#E7DED1] hover:bg-[#F8F5EF] rounded-full text-sm font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 bg-[#1D1A16] hover:bg-[#C8A96A] text-white px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all shadow-lg disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      <>Go to Dashboard <ArrowRight className="h-4 w-4" /></>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
