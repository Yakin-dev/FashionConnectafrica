import type { Metadata } from "next"
import { getBaseUrl } from "@/lib/url"

// ─── Site-wide constants ─────────────────────────────────────────────
export const SITE_NAME = "FashionConnect.Africa"
export const SITE_TITLE = "FashionConnect.Africa | Premium Fashion Business Platform"
export const SITE_DESCRIPTION =
  "Africa's premium business platform connecting fashion designers, photographers, models, agencies, and creative professionals. Subscribe to showcase your work and grow your fashion career."
export const SITE_KEYWORDS = [
  "African fashion",
  "fashion models Africa",
  "models in Rwanda",
  "fashion agencies Rwanda",
  "fashion photographers Africa",
  "African fashion designers",
  "fashion stylists Africa",
  "makeup artists Africa",
  "fashion marketplace Africa",
  "Kigali fashion",
  "fashion careers Africa",
  "model portfolio Africa",
  "creative professionals Africa",
  "fashion talent Africa",
  "African fashion industry",
  "fashion connect Africa",
  "runway models Africa",
  "editorial fashion Africa",
  "fashion business platform",
]

// ─── Default metadata ────────────────────────────────────────────────
export const defaultMetadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  metadataBase: new URL(getBaseUrl()),
  alternates: {
    canonical: getBaseUrl(),
  },
  openGraph: {
    title: "FashionConnect.Africa | Fashion Business Platform",
    description: SITE_DESCRIPTION,
    url: getBaseUrl(),
    siteName: SITE_NAME,
    locale: "en_RW",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FashionConnect.Africa | Fashion Business Platform",
    description: SITE_DESCRIPTION,
    site: "@fashionconnect_africa",
    creator: "@fashionconnect_africa",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    shortcut: { url: "/favicon.ico" },
  },
  other: {
    "application-name": SITE_NAME,
    "apple-mobile-web-app-title": SITE_NAME,
    "apple-mobile-web-app-capable": "yes",
    "mobile-web-app-capable": "yes",
  },
}

// ─── Model profile metadata builder ──────────────────────────────────
export interface ModelMetadataInput {
  id: string
  slug?: string
  name: string
  professionalName?: string | null
  categories?: string[]
  location?: string | null
  bio?: string | null
  profileImageUrl?: string | null
  agencyName?: string | null
  height?: number | null
  experienceLevel?: string | null
}

