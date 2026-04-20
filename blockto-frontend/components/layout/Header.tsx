"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, Search, Menu } from "lucide-react";
import PriceTicker from "@/components/features/PriceTicker";
import ThemeToggle from "@/components/ui/ThemeToggle";
import BrandLogo from "@/components/ui/BrandLogo";
import MobileDrawer from "@/components/layout/MobileDrawer";
import SearchOverlay from "@/components/ui/SearchOverlay";

const NAV = [
  { label: "News",      href: "/",        active: true },
  { label: "Markets",   href: "/markets", dot: true },
  { label: "Prices",    href: "/prices" },
  { label: "Buy & sell",href: "/buy" },
  { label: "Trading",   href: "/trading" },
  { label: "Events",    href: "/events" },
];

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 nav-brand-link">
          <BrandLogo size={36} />
          <span className="text-[22px] font-black tracking-[-1px] font-[family-name:var(--font-display)] header-brand-text">
            block<span className="gradient-text-alt">to</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex gap-1 flex-1">
          {NAV.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-sm font-semibold transition-all duration-150 cursor-pointer font-[family-name:var(--font-display)] ${
                n.active
                  ? "text-[var(--color-brand)] bg-[rgba(255,106,0,0.08)] border border-[rgba(255,106,0,0.2)]"
                  : "nav-link"
              }`}
            >
              {n.label}
              {n.dot && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)] shadow-[0_0_8px_var(--color-brand)] pls-anim" />
              )}
            </Link>
          ))}
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
          <button
            className="px-[18px] py-2.5 rounded-[10px] text-[13px] font-extrabold text-black cursor-pointer font-[family-name:var(--font-display)] transition-all duration-150 hover:brightness-110 hover:shadow-[0_4px_20px_rgba(255,106,0,0.4)]"
            style={{ background: "var(--gradient-brand)", boxShadow: "0 4px 14px rgba(255,106,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)" }}
          >
            Sign in
          </button>
        </div>
      </div>

      {/* ── Mobile topbar ──────────────────────────────────── */}
      <div className="glass-nav flex md:hidden items-center gap-3 px-3 py-3">
        <Link href="/" className="flex items-center gap-2">
          <BrandLogo size={32} />
          <span className="text-[20px] font-black tracking-[-1px] font-[family-name:var(--font-display)] header-brand-text">
            block<span className="gradient-text-alt">to</span>
          </span>
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

      {/* ── Price ticker ────────────────────────────────────── */}
      <PriceTicker />

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
