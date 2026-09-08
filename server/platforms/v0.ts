import { toFeedItem } from "../../shared/classify";
import type { FeedItem, PlatformResult } from "../../shared/types";
import { decodeEscapedJson, fetchText, uniqueBy } from "../http";

const SOURCES = [
  "https://v0.app/templates/dashboards",
  "https://v0.app/templates/ai",
  "https://v0.app/templates",
];

const CARD_RE =
  /(https:\/\/[^"\\]+(?:screenshots|templates\/assets)[^"\\]+\.(?:jpg|jpeg|png|webp))"[\s\S]{0,80}?"title":"([^"]+)"[\s\S]{0,400}?"templateCanonId":"([^"]+)"[\s\S]{0,500}?"category":"([^"]+)"[\s\S]{0,400}?"(?:authorUsername|author)":"([^"]+)"/g;

export async function fetchV0(): Promise<{ items: FeedItem[]; source: PlatformResult }> {
  const pages = await Promise.allSettled(SOURCES.map((url) => fetchText(url)));
  const html = pages
    .filter((page): page is PromiseFulfilledResult<string> => page.status === "fulfilled")
    .map((page) => decodeEscapedJson(page.value))
    .join("\n");

  if (!html) {
    throw new Error("v0 template pages unavailable");
  }

  const raw: FeedItem[] = [];
  for (const match of html.matchAll(CARD_RE)) {
    const [, imageUrl, title, id, category, creator] = match;
    const item = toFeedItem(
      {
        id: `v0:${id}`,
        platform: "v0",
        title,
        prompt: `${category} layout from ${creator}`,
        url: `https://v0.app/templates/${id}`,
        imageUrl,
        creator,
      },
      [category, "frontend", "dashboard", "settings", "pricing"],
    );
    if (item) raw.push(item);
  }

  const items = uniqueBy(raw, (item) => item.id).slice(0, 36);
  return {
    items,
    source: {
      platform: "v0",
      status: items.length ? "live" : "empty",
      count: items.length,
      fetched: raw.length,
      kept: items.length,
    },
  };
}
