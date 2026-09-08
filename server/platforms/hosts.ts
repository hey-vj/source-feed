import { toFeedItem } from "../../shared/classify";
import type { FeedItem, PlatformId, PlatformResult } from "../../shared/types";
import { fetchJson, uniqueBy } from "../http";

type UrlscanHit = {
  _id?: string;
  task?: { url?: string; time?: string };
  page?: { url?: string; title?: string; domain?: string; status?: string | number };
  screenshot?: string;
};

type UrlscanSearch = {
  results?: UrlscanHit[];
};

const NOISE_TITLE = [
  "create next app",
  "create react app",
  "welcome to nginx",
  "just a moment",
  "sign in",
  "log in",
  "login",
  "404",
  "not found",
  "deployment not found",
];

function isPreviewHost(host: string) {
  return (
    host.includes("-git-") ||
    host.includes("--") ||
    host.startsWith("localhost") ||
    /-[a-z0-9]{8,}\.(vercel|netlify)\.app$/.test(host)
  );
}

function hostLabel(host: string, suffix: string) {
  return host
    .replace(new RegExp(`\\.${suffix.replace(".", "\\.")}$`), "")
    .replace(/[-_]+/g, " ")
    .trim();
}

export async function fetchHostedApps(
  platform: Extract<PlatformId, "vercel" | "netlify">,
  suffix: "vercel.app" | "netlify.app",
): Promise<{ items: FeedItem[]; source: PlatformResult }> {
  const headers: Record<string, string> = {};
  if (process.env.URLSCAN_API_KEY) {
    headers["API-Key"] = process.env.URLSCAN_API_KEY;
  }

  const query = encodeURIComponent(`page.domain:${suffix} AND page.status:200`);
  const payload = await fetchJson<UrlscanSearch>(
    `https://urlscan.io/api/v1/search/?q=${query}&size=40`,
    { headers, timeoutMs: 16000 },
  );

  const raw = payload.results ?? [];
  const items = uniqueBy(
    raw
      .map((hit) => {
        const url = hit.page?.url || hit.task?.url;
        if (!url) return null;
        let parsed: URL;
        try {
          parsed = new URL(url);
        } catch {
          return null;
        }
        if (!parsed.hostname.endsWith(suffix)) return null;
        if (isPreviewHost(parsed.hostname)) return null;

        const title = (hit.page?.title || hostLabel(parsed.hostname, suffix)).trim();
        if (NOISE_TITLE.some((noise) => title.toLowerCase() === noise)) return null;

        const screenshot =
          hit.screenshot || (hit._id ? `https://urlscan.io/screenshots/${hit._id}.png` : undefined);

        return toFeedItem(
          {
            id: `${platform}:${parsed.hostname}`,
            platform,
            title,
            prompt: hostLabel(parsed.hostname, suffix),
            url: `${parsed.protocol}//${parsed.host}`,
            imageUrl: screenshot,
            createdAt: hit.task?.time,
          },
          [parsed.hostname],
          "hosted",
        );
      })
      .filter((item): item is FeedItem => Boolean(item)),
    (item) => item.url,
  ).slice(0, 28);

  return {
    items,
    source: {
      platform,
      status: items.length ? "live" : "empty",
      count: items.length,
      fetched: raw.length,
      kept: items.length,
      error: items.length
        ? undefined
        : "urlscan had public hostnames, but none looked like SaaS after filters.",
    },
  };
}

export const fetchVercel = () => fetchHostedApps("vercel", "vercel.app");
export const fetchNetlify = () => fetchHostedApps("netlify", "netlify.app");
