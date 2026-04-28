"use client";
import { useEffect, useState } from "react";
import { relativeDate } from "@/lib/wordpress/queries";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function stableDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export default function RelativeTime({ date }: { date: string }) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    setText(relativeDate(date));
    const id = setInterval(() => setText(relativeDate(date)), 30_000);
    return () => clearInterval(id);
  }, [date]);

  // Server and initial client render: stable date string — no hydration mismatch
  // After mount: useEffect updates to relative time
  return <time dateTime={date}>{text ?? stableDate(date)}</time>;
}
