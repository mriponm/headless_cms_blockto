"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Safari (iPhone) restores pages from BFCache on back-navigation.
// pageshow with persisted=true means the page came from the freeze-snapshot,
// not a fresh fetch. router.refresh() re-fetches all Server Components so
// the homepage always shows the latest posts, not the frozen old state.
export default function BFCacheRefresh() {
  const router = useRouter();
  useEffect(() => {
    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) router.refresh();
    }
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [router]);
  return null;
}
