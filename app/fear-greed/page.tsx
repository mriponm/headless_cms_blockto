import type { Metadata } from "next";
import InfoPage from "@/components/ui/InfoPage";
import FearGreedWidget from "@/components/features/FearGreedWidget";

export const metadata: Metadata = { title: "Fear & Greed Index — Blockto" };

export default function Page() {
  return (
    <div className="relative z-[2] max-w-[860px] mx-auto px-4 md:px-8 pt-5 pb-24 space-y-6">
      <FearGreedWidget />
      <InfoPage
        badge="Platform"
        title="Fear & Greed Index"
        subtitle="A composite sentiment indicator measuring the emotional state of the crypto market right now."
        sections={[
          { heading: "What is the Fear & Greed Index?", body: "The Crypto Fear & Greed Index is a 0–100 score that aggregates multiple market signals into a single sentiment reading. A score near 0 means Extreme Fear (historically a buying opportunity). A score near 100 means Extreme Greed (historically a signal to be cautious)." },
          { heading: "How it's calculated", body: ["The index combines six weighted factors:", "• Volatility (25%) — Current BTC volatility vs 30/90-day averages", "• Market momentum/volume (25%) — Current volume vs recent averages", "• Social media sentiment (15%) — Hashtag velocity and sentiment on X/Twitter", "• Surveys (15%) — Weekly sentiment surveys from crypto communities", "• Bitcoin dominance (10%) — Rising dominance = fear, falling = greed", "• Google Trends (10%) — Search volume for 'Bitcoin' and related terms"] },
          { heading: "How to use it", body: ["The index is a contrarian indicator. Warren Buffett's principle applies: 'Be fearful when others are greedy, and greedy when others are fearful.'", "Extreme Fear zones have historically preceded strong recoveries. Extreme Greed zones have preceded corrections. Use alongside other analysis — never as a standalone signal."] },
          { heading: "Data source", body: "Live Fear & Greed data powered by CoinMarketCap Pro API. Updated daily." },
        ]}
      />
    </div>
  );
}
