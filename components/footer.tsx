"use client";

import Link from "next/link"
import Image from "next/image"

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#E7DED1] bg-[#11100E] text-[#F8F5EF] pt-20 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/logo.jpeg"
                alt="FashionConnect.Africa"
                width={36}
                height={36}
                priority
                className="rounded-full object-cover ring-2 ring-[#C8A96A]/30"
              />
              <span className="font-serif text-lg font-bold tracking-wider uppercase text-white">
                FashionConnect<span className="text-[#C8A96A]">.Africa</span>
              </span>
            </Link>
            <p className="text-xs text-[#6B6257] leading-relaxed max-w-sm">
              Connecting Africa&apos;s modelling agencies, fashion businesses, creative service providers, clients, and event organizers in one professional fashion ecosystem.
            </p>
          </div>

          {/* Links: Platform */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#C8A96A] mb-5" id="footer-platform">Platform</h4>
            <ul className="space-y-3 text-xs" aria-labelledby="footer-platform">
              <li>
                <Link href="/models" className="text-[#6B6257] hover:text-white transition-colors">Browse Models</Link>
              </li>
              <li>
                <Link href="/agencies" className="text-[#6B6257] hover:text-white transition-colors">Top Agencies</Link>
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
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#C8A96A] mb-5" id="footer-company">Company</h4>
            <ul className="space-y-3 text-xs" aria-labelledby="footer-company">
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


        </div>

        {/* Footer Bottom */}
        <div className="border-t border-[#6B6257]/10 mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] tracking-widest text-[#6B6257] uppercase">
            &copy; {currentYear} FashionConnect.Africa. All rights reserved.
          </p>
          <p className="text-[10px] tracking-widest text-[#6B6257] uppercase flex items-center gap-1.5">
            Designed for <span className="text-white font-semibold">Africa&apos;s Creative Future</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
