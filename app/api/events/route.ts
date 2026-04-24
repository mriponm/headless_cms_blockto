import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";

const BASE = process.env.EVENTS_API_URL!;
const KEY  = process.env.EVENTS_API_KEY!;

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function GET(req: NextRequest) {
  // 20 requests per IP per minute
  if (!rateLimit(`events:${getIP(req)}`, 20, 60 * 1000)) {
    return rateLimitResponse();
  }

  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start") ?? new Date().toISOString().slice(0, 10);
  const end   = searchParams.get("end")   ?? start;

  try {
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
