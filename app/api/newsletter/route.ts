import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";

function getIP(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: NextRequest) {
  if (!rateLimit(`newsletter:${getIP(req)}`, 5, 60 * 60 * 1000)) return rateLimitResponse();

  const { email } = await req.json();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const dc = process.env.MAILCHIMP_DC!;
  const listId = process.env.MAILCHIMP_LIST_ID!;
  const apiKey = process.env.MAILCHIMP_API_KEY!;

  const res = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email_address: email, status: "subscribed" }),
  });

  const data = await res.json();

  if (res.ok || data.title === "Member Exists") {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: data.detail ?? "Subscription failed" }, { status: 400 });
}
