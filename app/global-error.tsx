"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-[#F8F5EF] px-4 font-sans antialiased">
        <div className="text-center max-w-md">
          <div className="relative mb-8">
            <span className="font-serif text-[12rem] font-bold text-[#1D1A16] opacity-[0.03] select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              !
            </span>
            <div className="relative z-10 mx-auto h-24 w-24 rounded-full border-2 border-red-200 bg-red-50 flex items-center justify-center shadow-sm">
              <svg
                className="h-10 w-10 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
          </div>

          <h1 className="font-serif text-3xl font-bold uppercase text-[#1D1A16] mb-3">
            Critical Error
          </h1>
          <p className="text-sm text-[#6B6257] leading-relaxed mb-8">
            A critical error occurred. Please try refreshing the page.
            If the problem persists, contact support.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1D1A16] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#C8A96A] transition-colors shadow-sm"
            >
              Try Again
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E7DED1] bg-white px-6 py-3 text-xs font-bold uppercase tracking-widest text-[#6B6257] hover:border-[#1D1A16] hover:text-[#1D1A16] transition-colors"
            >
              Back to Home
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
