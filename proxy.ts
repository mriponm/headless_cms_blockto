import { NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";

export async function proxy(request: Request) {
  const url = new URL(request.url);

  // Only run Auth0 middleware for auth routes.
  // All other routes pass through — avoids DomainResolutionError when
  // AUTH0_DOMAIN is not yet configured.
  if (!url.pathname.startsWith("/auth/")) {
    return NextResponse.next();
  }

  return await auth0.middleware(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
