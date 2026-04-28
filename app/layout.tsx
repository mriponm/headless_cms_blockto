import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Outfit, JetBrains_Mono, Lora, League_Spartan } from "next/font/google";
import "./globals.css";
import Background from "@/components/layout/Background";
import ConditionalShell from "@/components/layout/ConditionalShell";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { TranslationBatcherProvider } from "@/components/providers/TranslationBatcherProvider";
import PageTranslator from "@/components/providers/PageTranslator";
import { AuthModalProvider } from "@/components/providers/AuthModalProvider";
import AuthModal from "@/components/ui/AuthModal";
import UserSyncProvider from "@/components/providers/UserSyncProvider";
import CookieConsent from "@/components/ui/CookieConsent";
import SwRegister from "@/components/layout/SwRegister";
import PriceProvider from "@/components/providers/PriceProvider";
import AlertChecker from "@/components/features/alerts/AlertChecker";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const leagueSpartan = League_Spartan({
  variable: "--font-league-spartan",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://blockto.io";
const OG_IMAGE = `${SITE_URL}/Blockto_SEO.jpeg`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Blockto — Crypto Terminal",
    template: "%s — Blockto",
  },
  description: "Real-time crypto market analytics, news, prices, and trading data.",
  keywords: ["crypto", "bitcoin", "ethereum", "blockchain", "crypto news", "crypto prices", "defi", "market analytics"],
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: "Blockto",
    title: "Blockto — Crypto Terminal",
    description: "Real-time crypto market analytics, news, prices, and trading data.",
    url: SITE_URL,
    images: [{ url: OG_IMAGE, width: 945, height: 2048, alt: "Blockto — Crypto Terminal" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@blockto_io",
    title: "Blockto — Crypto Terminal",
    description: "Real-time crypto market analytics, news, prices, and trading data.",
    images: [OG_IMAGE],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Blockto",
    startupImage: "/favicon_updated.jpeg",
  },
  icons: {
    icon: "/favicon_updated.jpeg",
    apple: "/favicon_updated.jpeg",
    shortcut: "/favicon_updated.jpeg",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#ff6a00",
    "msapplication-TileImage": "/favicon_updated.jpeg",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const themeCls = jar.get("theme")?.value === "light" ? "light" : "dark";
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable} ${lora.variable} ${leagueSpartan.variable} ${themeCls}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cms.blockto.io" />
        <link rel="dns-prefetch" href="https://cms.blockto.io" />
      </head>
      <body className="min-h-screen flex flex-col relative" suppressHydrationWarning>
        <SwRegister />
        <UserSyncProvider />
        <AuthModalProvider>
          <AuthModal />
          <ThemeProvider>
            <I18nProvider>
              <TranslationBatcherProvider>
                <PageTranslator />
                <Background />
                <PriceProvider>
                  <AlertChecker />
                  <div className="flex flex-col flex-1 min-h-screen">
                    <ConditionalShell>
                      {children}
                    </ConditionalShell>
                  </div>
                </PriceProvider>
                <CookieConsent />
              </TranslationBatcherProvider>
            </I18nProvider>
          </ThemeProvider>
        </AuthModalProvider>
      </body>
    </html>
  );
}
