"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import SectionHeader from "@/components/section-header";
import { Mail, Phone, MapPin, CheckCircle, Loader2, AlertCircle } from "lucide-react";

const ROLES = ["Model", "Agency", "Client", "Marketplace Provider", "Other"];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "", email: "", role: "Model", subject: "", message: "",
  });
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setFormData((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally { setLoading(false); }
  };

  const inputClass = "w-full rounded-xl border border-[#E7DED1] bg-white p-3.5 text-xs focus:outline-none focus:border-[#C8A96A]";

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#F8F5EF] py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Inquire Elite" subtitle="Get In Touch" align="center" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mt-12 items-start">
            {/* Contact Info */}
            <div className="md:col-span-5 bg-white border border-[#E7DED1] rounded-2xl p-6 shadow-sm space-y-6">
              <h3 className="font-serif text-lg font-bold text-[#1D1A16] uppercase border-b border-[#E7DED1]/70 pb-3">
                Creative HQ
              </h3>
              <div className="space-y-4 text-xs text-[#6B6257]">
                {[
                  { icon: MapPin, text: "Kigali Innovation City, Rwanda" },
                  { icon: Phone, text: "+250 788 000 000" },
                  { icon: Mail,  text: "concierge@modelconnect.africa" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-[#C8A96A] shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-[#C8A96A]/5 border border-[#C8A96A]/20 p-4 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#C8A96A]">Agency Verification</p>
                <p className="text-[10px] text-[#6B6257] leading-relaxed">
                  Agencies interested in joining the platform can message us here. We review all requests personally.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-7 bg-white border border-[#E7DED1] rounded-2xl p-8 shadow-sm">
              {sent ? (
                <div className="py-12 text-center space-y-3">
                  <div className="mx-auto rounded-full bg-emerald-100 p-3 text-emerald-600 w-fit">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <h4 className="font-serif text-lg font-bold uppercase text-[#1D1A16]">Message Sent</h4>
                  <p className="text-xs text-[#6B6257] leading-relaxed uppercase tracking-wider">
                    Our team will review your inquiry and respond shortly.
                  </p>
                  <button onClick={() => { setSent(false); setFormData({ name:"",email:"",role:"Model",subject:"",message:"" }); }}
                    className="mt-4 rounded-full border border-[#1D1A16] px-6 py-2 text-xs font-bold uppercase tracking-widest text-[#1D1A16] hover:bg-[#1D1A16] hover:text-white transition-colors">
                    Send Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-red-600 text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" /> {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] block">Full Name</label>
                      <input type="text" required value={formData.name} onChange={handleChange("name")} placeholder="ENTER FULL NAME" className={inputClass} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] block">Email Address</label>
                      <input type="email" required value={formData.email} onChange={handleChange("email")} placeholder="ENTER EMAIL" className={inputClass} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] block">I Am A</label>
                      <select value={formData.role} onChange={handleChange("role")} className={inputClass}>
                        {ROLES.map((r) => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] block">Subject</label>
                      <input type="text" required value={formData.subject} onChange={handleChange("subject")} placeholder="SUBJECT" className={inputClass} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] block">Message</label>
                    <textarea rows={5} required value={formData.message} onChange={handleChange("message")}
                      placeholder="DESCRIBE YOUR INQUIRY..." className={`${inputClass} resize-none`} />
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full rounded-full bg-[#1D1A16] py-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2">
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Transmit Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
