import { toFeedItem } from "../../shared/classify";
import type { FeedItem } from "../../shared/types";
import { fetchJson } from "../http";

type TopicList = {
  topic_list?: {
    topics?: Array<{ id: number; title: string; slug: string; created_at?: string }>;
  };
};

type TopicDetail = {
  title?: string;
  created_at?: string;
  details?: { created_by?: { username?: string } };
  post_stream?: { posts?: Array<{ cooked?: string; username?: string }> };
};

const LINK_RE = /href="(https?:\/\/[^"]+)"/gi;

function keepLink(href: string) {
  try {
    const url = new URL(href);
    if (url.hostname.includes("community.vercel.com")) return false;
    if (url.hostname.includes("vercel.com") && !url.hostname.endsWith("vercel.app")) return false;
    if (["x.com", "twitter.com", "github.com", "linkedin.com"].includes(url.hostname)) return false;
    return true;
  } catch {
    return false;
  }
}

export async function fetchVercelCommunity(): Promise<FeedItem[]> {
  const list = await fetchJson<TopicList>("https://community.vercel.com/c/showcase/41/l/latest.json");
  const topics = (list.topic_list?.topics ?? []).slice(0, 10);

  const posts = await Promise.allSettled(
    topics.map((topic) =>
      fetchJson<TopicDetail>(`https://community.vercel.com/t/${topic.slug}/${topic.id}.json`),
    ),
  );

  const items: FeedItem[] = [];
  posts.forEach((result, index) => {
    if (result.status !== "fulfilled") return;
    const topic = topics[index];
    const cooked = result.value.post_stream?.posts?.[0]?.cooked ?? "";
    const links = [...cooked.matchAll(LINK_RE)].map((match) => match[1]).filter(keepLink);
    const live = links.find((href) => href.includes("vercel.app")) ?? links[0];
    if (!live || !topic) return;

    const item = toFeedItem(
      {
        id: `vercel:community:${topic.id}`,
        platform: "vercel",
        title: topic.title.replace(/^\[showcase\]\s*/i, "").trim(),
        prompt: "Posted in the Vercel community showcase",
        url: live,
        creator: result.value.details?.created_by?.username ?? result.value.post_stream?.posts?.[0]?.username,
        createdAt: topic.created_at ?? result.value.created_at,
      },
      [topic.title, live],
      "hosted",
    );
    if (item) items.push(item);
  });

  return items;
}
