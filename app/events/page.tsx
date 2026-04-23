import type { Metadata } from "next";
import EventsClient from "./EventsClient";
import type { DayData, MacroEvent, AnyEvent } from "./types";

export const metadata: Metadata = {
  title: "Events Calendar",
  description:
    "Stay updated with upcoming crypto events, listings, protocol upgrades, and macro economic releases that move the market.",
};

const COUNTRY_NAMES: Record<string, string> = {
  US: "United States", JP: "Japan",        AU: "Australia",    CN: "China",
  GB: "United Kingdom",EU: "Euro Zone",    CA: "Canada",       DE: "Germany",
  FR: "France",        IT: "Italy",        ES: "Spain",        KR: "South Korea",
  IN: "India",         BR: "Brazil",       MX: "Mexico",       SG: "Singapore",
  NZ: "New Zealand",   CH: "Switzerland",  SE: "Sweden",       NO: "Norway",
  HK: "Hong Kong",     ZA: "South Africa", TH: "Thailand",     TW: "Taiwan",
  RU: "Russia",        TR: "Turkey",       PL: "Poland",       CZ: "Czech Republic",
  HU: "Hungary",       RO: "Romania",      ID: "Indonesia",    MY: "Malaysia",
  PH: "Philippines",   VN: "Vietnam",      AR: "Argentina",    CL: "Chile",
  CO: "Colombia",      PT: "Portugal",     GR: "Greece",       AT: "Austria",
  BE: "Belgium",       NL: "Netherlands",  FI: "Finland",      DK: "Denmark",
};

function tvImpact(importance: number): "high" | "med" | "low" {
  if (importance >= 1)  return "high";
  if (importance >= 0)  return "med";
  return "low";
}

function fmtVal(raw: number | null, unit?: string): string | null {
  if (raw === null || raw === undefined) return null;
  return `${raw}${unit ?? ""}`;
}

function buildWeek(): {
  startISO: string; endISO: string;
  days: Omit<DayData, "events" | "hasEvents">[];
} {
  const now    = new Date();
  const dow    = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const DAYS_S = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const DAYS_L = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const MON_L  = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      date:      d.getDate(),
      month:     d.getMonth(),
      year:      d.getFullYear(),
      day:       DAYS_S[d.getDay()],
      fullLabel: `${DAYS_L[d.getDay()]} ${d.getDate()} ${MON_L[d.getMonth()]}`,
    };
  });

  return { startISO: monday.toISOString(), endISO: sunday.toISOString(), days };
}

interface TVEvent {
  id: string;
  title: string;
  country: string;
  actual: string | null;
  actualRaw: number | null;
  previous: string | null;
  previousRaw: number | null;
  forecast: string | null;
  forecastRaw: number | null;
  unit?: string;
  importance: number;
  date: string;
  comment?: string;
  source_url?: string;
}

export default async function EventsPage() {
  const { startISO, endISO, days: weekDays } = buildWeek();

  let tvEvents: TVEvent[] = [];
  try {
    const res = await fetch(
      `https://economic-calendar.tradingview.com/events?from=${encodeURIComponent(startISO)}&to=${encodeURIComponent(endISO)}`,
      {
        headers: { "Origin": "https://www.tradingview.com", "Referer": "https://www.tradingview.com/" },
        next: { revalidate: 1800 },
      }
    );
    const data = await res.json();
    tvEvents = data?.result ?? [];
  } catch { /* shows empty days */ }

  const byDate = new Map<string, MacroEvent[]>();
  for (const ev of tvEvents) {
    const dateKey = ev.date.slice(0, 10);
    if (!byDate.has(dateKey)) byDate.set(dateKey, []);
    const unit   = ev.unit ?? "";
    const impact = tvImpact(ev.importance);
    byDate.get(dateKey)!.push({
      kind:        "macro",
      id:          `tv-${ev.id}`,
      time:        ev.date.slice(11, 16),
      country:     COUNTRY_NAMES[ev.country] ?? ev.country,
      countryCode: ev.country.toLowerCase(),
      title:       ev.title,
      impact,
      important:   impact === "high",
      actual:      ev.actual   ?? fmtVal(ev.actualRaw,   unit),
      forecast:    ev.forecast ?? fmtVal(ev.forecastRaw, unit),
      previous:    ev.previous ?? fmtVal(ev.previousRaw, unit),
      description: ev.comment  ?? undefined,
    });
  }

  const days: DayData[] = weekDays.map((d) => {
    const key    = `${d.year}-${String(d.month + 1).padStart(2, "0")}-${String(d.date).padStart(2, "0")}`;
    const events: AnyEvent[] = (byDate.get(key) ?? []).sort((a, b) => a.time.localeCompare(b.time));
    return { ...d, hasEvents: events.length > 0, events };
  });

  const now      = new Date();
  const todayIdx = days.findIndex(
    (d) => d.date === now.getDate() && d.month === now.getMonth() && d.year === now.getFullYear()
  );

  return <EventsClient days={days} todayIdx={todayIdx >= 0 ? todayIdx : 0} />;
}
