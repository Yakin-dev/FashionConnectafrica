import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Pricing | FashionConnect.Africa",
  description: "Choose the right plan for your fashion business. Free, Pro, and Ultimate plans for agencies, models, and creative professionals in Africa.",
  alternates: { canonical: "/pricing" },
}

export default function PricingRedirect() {
  redirect("/upgrade")
}
