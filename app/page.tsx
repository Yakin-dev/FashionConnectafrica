"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Sparkles, ArrowRight, ShieldCheck, Award, Briefcase, Camera, Users, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";

const HERO_SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1920&q=80",
    tag: "Kigali Fashion Week",
    headline: ["Africa's", "Premier", "Runway Platform"],
    sub: "Connecting Kigali's elite models with the world's leading creative directors.",
  },
  {
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1920&q=80",
    tag: "Editorial & Catwalk",
    headline: ["Build Your", "Editorial", "Portfolio"],
    sub: "Showcase high-resolution showcards, stats, and catwalk reels in one elegant workspace.",
  },
  {
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1920&q=80",
    tag: "Direct Bookings",
    headline: ["Get Discovered", "By Global", "Luxury Brands"],
    sub: "Agencies and international casting directors browse live, verified talent from Kigali.",
  },
  {
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1920&q=80",
    tag: "Runway Ready",
    headline: ["Manage Every", "Casting", "Seamlessly"],
    sub: "Post castings, track applications, and manage bookings — all in one place.",
  },
];

const STATS = [
  { value: "100+", label: "Verified Models" },
  { value: "50+", label: "Active Castings" },
  { value: "30+", label: "Creative Agencies" },
  { value: "5★", label: "Platform Rating" },
];

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Editorial Portfolios",
    desc: "Upload high-resolution images, precise physical stats, and catwalk reels — all securely stored and beautifully presented.",
  },
  {
    icon: Award,
    title: "Direct Bookings",
    desc: "Connect directly with casting directors. Inquire, manage sessions, and track deadlines from your personal dashboard.",
  },
  {
    icon: Briefcase,
    title: "Creative Services",
    desc: "Hire vetted fashion photographers, makeup artists, catwalk coaches, and studio spaces — all in one marketplace.",
  },
  {
    icon: Camera,
    title: "Casting Briefs",
    desc: "Browse open castings from leading agencies. Apply with one click and receive real-time status updates.",
  },
  {
    icon: Users,
    title: "Agency Rosters",
    desc: "Agencies manage their full talent roster, add models, post castings, and track application pipelines easily.",
  },
  {
    icon: TrendingUp,
    title: "Profile Analytics",
    desc: "Models track profile views, application outcomes, and visibility metrics to grow their career intelligently.",
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

export default function LandingPage() {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const next = useCallback(() => setCurrent((c) => (c + 1) % HERO_SLIDES.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + HERO_SLIDES.length) % HERO_SLIDES.length), []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(next, 5500);
    return () => clearInterval(timer);
  }, [isAutoPlaying, next]);

  const slide = HERO_SLIDES[current];

  return (
    <>
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden h-[92vh] min-h-[560px] flex items-end"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Slide backgrounds */}
        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={slide.image}
              alt={slide.tag}
              fill
              priority
              sizes="100vw"
              className="object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0C0A08]/95 via-[#0C0A08]/50 to-[#0C0A08]/20" />
          </motion.div>
        </AnimatePresence>

        {/* Content */}
        <div className="relative z-10 w-full pb-16 sm:pb-20 lg:pb-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              {/* Tag pill */}
              <AnimatePresence mode="wait">
                <motion.span
                  key={`tag-${current}`}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.4 }}
                  className="inline-flex items-center gap-2 rounded-full border border-[#C8A96A]/40 bg-[#C8A96A]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#C8A96A] mb-5"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {slide.tag}
                </motion.span>
              </AnimatePresence>

              {/* Headline */}
              <AnimatePresence mode="wait">
                <motion.h1
                  key={`h-${current}`}
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  className="font-serif text-5xl sm:text-7xl font-bold leading-[1.05] text-white uppercase mb-6"
                >
                  {slide.headline.map((line, i) => (
                    <motion.span key={i} variants={fadeUp} className="block">
                      {i === 1 ? <span className="text-[#C8A96A]">{line}</span> : line}
                    </motion.span>
                  ))}
                </motion.h1>
              </AnimatePresence>

              {/* Sub */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={`sub-${current}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-base text-white/70 leading-relaxed max-w-xl mb-8"
                >
                  {slide.sub}
                </motion.p>
              </AnimatePresence>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-wrap gap-3"
              >
                <Link
                  href="/signup"
                  className="rounded-full bg-[#C8A96A] px-7 py-3.5 text-sm font-bold uppercase tracking-widest text-[#11100E] hover:bg-[#BCA062] transition-colors shadow-lg hover:shadow-[#C8A96A]/30"
                >
                  Join the Platform
                </Link>
                <Link
                  href="/models"
                  className="rounded-full border border-white/30 px-7 py-3.5 text-sm font-bold uppercase tracking-widest text-white hover:bg-white hover:text-[#11100E] transition-colors"
                >
                  Browse Models
                </Link>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Slide controls */}
        <div className="absolute bottom-6 right-4 sm:right-8 z-20 flex items-center gap-3">
          <button
            onClick={prev}
            className="rounded-full border border-white/20 p-2 text-white hover:bg-white/10 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex gap-1.5">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); setIsAutoPlaying(false); }}
                className={`rounded-full transition-all duration-300 ${
                  i === current ? "bg-[#C8A96A] w-6 h-2" : "bg-white/30 w-2 h-2 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="rounded-full border border-white/20 p-2 text-white hover:bg-white/10 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-[#1D1A16] border-b border-[#C8A96A]/20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-0 sm:divide-x sm:divide-white/10">
            {STATS.map((s) => (
              <div key={s.label} className="text-center px-6 py-2">
                <p className="font-serif text-3xl font-bold text-[#C8A96A]">{s.value}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-white/50 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── Join Banner ───────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="bg-[#F8F5EF] py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 bg-[#1D1A16] rounded-3xl px-8 sm:px-12 py-10 sm:py-12">
            <div className="space-y-3 text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C8A96A]/20 px-3 py-1 text-xs font-bold text-[#C8A96A] uppercase tracking-widest">
                <Sparkles className="h-3 w-3" /> Kigali, Rwanda
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white uppercase leading-snug">
                Rwanda&apos;s Home<br />for Fashion Talent
              </h2>
              <p className="text-sm text-white/60 leading-relaxed max-w-md">
                Models, agencies, and creative professionals — all under one platform built for Kigali&apos;s growing fashion scene.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href="/signup"
                className="rounded-full bg-[#C8A96A] px-7 py-3.5 text-center text-sm font-bold uppercase tracking-widest text-[#11100E] hover:bg-[#BCA062] transition-colors"
              >
                Create Free Account
              </Link>
              <Link
                href="/about"
                className="rounded-full border border-white/20 px-7 py-3.5 text-center text-sm font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── Features Grid ─────────────────────────────────────────────────── */}
      <section className="bg-white py-20 lg:py-28 border-y border-[#E7DED1]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-[#C8A96A]">Platform Features</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1D1A16] uppercase mt-3">
              Everything You Need
            </h2>
            <p className="text-sm text-[#6B6257] mt-3 max-w-xl mx-auto leading-relaxed">
              One platform for models, agencies, clients, and creative professionals in Kigali.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  className="group rounded-2xl border border-[#E7DED1] p-7 hover:border-[#C8A96A]/60 hover:shadow-lg transition-all duration-300"
                >
                  <div className="rounded-xl bg-[#F8F5EF] group-hover:bg-[#C8A96A]/10 p-3 w-fit mb-5 transition-colors duration-300">
                    <Icon className="h-5 w-5 text-[#C8A96A]" />
                  </div>
                  <h3 className="font-serif text-base font-bold text-[#1D1A16] uppercase mb-2">{f.title}</h3>
                  <p className="text-sm text-[#6B6257] leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section className="bg-[#F8F5EF] py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-[#C8A96A]">Simple Process</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1D1A16] uppercase mt-3">
              Get Started in Minutes
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative"
          >
            {[
              { step: "01", title: "Create Your Profile", desc: "Sign up free, complete your profile, and choose your role — model, agency, or client." },
              { step: "02", title: "Build Your Presence", desc: "Upload photos, add stats, post castings, or list your creative services." },
              { step: "03", title: "Connect & Grow", desc: "Get discovered, apply for castings, or book the talent you need — all in one place." },
            ].map((item) => (
              <motion.div
                key={item.step}
                variants={fadeUp}
                className="relative flex flex-col items-center text-center p-8 bg-white rounded-2xl border border-[#E7DED1]"
              >
                <span className="font-serif text-5xl font-bold text-[#C8A96A]/20 mb-4">{item.step}</span>
                <h3 className="font-serif text-lg font-bold text-[#1D1A16] uppercase mb-3">{item.title}</h3>
                <p className="text-sm text-[#6B6257] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-[#11100E] py-20 lg:py-28 text-white text-center"
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-6">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#C8A96A]">
            <Sparkles className="h-4 w-4" /> ModelConnect.Africa
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold uppercase leading-tight">
            Kigali&apos;s Fashion<br />
            <span className="text-[#C8A96A]">Platform Awaits You</span>
          </h2>
          <p className="text-base text-white/60 leading-relaxed max-w-xl mx-auto">
            Whether you&apos;re a model starting out, an agency managing talent, or a brand looking for the right face — this is where it begins.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-2">
            <Link
              href="/signup"
              className="rounded-full bg-[#C8A96A] px-9 py-4 text-sm font-bold uppercase tracking-widest text-[#11100E] hover:bg-[#BCA062] transition-colors shadow-lg inline-flex items-center gap-2"
            >
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/castings"
              className="rounded-full border border-white/20 px-9 py-4 text-sm font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-colors"
            >
              View Castings
            </Link>
          </div>
        </div>
      </motion.section>

      <Footer />
    </>
  );
}
