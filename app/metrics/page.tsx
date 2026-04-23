import type { Metadata } from "next";
import MetricsView from "@/components/features/prices/MetricsView";

export const metadata: Metadata = {
  title: "Metrics — Blockto",
  description: "Cryptocurrency market metrics, indicators, and on-chain data.",
};

export default function MetricsPage() {
  return (
    <div className="relative z-[2] max-w-[1440px] mx-auto px-3 md:px-10 pt-4">
      <MetricsView />
    </div>
  );
}
