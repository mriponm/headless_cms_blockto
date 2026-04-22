const WP_API = process.env.WP_REST_API_URL ?? "https://cms.blockto.io/wp-json/wp/v2";
const WP_USER = process.env.WP_ADMIN_USER ?? "";
const WP_PASS = process.env.WP_ADMIN_APP_PASS ?? "";

function wpAuthHeader(): string {
  return "Basic " + Buffer.from(`${WP_USER}:${WP_PASS}`).toString("base64");
}

export interface WpUser {
  id: number;
  username: string;
  email: string;
  name: string;
  meta: Record<string, unknown>;
}

/** Find a WP user by auth0_id stored in user meta via our custom endpoint. */
export async function findWpUserByAuth0Id(auth0Id: string): Promise<WpUser | null> {
  const res = await fetch(
    `${WP_API}/blockto/v1/users/by-auth0?auth0_id=${encodeURIComponent(auth0Id)}`,
    { headers: { Authorization: wpAuthHeader() }, cache: "no-store" }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`WP user lookup failed: ${res.status}`);
  return res.json() as Promise<WpUser>;
}

/** Create a WP user and store auth0_id in meta. */
export async function createWpUser(opts: {
  email: string;
  name: string;
  auth0Id: string;
}): Promise<WpUser> {
  // 1. Create the user
  const username = opts.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_") + "_" + Date.now();
  const password = crypto.randomUUID() + crypto.randomUUID(); // never used for login
  const res = await fetch(`${WP_API}/users`, {
    method: "POST",
    headers: {
      Authorization: wpAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      email: opts.email,
      name: opts.name,
      password,
      roles: ["subscriber"],
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`WP user create failed: ${res.status} ${body}`);
  }

  const user: WpUser = await res.json();

  // 2. Store auth0_id via our custom endpoint
  await fetch(`${WP_API}/blockto/v1/users/${user.id}/meta`, {
    method: "POST",
    headers: {
      Authorization: wpAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ auth0_id: opts.auth0Id }),
    cache: "no-store",
  });

  return user;
}
