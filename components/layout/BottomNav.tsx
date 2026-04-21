"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Newspaper, TrendingUp, CircleDollarSign, CreditCard, Calendar } from "lucide-react";
import clsx from "clsx";

const ITEMS = [
  { href: "/",        label: "News",    Icon: Newspaper },
  { href: "/markets", label: "Markets", Icon: TrendingUp },
  { href: "/prices",  label: "Rates",   Icon: CircleDollarSign },
  { href: "/buy",     label: "Buy",     Icon: CreditCard },
  { href: "/events",  label: "Events",  Icon: Calendar },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <div className="bottom-nav fixed bottom-4 inset-x-0 z-50 flex justify-center px-3 md:hidden pointer-events-none">
      <nav
        className="bottom-nav-inner pointer-events-auto flex justify-around items-center gap-0.5 px-1.5 py-2.5 rounded-[22px] w-full max-w-[420px] relative overflow-hidden"
        style={{
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
        }}
      >
        {/* top shimmer */}
        <span className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        {/* center glow */}
        <span className="absolute top-[-40%] left-1/2 -translate-x-1/2 w-3/5 h-4/5 bg-[radial-gradient(ellipse,rgba(255,106,0,0.08),transparent_70%)] pointer-events-none" />

        {ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "relative flex-1 flex flex-col items-center gap-1 cursor-pointer px-0.5 py-1.5 rounded-[14px] transition-all duration-200 z-10",
                active && "border border-[rgba(255,106,0,0.2)]"
              )}
              style={active ? {
                background: "linear-gradient(135deg, rgba(255,106,0,0.15), rgba(255,106,0,0.05))",
                boxShadow: "0 0 20px rgba(255,106,0,0.15), inset 0 1px 0 rgba(255,255,255,0.08)",
              } : {}}
              aria-current={active ? "page" : undefined}
            >
              <Icon
                size={19}
                className="transition-all duration-200"
                style={active ? { stroke: "#ff6a00", filter: "drop-shadow(0 0 6px rgba(255,106,0,0.4))" } : { stroke: "#666" }}
              />
              <span
                className="text-[9px] font-bold tracking-[0.2px] transition-colors duration-200 font-[family-name:var(--font-display)]"
                style={{ color: active ? "#ff6a00" : "#666" }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
