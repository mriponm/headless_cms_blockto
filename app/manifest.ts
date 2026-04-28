import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Blockto — Crypto Terminal",
    short_name: "Blockto",
    description: "Real-time crypto market analytics, news, prices, and trading data.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#ff6a00",
    orientation: "portrait-primary",
    categories: ["finance", "news"],
    icons: [
      {
        src: "/favicon_updated.jpeg",
        sizes: "192x192",
        type: "image/jpeg",
        purpose: "any",
      },
      {
        src: "/favicon_updated.jpeg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "maskable",
      },
    ],
    screenshots: [],
  };
}
