import { notFound } from "next/navigation";
import AuthorAvatar from "@/components/ui/AuthorAvatar";
import Image from "next/image";
import Link from "next/link";
import { getPostBySlug, getPosts, primaryCategory, relativeDate, stripExcerpt } from "@/lib/wordpress/queries";
import { pickAuthor } from "@/lib/authors";
import ArticleInteractive from "@/components/features/ArticleInteractive";
import ArticleImageActions from "@/components/features/ArticleImageActions";
import ArticleMetaBar from "@/components/features/ArticleMetaBar";
import ArticleMarketCard from "@/components/features/ArticleMarketCard";
import ArticleFooter from "@/components/features/ArticleFooter";
import ArticleTranslatedBody from "@/components/features/ArticleTranslatedBody";
import TranslatedLabel from "@/components/ui/TranslatedLabel";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Not Found" };
  return {
    title: `${post.title} — Blockto`,
    description: stripExcerpt(post.excerpt),
    openGraph: {
      title: post.title,
      description: stripExcerpt(post.excerpt),
      images: post.featuredImage ? [post.featuredImage.node.sourceUrl] : [],
    },
  };
}


export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, related] = await Promise.all([
    getPostBySlug(slug),
    getPosts(4),
  ]);

  if (!post) notFound();

  const cat = primaryCategory(post);
  const relatedPosts = related.filter((p) => p.slug !== slug).slice(0, 3);
  const postUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://blockto.news"}/news/${slug}`;
  const dateStr = new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <>
      {/* Reading progress — fixed at very top of viewport */}
      <ArticleInteractive
        slug={slug}
        title={post.title}
        image={post.featuredImage?.node.sourceUrl ?? ""}
        category={cat?.name ?? ""}
        date={dateStr}
      />

      <div className="w-full max-w-[860px] mx-auto pb-16">

        {/* ── Hero image ── */}
        <div className="relative mt-0">
          <div className="w-full overflow-hidden relative bg-[#0a0a0a]" style={{ borderRadius: "5px" }}>
            {post.featuredImage ? (
              <Image
                src={post.featuredImage.node.sourceUrl}
                alt={post.title}
                width={860}
                height={480}
                className="w-full h-auto block"
                sizes="860px"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#1e3a5f,#0a1929)" }}>
                <span className="text-[120px] font-black opacity-10 text-white">B</span>
              </div>
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent from-40% to-black/85 to-100%" />

            {/* Category + time — top left */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-black px-3 py-[6px] rounded-[7px] tracking-[0.8px] font-[family-name:var(--font-data)]"
                style={{ background: "linear-gradient(135deg,#ff6a00,#ff8a30)", boxShadow: "0 4px 14px rgba(255,106,0,0.3)" }}>
                {cat.name.toUpperCase()}
              </span>
              <span className="text-[10px] font-bold text-white bg-black/50 backdrop-blur-[10px] px-3 py-[6px] rounded-[7px] border border-white/10 flex items-center gap-1.5">
                <span className="w-[5px] h-[5px] bg-[var(--color-positive)] rounded-full shadow-[0_0_6px_var(--color-positive)] pls-anim" />
                {relativeDate(post.date)}
              </span>
            </div>

            {/* Save + Share — bottom right */}
            <ArticleImageActions
              title={post.title}
              url={postUrl}
              slug={slug}
              excerpt={post.excerpt ?? ""}
              category={cat?.name ?? ""}
              image={post.featuredImage?.node.sourceUrl ?? ""}
              date={dateStr}
            />
          </div>

          {/* Caption */}
          <p className="art-caption text-[10px] font-medium italic leading-[1.5] px-[18px] pt-2 font-[family-name:var(--font-display)]">
            Photo: Illustrative
          </p>
        </div>

        {/* ── Article content ── */}
        <div className="px-[18px] mt-4">

          {/* Hashtag tags */}
          <div className="flex flex-wrap gap-1.5 mb-3.5">
            {post.categories.nodes.map((c) => (
              <Link key={c.slug} href={`/category/${c.slug}`}
                className="art-tag-pill text-[10px] font-bold text-[var(--color-brand)] bg-[rgba(255,106,0,0.08)] px-[9px] py-1 rounded-[6px] tracking-[0.4px] border border-[rgba(255,106,0,0.2)] font-[family-name:var(--font-data)] cursor-pointer">
                #{c.name}
              </Link>
            ))}
          </div>

          {/* Translated title + excerpt + meta + takeaways + body */}
          <ArticleTranslatedBody
            title={post.title}
            excerpt={stripExcerpt(post.excerpt)}
            content={post.content ?? `<p>${stripExcerpt(post.excerpt)}</p>`}
            takeaways={
              stripExcerpt(post.excerpt)
                .split(/[.!?]+/)
                .map(s => s.trim())
                .filter(s => s.length > 20)
                .slice(0, 3)
            }
            metaSlot={
              <ArticleMetaBar
                slug={slug}
                dateStr={dateStr}
              />
            }
          />

          {/* How markets are positioning */}
          <div className="flex items-center gap-2.5 mb-3 mt-2">
            <TranslatedLabel tKey="article.howMarkets"
              className="text-[11px] font-extrabold uppercase tracking-[2px] art-heading font-[family-name:var(--font-display)]" />
            <div className="flex-1 h-px bg-gradient-to-r from-[rgba(255,106,0,0.25)] to-transparent" />
          </div>
          <ArticleMarketCard />

          {/* Disclaimer → Buy crypto → Tags → Share → Author bio */}
          <ArticleFooter
            tags={post.categories.nodes}
            postTitle={post.title}
            postUrl={postUrl}
            slug={slug}
          />

          {/* Similar/related news — always last */}
          {relatedPosts.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-2.5 mb-4">
                <TranslatedLabel tKey="article.similarNews"
                  className="text-[11px] font-extrabold uppercase tracking-[2.5px] art-heading font-[family-name:var(--font-display)]" />
                <div className="flex-1 h-px bg-gradient-to-r from-[rgba(255,106,0,0.25)] to-transparent" />
              </div>
              <div className="flex flex-col gap-2.5">
                {relatedPosts.map((rp) => {
                  const rCat = primaryCategory(rp);
                  return (
                    <Link key={rp.id} href={`/news/${rp.slug}`}
                      className="art-related-card rounded-[16px] p-3 grid grid-cols-[110px_1fr] gap-3 cursor-pointer relative overflow-hidden block">
                      <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
                      <div className="w-[110px] h-[110px] rounded-[14px] overflow-hidden flex-shrink-0 art-related-thumb relative">
                        {rp.featuredImage ? (
                          <Image src={rp.featuredImage.node.sourceUrl} alt={rp.title} fill className="object-cover" sizes="110px" />
                        ) : (
                          <div className="w-full h-full" style={{ background: "linear-gradient(135deg,#1a1a2e,#2d1b4e)" }} />
                        )}
                      </div>
                      <div className="flex flex-col justify-between min-w-0">
                        <div>
                          <span className="inline-block text-[8px] font-extrabold text-[var(--color-brand)] bg-[rgba(255,106,0,0.08)] px-[7px] py-[2px] rounded-[5px] tracking-[0.5px] font-[family-name:var(--font-data)] border border-[rgba(255,106,0,0.2)] mb-1.5">
                            {rCat.name.toUpperCase()}
                          </span>
                          <p className="text-[13px] font-bold leading-[1.35] art-heading line-clamp-3 tracking-[-0.2px] font-[family-name:var(--font-display)]">
                            {rp.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] art-sub-text font-medium mt-1.5">
                          <AuthorAvatar slug={rp.slug} size={14} />
                          {pickAuthor(rp.slug).name} · {relativeDate(rp.date)}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
