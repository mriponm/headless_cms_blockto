const WP_API = process.env.NEXT_PUBLIC_WP_API as string;

export async function fetchGraphQL<T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
  revalidate?: number | false,
): Promise<T | null> {
  if (!WP_API) {
    console.error("[WPGraphQL] NEXT_PUBLIC_WP_API is not set");
    return null;
  }
  try {
    const url = WP_API;
    const fetchOptions: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    };
    if (revalidate === false || revalidate === undefined) {
      fetchOptions.cache = "no-store";
    } else {
      fetchOptions.next = { revalidate };
    }
    const res = await fetch(url, fetchOptions);

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
