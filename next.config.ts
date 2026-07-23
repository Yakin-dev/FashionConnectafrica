import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "res.cloudinary.com",  pathname: "/**" },
      { protocol: "https", hostname: "assets.mixkit.co",    pathname: "/**" },
    ],
  },
  // Standalone output for Docker deployment
  output: "standalone",

  // Mark Prisma and bcrypt as external (not bundled) for standalone output
  serverExternalPackages: ["@prisma/client", "bcryptjs"],

  // Log fetch details in development only
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development",
    },
  },
};

export default nextConfig;
