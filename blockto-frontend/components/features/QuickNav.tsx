import { Newspaper, TrendingUp, ArrowLeftRight, BarChart2, Calendar } from "lucide-react";

const ITEMS = [
  { label: "News",   Icon: Newspaper,      href: "/" },
  { label: "Rates",  Icon: TrendingUp,     href: "/prices" },
  { label: "Buy",    Icon: ArrowLeftRight, href: "/buy" },
  { label: "Trade",  Icon: BarChart2,      href: "/trading" },
  { label: "Events", Icon: Calendar,       href: "/events" },
];

export default function QuickNav() {
  return (
    <div className="grid grid-cols-5 gap-2 mb-5 md:hidden">
      {ITEMS.map(({ label, Icon, href }) => (
        <a
          key={label}
          href={href}
          className="qn-pill flex flex-col items-center gap-1.5 py-3 px-1 rounded-[14px] cursor-pointer"
          style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.06)" }}
        >
          <span
            className="w-9 h-9 rounded-[10px] flex items-center justify-center"
            style={{ background: "rgba(255,106,0,0.08)", border: "0.5px solid rgba(255,106,0,0.15)" }}
          >
            <Icon size={18} className="text-[var(--color-brand)]" />
          </span>
          <span className="text-[10px] font-semibold text-[#aaa] font-[family-name:var(--font-display)]">{label}</span>
        </a>
      ))}
    </div>
  );
}
