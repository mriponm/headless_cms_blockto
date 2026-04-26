export const dynamic = "force-dynamic";

import { getPosts } from "@/lib/wordpress/queries";

export const metadata = { title: "CMS Test — Blockto" };

export default async function TestPage() {
  const posts = await getPosts(10);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-extrabold mb-2">WPGraphQL — Connection Test</h1>
      <p className="text-sm text-[#666] mb-8">
        Endpoint: {process.env.NEXT_PUBLIC_WP_API} · {posts.length} posts fetched
      </p>

      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="p-4 rounded-xl border border-[rgba(255,255,255,0.08)]"
            style={{ background: "rgba(255,255,255,0.025)" }}
          >
            <p className="text-[11px] text-[#666] font-mono mb-1">
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric", month: "short", day: "numeric",
              })}
              {" · "}
              {post.categories.nodes.map((c) => c.name).join(", ")}
            </p>
            <h2 className="text-[16px] font-bold leading-snug mb-1">{post.title}</h2>
            <p className="text-[11px] font-mono text-[#555]">/{post.slug}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
