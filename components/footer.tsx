"use client";

import Link from "next/link";
import { Sparkles, Camera, Globe, Share2, ArrowUpRight } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#E7DED1] bg-[#11100E] text-[#F8F5EF] pt-20 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-1.5 font-serif text-xl font-bold tracking-wider uppercase text-white">
              <Sparkles className="h-5 w-5 text-[#C8A96A]" />
              <span>ModelConnect</span>
              <span className="text-[#C8A96A]">.Africa</span>
            </Link>
            <p className="text-xs text-[#6B6257] leading-relaxed max-w-sm">
              Connecting Africa's elite fashion modeling talent, top agencies, and global luxury clients in a professional, high-end creative directory ecosystem.
            </p>
            <div className="flex gap-4 items-center">
              <a href="#" className="rounded-full bg-[#1D1A16] p-2 text-[#C8A96A] hover:bg-[#C8A96A] hover:text-[#11100E] transition-all" aria-label="Instagram">
                <Camera className="h-4 w-4" />
              </a>
              <a href="#" className="rounded-full bg-[#1D1A16] p-2 text-[#C8A96A] hover:bg-[#C8A96A] hover:text-[#11100E] transition-all" aria-label="Twitter">
                <Share2 className="h-4 w-4" />
              </a>
              <a href="#" className="rounded-full bg-[#1D1A16] p-2 text-[#C8A96A] hover:bg-[#C8A96A] hover:text-[#11100E] transition-all" aria-label="Website">
                <Globe className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links: Platform */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#C8A96A] mb-5">Platform</h4>
            <ul className="space-y-3 text-xs">
              <li>
                <Link href="/models" className="text-[#6B6257] hover:text-white transition-colors">Browse Models</Link>
              </li>
              <li>
                <Link href="/search?type=agencies" className="text-[#6B6257] hover:text-white transition-colors">Top Agencies</Link>
              </li>
              <li>
                <Link href="/castings" className="text-[#6B6257] hover:text-white transition-colors">Castings & Auditions</Link>
              </li>
              <li>
                <Link href="/marketplace" className="text-[#6B6257] hover:text-white transition-colors">Marketplace Services</Link>
              </li>
            </ul>
          </div>

          {/* Links: Company */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#C8A96A] mb-5">Company</h4>
            <ul className="space-y-3 text-xs">
              <li>
                <Link href="/about" className="text-[#6B6257] hover:text-white transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/contact" className="text-[#6B6257] hover:text-white transition-colors">Get In Touch</Link>
              </li>
              <li>
                <Link href="/privacy" className="text-[#6B6257] hover:text-white transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="text-[#6B6257] hover:text-white transition-colors">Terms of Service</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter / Booking Inquiry */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#C8A96A] mb-5">Exclusive Circle</h4>
            <p className="text-xs text-[#6B6257] leading-relaxed mb-4">
              Subscribe to get curated global runway updates and elite agency news.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="relative flex">
              <input
                type="email"
                placeholder="YOUR EMAIL"
                className="w-full bg-[#1D1A16] border border-[#6B6257]/30 rounded-full py-2 px-4 text-xs tracking-wider text-white placeholder-[#6B6257]/60 focus:outline-none focus:border-[#C8A96A]"
                required
              />
              <button
                type="submit"
                className="absolute right-1 top-1 rounded-full bg-[#C8A96A] p-1.5 text-[#11100E] hover:bg-[#BCA062] transition-colors"
                aria-label="Subscribe"
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-[#6B6257]/10 mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] tracking-widest text-[#6B6257] uppercase">
            &copy; {currentYear} ModelConnect.Africa. All rights reserved.
          </p>
          <p className="text-[10px] tracking-widest text-[#6B6257] uppercase flex items-center gap-1.5">
            Designed for <span className="text-white font-semibold">Africa's Creative Future</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
