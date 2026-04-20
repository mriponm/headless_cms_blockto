const usd2 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
const usd0 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const usd6 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 6 });
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 });

export function formatPrice(n: number): string {
  if (n >= 1000) return usd0.format(n);
  if (n < 0.01)  return usd6.format(n);
  return usd2.format(n);
}

export function formatPercent(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

export function formatBigNum(n: number): string {
  return compact.format(n);
}

export function formatDollarCompact(n: number): string {
  return "$" + compact.format(n);
}

export function percentClass(n: number): string {
  if (n > 0) return "text-positive";
  if (n < 0) return "text-negative";
  return "text-neutral";
}
