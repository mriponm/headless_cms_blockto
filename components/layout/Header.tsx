"use client";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, Search, Menu, ChevronDown } from "lucide-react";
import PriceTicker from "@/components/features/PriceTicker";
import ThemeToggle from "@/components/ui/ThemeToggle";
import BrandLogo from "@/components/ui/BrandLogo";
import MobileDrawer from "@/components/layout/MobileDrawer";
import SearchOverlay from "@/components/ui/SearchOverlay";
import { useTheme } from "@/components/providers/ThemeProvider";
import UserButton from "@/components/ui/UserButton";

const NAV = [
  { label: "News",      href: "/",        active: true, hasDropdown: true },
  { label: "Markets",   href: "/markets", dot: true },
  { label: "Prices",    href: "/prices" },
  { label: "Buy & sell",href: "/buy" },
  { label: "Trading",   href: "/trading" },
  { label: "Events",    href: "/events" },
];

const NEWS_CATS = [
  { label: "General News", href: "/category/general-news", emoji: "📰" },
  { label: "Bitcoin",      href: "/category/bitcoin",      emoji: "₿" },
  { label: "Ethereum",     href: "/category/ethereum",     emoji: "Ξ" },
  { label: "Altcoins",     href: "/category/altcoins",     emoji: "🪙" },
  { label: "NFTs",         href: "/category/nfts",         emoji: "🎨" },
  { label: "Blockchain",   href: "/category/blockchain",   emoji: "⛓️" },
];

export default function Header() {
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [searchOpen, setSearchOpen]     = useState(false);
  const [newsDropdown, setNewsDropdown] = useState(false);
  const dropdownRef                     = useRef<HTMLDivElement>(null);
  const { resolved } = useTheme();
  const isLight = resolved === "light";
  const pathname = usePathname();

  const ddStyle = {
    background: isLight ? "#ffffff" : "rgba(14,14,14,0.98)",
    border: `0.5px solid ${isLight ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.09)"}`,
    boxShadow: isLight
      ? "0 16px 40px rgba(0,0,0,0.12), 0 4px 16px rgba(255,106,0,0.06)"
      : "0 16px 40px rgba(0,0,0,0.6), 0 4px 16px rgba(255,106,0,0.08)",
  };
  const ddItemColor = isLight ? "#444" : "#aaa";

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setNewsDropdown(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      {/* ── Desktop topbar ─────────────────────────────────── */}
      <div className="glass-nav topbar-shimmer relative hidden md:flex items-center gap-6 px-10 py-3">
        {/* Brand */}
        <Link href="/" className="flex-shrink-0 nav-brand-link">
          <BrandLogo height={36} />
        </Link>

        {/* Nav links */}
        <nav className="flex gap-1 flex-1">
          {NAV.map((n) =>
            n.hasDropdown ? (
              <div key={n.label} className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setNewsDropdown((v) => !v)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-sm font-semibold transition-all duration-150 cursor-pointer font-[family-name:var(--font-display)] ${
                    n.active
                      ? "text-[var(--color-brand)] bg-[rgba(255,106,0,0.08)] border border-[rgba(255,106,0,0.2)]"
                      : "nav-link"
                  }`}
                >
                  {n.label}
                  <ChevronDown size={12} className={`transition-transform duration-200 ${newsDropdown ? "rotate-180" : ""}`} />
                </button>
                {newsDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-[200px] rounded-[14px] overflow-hidden z-50 py-1.5"
                    style={ddStyle}>
                    <span className="block h-px mx-3 mb-1.5 bg-gradient-to-r from-transparent via-[rgba(255,106,0,0.3)] to-transparent" />
                    {NEWS_CATS.map((cat) => (
                      <Link key={cat.href} href={cat.href}
                        onClick={() => setNewsDropdown(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-medium transition-all duration-150 font-[family-name:var(--font-display)] hover:bg-[rgba(255,106,0,0.08)] hover:text-[#ff6a00]"
                        style={{ color: ddItemColor }}>
                        <span className="w-6 h-6 rounded-[7px] flex items-center justify-center text-[13px] flex-shrink-0"
                          style={{ background: "rgba(255,106,0,0.06)", border: "0.5px solid rgba(255,106,0,0.15)" }}>
                          {cat.emoji}
                        </span>
                        {cat.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={n.label}
                href={n.href}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-sm font-semibold transition-all duration-150 cursor-pointer font-[family-name:var(--font-display)] ${
                  n.active ? "nav-link" : "nav-link"
                }`}
              >
                {n.label}
                {n.dot && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)] shadow-[0_0_8px_var(--color-brand)] pls-anim" />
                )}
              </Link>
            )
          )}
        </nav>

        {/* Search box */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] w-[300px] search-box text-left cursor-pointer transition-all duration-150 hover:border-[rgba(255,106,0,0.3)]"
        >
          <Search size={15} className="text-[#666] flex-shrink-0" />
          <span className="flex-1 text-[13px] font-medium font-[family-name:var(--font-display)] search-placeholder">
            Search articles, coins…
          </span>
          <kbd className="text-[10px] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] px-[7px] py-[2px] rounded font-[family-name:var(--font-data)] font-semibold text-[#555]">
            ⌘K
          </kbd>
        </button>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            className="relative w-10 h-10 rounded-[10px] flex items-center justify-center cursor-pointer transition-all duration-200 theme-btn hover:border-[rgba(255,106,0,0.3)] hover:text-[#ff6a00]"
            aria-label="Notifications"
          >
            <Bell size={16} className="text-[#888]" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--color-brand)] rounded-full border-2 border-black shadow-[0_0_6px_var(--color-brand)]" />
          </button>
          <ThemeToggle />
          <UserButton />
        </div>
      </div>

      {/* ── Mobile topbar ──────────────────────────────────── */}
      <div className="glass-nav flex md:hidden items-center gap-3 px-3 py-3">
        <Link href="/">
          <BrandLogo height={32} />
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle size="sm" />
          <button
            onClick={() => setSearchOpen(true)}
            className="w-9 h-9 rounded-[10px] flex items-center justify-center theme-btn transition-all duration-200 hover:bg-[rgba(255,106,0,0.12)] hover:border-[rgba(255,106,0,0.3)]"
            aria-label="Search"
          >
            <Search size={15} className="text-[#888]" />
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-9 h-9 rounded-[10px] flex items-center justify-center theme-btn transition-all duration-200 hover:bg-[rgba(255,106,0,0.12)] hover:border-[rgba(255,106,0,0.3)]"
            aria-label="Menu"
          >
            <Menu size={15} className="text-[#888]" />
          </button>
        </div>
      </div>

      {/* ── Price ticker ── */}
      {!pathname.startsWith("/news/") && <PriceTicker />}

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
