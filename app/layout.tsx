import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import Script from "next/script";
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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Blockto",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/blogto_seo_logo.jpeg`,
        width: 512,
        height: 512,
      },
      sameAs: [
        "https://twitter.com/blockto_io",
        "https://linktree.ee/blockto",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Blockto - Crypto News",
      description: "Follow Bitcoin, Ethereum and trending altcoins with live crypto prices, market signals, whale activity and breaking news on Blockto.",
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/news?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Blockto - Crypto News",
    template: "%s - Blockto",
  },
  description: "Follow Bitcoin, Ethereum and trending altcoins with live crypto prices, market signals, whale activity and breaking news on Blockto.",
  keywords: ["crypto news", "bitcoin", "ethereum", "altcoins", "crypto prices", "market signals", "whale activity", "blockchain", "defi", "breaking crypto news"],
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: "Blockto",
    title: "Blockto - Crypto News",
    description: "Follow Bitcoin, Ethereum and trending altcoins with live crypto prices, market signals, whale activity and breaking news on Blockto.",
    url: SITE_URL,
    images: [{ url: OG_IMAGE, width: 945, height: 2048, alt: "Blockto - Crypto News" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@blockto_io",
    title: "Blockto - Crypto News",
    description: "Follow Bitcoin, Ethereum and trending altcoins with live crypto prices, market signals, whale activity and breaking news on Blockto.",
    images: [OG_IMAGE],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Blockto",
    startupImage: "/blogto_seo_logo.jpeg",
  },
  icons: {
    icon: "/blogto_seo_logo.jpeg",
    apple: "/blogto_seo_logo.jpeg",
    shortcut: "/blogto_seo_logo.jpeg",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#0a0a0a",
    "msapplication-TileImage": "/blogto_seo_logo.jpeg",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const themeCls = jar.get("theme")?.value === "light" ? "light" : "dark";
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable} ${lora.variable} ${leagueSpartan.variable} ${themeCls}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="preconnect" href="https://cms.blockto.io" />
        <link rel="dns-prefetch" href="https://cms.blockto.io" />
        {/* Critical CSS: header visibility must survive CSS-load lag on slow mobile */}
        <style dangerouslySetInnerHTML={{ __html: `
          .desktop-only{display:none}
          @media(min-width:768px){.desktop-only{display:flex}.mobile-only{display:none}}
          .ticker-bar{overflow:hidden;max-height:48px;-webkit-transform:translateZ(0);transform:translateZ(0)}
          .ticker-inner{display:-webkit-box;display:-ms-flexbox;display:flex;width:max-content;white-space:nowrap;-webkit-transform:translateZ(0);transform:translateZ(0)}
          .ticker-inner>span{white-space:nowrap;flex-shrink:0}
        ` }} />
      </head>
      <body className="min-h-screen flex flex-col relative" suppressHydrationWarning>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-GT7FKFQMWX" strategy="afterInteractive" />
        <Script id="ga-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-GT7FKFQMWX');`}</Script>
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
