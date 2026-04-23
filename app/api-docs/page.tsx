import type { Metadata } from "next";
import InfoPage from "@/components/ui/InfoPage";
export const metadata: Metadata = { title: "API Docs — Blockto" };
export default function Page() {
  return <InfoPage
    badge="Resources"
    title="API Documentation"
    subtitle="Integrate Blockto market data into your own applications."
    sections={[
      { heading: "Overview", body: "The Blockto API provides real-time and historical cryptocurrency data, market metrics, news feeds, and sentiment indicators. RESTful JSON endpoints with optional WebSocket streaming." },
      { heading: "Authentication", body: ["All requests require an API key passed in the Authorization header:", "Authorization: Bearer YOUR_API_KEY", "Request your API key at: info@blockto.io (subject: API Access)"] },
      { heading: "Base URL", body: "https://api.blockto.io/v1" },
      { heading: "Endpoints (beta)", body: ["GET /prices — Live prices for all tracked assets", "GET /prices/{symbol} — Single asset price + metadata", "GET /news — Latest news articles (paginated)", "GET /news/{slug} — Single article", "GET /fear-greed — Current Fear & Greed index", "GET /halving — Bitcoin halving countdown data", "GET /markets/overview — Global market cap, dominance, volume"] },
      { heading: "Rate limits", body: "Free tier: 100 requests/minute. Pro tier: 1,000 requests/minute. Enterprise: unlimited. Contact info@blockto.io for Pro/Enterprise access." },
      { heading: "Response format", body: `All responses return JSON with the following envelope:\n{\n  "status": "ok",\n  "data": { ... },\n  "timestamp": 1700000000\n}` },
    ]}
  />;
}
