import type { Metadata } from "next";
import { Outfit, JetBrains_Mono, Lora } from "next/font/google";
import "./globals.css";
import Background from "@/components/layout/Background";
import ConditionalShell from "@/components/layout/ConditionalShell";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { AuthModalProvider } from "@/components/providers/AuthModalProvider";
import AuthModal from "@/components/ui/AuthModal";

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

export const metadata: Metadata = {
  title: {
    default: "Blockto — Crypto Terminal",
    template: "%s — Blockto",
  },
  description: "Real-time crypto market analytics, news, prices, and trading data.",
  icons: {
    icon: "/logo-icon.svg",
    apple: "/logo-icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable} ${lora.variable} dark`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');if(t){document.documentElement.classList.remove('dark','light');document.documentElement.classList.add(t);}})()`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col relative" suppressHydrationWarning>
        <AuthModalProvider>
          <AuthModal />
          <ThemeProvider>
            <I18nProvider>
              <Background />
              <ConditionalShell>
                {children}
              </ConditionalShell>
            </I18nProvider>
          </ThemeProvider>
        </AuthModalProvider>
      </body>
    </html>
  );
}
