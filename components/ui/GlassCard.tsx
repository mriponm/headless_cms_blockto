import { type ReactNode } from "react";
import clsx from "clsx";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  as?: "div" | "section" | "article";
  strong?: boolean;
}

export default function GlassCard({ children, className, padding = "md", as: Tag = "div", strong = false }: GlassCardProps) {
  const p = { none: "", sm: "p-3", md: "p-4 md:p-5", lg: "p-6 md:p-8" };
  return (
    <Tag className={clsx(strong ? "glass-strong" : "glass", p[padding], className)}>
      {children}
    </Tag>
  );
}
