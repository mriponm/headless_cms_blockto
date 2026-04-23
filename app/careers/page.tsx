import type { Metadata } from "next";
import InfoPage from "@/components/ui/InfoPage";
export const metadata: Metadata = { title: "Careers — Blockto" };
export default function Page() {
  return <InfoPage
    badge="Company"
    title="Careers at Blockto"
    subtitle="Help us build the world's best crypto intelligence platform. Remote-first, results-driven."
    sections={[
      { heading: "Open roles", body: ["We are currently hiring for the following positions:", "• Senior Full-Stack Engineer (Next.js / Node.js)", "• Crypto Market Analyst", "• Content Editor — DeFi & Altcoins", "• Data Engineer (on-chain analytics)", "• Growth & Partnerships Manager"] },
      { heading: "What we offer", body: ["Competitive salary in EUR or USDC — your choice. Full remote with optional Utrecht co-working space. 30 days PTO + Dutch public holidays. Learning budget €1,500/year. Token allocation in Blockto ecosystem products."] },
      { heading: "Our hiring process", body: "1. Apply via email with your CV and a short note on why Blockto. 2. 30-minute intro call. 3. Short paid task (max 4 hours). 4. Team interview. 5. Offer." },
      { heading: "Apply", body: "Send your application to careers@blockto.io with the role title in the subject line." },
    ]}
  />;
}
