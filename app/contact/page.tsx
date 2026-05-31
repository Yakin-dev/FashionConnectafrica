"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import SectionHeader from "@/components/section-header";
import { Mail, Phone, MapPin, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setFormData({ name: "", email: "", message: "" });
    }, 2500);
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#F8F5EF] py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Inquire Elite"
            subtitle="Get In Touch"
            align="center"
          />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mt-12 items-start">
            {/* Contact Details */}
            <div className="md:col-span-5 bg-white border border-[#E7DED1] rounded-2xl p-6 shadow-sm space-y-6">
              <h3 className="font-serif text-lg font-bold text-[#1D1A16] uppercase border-b border-[#E7DED1]/70 pb-3">
                Creative HQ
              </h3>
              
              <div className="space-y-4 text-xs text-[#6B6257]">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4.5 w-4.5 text-[#C8A96A]" />
                  <span>Kigali Innovation City, Rwanda</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4.5 w-4.5 text-[#C8A96A]" />
                  <span>+250 788 000 000</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4.5 w-4.5 text-[#C8A96A]" />
                  <span>concierge@modelconnect.africa</span>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-7 bg-white border border-[#E7DED1] rounded-2xl p-8 shadow-sm">
              {sent ? (
                <div className="py-12 text-center space-y-3">
                  <div className="mx-auto rounded-full bg-emerald-100 p-3 text-emerald-600 w-fit">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <h4 className="font-serif text-lg font-bold uppercase text-[#1D1A16]">Message Transmitted</h4>
                  <p className="text-xs text-[#6B6257] leading-relaxed uppercase tracking-wider">
                    Our creative concierge team will review your booking request or agency proposal.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] block">Your Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="ENTER FULL NAME"
                      className="w-full rounded-xl border border-[#E7DED1] bg-white p-3.5 text-xs focus:outline-none focus:border-[#C8A96A]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] block">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ENTER EMAIL ADDRESS"
                      className="w-full rounded-xl border border-[#E7DED1] bg-white p-3.5 text-xs focus:outline-none focus:border-[#C8A96A]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B6257] block">Inquiry Content</label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="DESCRIBE AGENCY AND TALENT REQUIREMENTS..."
                      className="w-full rounded-xl border border-[#E7DED1] bg-white p-3.5 text-xs focus:outline-none focus:border-[#C8A96A]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-full bg-[#1D1A16] py-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] transition-all shadow-sm"
                  >
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
