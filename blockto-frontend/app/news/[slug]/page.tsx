import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPostBySlug, getPosts, primaryCategory, relativeDate, stripExcerpt } from "@/lib/wordpress/queries";
import ArticleInteractive from "@/components/features/ArticleInteractive";

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

  return (
    <>
      <ArticleInteractive />

      <div className="w-full max-w-[860px] mx-auto">

        {/* ── Hero image ── */}
        <div className="relative">
          <div className="w-full h-[300px] md:h-[480px] md:rounded-b-[24px] lg:rounded-[20px] overflow-hidden relative bg-[#0a0a0a]">
            {post.featuredImage ? (
              <Image
                src={post.featuredImage.node.sourceUrl}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 860px) 100vw, 860px"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #1e3a5f, #0a1929)" }}>
                <span className="text-[120px] font-black opacity-10 text-white">B</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90" />
          </div>

          {/* Floating tags */}
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
        </div>

        {/* ── Article wrapper ── */}
        <div className="px-4 md:px-6 lg:px-0 mt-5">

          {/* Title block */}
          <div className="pb-4 border-b art-border mb-5 relative">
            <div className="absolute bottom-[-0.5px] left-0 w-10 h-px bg-gradient-to-r from-[#ff6a00] to-transparent" />
            <div className="flex flex-wrap gap-1.5 mb-3.5">
              {post.categories.nodes.map((c) => (
                <Link key={c.slug} href={`/category/${c.slug}`}
                  className="art-tag-pill text-[10px] font-bold text-[var(--color-brand)] bg-[rgba(255,106,0,0.08)] px-[9px] py-1 rounded-[6px] tracking-[0.4px] border border-[rgba(255,106,0,0.2)] font-[family-name:var(--font-data)] cursor-pointer">
                  #{c.name}
                </Link>
              ))}
            </div>
            <h1 className="text-[26px] md:text-[34px] font-black tracking-[-1px] md:tracking-[-1.4px] leading-[1.1] mb-3.5 art-heading font-[family-name:var(--font-display)]">
              {post.title}
            </h1>
            <p className="text-[14px] md:text-[16px] art-lead-text leading-[1.55] font-medium">
              {stripExcerpt(post.excerpt)}
            </p>
          </div>

          {/* Author meta */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b art-border">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-extrabold text-black flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#ff6a00,#ff8a30)" }}>
              {post.author.node.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-[13px] font-bold art-heading">{post.author.node.name}</p>
              <p className="text-[11px] art-sub-text">
                {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>

          {/* Body */}
          {post.content ? (
            <div
              className="mb-6 art-body prose-wp"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          ) : (
            <p className="mb-6 text-[15px] leading-[1.75] art-body-text">{stripExcerpt(post.excerpt)}</p>
          )}

          {/* Related */}
          {relatedPosts.length > 0 && (
            <>
              <div className="flex items-center gap-2.5 mb-4 mt-8">
                <span className="text-[11px] font-extrabold uppercase tracking-[2.5px] art-heading font-[family-name:var(--font-display)]">
                  Related <span className="gradient-text-alt">posts</span>
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-[rgba(255,106,0,0.25)] to-transparent" />
              </div>
              <div className="flex flex-col gap-3 mb-8">
                {relatedPosts.map((rp) => {
                  const rCat = primaryCategory(rp);
                  return (
                    <Link key={rp.id} href={`/news/${rp.slug}`}
                      className="art-related-card rounded-[16px] p-3 grid grid-cols-[110px_1fr] gap-3 cursor-pointer relative overflow-hidden block">
                      <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
                      <div className="w-[110px] h-[110px] rounded-[14px] overflow-hidden flex-shrink-0 art-related-thumb relative bg-[#0a0e1a]">
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
                          <p className="text-[13px] font-bold leading-[1.35] art-heading line-clamp-3 tracking-[-0.2px]">{rp.title}</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] art-sub-text font-medium mt-1.5">
                          <span className="w-[14px] h-[14px] rounded-full flex items-center justify-center text-[7px] font-extrabold text-black flex-shrink-0" style={{ background: "var(--gradient-brand)" }}>
                            {rp.author.node.name.slice(0, 2).toUpperCase()}
                          </span>
                          {rp.author.node.name} · {relativeDate(rp.date)}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
