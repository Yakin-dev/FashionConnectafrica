"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ModelCard from "@/components/model-card";
import ServiceCard from "@/components/service-card";
import SectionHeader from "@/components/section-header";
import { mockModels, mockServices } from "@/lib/mock-data";
import { Sparkles, ArrowRight, ShieldCheck, Award, Briefcase } from "lucide-react";

export default function LandingPage() {
  // Slice datasets for preview lists
  const featuredModels = mockModels.slice(0, 4);
  const featuredServices = mockServices.slice(0, 3);

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#11100E] py-20 lg:py-32 text-white">
        {/* Subtle radial texture background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#C8A96A]/10 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            
            {/* Identity & Headline Call */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C8A96A]/10 px-4 py-1.5 text-xs font-bold text-[#C8A96A] uppercase tracking-widest">
                <Sparkles className="h-4 w-4" />
                <span>The Global Catwalk Platform</span>
              </span>

              <h1 className="font-serif text-4xl sm:text-6xl font-bold leading-tight sm:leading-none tracking-tight text-white uppercase">
                Connecting Africa&apos;s <br />
                <span className="text-[#C8A96A]">Elite Models</span> <br />
                To Global Runway
              </h1>

              <p className="text-xs sm:text-sm text-[#6B6257] leading-relaxed max-w-lg font-medium">
                Build your editorial portfolio, get discovered by international luxury creative directories, book verified talent, and manage modelling events in one elegant workspace.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link
                  href="/role-selection"
                  className="rounded-full bg-[#C8A96A] px-8 py-4 text-center text-xs font-bold uppercase tracking-widest text-[#11100E] hover:bg-[#BCA062] transition-colors shadow-lg"
                >
                  Join as Model
                </Link>

                <Link
                  href="/models"
                  className="rounded-full border border-white/20 px-8 py-4 text-center text-xs font-bold uppercase tracking-widest text-white hover:bg-white hover:text-[#11100E] transition-colors"
                >
                  Browse Models
                </Link>

                <Link
                  href="/marketplace"
                  className="rounded-full border border-white/20 px-8 py-4 text-center text-xs font-bold uppercase tracking-widest text-white hover:bg-white hover:text-[#11100E] transition-colors"
                >
                  Explore Marketplace
                </Link>
              </div>
            </div>

            {/* Premium editorial placeholder card showcase with hover and float animations */}
            <div className="lg:col-span-5 relative hidden md:block">
              <div className="relative aspect-[3/4] w-full max-w-md mx-auto rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-md shadow-2xl animate-float">
                <div className="relative w-full h-full overflow-hidden rounded-2xl bg-[#E7DED1]/10">
                  <Image
                    src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80"
                    alt="Editorial Model Showcard"
                    fill
                    priority
                    sizes="(max-w-7xl) 33vw, 50vw"
                    className="object-cover"
                  />
                  {/* Floating champagne styling stats overlay */}
                  <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-[#11100E]/80 backdrop-blur-md p-4 border border-white/10 flex items-center justify-between">
                    <div>
                      <h4 className="font-serif text-sm font-bold text-white uppercase">Amina Uwase</h4>
                      <span className="text-[9px] font-bold text-[#C8A96A] uppercase tracking-widest">Kigali Elite Models</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase text-white tracking-wider">Height: 180cm</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Agency Join Banner */}
      <section className="bg-[#C8A96A]/10 border-y border-[#C8A96A]/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C8A96A] px-3 py-1 text-[9px] font-bold text-[#11100E] uppercase tracking-widest">
                <Sparkles className="h-3 w-3" />
                Create Your Professional Profile
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1D1A16] uppercase">
                Join ModelConnect.Africa
              </h2>
              <p className="text-xs text-[#6B6257] leading-relaxed max-w-xl">
                Agencies can create profiles, list models, post opportunities, and manage applications.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href="/signup"
                className="rounded-full bg-[#1D1A16] px-6 py-3 text-center text-xs font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] hover:text-[#11100E] transition-colors"
              >
                Request Agency Access
              </Link>
              <Link
                href="/about"
                className="rounded-full border border-[#1D1A16]/30 px-6 py-3 text-center text-xs font-bold uppercase tracking-widest text-[#1D1A16] hover:bg-[#1D1A16] hover:text-white transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Models Grid */}
      <section className="bg-[#F8F5EF] py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
            <SectionHeader
              title="Featured Talents"
              subtitle="Elite Model Showcards"
            />
            <Link
              href="/models"
              className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-[#C8A96A] hover:underline"
            >
              <span>View Roster Directory</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredModels.map((model) => (
              <ModelCard key={model.id} model={model} />
            ))}
          </div>

        </div>
      </section>

      {/* Top agencies row */}
      <section className="border-y border-[#E7DED1] bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] font-bold text-[#6B6257] uppercase tracking-widest text-center mb-8">
            Partnered Elite Agencies ACCROSS Global Runway Centres
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 sm:gap-20 opacity-60">
            <span className="font-serif text-sm font-bold uppercase tracking-widest text-[#1D1A16]">KIGALI ELITE</span>
            <span className="font-serif text-sm font-bold uppercase tracking-widest text-[#1D1A16]">LAGOS FASHION</span>
            <span className="font-serif text-sm font-bold uppercase tracking-widest text-[#1D1A16]">NAIROBI RUNWAY</span>
            <span className="font-serif text-sm font-bold uppercase tracking-widest text-[#1D1A16]">ACCRA BUREAU</span>
          </div>
        </div>
      </section>

      {/* Value Propositions columns */}
      <section className="bg-[#F8F5EF] py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          <SectionHeader
            title="Ecosystem Features"
            subtitle="Premium Operational Solutions"
            align="center"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Prop 1 */}
            <div className="bg-white border border-[#E7DED1] rounded-2xl p-8 space-y-4 text-center">
              <div className="mx-auto rounded-full bg-[#1D1A16] p-4 text-[#C8A96A] w-fit">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#1D1A16] uppercase">Editorial Books</h3>
              <p className="text-xs text-[#6B6257] leading-relaxed">
                Display high-resolution image cards, catalog precise physical stats, and tag catwalk reels safely verified in Cloudinary.
              </p>
            </div>

            {/* Prop 2 */}
            <div className="bg-white border border-[#E7DED1] rounded-2xl p-8 space-y-4 text-center">
              <div className="mx-auto rounded-full bg-[#1D1A16] p-4 text-[#C8A96A] w-fit">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#1D1A16] uppercase">Direct Bookings</h3>
              <p className="text-xs text-[#6B6257] leading-relaxed">
                Connect directly with casting directors and luxury brands. Inquire, contract sessions and track show deadlines safely.
              </p>
            </div>

            {/* Prop 3 */}
            <div className="bg-white border border-[#E7DED1] rounded-2xl p-8 space-y-4 text-center">
              <div className="mx-auto rounded-full bg-[#1D1A16] p-4 text-[#C8A96A] w-fit">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#1D1A16] uppercase">Creative Services</h3>
              <p className="text-xs text-[#6B6257] leading-relaxed">
                Hire vetted fashion photographers, professional makeup glow artists, catwalk coaches, and hire minimalist loft studio rentals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace Previews */}
      <section className="bg-white py-20 lg:py-28 border-t border-[#E7DED1]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
            <SectionHeader
              title="Creative Marketplace"
              subtitle="Hire Vetted Editorial Creators"
            />
            <Link
              href="/marketplace"
              className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-[#C8A96A] hover:underline"
            >
              <span>Explore Marketplace Directory</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {featuredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>

        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#11100E] py-20 lg:py-28 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <SectionHeader
            title="Appreciations"
            subtitle="Voice of Luxury Partners"
            align="center"
          />

          <blockquote className="font-serif text-xl sm:text-2xl italic leading-relaxed text-[#F8F5EF] max-w-2xl mx-auto">
            &quot;ModelConnect has completely simplified how we source East African talent for our couture editorial shoots. The statistics are precise, and booking is instantaneous.&quot;
          </blockquote>
          
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#C8A96A]">Marc Laurent</h4>
            <span className="text-[10px] uppercase tracking-wider text-[#6B6257] mt-1 block">Creative Director, Haute Couture Paris</span>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
