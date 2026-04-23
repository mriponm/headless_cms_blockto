import type { Metadata } from "next";
import InfoPage from "@/components/ui/InfoPage";
export const metadata: Metadata = { title: "Terms of Use — Blockto" };
export default function Page() {
  return <InfoPage
    badge="Legal"
    title="Terms of Use"
    lastUpdated="23 April 2026"
    sections={[
      { heading: "1. Acceptance", body: "By accessing or using Blockto (blockto.io), you agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree, do not use the service." },
      { heading: "2. Service description", body: "Blockto provides cryptocurrency market data, news, analysis, and related information services. We are an information service provider registered with the AFM. We do not provide investment advice, brokerage services, or execute trades." },
      { heading: "3. User accounts", body: ["You must be 18 years or older to create an account. You are responsible for maintaining the security of your account credentials. You may not use another person's account. We reserve the right to suspend accounts that violate these terms."] },
      { heading: "4. Acceptable use", body: ["You may not: scrape or harvest data without API authorisation; attempt to circumvent access controls; use the platform to distribute spam or malware; impersonate Blockto or its staff; use automated tools to overload our infrastructure."] },
      { heading: "5. Intellectual property", body: "All content on Blockto — including articles, analysis, data visualisations, and the platform interface — is the intellectual property of Blockto B.V. or licensed third parties. You may share links and quote up to 150 words with attribution. Republication without permission is prohibited." },
      { heading: "6. Disclaimer of warranties", body: "The service is provided 'as is'. We make no warranty that the service will be uninterrupted, error-free, or that market data will be 100% accurate. Crypto data is sourced from third-party exchanges and may contain discrepancies." },
      { heading: "7. Limitation of liability", body: "To the maximum extent permitted by Dutch law, Blockto B.V. shall not be liable for financial losses arising from reliance on information published on this platform. You assume full responsibility for your investment decisions." },
      { heading: "8. Governing law", body: "These terms are governed by Dutch law. Any disputes shall be subject to the exclusive jurisdiction of the courts of Utrecht, Netherlands." },
    ]}
  />;
}
