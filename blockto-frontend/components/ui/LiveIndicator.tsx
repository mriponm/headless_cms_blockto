import clsx from "clsx";

export default function LiveIndicator({ className }: { className?: string }) {
  return (
    <span className={clsx("flex items-center gap-1.5", className)}>
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--color-positive)] pls-anim" aria-hidden="true" />
      <span className="text-[10px] font-bold text-[var(--color-neutral)] uppercase tracking-[2px] font-[family-name:var(--font-display)]">
        Live
      </span>
    </span>
  );
}
