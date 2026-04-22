"use client";
import { useState } from "react";
import PricesToggle from "./PricesToggle";
import MetricsView from "./MetricsView";
import PricesView from "./PricesView";

export default function PricesPageClient() {
  const [tab, setTab] = useState<"metrics" | "prices">("metrics");

  return (
    <div className="relative z-[2] max-w-[1440px] mx-auto px-3 md:px-10 pb-10 pt-4">
      <PricesToggle active={tab} onChange={setTab} />
      {tab === "metrics" ? <MetricsView /> : <PricesView />}
    </div>
  );
}
