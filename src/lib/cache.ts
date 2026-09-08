import type { FeedResponse } from "../../shared/types";

const KEY = "source-feed-cache-v1";

export function readCache(): FeedResponse | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FeedResponse;
    if (!parsed?.items || !parsed.fetchedAt) return null;
    return { ...parsed, fromCache: true };
  } catch {
    return null;
  }
}

export function writeCache(payload: FeedResponse) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...payload, fromCache: true }));
  } catch {
    // Ignore quota errors on huge screenshot payloads.
  }
}

export function cacheAgeMs(payload: FeedResponse | null) {
  if (!payload) return Number.POSITIVE_INFINITY;
  return Date.now() - Date.parse(payload.fetchedAt);
}
