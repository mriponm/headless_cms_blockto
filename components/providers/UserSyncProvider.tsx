"use client";
import { useEffect, useRef } from "react";

export default function UserSyncProvider() {
  const synced = useRef(false);

  useEffect(() => {
    if (synced.current) return;
    synced.current = true;
    fetch("/api/sync-user", { method: "POST" }).catch(() => {});
  }, []);

  return null;
}
