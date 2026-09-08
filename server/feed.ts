import type { FeedItem, FeedResponse, PlatformId, PlatformResult } from "../shared/types";
import { fetchBolt } from "./platforms/bolt";
import { fetchNetlify, fetchVercel } from "./platforms/hosts";
import { fetchLovable } from "./platforms/lovable";
import { fetchV0 } from "./platforms/v0";
import { fetchVercelCommunity } from "./platforms/vercel-community";
import { fetchWebsim } from "./platforms/websim";
import { uniqueBy } from "./http";

export const CACHE_TTL_MS = 30 * 60 * 1000;

let memoryCache: FeedResponse | null = null;

async function fetchVercelFeed() {
  const [scanned, community] = await Promise.allSettled([fetchVercel(), fetchVercelCommunity()]);
  const scan = scanned.status === "fulfilled" ? scanned.value : null;
  const extras = community.status === "fulfilled" ? community.value : [];
  const items = uniqueBy([...(scan?.items ?? []), ...extras], (item) => item.url);
  if (!scan && extras.length === 0) {
    throw scanned.status === "rejected" ? scanned.reason : new Error("Vercel sources unavailable");
  }
  return {
    items,
    source: {
      platform: "vercel" as const,
      status: items.length ? ("live" as const) : ("empty" as const),
      count: items.length,
      fetched: (scan?.source.fetched ?? 0) + extras.length,
      kept: items.length,
      error: scan?.source.error,
    },
  };
}

const loaders: Record<PlatformId, () => Promise<{ items: FeedItem[]; source: PlatformResult }>> = {
  vercel: fetchVercelFeed,
  netlify: fetchNetlify,
  lovable: fetchLovable,
  v0: fetchV0,
  bolt: fetchBolt,
  websim: fetchWebsim,
};

function failed(platform: PlatformId, error: unknown): { items: FeedItem[]; source: PlatformResult } {
  return {
    items: [],
    source: {
      platform,
      status: "error",
      count: 0,
      fetched: 0,
      kept: 0,
      error: error instanceof Error ? error.message : String(error),
    },
  };
}

export async function collectFeed(): Promise<FeedResponse> {
  const settled = await Promise.all(
    (Object.entries(loaders) as Array<[PlatformId, (typeof loaders)[PlatformId]]>).map(async ([platform, load]) => {
      try {
        return await load();
      } catch (error) {
        return failed(platform, error);
      }
    }),
  );

  const items = settled
    .flatMap((result) => result.items)
    .sort((a, b) => {
      const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
      if (aTime && bTime && aTime !== bTime) return bTime - aTime;
      return a.title.localeCompare(b.title);
    });

  return {
    items,
    sources: settled.map((result) => result.source),
    fetchedAt: new Date().toISOString(),
    cacheTtlMs: CACHE_TTL_MS,
    fromCache: false,
  };
}

export async function getFeed(options: { force?: boolean } = {}): Promise<FeedResponse> {
  const now = Date.now();
  if (!options.force && memoryCache) {
    const age = now - Date.parse(memoryCache.fetchedAt);
    if (age < CACHE_TTL_MS) {
      return { ...memoryCache, fromCache: true };
    }
  }

  const fresh = await collectFeed();
  memoryCache = fresh;
  return fresh;
}
