import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FashionConnect.Africa",
    short_name: "FashionConnect",
    description:
      "Africa's premium fashion business platform — showcase your work, connect with talent, and grow your career.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    background_color: "#F8F5EF",
    theme_color: "#11100E",
    orientation: "portrait-primary",
    categories: ["fashion", "business", "lifestyle", "professional"],
    lang: "en",
    dir: "ltr",
    prefer_related_applications: false,
    icons: [
      {
        src: "/icons/icon-192x192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "monochrome",
      },
      {
        src: "/icons/icon-512x512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/logo.jpeg",
        sizes: "192x192",
        type: "image/jpeg",
        purpose: "any",
      },
      {
        src: "/logo.jpeg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Models",
        short_name: "Models",
        description: "Browse model portfolios",
        url: "/models",
        icons: [{ src: "/icons/icon-192x192.svg", sizes: "192x192" }],
      },
      {
        name: "Agencies",
        short_name: "Agencies",
        description: "Find fashion agencies",
        url: "/agencies",
        icons: [{ src: "/icons/icon-192x192.svg", sizes: "192x192" }],
      },
      {
        name: "Castings",
        short_name: "Castings",
        description: "View casting opportunities",
        url: "/castings",
        icons: [{ src: "/icons/icon-192x192.svg", sizes: "192x192" }],
      },
      {
        name: "Marketplace",
        short_name: "Marketplace",
        description: "Browse creative services",
        url: "/marketplace",
        icons: [{ src: "/icons/icon-192x192.svg", sizes: "192x192" }],
      },
    ],
    screenshots: [],
  };
}
