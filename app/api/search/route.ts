import { NextRequest, NextResponse } from "next/server";
import { fetchGraphQL } from "@/lib/wordpress/client";
import type { WPPost } from "@/lib/wordpress/types";

const POST_FIELDS = `
  title slug
  featuredImage { node { sourceUrl } }
  categories { nodes { name slug } }
`;

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ articles: [], coins: [] });

  const safeQ = q.replace(/["\\\n\r]/g, " ").slice(0, 100);

  const [wpResult, cgResult] = await Promise.allSettled([
    fetchGraphQL<{ posts: { nodes: WPPost[] } }>(`
      {
        posts(first: 5, where: { search: "${safeQ}" }) {
          nodes { ${POST_FIELDS} }
        }
      }
    `),
    fetch(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(q)}`,
      { next: { revalidate: 0 } }
    ).then((r) => (r.ok ? r.json() : { coins: [] })),
  ]);

  const articles =
    wpResult.status === "fulfilled" ? (wpResult.value?.posts?.nodes ?? []) : [];
  const coins =
    cgResult.status === "fulfilled"
      ? ((cgResult.value?.coins ?? []) as unknown[]).slice(0, 5)
      : [];

  return NextResponse.json({ articles, coins });
}
