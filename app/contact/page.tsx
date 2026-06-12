"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { motion, type Variants } from "framer-motion";
import { Mail, Phone, MapPin, CheckCircle, Loader2, AlertCircle, Sparkles } from "lucide-react";

const ROLES = ["Fashion Model", "Photographer", "Fashion Designer", "Content Studio Owner", "Model Agency", "Brand / Client", "Other"];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "", email: "", role: "Model", subject: "", message: "",
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setFormData((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
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
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-[#E7DED1] bg-[#F8F5EF] px-4 py-3.5 text-sm text-[#1D1A16] placeholder-[#9B9189] focus:outline-none focus:border-[#C8A96A] focus:bg-white transition-colors";

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#F8F5EF]">

        {/* Page header */}
        <div className="bg-[#1D1A16] py-14 sm:py-20 text-white text-center">
          <div className="mx-auto max-w-3xl px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-3"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C8A96A]/10 border border-[#C8A96A]/30 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#C8A96A]">
                <Sparkles className="h-3.5 w-3.5" /> Kigali, Rwanda
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold uppercase">Get In Touch</h1>
              <p className="text-base text-white/60">We read every message and respond within 24 hours.</p>
            </motion.div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

            {/* Contact info panel */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="md:col-span-4 space-y-6"
            >
              <div className="bg-white rounded-2xl border border-[#E7DED1] p-6 space-y-5">
                <h3 className="font-serif text-base font-bold text-[#1D1A16] uppercase">Contact Details</h3>
                <div className="space-y-4">
                  {[
                    { icon: MapPin, label: "Address", text: "Kigali, Rwanda" },
                    { icon: Phone, label: "Phone", text: "+250 788 000 000" },
                    { icon: Mail, label: "Email", text: "hello@modelconnect.africa" },
                  ].map(({ icon: Icon, label, text }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className="rounded-lg bg-[#F8F5EF] p-2 shrink-0">
                        <Icon className="h-4 w-4 text-[#C8A96A]" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-[#6B6257]">{label}</p>
                        <p className="text-sm text-[#1D1A16] mt-0.5">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-[#C8A96A]/10 border border-[#C8A96A]/20 p-5 space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-[#C8A96A]">Agencies</p>
                <p className="text-sm text-[#6B6257] leading-relaxed">
                  Interested in joining the platform? Message us here and our team will guide you through the verification process.
                </p>
              </div>
            </motion.div>

            {/* Contact form */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              className="md:col-span-8 bg-white rounded-2xl border border-[#E7DED1] p-8 shadow-sm"
            >
              {sent ? (
                <div className="py-14 text-center space-y-4">
                  <div className="mx-auto rounded-full bg-emerald-100 p-4 text-emerald-600 w-fit">
                    <CheckCircle className="h-10 w-10" />
                  </div>
                  <h4 className="font-serif text-xl font-bold uppercase text-[#1D1A16]">Message Sent!</h4>
                  <p className="text-sm text-[#6B6257] leading-relaxed">
                    Thank you for reaching out. We&apos;ll respond within 24 hours.
                  </p>
                  <button
                    onClick={() => { setSent(false); setFormData({ name: "", email: "", role: "Model", subject: "", message: "" }); }}
                    className="mt-2 rounded-full border border-[#1D1A16] px-7 py-3 text-sm font-bold uppercase tracking-widest text-[#1D1A16] hover:bg-[#1D1A16] hover:text-white transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h3 className="font-serif text-lg font-bold text-[#1D1A16] uppercase mb-6">Send a Message</h3>

                  {error && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-red-600 text-sm flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-widest text-[#6B6257] block">Full Name</label>
                      <input type="text" required value={formData.name} onChange={handleChange("name")} placeholder="Your full name" className={inputClass} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-widest text-[#6B6257] block">Email Address</label>
                      <input type="email" required value={formData.email} onChange={handleChange("email")} placeholder="your@email.com" className={inputClass} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-widest text-[#6B6257] block">I am a</label>
                      <select value={formData.role} onChange={handleChange("role")} className={inputClass}>
                        {ROLES.map((r) => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-widest text-[#6B6257] block">Subject</label>
                      <input type="text" required value={formData.subject} onChange={handleChange("subject")} placeholder="How can we help?" className={inputClass} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#6B6257] block">Message</label>
                    <textarea
                      rows={5}
                      required
                      value={formData.message}
                      onChange={handleChange("message")}
                      placeholder="Describe your inquiry in detail..."
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full bg-[#1D1A16] py-4 text-sm font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] hover:text-[#11100E] transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Send Message
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
