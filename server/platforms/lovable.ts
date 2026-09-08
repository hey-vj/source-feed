import { toFeedItem } from "../../shared/classify";
import type { FeedItem, PlatformResult } from "../../shared/types";
import { fetchText, uniqueBy } from "../http";

const SOURCES = [
  "https://lovable.dev/templates/apps/saas",
  "https://lovable.dev/templates",
];

const BLOCK_RE =
  /slug:"([^"]+)"[\s\S]{0,700}?title:"([^"]+)"[\s\S]{0,240}?project_id:"([^"]+)"[\s\S]{0,120}?url:"(https:\/\/[^"]+\.lovable\.app)"[\s\S]{0,160}?subtitle:"([^"]*)"[\s\S]{0,900}?screenshot:"([^"]+)"/g;

export async function fetchLovable(): Promise<{ items: FeedItem[]; source: PlatformResult }> {
  const pages = await Promise.allSettled(SOURCES.map((url) => fetchText(url)));
  const html = pages
    .filter((page): page is PromiseFulfilledResult<string> => page.status === "fulfilled")
    .map((page) => page.value)
    .join("\n");

  if (!html) {
    const reason = pages.find((page) => page.status === "rejected");
    throw new Error(reason && reason.status === "rejected" ? String(reason.reason) : "Lovable pages unavailable");
  }

  const raw: FeedItem[] = [];
  for (const match of html.matchAll(BLOCK_RE)) {
    const [, slug, title, projectId, url, subtitle, screenshot] = match;
    const item = toFeedItem(
      {
        id: `lovable:${slug}`,
        platform: "lovable",
        title,
        prompt: subtitle,
        url,
        imageUrl: screenshot,
        createdAt: undefined,
      },
      [projectId, "saas", "dashboard"],
    );
    if (item) raw.push(item);
  }

  const items = uniqueBy(raw, (item) => item.url).slice(0, 36);
  return {
    items,
    source: {
      platform: "lovable",
      status: items.length ? "live" : "empty",
      count: items.length,
      fetched: raw.length,
      kept: items.length,
    },
  };
}
