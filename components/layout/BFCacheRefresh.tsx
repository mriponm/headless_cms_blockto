"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// Guards against stale homepage posts after navigation on Safari / mobile:
//
// 1. pageshow + persisted=true  — BFCache restore (back-swipe, back button)
// 2. visibilitychange (hidden→visible) — user switches back from another app
//
// Both call router.refresh() so Server Components re-fetch and show
// the latest posts without a full page reload.
export default function BFCacheRefresh() {
  const router = useRouter();
  const lastRefresh = useRef(0);

  useEffect(() => {
    function refresh() {
      // Debounce: don't fire more than once per 2 seconds
      const now = Date.now();
      if (now - lastRefresh.current < 2000) return;
      lastRefresh.current = now;
      router.refresh();
    }

    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) refresh();
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible") refresh();
    }

    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [router]);

  return null;
}
