import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "Sitemap — Blockto" };

const SECTIONS = [
  { title: "Platform", links: [
    { label: "Home — Latest News", href: "/" },
    { label: "Live Prices", href: "/prices" },
    { label: "Markets", href: "/markets" },
    { label: "Trading", href: "/trading" },
    { label: "Buy & Sell", href: "/buy" },
    { label: "Economic Calendar", href: "/events" },
    { label: "Fear & Greed Index", href: "/fear-greed" },
    { label: "Bitcoin Halving", href: "/bitcoin-halving" },
  ]},
  { title: "Company", links: [
    { label: "About Blockto", href: "/about" },
    { label: "Our Mission", href: "/mission" },
    { label: "Team", href: "/team" },
    { label: "Careers", href: "/careers" },
    { label: "Press Kit", href: "/press" },
  ]},
  { title: "Resources", links: [
    { label: "Crypto Glossary", href: "/glossary" },
    { label: "Learn Centre", href: "/learn" },
    { label: "API Documentation", href: "/api-docs" },
  ]},
  { title: "Legal", links: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Terms of Use", href: "/terms" },
    { label: "Disclaimer", href: "/disclaimer" },
    { label: "GDPR", href: "/gdpr" },
  ]},
];

export default function SitemapPage() {
  return (
    <div className="relative z-[2] max-w-[1440px] mx-auto px-3 md:px-10 pb-20 pt-10">
      <div className="max-w-[760px] mx-auto">
        <span className="inline-block mb-3 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-[var(--color-brand)] border border-[rgba(255,106,0,0.2)]"
          style={{ background: "rgba(255,106,0,0.06)" }}>Resources</span>
        <h1 className="text-[32px] md:text-[40px] font-black tracking-[-1.2px] leading-[1.1] mb-3" style={{ color: "var(--color-text)" }}>Sitemap</h1>
        <p className="text-[14px] mb-8" style={{ color: "var(--color-muted)" }}>All pages on Blockto.io</p>
        <div className="h-px mb-10 bg-gradient-to-r from-[rgba(255,106,0,0.4)] via-[rgba(255,255,255,0.06)] to-transparent" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          {SECTIONS.map(s => (
            <div key={s.title}>
              <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--color-brand)] mb-4">{s.title}</h2>
              <ul className="space-y-2.5">
                {s.links.map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-[14px] font-medium hover:text-[var(--color-brand)] transition-colors" style={{ color: "var(--color-muted)" }}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
