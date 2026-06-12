"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, User, Building, Briefcase, Calendar, Store, Shield } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { update } = useSession();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [purpose, setPurpose] = useState<string>("");
  const [intentData, setIntentData] = useState<Record<string, string>>({});

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handlePurposeSelect = (p: string) => {
    setPurpose(p);
    handleNext();
  };

  const handleIntentChange = (key: string, value: string) => {
    setIntentData(prev => ({ ...prev, [key]: value }));
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
      if (!res.ok) throw new Error(data.error || "Failed to save onboarding");
      await update();
      router.push(data.redirectUrl);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const purposeOptions = [
    { id: "model", label: "I am a model looking for opportunities", icon: User },
    { id: "agency", label: "I represent a modelling agency", icon: Building },
    { id: "client", label: "I am a client looking to hire models", icon: Briefcase },
    { id: "event", label: "I organize events or castings", icon: Calendar },
    { id: "provider", label: "I provide fashion services", icon: Store },
    { id: "admin", label: "I am platform admin/staff", icon: Shield },
  ];

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F8F5EF] p-4 sm:p-6 font-sans text-[#1D1A16]">
      <div className="w-full max-w-2xl bg-white border border-[#E7DED1] rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1 bg-[#F8F5EF] w-full">
          <div 
            className="h-full bg-[#C8A96A] transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-[#C8A96A]" />
            <h1 className="font-serif text-xl font-bold tracking-widest uppercase text-[#1D1A16]">
              ModelConnect<span className="text-[#C8A96A]">.Africa</span>
            </h1>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 text-center">
            {error}
          </div>
        )}

        <div className="relative min-h-[300px]">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="font-serif text-3xl font-bold mb-2 text-center uppercase tracking-wide">Welcome</h2>
              <p className="text-sm text-[#6B6257] text-center mb-8 uppercase tracking-widest">What best describes you?</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {purposeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handlePurposeSelect(opt.id)}
                    className="flex flex-col items-center p-6 text-center border border-[#E7DED1] rounded-2xl hover:border-[#C8A96A] hover:bg-[#F8F5EF] transition-all group"
                  >
                    <opt.icon className="h-8 w-8 mb-3 text-[#6B6257] group-hover:text-[#C8A96A] transition-colors" />
                    <span className="text-sm font-semibold uppercase tracking-wider">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="font-serif text-2xl font-bold mb-2 text-center uppercase tracking-wide">Tell us more</h2>
              <p className="text-xs text-[#6B6257] text-center mb-8 uppercase tracking-widest">Customize your experience</p>
              
              <div className="space-y-6 max-w-md mx-auto">
                {purpose === "model" && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-[#6B6257]">Representation</label>
                      <select 
                        className="w-full p-3 bg-white border border-[#E7DED1] rounded-xl focus:outline-none focus:border-[#C8A96A] text-sm"
                        value={intentData.representation || ""}
                        onChange={(e) => handleIntentChange("representation", e.target.value)}
                      >
                        <option value="" disabled>Select option</option>
                        <option value="independent">Independent Model</option>
                        <option value="agency">Represented by an Agency</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-[#6B6257]">Main Interest</label>
                      <select 
                        className="w-full p-3 bg-white border border-[#E7DED1] rounded-xl focus:outline-none focus:border-[#C8A96A] text-sm"
                        value={intentData.category || ""}
                        onChange={(e) => handleIntentChange("category", e.target.value)}
                      >
                        <option value="" disabled>Select category</option>
                        <option value="Runway">Runway</option>
                        <option value="Commercial">Commercial</option>
                        <option value="Editorial">Editorial</option>
                        <option value="Beauty">Beauty</option>
                        <option value="Fitness">Fitness</option>
                        <option value="Fashion Influencer">Fashion Influencer</option>
                      </select>
                    </div>
                  </>
                )}

                {purpose === "agency" && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-[#6B6257]">Agency Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Elite Models Africa"
                        className="w-full p-3 bg-white border border-[#E7DED1] rounded-xl focus:outline-none focus:border-[#C8A96A] text-sm"
                        value={intentData.agencyName || ""}
                        onChange={(e) => handleIntentChange("agencyName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-[#6B6257]">Location</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Lagos, Nigeria"
                        className="w-full p-3 bg-white border border-[#E7DED1] rounded-xl focus:outline-none focus:border-[#C8A96A] text-sm"
                        value={intentData.location || ""}
                        onChange={(e) => handleIntentChange("location", e.target.value)}
                      />
                    </div>
                  </>
                )}

                {purpose === "client" && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-[#6B6257]">Company / Brand Name</label>
                      <input 
                        type="text" 
                        placeholder="Enter your brand name"
                        className="w-full p-3 bg-white border border-[#E7DED1] rounded-xl focus:outline-none focus:border-[#C8A96A] text-sm"
                        value={intentData.companyName || ""}
                        onChange={(e) => handleIntentChange("companyName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-[#6B6257]">Primary Goal</label>
                      <select 
                        className="w-full p-3 bg-white border border-[#E7DED1] rounded-xl focus:outline-none focus:border-[#C8A96A] text-sm"
                        value={intentData.clientPurpose || ""}
                        onChange={(e) => handleIntentChange("clientPurpose", e.target.value)}
                      >
                        <option value="" disabled>Select goal</option>
                        <option value="Hire models">Hire models</option>
                        <option value="Post casting">Post a casting</option>
                        <option value="Browse portfolios">Browse portfolios</option>
                      </select>
                    </div>
                  </>
                )}

                {(purpose === "event" || purpose === "provider" || purpose === "admin") && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#6B6257]">Location / Focus</label>
                    <input 
                      type="text" 
                      placeholder="Enter main city or focus area"
                      className="w-full p-3 bg-white border border-[#E7DED1] rounded-xl focus:outline-none focus:border-[#C8A96A] text-sm"
                      value={intentData.location || ""}
                      onChange={(e) => handleIntentChange("location", e.target.value)}
                    />
                  </div>
                )}
                
                <div className="flex justify-between mt-8">
                  <button onClick={handleBack} className="flex items-center gap-2 text-[#6B6257] hover:text-[#1D1A16] font-semibold text-sm uppercase tracking-wider transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button onClick={handleNext} className="flex items-center gap-2 bg-[#1D1A16] hover:bg-[#C8A96A] text-white px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-colors shadow-lg">
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 text-center max-w-md mx-auto">
              <CheckCircle2 className="w-16 h-16 text-[#C8A96A] mx-auto mb-6" />
              <h2 className="font-serif text-3xl font-bold mb-4 uppercase tracking-wide">You're All Set</h2>
              <p className="text-sm text-[#6B6257] mb-8 leading-relaxed">
                Your profile is ready. You will be directed to your personalized dashboard where you can start managing your opportunities.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <button 
                  onClick={handleBack} 
                  disabled={loading}
                  className="px-6 py-3 border border-[#E7DED1] hover:bg-[#F8F5EF] rounded-full text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
                >
                  Go Back
                </button>
                <button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="flex items-center justify-center gap-2 bg-[#1D1A16] hover:bg-[#C8A96A] text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-lg disabled:opacity-70"
                >
                  {loading ? "Preparing Dashboard..." : "Continue to Dashboard"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
