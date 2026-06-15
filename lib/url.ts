/**
 * Returns the application base URL.
 *
 * Priority:
 *   1. NEXT_PUBLIC_APP_URL  (set explicitly in .env / Vercel dashboard)
 *   2. VERCEL_URL           (auto-set by Vercel on every deployment)
 *   3. http://localhost:3000 (local dev fallback)
 *
 * This must NEVER return localhost in production.
 */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // VERCEL_URL is auto-injected by Vercel (e.g. "my-app-xyz.vercel.app")
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}
