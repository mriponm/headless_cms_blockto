import type { Metadata } from "next";
import InfoPage from "@/components/ui/InfoPage";
export const metadata: Metadata = { title: "Privacy Policy — Blockto" };
export default function Page() {
  return <InfoPage
    badge="Legal"
    title="Privacy Policy"
    subtitle="How Blockto collects, uses, and protects your personal data."
    lastUpdated="23 April 2026"
    sections={[
      { heading: "1. Who we are", body: "Blockto, registered in the Netherlands. Data Protection contact: privacy@blockto.io" },
      { heading: "2. What data we collect", body: ["Account data: email address, display name, profile picture (when you register).", "Usage data: pages visited, articles saved, watchlist coins, reading progress.", "Technical data: IP address, browser type, device type, cookie identifiers.", "We do not collect financial data, payment information, or government IDs."] },
      { heading: "3. How we use your data", body: ["To provide the Blockto service (account, saved articles, watchlist).", "To send our daily market brief (if subscribed — unsubscribe at any time).", "To improve the platform through aggregate, anonymised analytics.", "We do not sell your personal data to third parties."] },
      { heading: "4. Legal basis (GDPR)", body: "Processing is based on: (a) contract performance — providing the service you signed up for; (b) legitimate interest — platform security and abuse prevention; (c) consent — newsletter subscription." },
      { heading: "5. Data storage", body: "User data is stored in the EU (Supabase Frankfurt region). We apply encryption at rest and in transit. Backups are retained for 30 days." },
      { heading: "6. Your rights", body: ["Under GDPR you have the right to: access your data, correct inaccurate data, delete your account and associated data, export your data (portability), object to processing, withdraw consent at any time.", "To exercise these rights: privacy@blockto.io. We respond within 30 days."] },
      { heading: "7. Cookies", body: "See our Cookie Policy for details on how we use cookies and how to manage them." },
      { heading: "8. Changes", body: "We may update this policy. Material changes will be notified by email or in-app notification. Continued use of Blockto after notification constitutes acceptance." },
    ]}
  />;
}
