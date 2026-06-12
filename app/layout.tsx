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
  title: "ModelConnect.Africa | Premium Fashion & Modelling Talent Network",
  description:
    "Connecting Africa's elite models, top agencies, clients, casting panels, and fashion creatives to global opportunities.",
  openGraph: {
    title: "ModelConnect.Africa | Connecting Fashion Talent",
    description:
      "Build portfolios, apply for international casting, book premium creatives, and manage modeling activities in one elegant workspace.",
    url: "https://modelconnect.africa",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SessionProvider>
      <html
        lang="en"
        className={cn(
          "h-full antialiased scroll-smooth selection:bg-[#C8A96A]/20 selection:text-[#1D1A16]",
          playfair.variable,
          inter.variable
        )}
      >
        <body className="min-h-full flex flex-col font-sans bg-[#F8F5EF] text-[#1D1A16]">
          {children}
        </body>
      </html>
    </SessionProvider>
  )
}
