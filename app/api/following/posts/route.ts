import { NextRequest, NextResponse } from "next/server";
import { getPosts } from "@/lib/wordpress/queries";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const authorsParam = searchParams.get("authors") ?? "";
  const authorNames  = authorsParam.split(",").map(a => a.trim().toLowerCase()).filter(Boolean);
  if (authorNames.length === 0) return NextResponse.json([]);

  const posts    = await getPosts(50);
  const filtered = posts.filter(p => authorNames.includes(p.author.node.name.toLowerCase()));
  return NextResponse.json(filtered);
}
