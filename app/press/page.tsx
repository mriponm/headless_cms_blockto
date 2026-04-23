import type { Metadata } from "next";
import InfoPage from "@/components/ui/InfoPage";
export const metadata: Metadata = { title: "Press Kit — Blockto" };
export default function Page() {
  return <InfoPage
    badge="Company"
    title="Press Kit"
    subtitle="Media resources, brand assets, and press contact for journalists covering Blockto."
    sections={[
      { heading: "About Blockto (boilerplate)", body: "Blockto is a Dutch crypto intelligence platform providing real-time market data, AI-powered analysis, and professional news coverage to retail and institutional participants. Founded in Utrecht, Blockto is registered with the AFM as an information service provider." },
      { heading: "Brand assets", body: ["Our logo, color palette, and brand guidelines are available for editorial use. Please do not alter colours, proportions, or add effects to the logo.", "• Logo (SVG, PNG) — available on request", "• Brand colours: #FF6A00 (brand orange), #000000 (dark), #F5F5F5 (light)", "• Primary font: Outfit (display)"] },
      { heading: "Press contact", body: ["For interview requests, data inquiries, or editorial questions:", "press@blockto.io", "Response time: within 1 business day."] },
      { heading: "Coverage guidelines", body: "When citing Blockto data or analysis, please attribute as: 'According to Blockto (blockto.io)'. We request advance notice for embargo content." },
    ]}
  />;
}
