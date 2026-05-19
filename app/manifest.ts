import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Blockto - Crypto News",
    short_name: "Blockto",
    description: "Follow Bitcoin, Ethereum and trending altcoins with live crypto prices, market signals, whale activity and breaking news on Blockto.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    orientation: "portrait-primary",
    categories: ["finance", "news"],
    icons: [
      {
        src: "/blogto_seo_logo.jpeg",
        sizes: "192x192",
        type: "image/jpeg",
        purpose: "any",
      },
      {
        src: "/blogto_seo_logo.jpeg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "maskable",
      },
    ],
    screenshots: [],
  };
}
