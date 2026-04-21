"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, PlayCircle, Globe, AlertTriangle, ShieldCheck, Lock, ChevronDown } from "lucide-react";
import { LANGUAGES, type LangCode } from "@/lib/i18n/languages";
import { useI18n } from "@/components/providers/I18nProvider";
import BrandLogo from "@/components/ui/BrandLogo";

const NAV_COLS = [
  { title: "Platform",  links: ["News", "Live Prices", "Fear & Greed", "Bitcoin Halving", "Crypto Calendar"] },
  { title: "Company",   links: ["About Blockto", "Our Mission", "Team", "Careers", "Press Kit"] },
  { title: "Resources", links: ["Crypto Glossary", "Learn Centre", "API Docs", "Newsletter", "Sitemap"] },
  { title: "Legal",     links: ["Privacy Policy", "Cookie Policy", "Terms of Use", "Disclaimer", "GDPR"] },
];

const SOCIALS = [
  { Icon: MessageSquare, label: "X (Twitter)", href: "#" },
  { Icon: Send,          label: "Telegram",    href: "#" },
  { Icon: PlayCircle,    label: "YouTube",     href: "#" },
  { Icon: Globe,         label: "Website",     href: "#" },
];

function LanguagePicker() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ bottom: 0, right: 0 });
  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  /* Calculate fixed position relative to the trigger button */
  useEffect(() => {
    if (open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({
        bottom: window.innerHeight - r.top + 8,
        right:  window.innerWidth  - r.right,
      });
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
      {open && (
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
    <footer className="relative z-[2] mt-16 footer-border-top">
      <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,106,0,0.3)] to-transparent" />

      <div className="max-w-[1440px] mx-auto px-3 md:px-10 pt-12 pb-6">

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10 mb-10">

          {/* Brand + newsletter */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-3 w-fit group">
              <BrandLogo size={34} />
              <span className="text-[20px] font-extrabold tracking-[-0.5px] font-[family-name:var(--font-display)] header-brand-text transition-colors group-hover:text-[#ff6a00]">
                block<span className="gradient-text-alt">to</span>
              </span>
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
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="flex-1 min-w-0 rounded-[8px] px-3 py-2 text-[12px] outline-none transition-colors font-[family-name:var(--font-display)] footer-input"
                />
                <button
                  className="px-3 py-2 rounded-[8px] text-[11px] font-extrabold text-black cursor-pointer flex-shrink-0 font-[family-name:var(--font-display)] transition-all duration-150 hover:brightness-110 hover:shadow-[0_2px_12px_rgba(255,106,0,0.35)]"
                  style={{ background: "var(--gradient-brand)", boxShadow: "0 2px 8px rgba(255,106,0,0.2)" }}
                >
                  Join
                </button>
              </div>
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
                    <li key={link}>
                      <a href="#" className="link-hover text-[13px] font-medium font-[family-name:var(--font-display)] footer-muted transition-colors duration-150 hover:text-[#ff6a00]">
                        {link}
                      </a>
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
            {SOCIALS.map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="social-icon w-9 h-9 rounded-[10px] flex items-center justify-center cursor-pointer footer-social transition-all duration-200 hover:bg-[rgba(255,106,0,0.12)] hover:border-[rgba(255,106,0,0.3)] hover:text-[#ff6a00]"
              >
                <Icon size={15} className="footer-muted-icon transition-colors" />
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
            {["Privacy Policy", "Cookie Policy", "Terms of Use", "Disclaimer"].map((item) => (
              <a key={item} href="#" className="link-hover text-[11px] font-[family-name:var(--font-display)] footer-dimmed transition-colors hover:text-[#ff6a00]">
                {item}
              </a>
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
          © {new Date().getFullYear()} Blockto B.V. All rights reserved. Made with ♥ in Utrecht, Netherlands.
        </p>
      </div>
    </footer>
  );
}
