import { toFeedItem } from "../../shared/classify.js";
import type { FeedItem, PlatformResult } from "../../shared/types.js";
import { fetchJson, uniqueBy } from "../http.js";

type WebsimSite = {
  id?: string;
  title?: string;
  link_url?: string;
  created_at?: string;
  prompt?: { text?: string } | string;
  owner?: { username?: string };
  yapping?: string;
};

type WebsimFeed = {
  feed?: { data?: Array<{ site?: WebsimSite } | WebsimSite> };
};

function promptOf(site: WebsimSite) {
  if (typeof site.prompt === "string") return site.prompt;
  return site.prompt?.text || site.yapping || "";
}

export async function fetchWebsim(): Promise<{ items: FeedItem[]; source: PlatformResult }> {
  const payload = await fetchJson<WebsimFeed>("https://websim.com/api/v1/feed/trending?first=40&class=hot");
  const raw = (payload.feed?.data ?? []).map((entry) => {
    if (entry && typeof entry === "object" && "site" in entry && entry.site) return entry.site;
    return entry as WebsimSite;
  });

  const items = uniqueBy(
    raw
      .map((site) => {
        const path = site.link_url;
        if (!path) return null;
        return toFeedItem({
          id: `websim:${site.id || path}`,
          platform: "websim",
          title: site.title?.trim() || promptOf(site).slice(0, 72) || "Untitled build",
          prompt: promptOf(site).replace(/\s+/g, " ").trim(),
          url: `https://websim.ai${path}`,
          creator: site.owner?.username,
          createdAt: site.created_at,
        });
      })
      .filter((item): item is FeedItem => Boolean(item)),
    (item) => item.url,
  );

  return {
    items,
    source: {
      platform: "websim",
      status: items.length ? "live" : "empty",
      count: items.length,
      fetched: raw.length,
      kept: items.length,
    },
  };
}
