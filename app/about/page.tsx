"use client";

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { motion } from "framer-motion";
import { Award, MapPin, Users, Sparkles } from "lucide-react";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const PILLARS = [
  {
    icon: MapPin,
    title: "Kigali-Focused",
    desc: "Built specifically for Rwanda's fashion ecosystem — connecting local talent with local and international opportunities.",
  },
  {
    icon: Award,
    title: "Verified Profiles",
    desc: "Agency-backed verification and profile checks ensure every listing represents real, professional talent.",
  },
  {
    icon: Users,
    title: "Open to All",
    desc: "Models, agencies, clients, and creatives all use one platform — simple, clear, and easy for everyone.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#F8F5EF]">

        {/* Hero */}
        <section className="bg-[#1D1A16] py-20 sm:py-28 text-white text-center">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-5"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C8A96A]/10 border border-[#C8A96A]/30 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#C8A96A]">
                <Sparkles className="h-3.5 w-3.5" /> Our Narrative
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold uppercase leading-tight">
                About ModelConnect<span className="text-[#C8A96A]">.Africa</span>
              </h1>
              <p className="text-base text-white/60 leading-relaxed max-w-xl mx-auto">
                Rwanda&apos;s first dedicated platform for models, agencies, and fashion creatives.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl border border-[#E7DED1] p-8 sm:p-12 text-center"
            >
              <p className="font-serif text-xl sm:text-2xl italic text-[#1D1A16] leading-relaxed">
                &quot;We believe Rwanda&apos;s creative talent belongs on the world stage. ModelConnect.Africa is the bridge that turns digital portfolios into real opportunities.&quot;
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-5 text-[#6B6257] leading-relaxed"
            >
              <p className="text-base">
                ModelConnect.Africa was built to solve a real problem in Kigali&apos;s fashion scene: talented models, hardworking agencies, and ambitious clients with no single place to connect professionally.
              </p>
              <p className="text-base">
                We offer a clean, easy-to-use platform where models display their portfolios with the right details, agencies manage their rosters efficiently, and clients find exactly the talent they need — all without friction.
              </p>
              <p className="text-base">
                No technical skills required. No complicated processes. Just professional fashion, made accessible for everyone in Kigali.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Pillars */}
        <section className="bg-white border-y border-[#E7DED1] py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="font-serif text-3xl font-bold uppercase text-[#1D1A16]">What We Stand For</h2>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6"
            >
              {PILLARS.map((p) => {
                const Icon = p.icon;
                return (
                  <motion.div
                    key={p.title}
                    variants={fadeUp}
                    className="flex flex-col items-center text-center p-8 rounded-2xl border border-[#E7DED1] hover:border-[#C8A96A]/50 hover:shadow-md transition-all"
                  >
                    <div className="mb-4 rounded-full bg-[#1D1A16] p-3.5">
                      <Icon className="h-5 w-5 text-[#C8A96A]" />
                    </div>
                    <h3 className="font-serif text-base font-bold uppercase text-[#1D1A16] mb-2">{p.title}</h3>
                    <p className="text-sm text-[#6B6257] leading-relaxed">{p.desc}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="py-16 sm:py-24 text-center"
        >
          <div className="mx-auto max-w-xl px-4 space-y-6">
            <h2 className="font-serif text-3xl font-bold uppercase text-[#1D1A16]">Ready to Join?</h2>
            <p className="text-sm text-[#6B6257] leading-relaxed">
              Create your free account today and become part of Kigali&apos;s fashion community.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/signup"
                className="rounded-full bg-[#1D1A16] px-8 py-4 text-sm font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] hover:text-[#11100E] transition-colors"
              >
                Get Started
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-[#E7DED1] px-8 py-4 text-sm font-bold uppercase tracking-widest text-[#6B6257] hover:bg-white transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </motion.section>

      </main>
      <Footer />
    </>
  );
}
