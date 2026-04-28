"use client";
import { useEffect, useState } from "react";
import { relativeDate } from "@/lib/wordpress/queries";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Force UTC parsing — WP dateGmt has no Z suffix but is UTC
function toUtcIso(iso: string): string {
  return iso.endsWith("Z") || /[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}Z`;
}

function stableDate(iso: string): string {
  const d = new Date(toUtcIso(iso));
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

export default function RelativeTime({ date }: { date: string }) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    setText(relativeDate(date));
    const id = setInterval(() => setText(relativeDate(date)), 30_000);
    return () => clearInterval(id);
  }, [date]);

  return <time dateTime={date}>{text ?? stableDate(date)}</time>;
}
