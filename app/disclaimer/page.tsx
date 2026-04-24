import type { Metadata } from "next";
import InfoPage from "@/components/ui/InfoPage";
export const metadata: Metadata = { title: "Disclaimer — Blockto" };
export default function Page() {
  return <InfoPage
    badge="Legal"
    title="Disclaimer"
    lastUpdated="23 April 2026"
    sections={[
      { heading: "Not financial advice", body: "All content published on Blockto — including news articles, market analysis, price data, sentiment indicators, and AI-generated briefs — is for informational purposes only. Nothing on this platform constitutes financial advice, investment advice, trading advice, or any other type of advice." },
      { heading: "Risk warning", body: ["Cryptocurrencies are highly volatile and largely unregulated financial instruments. Prices can move significantly in short time periods. You may lose all of your invested capital. Past performance of any asset is not indicative of future results.", "Do not invest money you cannot afford to lose. Consider seeking advice from an independent financial adviser before making any investment decision."] },
      { heading: "Third-party content", body: "Blockto may publish or link to content from third-party sources. We endeavour to verify the credibility of sources but cannot guarantee the accuracy of third-party information. Links to external sites do not constitute endorsement." },
      { heading: "Market data accuracy", body: "Price and market data is sourced from third-party exchanges and aggregators via API. Data may be delayed, incomplete, or contain errors. Blockto is not liable for decisions made based on inaccurate market data." },
      { heading: "AFM registration", body: "Blockto is registered with the Netherlands Authority for the Financial Markets (AFM) as an information service provider. This registration does not constitute an AFM licence to provide investment services." },
    ]}
  />;
}
