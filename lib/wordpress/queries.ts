import { fetchGraphQL } from "./client";
import type { PostsData, CategoriesData, SinglePostData, WPPost, WPCategory } from "./types";

/** Maps the app's URL slugs to WPGraphQL category names */
export const APP_SLUG_TO_WP: Record<string, string> = {
  "general-news":    "news",
  "bitcoin":         "bitcoin",
  "ethereum":        "ethereum",
  "altcoins":        "altcoin",
  "nfts":            "nft",
  "blockchain":      "news",
  "markets":         "markets",
  "analysis":        "analysis",
  "bitcoin-analysis":"bitcoin",
  "altcoin-focus":   "altcoin",
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

export async function getPosts(first = 10, categorySlug?: string): Promise<WPPost[]> {
  const wpCat = categorySlug ? APP_SLUG_TO_WP[categorySlug] ?? categorySlug : undefined;
  const where = wpCat ? `, where: { categoryName: "${wpCat}" }` : "";
  const data = await fetchGraphQL<PostsData>(`
    {
      posts(first: ${first}${where}) {
        nodes { ${POST_FIELDS} }
      }
    }
  `);
  return data.posts.nodes;
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
  return data.post;
}

export async function getCategories(): Promise<WPCategory[]> {
  const data = await fetchGraphQL<CategoriesData>(`
    {
      categories(first: 20) {
        nodes { name slug count }
      }
    }
  `);
  return data.categories.nodes.filter(
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
