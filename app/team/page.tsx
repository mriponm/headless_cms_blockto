import type { Metadata } from "next";
import InfoPage from "@/components/ui/InfoPage";
export const metadata: Metadata = { title: "Team — Blockto" };
export default function Page() {
  return <InfoPage
    badge="Company"
    title="Meet the Team"
    subtitle="A small team of analysts, engineers, and journalists obsessed with crypto markets."
    sections={[
      { heading: "Leadership", body: ["Our founding team brings experience from traditional finance, fintech, and investigative journalism. We are headquartered in Utrecht, Netherlands, with contributors across Europe and Southeast Asia."] },
      { heading: "Editorial team", body: "Our analysts hold CFA or equivalent qualifications and have a combined 40+ years of capital markets experience. All editorial content is independently produced with no sponsored placements." },
      { heading: "Engineering", body: "Our engineering team builds and maintains the data infrastructure that powers real-time prices, on-chain analytics, and the AI brief engine. We are a remote-first team." },
      { heading: "Join us", body: ["We are always looking for talented people who care deeply about financial markets and open technology. Check our Careers page for open roles.", "Contact: team@blockto.io"] },
    ]}
  />;
}
