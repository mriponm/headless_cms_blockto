import type { Metadata } from "next";
import InfoPage from "@/components/ui/InfoPage";
export const metadata: Metadata = { title: "Learn Centre — Blockto" };
export default function Page() {
  return <InfoPage
    badge="Resources"
    title="Learn Centre"
    subtitle="Guides, explainers, and educational content for every level of crypto experience."
    sections={[
      { heading: "Getting started", body: ["New to crypto? Start here. Our beginner guides cover everything from creating your first wallet to understanding how blockchains work.", "• What is Bitcoin and why does it matter?", "• How to buy crypto safely (a step-by-step guide)", "• Understanding private keys and seed phrases", "• Hot wallets vs cold wallets — which should you use?"] },
      { heading: "Market fundamentals", body: ["• How to read a crypto chart", "• Understanding market cap and volume", "• What drives crypto prices?", "• Fear & Greed index explained", "• How Bitcoin halvings affect price cycles"] },
      { heading: "DeFi & advanced topics", body: ["• How DeFi protocols generate yield", "• Impermanent loss explained", "• Layer 2 networks: Arbitrum, Optimism, Base", "• How to evaluate a new token before investing", "• On-chain analytics: what the data tells you"] },
      { heading: "Coming soon", body: "Interactive video lessons, quizzes, and certification tracks are under development. Sign up to our daily brief to be notified on launch." },
    ]}
  />;
}
