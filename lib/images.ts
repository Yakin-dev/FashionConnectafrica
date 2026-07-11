/**
 * Image SEO and optimization utilities for FashionConnect.Africa.
 *
 * Provides:
 * - Blur placeholder generation via Cloudinary transformations
 * - SEO-friendly alt text generation
 * - Image dimension helpers
 */

/**
 * Generate a Cloudinary blur placeholder URL.
 * Creates a tiny, heavily blurred version of the image that serves as
 * a low-quality image placeholder (LQIP) for Next.js Image blurDataURL.
 *
 * Only works for images hosted on Cloudinary.
 * Falls back to a transparent pixel for non-Cloudinary images.
 */
export function getCloudinaryBlurUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined

  // Check if it's a Cloudinary URL
  if (!url.includes("cloudinary.com")) {
    return undefined // Can't generate blur for non-Cloudinary images
  }

  try {
    // Insert transformation parameters for a tiny blurred version
    // Uses: w_10,q_1,e_blur:1000 — very small, low quality, heavy blur
    const uploadIndex = url.indexOf("/upload/")
    if (uploadIndex === -1) return undefined

    const before = url.slice(0, uploadIndex + 8) // "/upload/" is 8 chars
    const after = url.slice(uploadIndex + 8)
    // Insert transformation right after /upload/
    // Also use f_auto for automatic format selection
    return `${before}w_10,q_1,e_blur:1000,f_auto/${after}`
  } catch {
    return undefined
  }
}

/**
 * Generate a simple CSS-based skeleton shimmer as a data URL.
 * This is a fallback when Cloudinary blur URL is not available.
 * A tiny SVG placeholder that creates a subtle shimmer effect.
 */
export function shimmerBase64(w: number, h: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <rect width="${w}" height="${h}" fill="#E7DED1"/>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#E7DED1;stop-opacity:1"/>
        <stop offset="50%" style="stop-color:#D4C9B8;stop-opacity:1"/>
        <stop offset="100%" style="stop-color:#E7DED1;stop-opacity:1"/>
      </linearGradient>
    </defs>
  </svg>`
  const toBase64 = typeof btoa === "function"
    ? btoa(svg)
    : typeof Buffer !== "undefined"
      ? Buffer.from(svg).toString("base64")
      : ""
  return `data:image/svg+xml;base64,${toBase64}`
}

/**
 * Generate SEO-optimized alt text for a model image.
 */
export function generateModelAltText(
  professionalName: string,
  categories?: string[],
  location?: string,
  index?: number
): string {
  const name = professionalName
  const cat = categories?.length ? categories.slice(0, 2).join(" & ") : "Fashion Model"
  const loc = location || "Rwanda"
  const suffix = index !== undefined ? ` — Photo ${index + 1}` : ""

  return `${name} — ${cat} in ${loc} | FashionConnect.Africa Portfolio${suffix}`
}

/**
 * Generate SEO-optimized alt text for an agency logo.
 */
export function generateAgencyAltText(agencyName: string): string {
  return `${agencyName} — Fashion Agency Logo | FashionConnect.Africa`
}

/**
 * Generate SEO-optimized alt text for a model card thumbnail.
 */
export function generateModelCardAltText(
  name: string,
  category: string,
  location: string
): string {
  return `${name} — ${category} Model in ${location} | FashionConnect.Africa`
}

/**
 * Generate a descriptive file name for SEO from a model's name and category.
 */
export function generateImageFileName(name: string, category?: string): string {
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
  const cat = category?.toLowerCase().replace(/\s+/g, "-") || "model"
  return `${slug}-${cat}-fashionconnect-africa`
}
