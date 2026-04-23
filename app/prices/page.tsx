import type { Metadata } from "next";
import PricesView from "@/components/features/prices/PricesView";

export const metadata: Metadata = {
  title: "Prices — Blockto",
  description: "Live cryptocurrency prices and market data.",
};

export default function PricesPage() {
  return (
    <div className="relative z-[2] max-w-[1440px] mx-auto px-3 md:px-10 pt-4">
      <PricesView />
    </div>
  );
}
