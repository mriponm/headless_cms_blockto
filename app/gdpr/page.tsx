import type { Metadata } from "next";
import InfoPage from "@/components/ui/InfoPage";
export const metadata: Metadata = { title: "GDPR — Blockto" };
export default function Page() {
  return <InfoPage
    badge="Legal"
    title="GDPR Compliance"
    lastUpdated="23 April 2026"
    sections={[
      { heading: "Our commitment", body: "Blockto B.V. is fully committed to compliance with the General Data Protection Regulation (GDPR — EU 2016/679). As a Dutch company, GDPR compliance is both a legal obligation and a core value." },
      { heading: "Your rights under GDPR", body: ["Article 15 — Right of access: Request a copy of all personal data we hold about you.", "Article 16 — Right to rectification: Correct inaccurate personal data.", "Article 17 — Right to erasure ('right to be forgotten'): Delete your account and all associated data.", "Article 18 — Right to restriction: Restrict processing of your data in certain circumstances.", "Article 20 — Right to portability: Export your data in a machine-readable format.", "Article 21 — Right to object: Object to processing based on legitimate interest.", "Article 7(3) — Right to withdraw consent: Unsubscribe from marketing at any time."] },
      { heading: "How to exercise your rights", body: ["Email: privacy@blockto.io", "Subject line: 'GDPR Request — [Your Right]'", "We respond within 30 calendar days. We may request identity verification before processing requests."] },
      { heading: "Data Protection Officer", body: "Blockto B.V. has appointed a Data Protection contact. For DPO enquiries: dpo@blockto.io" },
      { heading: "Supervisory authority", body: "If you are unsatisfied with our response, you have the right to lodge a complaint with the Dutch Data Protection Authority (Autoriteit Persoonsgegevens): autoriteitpersoonsgegevens.nl" },
    ]}
  />;
}
