import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ModelConnect.Africa",
    short_name: "ModelConnect",
    description: "Africa's premium fashion & modelling talent network",
    start_url: "/",
    display: "standalone",
    background_color: "#F8F5EF",
    theme_color: "#11100E",
    icons: [
      { src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
