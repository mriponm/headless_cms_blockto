import type { Metadata } from "next";
import PricesPageClient from "@/components/features/prices/PricesPageClient";

export const metadata: Metadata = {
  title: "Prices — Blockto",
  description: "Live cryptocurrency prices, market cap, volume, and metrics dashboard.",
};

export default function PricesPage() {
  return <PricesPageClient />;
}
