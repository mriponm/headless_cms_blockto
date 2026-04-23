export type Impact = "high" | "med" | "low";

export interface HistoryRow { date: string; actual: string; forecast: string | null; }

export interface MacroEvent {
  kind: "macro";
  id: string;
  time: string;
  country: string;
  countryCode: string;
  title: string;
  impact: Impact;
  important: boolean;
  actual: string | null;
  forecast: string | null;
  previous: string | null;
  description?: string;
  affected?: string[];
  history?: HistoryRow[];
}

export interface CryptoEvent {
  kind: "crypto";
  id: string;
  time: string;
  platform: string;
  platformBg: string;
  platformColor: string;
  platformSymbol: string;
  badge: string;
  title: string;
  fields: { label: string; value: string; color?: string }[];
  description?: string;
  links?: { label: string; url: string }[];
  history?: HistoryRow[];
}

export type AnyEvent = MacroEvent | CryptoEvent;

export interface DayData {
  date: number;
  month: number;
  year: number;
  day: string;
  fullLabel: string;
  hasEvents: boolean;
  events: AnyEvent[];
}
