import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { findWpUserByAuth0Id, createWpUser } from "@/lib/wordpress/users";

export async function POST() {
  const session = await auth0.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sub: auth0Id, email, name } = session.user;

  if (!auth0Id || !email) {
    return NextResponse.json({ error: "Incomplete user data" }, { status: 400 });
  }

  try {
    let wpUser = await findWpUserByAuth0Id(auth0Id);

    if (!wpUser) {
      wpUser = await createWpUser({
        email,
        name: name ?? email.split("@")[0],
        auth0Id,
      });
      return NextResponse.json({ synced: true, created: true, wpUserId: wpUser.id });
    }

    return NextResponse.json({ synced: true, created: false, wpUserId: wpUser.id });
  } catch (err) {
    console.error("[sync-user]", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
