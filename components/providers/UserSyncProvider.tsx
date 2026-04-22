"use client";
import { useEffect, useRef } from "react";

/**
 * Calls /api/sync-user once per session to ensure the Auth0 user
 * is registered in WordPress. Runs client-side after Auth0 callback.
 */
export default function UserSyncProvider({ isLoggedIn }: { isLoggedIn: boolean }) {
  const synced = useRef(false);

  useEffect(() => {
    if (!isLoggedIn || synced.current) return;
    synced.current = true;
    fetch("/api/sync-user", { method: "POST" }).catch(() => {
      // non-critical — swallow silently
    });
  }, [isLoggedIn]);

  return null;
}
