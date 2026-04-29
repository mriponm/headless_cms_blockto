import { NextRequest, NextResponse } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase/ssr";

const ALLOWED_ORIGINS = new Set([
  process.env.NEXT_PUBLIC_SITE_URL ?? "",
  "http://localhost:3000",
  "http://localhost:3001",
  "https://blockto.io",
  "https://new.blockto.io",
  "https://www.blockto.io",
].filter(Boolean));

const PROTECTED_PATHS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/forgot-password",
  "/api/saved-articles",
  "/api/watchlist",
  "/api/following",
  "/api/sync-user",
];

// Public API routes that never need auth — skip Supabase session overhead
const PUBLIC_API_PREFIX = /^\/api\/(global|markets|fear-greed|mempool|futures|gas|defillama|gainers|pairs|rainbow|returns|stablecoins|altcoin-season|binance|crypto|events|tv-events|halving|search|converter|news)/;

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  // Block cross-origin POST/DELETE/PATCH on state-changing routes
  if (["POST", "DELETE", "PATCH", "PUT"].includes(method)) {
    const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
    if (isProtected) {
      const origin = req.headers.get("origin");
      if (origin && !ALLOWED_ORIGINS.has(origin)) {
        return new NextResponse(
          JSON.stringify({ error: "Forbidden" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
    }
  }

  // Skip Supabase session refresh for public data routes — saves ~10-30ms per call
  if (PUBLIC_API_PREFIX.test(pathname)) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createSupabaseMiddlewareClient(req, res);
  await supabase.auth.getSession();
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
