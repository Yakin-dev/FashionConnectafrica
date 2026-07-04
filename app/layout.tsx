import type { Metadata } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { SessionProvider } from "@/components/session-provider"

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

export const metadata: Metadata = {
  title: "FashionConnect.Africa | Premium Fashion Business Platform",
  description:
    "Africa's premium business platform connecting fashion designers, photographers, models, agencies, and creative professionals. Subscribe to showcase your work and grow your fashion career.",
  openGraph: {
    title: "FashionConnect.Africa | Fashion Business Platform",
    description:
      "A premium business platform for fashion professionals. Showcase your designs, photography, and creative services. Subscribe and connect with Africa's fashion ecosystem.",
    url: "https://fashionconnect.africa",
    type: "website",
  },
}

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
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
