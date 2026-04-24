import type { Metadata } from "next";
import InfoPage from "@/components/ui/InfoPage";
export const metadata: Metadata = { title: "About Blockto" };
export default function Page() {
  return <InfoPage
    badge="Company"
    title="About Blockto"
    subtitle="Your crypto intelligence terminal — real-time data, market signals, and breaking news from the world of digital assets."
    sections={[
      { heading: "Who we are", body: ["Blockto is a crypto intelligence platform founded in Utrecht, Netherlands. We combine live market data, AI-powered analysis, and professional-grade news coverage to give traders, investors, and enthusiasts a decisive edge.", "Our team of market analysts, data engineers, and journalists work around the clock to ensure you never miss a market-moving event."] },
      { heading: "What we do", body: ["We track thousands of digital assets in real time, deliver daily AI market briefs, and surface the stories that matter — before they hit the mainstream. From Bitcoin dominance shifts to regulatory developments in Brussels, Blockto keeps you ahead of the curve."] },
      { heading: "Our values", body: ["Transparency first. We disclose conflicts of interest, cite sources, and never sell editorial coverage. Accuracy over speed — we verify before we publish. Independence — we are not affiliated with any exchange, project, or fund."] },
      { heading: "Registered entity", body: "Blockto is registered in the Netherlands and operates as an information service provider." },
    ]}
  />;
}
