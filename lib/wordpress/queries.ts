import { fetchGraphQL } from "./client";
import type { PostsData, CategoriesData, SinglePostData, WPPost, WPCategory } from "./types";

/** Maps app URL slugs to WPGraphQL category slug(s). Array = match any. */
export const APP_SLUG_TO_WP: Record<string, string | string[]> = {
  "general-news":     "general-news",
  "bitcoin":          "bitcoin",
  "ethereum":         "ethereum",
  "altcoins":         "altcoin",
  "blockchain":       "blockchain",
  "markets":          "markets",
  "analysis":         "analysis",
  "bitcoin-analysis": "bitcoin-analysis",
  "altcoin-focus":    "altcoin-focus",
  "defi":             "defi",
  "ai":               "ai",
};

const POST_FIELDS = `
  id
  title
  slug
  date
  excerpt
  featuredImage { node { sourceUrl } }
  author { node { name avatar { url } } }
  categories { nodes { name slug } }
`;

function resolveSlugs(categorySlug?: string): string[] {
  if (!categorySlug) return [];
  const mapped = APP_SLUG_TO_WP[categorySlug] ?? categorySlug;
  return Array.isArray(mapped) ? mapped : [mapped];
}

async function fetchPostsForSlug(
  first: number,
  catSlug?: string,
  after?: string,
): Promise<{ nodes: WPPost[]; hasNextPage: boolean; endCursor: string | null }> {
  const whereParts = [`orderby: { field: DATE, order: DESC }`];
  if (catSlug) whereParts.push(`categoryName: "${catSlug}"`);
  const afterPart = after ? `, after: "${after}"` : "";
  const data = await fetchGraphQL<{
    posts: { nodes: WPPost[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } };
  }>(`
    {
      posts(first: ${first}${afterPart}, where: { ${whereParts.join(", ")} }) {
        nodes { ${POST_FIELDS} }
        pageInfo { hasNextPage endCursor }
      }
    }
  `);
  return {
    nodes: data?.posts?.nodes ?? [],
    hasNextPage: data?.posts?.pageInfo?.hasNextPage ?? false,
    endCursor: data?.posts?.pageInfo?.endCursor ?? null,
  };
}

function mergePosts(results: WPPost[][], limit: number): WPPost[] {
  const seen = new Set<string>();
  return results
    .flat()
    .filter((p) => (seen.has(p.slug) ? false : (seen.add(p.slug), true)))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

// Composite cursor: base64-encoded JSON used when merging multiple category streams
interface CompositeCursor {
  v: 1;
  cursors: (string | null)[];
  hasMore: boolean[];
}

function encodeCompositeCursor(cursors: (string | null)[], hasMore: boolean[]): string {
  return Buffer.from(JSON.stringify({ v: 1, cursors, hasMore } satisfies CompositeCursor)).toString("base64");
}

function decodeCompositeCursor(s: string): CompositeCursor | null {
  try {
    const obj = JSON.parse(Buffer.from(s, "base64").toString("utf8"));
    if (obj?.v === 1) return obj as CompositeCursor;
  } catch {}
  return null;
}

export async function getPosts(first = 10, categorySlug?: string): Promise<WPPost[]> {
  const slugs = resolveSlugs(categorySlug);
  if (slugs.length <= 1) {
    const r = await fetchPostsForSlug(first, slugs[0]);
    return r.nodes;
  }
  const results = await Promise.all(slugs.map((s) => fetchPostsForSlug(first, s).then((r) => r.nodes)));
  return mergePosts(results, first);
}

export interface PostsPage {
  posts: WPPost[];
  hasNextPage: boolean;
  endCursor: string | null;
}

export async function getPostsPage(
  first = 50,
  categorySlug?: string,
  after?: string,
): Promise<PostsPage> {
  const slugs = resolveSlugs(categorySlug);

  // Single category — simple cursor-based query
  if (slugs.length <= 1) {
    const r = await fetchPostsForSlug(first, slugs[0], after);
    return { posts: r.nodes, hasNextPage: r.hasNextPage, endCursor: r.endCursor };
  }

  // Multiple categories — parallel queries with composite cursor
  let cursors: (string | null)[] = slugs.map(() => null);
  let activeIdx = slugs.map((_, i) => i);

  if (after) {
    const comp = decodeCompositeCursor(after);
    if (comp) {
      cursors = comp.cursors;
      activeIdx = comp.hasMore.map((m, i) => (m ? i : -1)).filter((i) => i >= 0);
    }
  }

  const results = await Promise.all(
    slugs.map((slug, i) =>
      activeIdx.includes(i)
        ? fetchPostsForSlug(first, slug, cursors[i] ?? undefined)
        : Promise.resolve({ nodes: [] as WPPost[], hasNextPage: false, endCursor: null })
    )
  );

  const merged = mergePosts(results.map((r) => r.nodes), first);
  const newCursors = results.map((r) => r.endCursor);
  const newHasMore = results.map((r) => r.hasNextPage);
  const anyMore = newHasMore.some(Boolean);

  return {
    posts: merged,
    hasNextPage: anyMore,
    endCursor: anyMore ? encodeCompositeCursor(newCursors, newHasMore) : null,
  };
}

export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  const data = await fetchGraphQL<SinglePostData>(`
    {
      post(id: "${slug}", idType: SLUG) {
        ${POST_FIELDS}
        content
      }
    }
  `);
  return data?.post ?? null;
}

export async function getCategories(): Promise<WPCategory[]> {
  const data = await fetchGraphQL<CategoriesData>(`
    {
      categories(first: 20) {
        nodes { name slug count }
      }
    }
  `);
  return (data?.categories?.nodes ?? []).filter(
    (c) => c.count && c.count > 0 && c.slug !== "uncategorized"
  );
}

/** Strip HTML tags from WP excerpt */
export function stripExcerpt(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\[&hellip;\]|&#8230;/g, "…").trim();
}

/** Format WP date to relative string */
export function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

/** Get the primary category of a post (skip "news" catch-all if possible) */
export function primaryCategory(post: WPPost): { name: string; slug: string } {
  const cats = post.categories.nodes;
  const preferred = cats.find((c) => c.slug !== "news" && c.slug !== "uncategorized");
  return preferred ?? cats[0] ?? { name: "News", slug: "news" };
}
