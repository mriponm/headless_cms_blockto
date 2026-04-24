import { NextRequest, NextResponse } from "next/server";
import { getPosts } from "@/lib/wordpress/queries";
import { createSupabaseServerClient } from "@/lib/supabase/ssr";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function GET(req: NextRequest) {
  if (!rateLimit(`following-posts:${getIP(req)}`, 30, 60 * 1000)) {
    return rateLimitResponse();
  }

  // Require authenticated session
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const authorsParam = searchParams.get("authors") ?? "";
  const authorNames  = authorsParam.split(",").map(a => a.trim().toLowerCase()).filter(Boolean);
  if (authorNames.length === 0) return NextResponse.json([]);

  const posts    = await getPosts(50);
  const filtered = posts.filter(p => authorNames.includes(p.author.node.name.toLowerCase()));
  return NextResponse.json(filtered);
}
