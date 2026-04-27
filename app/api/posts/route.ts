import { NextRequest, NextResponse } from "next/server";
import { getPostsPage } from "@/lib/wordpress/queries";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const slug   = searchParams.get("slug") ?? undefined;
  const after  = searchParams.get("after") ?? undefined;
  const first  = Math.min(Number(searchParams.get("first") ?? "50"), 100);

  const page = await getPostsPage(first, slug, after);
  return NextResponse.json(page);
}
