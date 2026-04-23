import FadeIn from "@/components/ui/FadeIn";
import BreakingBanner from "@/components/features/BreakingBanner";
import QuickNav from "@/components/features/QuickNav";
import PulseRow from "@/components/features/PulseRow";
import HeroSection from "@/components/features/homepage/HeroSection";
import NewsGrid from "@/components/features/homepage/NewsGrid";
import CategoryNewsSection from "@/components/features/homepage/CategoryNewsSection";
import Sidebar from "@/components/features/homepage/Sidebar";
import MobileNewsCards from "@/components/features/homepage/MobileNewsCards";
import { getPosts } from "@/lib/wordpress/queries";

export default async function HomePage() {
  const [latestPosts, generalPosts, bitcoinPosts, ethereumPosts, altcoinPosts] = await Promise.all([
    getPosts(6),
    getPosts(9, "general-news"),
    getPosts(9, "bitcoin"),
    getPosts(9, "ethereum"),
    getPosts(9, "altcoins"),
  ]);

  const heroPosts    = latestPosts.slice(0, 3);
  const trendingPosts = latestPosts.slice(0, 5);
  const breakingPost = latestPosts[0] ?? null;

  return (
    <div className="relative z-[2] max-w-[1440px] mx-auto px-3 md:px-10 pt-4">
      {/* Mobile only */}
      <FadeIn delay={0.05}><BreakingBanner post={breakingPost} /></FadeIn>
      <FadeIn delay={0.1}><QuickNav /></FadeIn>
      <FadeIn delay={0.15}><PulseRow /></FadeIn>

      {/* Main grid: content + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-7">
        <div>
          {/* ── Desktop layout ── */}
          <div className="hidden md:block">
            <FadeIn delay={0.2}><HeroSection posts={heroPosts} /></FadeIn>

            <FadeIn delay={0.26}>
              <NewsGrid posts={generalPosts} title="General news" viewAllHref="/category/general-news" />
            </FadeIn>

            <FadeIn delay={0.3}>
              <CategoryNewsSection
                posts={bitcoinPosts}
                title="Bitcoin news"
                viewAllHref="/category/bitcoin"
                accentColor="#ff6a00"
                accentBg="rgba(255,106,0,0.08)"
                accentBorder="rgba(255,106,0,0.15)"
                accentGrad="linear-gradient(135deg,#ff9a40,#ff6a00)"
                symbol="₿"
              />
            </FadeIn>

            <FadeIn delay={0.34}>
              <CategoryNewsSection
                posts={ethereumPosts}
                title="Ethereum news"
                viewAllHref="/category/ethereum"
                accentColor="#ff6a00"
                accentBg="rgba(255,106,0,0.08)"
                accentBorder="rgba(255,106,0,0.15)"
                accentGrad="linear-gradient(135deg,#ff9a40,#ff6a00)"
                symbol="Ξ"
              />
            </FadeIn>

            <FadeIn delay={0.38}>
              <CategoryNewsSection
                posts={altcoinPosts}
                title="Altcoin news"
                viewAllHref="/category/altcoins"
                accentColor="#ff6a00"
                accentBg="rgba(255,106,0,0.08)"
                accentBorder="rgba(255,106,0,0.15)"
                accentGrad="linear-gradient(135deg,#ff9a40,#ff6a00)"
                symbol="◎"
              />
            </FadeIn>
          </div>

          {/* ── Mobile layout ── */}
          <div className="md:hidden">
            <FadeIn delay={0.18}><HeroSection posts={heroPosts} /></FadeIn>
            <FadeIn delay={0.22}>
              <MobileNewsCards
                posts={generalPosts.slice(0, 6)}
                title="General news"
                viewAllHref="/category/general-news"
                variant="list"
              />
            </FadeIn>
            <FadeIn delay={0.26}>
              <MobileNewsCards
                posts={bitcoinPosts.slice(0, 6)}
                title="Bitcoin news"
                viewAllHref="/category/bitcoin"
                variant="bitcoin"
                accentColor="#ff6a00"
                accentBg="rgba(255,106,0,0.08)"
                accentBorder="rgba(255,106,0,0.15)"
              />
            </FadeIn>
            <FadeIn delay={0.3}>
              <MobileNewsCards
                posts={ethereumPosts.slice(0, 4)}
                title="Ethereum news"
                viewAllHref="/category/ethereum"
                variant="list"
                accentColor="#627eea"
                accentBg="rgba(98,126,234,0.08)"
                accentBorder="rgba(98,126,234,0.2)"
              />
            </FadeIn>
            <FadeIn delay={0.34}>
              <MobileNewsCards
                posts={altcoinPosts.slice(0, 6)}
                title="Altcoin news"
                viewAllHref="/category/altcoins"
                variant="list"
                accentColor="#ff6a00"
                accentBg="rgba(255,106,0,0.08)"
                accentBorder="rgba(255,106,0,0.15)"
              />
            </FadeIn>
          </div>
        </div>

        {/* Sidebar — sticky on desktop, full-width below content on mobile */}
        <div className="lg:block">
          <FadeIn delay={0.25}>
            <Sidebar trendingPosts={trendingPosts} />
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
