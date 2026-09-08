import type { FeedResponse } from "../../shared/types";
import { cacheAgeMs, readCache, writeCache } from "./cache";

const STALE_MS = 30 * 60 * 1000;

export async function requestFeed(force = false): Promise<FeedResponse> {
  const response = await fetch(`/api/feed${force ? "?refresh=1" : ""}`);
  if (!response.ok) {
    throw new Error(`Feed request failed (${response.status})`);
  }
  const payload = (await response.json()) as FeedResponse;
  writeCache(payload);
  return payload;
}

export function initialFeed(): FeedResponse | null {
  const cached = readCache();
  if (!cached) return null;
  return cached;
}

export function isFresh(payload: FeedResponse | null) {
  return cacheAgeMs(payload) < STALE_MS;
}
