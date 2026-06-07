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
};

export default nextConfig;
