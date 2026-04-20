const WP_API = process.env.NEXT_PUBLIC_WP_API as string;

export async function fetchGraphQL<T = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(WP_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`WPGraphQL request failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  if (json.errors) {
    console.error("[WPGraphQL] errors:", json.errors);
    throw new Error(json.errors[0]?.message ?? "GraphQL error");
  }

  return json.data as T;
}
