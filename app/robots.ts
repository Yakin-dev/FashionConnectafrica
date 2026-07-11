import type { MetadataRoute } from "next"
import { getBaseUrl } from "@/lib/url"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl()

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/login",
          "/signup",
          "/onboarding/",
          "/payments/",
          "/messages/",
          "/notifications/",
          "/settings/",
          "/events/upload/",
        ],
      },
      // Block known AI crawlers that ignore robots.txt — being explicit
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
      {
        userAgent: "CCBot",
        disallow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
