"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  X, Newspaper, TrendingUp, CircleDollarSign, CreditCard,
  Calendar, BarChart2, Info, Mail, Shield,
  ChevronDown, MessageSquare, Send, PlayCircle, Globe, Check,
  Monitor, Sun, Moon,
} from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";
import { useI18n } from "@/components/providers/I18nProvider";
import { useTheme, type Theme } from "@/components/providers/ThemeProvider";
import { LANGUAGES, type LangCode } from "@/lib/i18n/languages";
import { useAuthModal } from "@/components/providers/AuthModalProvider";

const NEWS_SUBS = [
  { label: "General news", href: "/category/general-news" },
  { label: "Bitcoin",      href: "/category/bitcoin" },
  { label: "Ethereum",     href: "/category/ethereum" },
  { label: "Altcoins",     href: "/category/altcoins" },
  { label: "NFTs",         href: "/category/nfts" },
  { label: "Blockchain",   href: "/category/blockchain" },
];

const MAIN_NAV = [
  { icon: Newspaper,        label: "News",              sub: NEWS_SUBS, badge: "LIVE", href: "/" },
  { icon: CircleDollarSign, label: "Prices & rates",    href: "/prices" },
  { icon: TrendingUp,       label: "Markets",           tag: "NEW",     href: "/markets" },
  { icon: CreditCard,       label: "Buy & sell",        href: "/buy" },
  { icon: BarChart2,        label: "Trading",           href: "/trading" },
  { icon: Calendar,         label: "Economic calendar", href: "/events" },
];

const MORE_NAV = [
  { icon: Info,   label: "About us",       href: "#" },
  { icon: Mail,   label: "Get in touch",   href: "#" },
  { icon: Shield, label: "Privacy policy", href: "#" },
];

const SOCIALS = [
  { label: "X",        Icon: MessageSquare },
  { label: "Telegram", Icon: Send },
  { label: "YouTube",  Icon: PlayCircle },
];


const THEME_OPTIONS: { value: Theme; Icon: React.ElementType; label: string }[] = [
  { value: "system", Icon: Monitor, label: "System" },
  { value: "light",  Icon: Sun,     label: "Light" },
  { value: "dark",   Icon: Moon,    label: "Dark" },
];

interface Props { open: boolean; onClose: () => void; }

