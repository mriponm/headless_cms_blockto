import type { Metadata } from "next";
import InfoPage from "@/components/ui/InfoPage";
export const metadata: Metadata = { title: "Cookie Policy — Blockto" };
export default function Page() {
  return <InfoPage
    badge="Legal"
    title="Cookie Policy"
    lastUpdated="23 April 2026"
    sections={[
      { heading: "What are cookies?", body: "Cookies are small text files stored on your device by your browser when you visit a website. They allow websites to remember your preferences and provide functionality." },
      { heading: "Cookies we use", body: ["Strictly necessary cookies — Required for authentication (Supabase session cookie) and basic site security. Cannot be disabled without breaking core functionality.", "Preference cookies — Store your theme preference (dark/light mode) and language selection. These are stored in localStorage, not as server cookies.", "Analytics cookies — We use privacy-respecting, cookie-free analytics (no third-party tracking pixels). Aggregate data only — no individual profiling."] },
      { heading: "Third-party cookies", body: "Blockto does not embed Facebook, Google Analytics, or advertising pixels. We do not use cross-site tracking cookies." },
      { heading: "Managing cookies", body: ["You can control cookies through your browser settings. Disabling strictly necessary cookies will prevent login from working.", "Browser instructions: Chrome → Settings → Privacy → Cookies. Firefox → Settings → Privacy & Security. Safari → Preferences → Privacy."] },
      { heading: "Contact", body: "For cookie-related questions: privacy@blockto.io" },
    ]}
  />;
}
