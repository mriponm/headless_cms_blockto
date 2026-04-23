import type { Metadata } from "next";
import InfoPage from "@/components/ui/InfoPage";
export const metadata: Metadata = { title: "Bitcoin Halving — Blockto" };
export default function Page() {
  return <InfoPage
    badge="Platform"
    title="Bitcoin Halving"
    subtitle="Every ~4 years, Bitcoin's block reward is cut in half. Here's everything you need to know."
    sections={[
      { heading: "What is the halving?", body: "The Bitcoin halving is a programmatic event built into Bitcoin's code that reduces the reward paid to miners for validating blocks by 50%. It occurs every 210,000 blocks (~4 years) and continues until all 21 million BTC are mined (estimated ~2140)." },
      { heading: "Halving history", body: ["• Block 0 (2009) — Reward: 50 BTC", "• Block 210,000 (Nov 2012) — Reward: 25 BTC", "• Block 420,000 (Jul 2016) — Reward: 12.5 BTC", "• Block 630,000 (May 2020) — Reward: 6.25 BTC", "• Block 840,000 (Apr 2024) — Reward: 3.125 BTC", "• Next halving (~2028) — Reward: 1.5625 BTC"] },
      { heading: "Why it matters for price", body: ["The halving reduces the rate of new Bitcoin supply. Basic economics: if demand stays constant or grows while supply growth slows, upward price pressure increases.", "Historically, Bitcoin has entered bull markets 12–18 months after each halving. Past halvings are not a guarantee of future performance — but they are structurally significant."] },
      { heading: "Countdown", body: "Live halving countdown data is available via the Blockto API and Markets page. The next halving is estimated to occur in April 2028." },
    ]}
  />;
}
