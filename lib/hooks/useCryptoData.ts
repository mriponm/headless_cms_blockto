"use client";
import useSWR from "swr";
import type { CryptoApiResponse } from "@/lib/types/crypto";

const fetcher = (url: string): Promise<CryptoApiResponse> =>
  fetch(url).then((r) => { if (!r.ok) throw new Error("Fetch failed"); return r.json(); });

export function useCryptoData() {
  const { data, error, isLoading } = useSWR<CryptoApiResponse>("/api/crypto", fetcher, {
    refreshInterval: 30_000,
    revalidateOnFocus: true,
    dedupingInterval: 10_000,
    keepPreviousData: true,
  });
  return { data, error, isLoading };
}
