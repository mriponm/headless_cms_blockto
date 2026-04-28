"use client";
import { relativeDate } from "@/lib/wordpress/queries";

export default function RelativeTime({ date }: { date: string }) {
  return <span suppressHydrationWarning>{relativeDate(date)}</span>;
}
