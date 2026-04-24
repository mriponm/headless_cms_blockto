/**
 * In-memory sliding-window rate limiter.
 * Per-instance — sufficient for single-server; add Redis for multi-instance/serverless.
 */

interface Window {
  count: number;
  reset: number; // epoch ms
}

const store = new Map<string, Window>();

// Clean up old entries every 5 minutes to prevent memory leak
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    store.forEach((v, k) => { if (v.reset < now) store.delete(k); });
  }, 5 * 60 * 1000);
}

/**
 * @param key      Unique identifier (e.g. `login:1.2.3.4`)
 * @param limit    Max requests per window
 * @param windowMs Window size in milliseconds
 * @returns true if request is allowed, false if rate-limited
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.reset < now) {
    store.set(key, { count: 1, reset: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;

  entry.count += 1;
  return true;
}

export function rateLimitResponse() {
  return new Response(
    JSON.stringify({ error: "Too many requests. Please try again later." }),
    { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60" } }
  );
}
