import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FashionConnect.Africa",
    short_name: "FashionConnect",
    description: "Africa's premium fashion business platform — showcase your work, connect with talent, and grow your career.",
    start_url: "/",
    display: "standalone",
    background_color: "#F8F5EF",
    theme_color: "#11100E",
    icons: [
      { src: "/logo.jpeg", sizes: "192x192", type: "image/jpeg" },
      { src: "/logo.jpeg", sizes: "512x512", type: "image/jpeg" },
    ],
  };
}
