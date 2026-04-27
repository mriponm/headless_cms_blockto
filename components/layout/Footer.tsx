"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { AlertTriangle, ShieldCheck, Lock, ChevronDown, Globe } from "lucide-react";
import { LANGUAGES, type LangCode } from "@/lib/i18n/languages";
import { useI18n } from "@/components/providers/I18nProvider";
import BrandLogo from "@/components/ui/BrandLogo";
import NewsletterForm from "@/components/ui/NewsletterForm";

const NAV_COLS = [
  { title: "Platform", links: [
    { label: "News",             href: "/" },
    { label: "Live Prices",      href: "/prices" },
    { label: "Fear & Greed",     href: "/fear-greed" },
    { label: "Bitcoin Halving",  href: "/bitcoin-halving" },
    { label: "Crypto Calendar",  href: "/events" },
  ]},
  { title: "Company", links: [
    { label: "About Blockto", href: "/about" },
    { label: "Our Mission",   href: "/mission" },
    { label: "Team",          href: "/team" },
    { label: "Careers",       href: "/careers" },
    { label: "Press Kit",     href: "/press" },
  ]},
  { title: "Resources", links: [
    { label: "Crypto Glossary", href: "/glossary" },
    { label: "Learn Centre",    href: "/learn" },
    { label: "API Docs",        href: "/api-docs" },
    { label: "Newsletter",      href: "/#newsletter" },
    { label: "Sitemap",         href: "/sitemap-page" },
  ]},
  { title: "Legal", links: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Cookie Policy",  href: "/cookies" },
    { label: "Terms of Use",   href: "/terms" },
    { label: "Disclaimer",     href: "/disclaimer" },
    { label: "GDPR",           href: "/gdpr" },
  ]},
];

const SOCIALS = [
  {
    label: "X (Twitter)",
    href: "https://x.com/cryptoblockto?s=21&t=GSgByMAktV68aoFJuxO_Dg",
    svg: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.264 5.638 5.9-5.638zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/blockto.io?igsh=MXA2Zm1nM2o0MWh3cg==",
    svg: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
  {
    label: "Telegram",
    href: "https://t.me/blocktotrading",
    svg: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
    ),
  },
];

