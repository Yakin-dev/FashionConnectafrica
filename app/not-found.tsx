import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F5EF] px-4">
      <div className="text-center max-w-md">
        {/* Large decorative number */}
        <div className="relative mb-8">
          <span className="font-serif text-[12rem] font-bold text-[#1D1A16] opacity-[0.03] select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            404
          </span>

          {/* Icon / Emblem */}
          <div className="relative z-10 mx-auto h-24 w-24 rounded-full border-2 border-[#E7DED1] bg-white flex items-center justify-center shadow-sm">
            <svg
              className="h-10 w-10 text-[#C8A96A]"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
              />
            </svg>
          </div>
        </div>

        <h1 className="font-serif text-3xl font-bold uppercase text-[#1D1A16] mb-3">
          Page Not Found
        </h1>
        <p className="text-sm text-[#6B6257] leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          It might have been archived, renamed, or is temporarily unavailable.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1D1A16] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] transition-colors shadow-sm"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            Back to Home
          </Link>
          <Link
            href="/models"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E7DED1] bg-white px-6 py-3 text-xs font-bold uppercase tracking-widest text-[#6B6257] hover:border-[#1D1A16] hover:text-[#1D1A16] transition-colors"
          >
            Browse Models
          </Link>
        </div>
      </div>
    </div>
  )
}
