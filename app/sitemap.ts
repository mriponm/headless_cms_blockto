import type { MetadataRoute } from "next";
import { fetchGraphQL } from "@/lib/wordpress/client";
import { COIN_IDS } from "@/lib/coinIds";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://blockto.io";

const CATEGORY_SLUGS = [
  "general-news",
  "bitcoin",
  "ethereum",
  "altcoins",
  "blockchain",
  "markets",
  "analysis",
  "bitcoin-analysis",
  "altcoin-focus",
  "defi",
  "ai",
];

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: SITE_URL, lastModified: new Date(), changeFrequency: "hourly", priority: 1.0 },
  { url: `${SITE_URL}/news`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
  { url: `${SITE_URL}/prices`, lastModified: new Date(), changeFrequency: "always", priority: 0.9 },
  { url: `${SITE_URL}/metrics`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.8 },
  { url: `${SITE_URL}/buy`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  { url: `${SITE_URL}/trading`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  { url: `${SITE_URL}/events`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
  { url: `${SITE_URL}/fear-greed`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
  { url: `${SITE_URL}/bitcoin-halving`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  { url: `${SITE_URL}/glossary`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
  { url: `${SITE_URL}/learn`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
  { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  { url: `${SITE_URL}/team`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  { url: `${SITE_URL}/mission`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  { url: `${SITE_URL}/careers`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
  { url: `${SITE_URL}/press`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  { url: `${SITE_URL}/api-docs`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  { url: `${SITE_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  { url: `${SITE_URL}/disclaimer`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  { url: `${SITE_URL}/cookies`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  { url: `${SITE_URL}/gdpr`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
];

async function fetchAllPostSlugs(): Promise<{ slug: string; date: string }[]> {
  const results: { slug: string; date: string }[] = [];
  let after: string | null = null;

  for (let i = 0; i < 20; i++) {
    const afterPart: string = after ? `, after: "${after}"` : "";
    const data = await fetchGraphQL<{
      posts: {
        nodes: { slug: string; dateGmt: string }[];
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
    }>(
      `{ posts(first: 100${afterPart}, where: { orderby: { field: DATE, order: DESC } }) {
          nodes { slug dateGmt }
          pageInfo { hasNextPage endCursor }
        }
      }`,
      undefined,
      3600,
    );

    if (!data?.posts) break;
    results.push(...data.posts.nodes.map((n) => ({ slug: n.slug, date: n.dateGmt })));
    if (!data.posts.pageInfo.hasNextPage) break;
    after = data.posts.pageInfo.endCursor;
  }

  return results;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts] = await Promise.all([fetchAllPostSlugs()]);

  const newsEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE_URL}/news/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryEntries: MetadataRoute.Sitemap = CATEGORY_SLUGS.map((slug) => ({
    url: `${SITE_URL}/category/${slug}`,
    lastModified: new Date(),
    changeFrequency: "hourly",
    priority: 0.7,
  }));

  const coinEntries: MetadataRoute.Sitemap = Object.values(COIN_IDS).map((id) => ({
    url: `${SITE_URL}/coins/${id}`,
    lastModified: new Date(),
    changeFrequency: "always",
    priority: 0.8,
  }));

  return [...STATIC_PAGES, ...newsEntries, ...categoryEntries, ...coinEntries];
}