function LanguagePicker() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ bottom: number; right: number } | null>(null);
  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  /* Calculate fixed position relative to the trigger button */
  useEffect(() => {
    if (open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({
        bottom: window.innerHeight - r.top + 8,
        right:  window.innerWidth  - r.right,
      });
    } else if (!open) {
      setPos(null);
    }
  }, [open]);

  /* Close on outside click */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        btnRef.current && !btnRef.current.contains(e.target as Node) &&
        dropRef.current && !dropRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="social-icon flex items-center gap-1.5 px-3 h-9 rounded-[10px] text-[11px] font-semibold cursor-pointer font-[family-name:var(--font-display)] footer-lang-btn transition-all duration-200 hover:border-[rgba(255,106,0,0.35)] hover:bg-[rgba(255,106,0,0.08)]"
        aria-label="Select language"
        aria-expanded={open}
      >
        <span className="text-[14px]">{current.flag}</span>
        <span className="footer-muted">{current.code.toUpperCase()}</span>
        <ChevronDown size={11} className={`footer-muted transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Fixed-position dropdown — escapes footer stacking context entirely */}
      {open && pos && (
        <div
          ref={dropRef}
          className="fixed w-[210px] rounded-[14px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.45)] z-[500] lang-dropdown"
          style={{ bottom: pos.bottom, right: pos.right }}
        >
          <div className="max-h-[240px] overflow-y-auto p-1.5">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => { setLang(l.code as LangCode); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[9px] text-left text-[12px] font-medium cursor-pointer transition-colors duration-150 font-[family-name:var(--font-display)] lang-option ${
                  l.code === lang ? "lang-option-active" : ""
                }`}
              >
                <span className="text-[15px] flex-shrink-0">{l.flag}</span>
                <span className="flex-1">{l.native}</span>
                <span className="text-[10px] footer-dimmed">{l.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


export default function Footer() {
  return (
    <footer className="relative z-[2] mt-4 footer-border-top">
      <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,106,0,0.3)] to-transparent" />

      <div className="max-w-[1440px] mx-auto px-3 md:px-10 pt-12 pb-6">

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10 mb-10">

          {/* Brand + newsletter */}
          <div>
            <Link href="/" className="inline-block mb-3">
              <BrandLogo height={34} />
            </Link>

            <p className="text-[13px] leading-[1.6] mb-6 font-[family-name:var(--font-display)] max-w-[230px] footer-muted">
              Your crypto intelligence terminal — real-time data, market signals, and breaking news.
            </p>

            {/* Newsletter */}
            <div
              className="p-4 rounded-[16px] relative overflow-hidden"
              style={{ background: "linear-gradient(135deg,rgba(255,106,0,0.08),rgba(255,106,0,0.02))", border: "0.5px solid rgba(255,106,0,0.2)" }}
            >
              <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,106,0,0.35)] to-transparent" />
              <p className="text-[13px] font-bold mb-1 font-[family-name:var(--font-display)]">Daily brief</p>
              <p className="text-[11px] mb-3 font-[family-name:var(--font-display)] footer-muted">Market moves delivered every morning.</p>
              <NewsletterForm />
            </div>
          </div>

          {/* Nav columns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {NAV_COLS.map((col) => (
              <div key={col.title}>
                <p className="text-[10px] font-extrabold uppercase tracking-[1.5px] text-[var(--color-brand)] mb-3 font-[family-name:var(--font-display)]">
                  {col.title}
                </p>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="link-hover text-[13px] font-medium font-[family-name:var(--font-display)] footer-muted transition-colors duration-150 hover:text-[#ff6a00]">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Contact + socials */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 pb-8 footer-divider">
          <div className="space-y-1">
            <p className="text-[12px] font-[family-name:var(--font-display)] footer-muted">
              <span className="footer-sub">Email: </span>
              <a href="mailto:info@blockto.io" className="link-hover footer-sub transition-colors hover:text-[#ff6a00]">info@blockto.io</a>
            </p>
            <p className="text-[12px] font-[family-name:var(--font-display)] footer-sub">Utrecht, Netherlands</p>
            <p className="text-[12px] font-[family-name:var(--font-display)] footer-dimmed">KvK: NL 89234567 · VAT: NL864523901B01</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {SOCIALS.map(({ svg, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="social-icon w-9 h-9 rounded-[10px] flex items-center justify-center cursor-pointer footer-social transition-all duration-200 hover:bg-[rgba(255,106,0,0.12)] hover:border-[rgba(255,106,0,0.3)] hover:text-[#ff6a00]"
              >
                {svg}
              </a>
            ))}
            <LanguagePicker />
          </div>
        </div>

        {/* Risk disclaimer */}
        <div
          className="my-6 p-4 rounded-[12px] flex gap-3"
          style={{ background: "rgba(255,59,79,0.04)", border: "0.5px solid rgba(255,59,79,0.15)" }}
        >
          <AlertTriangle size={16} className="text-[#ff3b4f] flex-shrink-0 mt-0.5" />
          <p className="text-[11px] leading-[1.6] font-[family-name:var(--font-display)] footer-muted">
            <span className="footer-sub font-semibold">Risk disclaimer: </span>
            Crypto-assets are highly volatile and unregulated. Blockto provides information only and does not offer investment advice. You may lose all invested capital. Past performance is not indicative of future results. Blockto is registered with the AFM as an information service provider. This is not a financial services licence.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4">
          <div className="flex flex-wrap items-center gap-3">
            {[
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Cookie Policy",  href: "/cookies" },
              { label: "Terms of Use",   href: "/terms" },
              { label: "Disclaimer",     href: "/disclaimer" },
            ].map((item) => (
              <Link key={item.label} href={item.href} className="link-hover text-[11px] font-[family-name:var(--font-display)] footer-dimmed transition-colors hover:text-[#ff6a00]">
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {[
              [ShieldCheck, "GDPR Compliant"],
              [ShieldCheck, "AFM Registered"],
              [Lock,        "SSL Secured"],
            ].map(([Icon, label]) => (
              <span key={label as string} className="flex items-center gap-1.5 text-[10px] font-[family-name:var(--font-display)] footer-dimmed">
                <Icon size={11} className="footer-dimmed" />
                {label as string}
              </span>
            ))}
          </div>
        </div>

        <p className="text-[11px] mt-4 text-center sm:text-left font-[family-name:var(--font-display)] footer-dimmed">
          © {new Date().getFullYear()} Blockto. All rights reserved. Made with ♥ in Utrecht, Netherlands.
        </p>
      </div>
    </footer>
  );
}
