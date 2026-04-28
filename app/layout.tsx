import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: {
    default: "Blockto — Crypto Terminal",
    template: "%s — Blockto",
  },
  description: "Real-time crypto market analytics, news, prices, and trading data.",
  manifest: "/manifest.webmanifest",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable} ${lora.variable} ${leagueSpartan.variable} dark`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cms.blockto.io" />
        <link rel="dns-prefetch" href="https://cms.blockto.io" />
        {/* Blocking theme init — must run before first paint to avoid flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('theme');if(t){document.documentElement.classList.remove('dark','light');document.documentElement.classList.add(t);}if('scrollRestoration' in history){history.scrollRestoration='manual';}window.scrollTo(0,0);})()` }} />
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
