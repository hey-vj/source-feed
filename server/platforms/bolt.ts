import { toFeedItem } from "../../shared/classify.js";
import type { FeedItem, PlatformResult } from "../../shared/types.js";
import { fetchText, uniqueBy } from "../http.js";

const CANDIDATES = [
  "https://bolt.new/~/discover",
  "https://bolt.new/discover",
  "https://bolt.new/",
];

const PROJECT_RE =
  /https:\/\/bolt\.new\/~\/([A-Za-z0-9_-]{8,})/g;

export async function fetchBolt(): Promise<{ items: FeedItem[]; source: PlatformResult }> {
  const pages = await Promise.allSettled(CANDIDATES.map((url) => fetchText(url)));
  const html = pages
    .filter((page): page is PromiseFulfilledResult<string> => page.status === "fulfilled")
    .map((page) => page.value)
    .join("\n");

  if (!html) {
    throw new Error("Bolt discover pages unavailable");
  }

  const slugs = uniqueBy([...html.matchAll(PROJECT_RE)].map((match) => match[1]), (slug) => slug)
    .filter((slug) => slug !== "discover");

  const raw = slugs
    .map((slug) =>
      toFeedItem({
        id: `bolt:${slug}`,
        platform: "bolt",
        title: slug.replace(/[-_]+/g, " "),
        prompt: "Public Bolt prototype",
        url: `https://bolt.new/~/${slug}`,
      }),
    )
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const items = uniqueBy(raw, (item) => item.url).slice(0, 24);

  return {
    items,
    source: {
      platform: "bolt",
      status: items.length ? "live" : "empty",
      count: items.length,
      fetched: slugs.length,
      kept: items.length,
      error: items.length
        ? undefined
        : "Bolt discover ships as a client-rendered IDE shell, so no public project cards were in the HTML.",
    },
  };
}
