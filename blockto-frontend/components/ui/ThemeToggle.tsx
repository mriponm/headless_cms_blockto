"use client";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme, type Theme } from "@/components/providers/ThemeProvider";

const OPTIONS: { value: Theme; Icon: React.ElementType; label: string }[] = [
  { value: "system", Icon: Monitor, label: "System" },
  { value: "light",  Icon: Sun,     label: "Light" },
  { value: "dark",   Icon: Moon,    label: "Dark" },
];

export default function ThemeToggle({ size = "md" }: { size?: "sm" | "md" }) {
  const { theme, setTheme } = useTheme();

  if (size === "sm") {
    // Simple icon button for mobile header — cycles through options
    const current = OPTIONS.find(o => o.value === theme) ?? OPTIONS[2];
    const next = OPTIONS[(OPTIONS.indexOf(current) + 1) % OPTIONS.length];
    return (
      <button
        onClick={() => setTheme(next.value)}
        aria-label={`Switch to ${next.label} mode`}
        className="w-9 h-9 rounded-[10px] flex items-center justify-center cursor-pointer transition-colors duration-200 theme-btn"
      >
        <current.Icon size={14} className="text-[#888]" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-0.5 p-[3px] rounded-[10px] theme-seg-wrap">
      {OPTIONS.map(({ value, Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          aria-label={label}
          title={label}
          className={`w-[30px] h-[26px] flex items-center justify-center rounded-[7px] transition-all duration-200 cursor-pointer ${
            theme === value ? "theme-seg-active" : "theme-seg-btn"
          }`}
        >
          <Icon size={13} strokeWidth={theme === value ? 2.5 : 2} />
        </button>
      ))}
    </div>
  );
}
