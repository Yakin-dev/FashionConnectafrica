"use client";

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { motion } from "framer-motion";
import { MessageSquare, Bell, Sparkles } from "lucide-react";
import Link from "next/link";

export default function MessagesPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#F8F5EF] min-h-[70vh] flex items-center justify-center py-20">
        <div className="mx-auto max-w-lg px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="mx-auto w-20 h-20 rounded-full bg-[#1D1A16] flex items-center justify-center shadow-lg">
              <MessageSquare className="h-9 w-9 text-[#C8A96A]" />
            </div>

            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C8A96A]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#C8A96A]">
                <Sparkles className="h-3.5 w-3.5" /> Coming Soon
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold uppercase text-[#1D1A16]">
                Direct Messaging
              </h1>
              <p className="text-sm text-[#6B6257] leading-relaxed max-w-sm mx-auto">
                Secure in-platform messaging between models, agencies, and clients is on its way. For now, use the contact form to get in touch.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/contact"
                className="rounded-full bg-[#1D1A16] px-7 py-3.5 text-sm font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] hover:text-[#11100E] transition-colors"
              >
                Contact Us
              </Link>
              <Link
                href="/notifications"
                className="rounded-full border border-[#E7DED1] px-7 py-3.5 text-sm font-bold uppercase tracking-widest text-[#6B6257] hover:bg-white transition-colors inline-flex items-center gap-2 justify-center"
              >
                <Bell className="h-4 w-4" /> Notifications
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
