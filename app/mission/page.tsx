import type { Metadata } from "next";
import InfoPage from "@/components/ui/InfoPage";
export const metadata: Metadata = { title: "Our Mission — Blockto" };
export default function Page() {
  return <InfoPage
    badge="Company"
    title="Our Mission"
    subtitle="To make professional-grade crypto intelligence accessible to everyone — not just institutions."
    sections={[
      { heading: "The problem we solve", body: "Retail crypto participants have historically been at a structural disadvantage. Institutional desks have Bloomberg terminals, proprietary data feeds, and research teams. We're changing that." },
      { heading: "Our commitment", body: ["Blockto is built on the belief that information asymmetry is the biggest obstacle to fair markets. By giving every user access to real-time prices, sentiment data, on-chain signals, and professional news analysis, we level the playing field.", "We measure success not by page views, but by the quality of decisions our users make."] },
      { heading: "Long-term vision", body: "A world where every market participant — regardless of capital size — has access to the same quality of market intelligence as the largest trading desks on Wall Street." },
    ]}
  />;
}
