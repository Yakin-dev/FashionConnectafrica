import { Playfair_Display, Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { SessionProvider } from "@/components/session-provider"
import { defaultMetadata } from "@/lib/seo"

export const metadata = defaultMetadata

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased scroll-smooth selection:bg-[#C8A96A]/20 selection:text-[#1D1A16]",
        playfair.variable,
        inter.variable
      )}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#F8F5EF] text-[#1D1A16]">
        {/* Preconnect to CDN origin for faster Cloudinary image loading */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "FashionConnect.Africa",
              url: "https://fashionconnect.africa",
              logo: "/logo.jpeg",
              description:
                "Africa's premium business platform connecting fashion designers, photographers, models, agencies, and creative professionals.",
              foundingLocation: { "@type": "Place", name: "Kigali, Rwanda" },
              areaServed: ["Rwanda", "Kenya", "Nigeria", "Uganda", "Tanzania", "South Africa", "Africa"],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "FashionConnect.Africa",
              url: "https://fashionconnect.africa",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: "https://fashionconnect.africa/search?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <SessionProvider>
          <main id="main-content" className="outline-none flex flex-col flex-1">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  )
}
