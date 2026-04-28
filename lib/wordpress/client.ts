const WP_API = process.env.NEXT_PUBLIC_WP_API as string;

export async function fetchGraphQL<T = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T | null> {
  if (!WP_API) {
    console.error("[WPGraphQL] NEXT_PUBLIC_WP_API is not set");
    return null;
  }
  try {
    const url = `${WP_API}?_=${Date.now()}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`[WPGraphQL] request failed: ${res.status} ${res.statusText}`);
      return null;
    }

    const json = await res.json();

    if (json.errors) {
      console.error("[WPGraphQL] errors:", json.errors);
      return null;
    }

    return json.data as T;
  } catch (err) {
    console.error("[WPGraphQL] fetch error:", err);
    return null;
  }
}