function NavItem({
  icon: Icon, label, sub, badge, tag, href, onClose,
}: {
  icon: React.ElementType; label: string; sub?: { label: string; href: string }[];
  badge?: string; tag?: string; href: string; onClose: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isActive = badge != null;

  const inner = (
    <>
      <span className={`drawer-ic-wrap w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 transition-all duration-200 ${isActive ? "drawer-ic-active" : ""}`}>
        <Icon size={17} className={`transition-all duration-200 ${isActive ? "drawer-ic-svg-active" : "drawer-ic-svg"}`} strokeWidth={2} />
      </span>
      <span className="flex-1 min-w-0">
        <span className={`block text-[14px] font-semibold tracking-tight transition-colors drawer-item-text ${isActive ? "drawer-item-active-text font-bold" : ""}`}>
          {label}
        </span>
      </span>
      {badge && (
        <span className="text-[9px] font-extrabold text-black px-[7px] py-[2px] rounded-[5px] tracking-wide flex-shrink-0" style={{ background: "linear-gradient(135deg,#ff6a00,#ff8a30)" }}>
          {badge}
        </span>
      )}
      {tag && <span className="text-[10px] font-bold text-[#ff6a00] flex-shrink-0">{tag}</span>}
      {sub && (
        <ChevronDown size={15} className={`transition-transform duration-200 flex-shrink-0 ${expanded ? "rotate-180 text-[#ff6a00]" : "drawer-chevron"}`} />
      )}
    </>
  );

  if (sub) {
    return (
      <>
        <button
          onClick={() => setExpanded((v) => !v)}
          className={`drawer-mi w-full flex items-center gap-3.5 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 mb-0.5 text-left relative ${isActive ? "drawer-mi-active" : ""}`}
        >
          {inner}
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pl-[50px] flex flex-col gap-0.5 pb-1.5">
                {sub.map((s) => (
                  <Link key={s.href} href={s.href} onClick={onClose} className="flex items-center gap-2.5 px-3 py-[9px] rounded-[9px] cursor-pointer transition-all duration-150 drawer-sub-item w-full text-left group">
                    <span className="w-[5px] h-[5px] rounded-full flex-shrink-0 drawer-sub-dot group-hover:bg-[#ff6a00] group-hover:shadow-[0_0_6px_rgba(255,106,0,0.5)] transition-all" />
                    <span className="text-[12px] font-medium drawer-sub-text group-hover:text-[#ff6a00] transition-colors">{s.label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <Link href={href} onClick={onClose} className={`drawer-mi flex items-center gap-3.5 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 mb-0.5 relative ${isActive ? "drawer-mi-active" : ""}`}>
      {inner}
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] font-extrabold uppercase tracking-[2px] text-[#444] px-3 pt-3.5 pb-2">
      {children}
    </p>
  );
}

function Divider() {
  return <div className="h-px my-2.5 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.06)] to-transparent drawer-divider" />;
}

function DrawerThemeSegment() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="drawer-pref-row mx-3 mb-2 px-3 py-2.5 rounded-[12px] flex items-center gap-3.5">
      <span className="drawer-pref-ic w-[34px] h-[34px] rounded-[10px] flex items-center justify-center flex-shrink-0">
        <Sun size={16} strokeWidth={2} className="text-[#ff6a00]" />
      </span>
      <div className="flex-1">
        <p className="text-[13px] font-semibold drawer-item-text">Appearance</p>
        <p className="text-[10px] drawer-sub-text mt-0.5">Choose your theme</p>
      </div>
      <div className="flex items-center gap-0.5 p-[3px] rounded-[10px] theme-seg-wrap">
        {THEME_OPTIONS.map(({ value, Icon, label }) => (
          <button
            key={value}
            title={label}
            aria-label={label}
            onClick={() => setTheme(value)}
            className={`w-[30px] h-[26px] flex items-center justify-center rounded-[7px] transition-all duration-200 cursor-pointer ${theme === value ? "theme-seg-active" : "theme-seg-btn"}`}
          >
            <Icon size={13} strokeWidth={theme === value ? 2.5 : 2} />
          </button>
        ))}
      </div>
    </div>
  );
}

function DrawerLanguagePicker() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <div className="mx-3 mb-1">
      <button
        onClick={() => setOpen((v) => !v)}
        className="drawer-pref-row w-full flex items-center gap-3.5 px-3 py-2.5 rounded-[12px] cursor-pointer transition-all duration-200"
      >
        <span className="drawer-pref-ic w-[34px] h-[34px] rounded-[10px] flex items-center justify-center flex-shrink-0">
          <Globe size={16} className="text-[#ff6a00]" strokeWidth={2} />
        </span>
        <div className="flex-1 text-left">
          <p className="text-[13px] font-semibold drawer-item-text">Language</p>
          <p className="text-[10px] drawer-sub-text mt-0.5">{current.native}</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-[5px] rounded-[8px] drawer-lang-pill">
          <span className="text-[13px]">{current.flag}</span>
          <span className="text-[11px] font-bold font-[family-name:var(--font-data)] drawer-item-text">{current.code.toUpperCase()}</span>
          <ChevronDown size={11} className={`transition-transform duration-200 text-[#ff6a00] ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-1 mx-1 rounded-[12px] overflow-hidden drawer-lang-panel">
              <div className="max-h-[200px] overflow-y-auto p-1.5 grid grid-cols-2 gap-0.5">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code as LangCode); setOpen(false); }}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-[8px] text-left text-[11px] font-medium cursor-pointer transition-all duration-150 ${
                      l.code === lang ? "lang-option-active" : "lang-option"
                    }`}
                  >
                    <span className="text-[14px] flex-shrink-0">{l.flag}</span>
                    <span className="flex-1 truncate">{l.native}</span>
                    {l.code === lang && <Check size={10} className="text-[#ff6a00] flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MobileDrawer({ open, onClose }: Props) {
  const { resolved } = useTheme();
  const drawerRef = useRef<HTMLDivElement>(null);
  const { openModal } = useAuthModal();
  const [me, setMe] = useState<{ name?: string; email?: string; picture?: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.ok ? r.json() : null).then(setMe).catch(() => {});
  }, []);

  useEffect(() => {
    if (open) { document.body.style.overflow = "hidden"; document.body.classList.add("drawer-open"); }
    else { document.body.style.overflow = ""; document.body.classList.remove("drawer-open"); }
    return () => { document.body.style.overflow = ""; document.body.classList.remove("drawer-open"); };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isDark = resolved === "dark";

  return (
    <>
      {/* Scrim */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60]"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)" }}
            onClick={onClose}
            aria-hidden
          />
        )}
      </AnimatePresence>

      {/* Drawer panel */}
      <motion.div
        ref={drawerRef}
        initial={false}
        animate={{ x: open ? 0 : "-100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="fixed top-0 left-0 bottom-0 z-[70] flex flex-col"
        style={{
          width: "100vw",
          background: isDark ? "rgba(10,10,10,0.88)" : "rgba(248,248,245,0.96)",
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
          borderRight: isDark ? "0.5px solid rgba(255,255,255,0.08)" : "0.5px solid rgba(0,0,0,0.09)",
          boxShadow: isDark
            ? "8px 0 40px rgba(0,0,0,0.6), 8px 0 60px rgba(255,106,0,0.05)"
            : "8px 0 40px rgba(0,0,0,0.12), 8px 0 20px rgba(255,106,0,0.04)",
          overflow: "hidden",
        }}
        aria-modal="true"
        role="dialog"
        aria-label="Navigation menu"
      >
        {/* top shimmer */}
        <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[rgba(255,106,0,0.4)] via-[rgba(255,255,255,0.08)] to-transparent pointer-events-none z-10" />
        {/* corner glow */}
        <span className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(255,106,0,0.08), transparent 70%)", filter: "blur(40px)" }} />

        {/* Header */}
        <div className={`flex items-center gap-3 px-5 py-[18px] flex-shrink-0 ${isDark ? "border-b border-[rgba(255,255,255,0.05)]" : "border-b border-[rgba(0,0,0,0.07)]"}`}>
          <BrandLogo height={36} />
          <button
            onClick={onClose}
            className="ml-auto w-8 h-8 rounded-[10px] flex items-center justify-center cursor-pointer transition-all duration-200 drawer-close-btn"
            aria-label="Close menu"
          >
            <X size={14} className="drawer-close-icon" />
          </button>
        </div>

        {/* User card */}
        {me ? (
          <Link href="/profile" onClick={onClose}
            className="mx-4 mt-4 mb-1 p-3.5 rounded-[14px] flex items-center gap-3 relative overflow-hidden drawer-user-card transition-all duration-200">
            <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,106,0,0.3)] to-transparent" />
            {me.picture
              ? <img src={me.picture} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-[rgba(255,106,0,0.3)]" />
              : <div className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-extrabold text-black flex-shrink-0" style={{ background: "linear-gradient(135deg,#ff6a00,#ff8a30)" }}>
                  {(me.name ?? me.email ?? "U").slice(0, 1).toUpperCase()}
                </div>}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold drawer-item-text truncate">{me.name ?? me.email}</p>
              <p className="text-[11px] drawer-sub-text font-medium mt-0.5 truncate">{me.email}</p>
            </div>
            <span className="text-[#ff6a00] text-lg leading-none">&rsaquo;</span>
          </Link>
        ) : (
          <div className="mx-4 mt-4 mb-1 p-3.5 rounded-[14px] flex items-center gap-3 cursor-pointer relative overflow-hidden drawer-user-card transition-all duration-200"
            onClick={() => { openModal("signin"); onClose(); }}>
            <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,106,0,0.3)] to-transparent" />
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-extrabold text-black flex-shrink-0" style={{ background: "linear-gradient(135deg,#ff6a00,#ff8a30)", boxShadow: "0 0 14px rgba(255,106,0,0.25)" }}>
              ?
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold drawer-item-text">Sign in to Blockto</p>
              <p className="text-[11px] drawer-sub-text font-medium mt-0.5">Save articles &amp; track coins</p>
            </div>
            <span className="text-[#ff6a00] text-lg leading-none">&rsaquo;</span>
          </div>
        )}

        {/* Scrollable nav */}
        <div className="flex-1 overflow-y-auto pb-2 drawer-scroll">
          <div className="px-3">
            <SectionLabel>Menu</SectionLabel>
            {MAIN_NAV.map((item) => (
              <NavItem key={item.label} {...item} onClose={onClose} />
            ))}
          </div>

          <Divider />

          {/* Preferences */}
          <p className="text-[9px] font-extrabold uppercase tracking-[2px] text-[#444] px-5 pt-1 pb-2">Preferences</p>
          <DrawerThemeSegment />
          <DrawerLanguagePicker />

          <Divider />

          <div className="px-3">
            <SectionLabel>More</SectionLabel>
            {MORE_NAV.map((item) => (
              <NavItem key={item.label} {...item} onClose={onClose} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={`flex-shrink-0 px-5 pt-3.5 pb-5 ${isDark ? "border-t border-[rgba(255,255,255,0.05)]" : "border-t border-[rgba(0,0,0,0.07)]"}`}>
          {/* Socials */}
          <div className="flex justify-center gap-2.5 mb-3">
            {SOCIALS.map(({ label, Icon }) => (
              <button key={label} aria-label={label} className="w-9 h-9 rounded-[10px] flex items-center justify-center cursor-pointer transition-all duration-200 drawer-soc">
                <Icon size={14} className="drawer-soc-icon" />
              </button>
            ))}
          </div>

          <p className="text-center text-[10px] drawer-sub-text font-medium">
            Blockto.io &mdash; All rights reserved
            <span className="block mt-1 text-[#555] font-[family-name:var(--font-data)]">v2.4.1</span>
          </p>
        </div>
      </motion.div>
    </>
  );
}