export function buildModelMetadata(model: ModelMetadataInput): Metadata {
  const displayName = model.professionalName || model.name
  const baseUrl = getBaseUrl()
  const pageUrl = `${baseUrl}/models/${model.slug || model.id}`
  const categories = model.categories?.length ? model.categories.join(", ") : "Model"
  const location = model.location || "Rwanda"
  const description =
    model.bio?.slice(0, 160) ||
    `${displayName} — ${categories} in ${location}. ${model.agencyName ? `Represented by ${model.agencyName}.` : ""} View portfolio, measurements, and experience on FashionConnect.Africa.`

  return {
    title: `${displayName} | ${categories} in ${location} | FashionConnect.Africa`,
    description,
    alternates: { canonical: pageUrl },
    keywords: [
      ...SITE_KEYWORDS,
      displayName.toLowerCase(),
      `${displayName} model`,
      `${displayName} ${location}`,
      `${location} fashion`,
    ],
    openGraph: {
      title: `${displayName} — Fashion Model in ${location}`,
      description,
      url: pageUrl,
      siteName: SITE_NAME,
      locale: "en_RW",
      type: "profile",
      ...(model.profileImageUrl ? { images: [{ url: model.profileImageUrl, width: 800, height: 1200, alt: displayName }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayName} — Fashion Model in ${location}`,
      description,
      ...(model.profileImageUrl ? { images: [model.profileImageUrl] } : {}),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
  }
}

// ─── Agency profile metadata builder ─────────────────────────────────
export interface AgencyMetadataInput {
  id: string
  slug?: string
  name: string
  location?: string | null
  description?: string | null
  logoUrl?: string | null
  modelCount?: number
}

export function buildAgencyMetadata(agency: AgencyMetadataInput): Metadata {
  const baseUrl = getBaseUrl()
  const pageUrl = `${baseUrl}/agencies/${agency.slug || agency.id}`
  const location = agency.location || "Rwanda"
  const description =
    agency.description?.slice(0, 160) ||
    `${agency.name} — Fashion talent agency in ${location}. ${agency.modelCount ? `Representing ${agency.modelCount} model${agency.modelCount === 1 ? "" : "s"}.` : ""} Discover and book professional models on FashionConnect.Africa.`

  return {
    title: `${agency.name} | Fashion Agency in ${location} | FashionConnect.Africa`,
    description,
    alternates: { canonical: pageUrl },
    keywords: [
      ...SITE_KEYWORDS,
      agency.name.toLowerCase(),
      `${agency.name} agency`,
      `${location} fashion agency`,
      `${location} talent agency`,
    ],
    openGraph: {
      title: `${agency.name} — Fashion Agency in ${location}`,
      description,
      url: pageUrl,
      siteName: SITE_NAME,
      locale: "en_RW",
      type: "website",
      ...(agency.logoUrl ? { images: [{ url: agency.logoUrl, width: 800, height: 800, alt: agency.name }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${agency.name} — Fashion Agency in ${location}`,
      description,
      ...(agency.logoUrl ? { images: [agency.logoUrl] } : {}),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
  }
}

// ─── Casting page metadata builder ───────────────────────────────────
export interface CastingMetadataInput {
  id: string
  title: string
  description: string
  location: string
  budget?: number
  category?: string
  agencyName?: string | null
}

export function buildCastingMetadata(casting: CastingMetadataInput): Metadata {
  const baseUrl = getBaseUrl()
  const pageUrl = `${baseUrl}/castings/${casting.id}`
  const description =
    casting.description.slice(0, 160) ||
    `${casting.title} — ${casting.category || "Casting"} in ${casting.location}. ${casting.agencyName ? `Posted by ${casting.agencyName}.` : ""} Apply on FashionConnect.Africa.`

  return {
    title: `${casting.title} | ${casting.location} Casting | FashionConnect.Africa`,
    description,
    alternates: { canonical: pageUrl },
    keywords: ["casting", casting.location, casting.category || "casting", `${casting.location} casting`, ...SITE_KEYWORDS],
    openGraph: {
      title: `${casting.title} — Casting in ${casting.location}`,
      description,
      url: pageUrl,
      siteName: SITE_NAME,
      locale: "en_RW",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${casting.title} — Casting in ${casting.location}`,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
  }
}

// ─── Generic listing page metadata builder ───────────────────────────
export function buildListingMetadata(title: string, description: string, path: string): Metadata {
  const baseUrl = getBaseUrl()
  const pageUrl = `${baseUrl}${path}`

  return {
    title: `${title} | FashionConnect.Africa`,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: `${title} | FashionConnect.Africa`,
      description,
      url: pageUrl,
      siteName: SITE_NAME,
      locale: "en_RW",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | FashionConnect.Africa`,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
  }
}

// ─── ImageObject Schema Generator ───────────────────────────────────
export interface ImageObjectInput {
  url: string
  caption: string
  width?: number
  height?: number
  representativeOfPage?: boolean
  contentUrl?: string
}

export function imageObjectSchema(image: ImageObjectInput) {
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    contentUrl: image.contentUrl || image.url,
    url: image.url,
    caption: image.caption,
    ...(image.width ? { width: image.width } : {}),
    ...(image.height ? { height: image.height } : {}),
    ...(image.representativeOfPage ? { representativeOfPage: "True" } : {}),
  }
}

// ─── JSON-LD Schema Generators ─────────────────

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "FashionConnect.Africa",
    url: getBaseUrl(),
    logo: `${getBaseUrl()}/logo.jpeg`,
    description: SITE_DESCRIPTION,
    foundingLocation: { "@type": "Place", name: "Kigali, Rwanda" },
    areaServed: ["Rwanda", "Kenya", "Nigeria", "Uganda", "Tanzania", "South Africa", "Africa"],
    sameAs: [
      "https://instagram.com/fashionconnect_africa",
      "https://twitter.com/fashionconnect_africa",
      "https://linkedin.com/company/fashionconnect-africa",
    ],
  }
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "FashionConnect.Africa",
    url: getBaseUrl(),
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${getBaseUrl()}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${getBaseUrl()}${item.url}`,
    })),
  }
}

export function personSchema(model: ModelMetadataInput) {
  const displayName = model.professionalName || model.name
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: displayName,
    givenName: model.name,
    jobTitle: model.categories?.join(", ") || "Model",
    homeLocation: model.location ? { "@type": "Place", name: model.location } : undefined,
    description: model.bio?.slice(0, 200),
    image: model.profileImageUrl,
    url: `${getBaseUrl()}/models/${model.slug || model.id}`,
    height: model.height ? { "@type": "QuantitativeValue", value: model.height, unitText: "CM" } : undefined,
    knowsAbout: model.categories,
    memberOf: model.agencyName ? { "@type": "Organization", name: model.agencyName } : undefined,
  }
}

export function localBusinessSchema(agency: AgencyMetadataInput) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: agency.name,
    description: agency.description?.slice(0, 200),
    url: `${getBaseUrl()}/agencies/${agency.slug || agency.id}`,
    image: agency.logoUrl,
    address: agency.location ? { "@type": "PostalAddress", addressLocality: agency.location } : undefined,
    areaServed: "Rwanda",
    numberOfEmployees: agency.modelCount ? { "@type": "QuantitativeValue", value: agency.modelCount } : undefined,
  }
}

export function collectionPageSchema(title: string, description: string, url: string, totalItems: number) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: `${getBaseUrl()}${url}`,
    numberOfItems: totalItems,
  }
}
