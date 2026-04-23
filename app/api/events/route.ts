import { NextResponse } from "next/server";

const BASE = process.env.EVENTS_API_URL!;
const KEY  = process.env.EVENTS_API_KEY!;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start") ?? new Date().toISOString().slice(0, 10);
  const end   = searchParams.get("end")   ?? start;

  try {
    // CoinMarketCal caps at 150 per page; fetch up to 2 pages to cover busy weeks
    const fetchPage = (page: number) =>
      fetch(
        `${BASE}/events?dateRangeStart=${start}&dateRangeEnd=${end}&max=150&page=${page}`,
        { headers: { "x-api-key": KEY }, next: { revalidate: 1800 } }
      ).then((r) => r.json());

    const first = await fetchPage(1);
    const totalPages: number = first?._metadata?.page_count ?? 1;
    let events = first?.body ?? [];

    if (totalPages > 1) {
      const second = await fetchPage(2);
      events = [...events, ...(second?.body ?? [])];
    }

    return NextResponse.json(events);
  } catch (err) {
    console.error("[/api/events]", err);
    return NextResponse.json([], { status: 502 });
  }
}
