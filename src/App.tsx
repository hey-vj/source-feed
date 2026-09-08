import { useEffect, useMemo, useState } from "react";
import type { Classification, PlatformId } from "../shared/types";
import { Clock } from "./components/Clock";
import { FeedGrid } from "./components/FeedGrid";
import { FilterBar } from "./components/FilterBar";
import { StatusDock } from "./components/StatusDock";
import { initialFeed, isFresh, requestFeed } from "./lib/feed";
import type { FeedResponse } from "../shared/types";

const REFRESH_MS = 30 * 60 * 1000;

export default function App() {
  const [feed, setFeed] = useState<FeedResponse | null>(() => initialFeed());
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>();
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<PlatformId | "all">("all");
  const [classification, setClassification] = useState<Classification | "all">("all");

  async function refresh(force = false) {
    setRefreshing(true);
    try {
      const next = await requestFeed(force);
      setFeed(next);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not refresh");
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (!isFresh(feed)) {
      void refresh(false);
    }
    const timer = window.setInterval(() => {
      void refresh(false);
    }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, []);

  const items = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (feed?.items ?? []).filter((item) => {
      if (platform !== "all" && item.platform !== platform) return false;
      if (classification !== "all" && item.classification !== classification) return false;
      if (!needle) return true;
      return `${item.title} ${item.prompt} ${item.creator ?? ""}`.toLowerCase().includes(needle);
    });
  }, [classification, feed, platform, query]);

  return (
    <div className="mx-auto min-h-screen max-w-[1600px] px-5 py-6 md:px-8 md:py-8">
      <header className="flex flex-col gap-6 border-b border-white/6 pb-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <p className="text-[12px] uppercase tracking-[0.22em] text-[var(--accent)]/80">
            New tab
          </p>
          <h1 className="mt-2 text-[34px] font-medium tracking-tight text-white">Source</h1>
          <p className="mt-2 max-w-md text-[14px] leading-relaxed text-white/50">
            Public SaaS prototypes from Vercel, Netlify, and the AI builders. No launch-day leaderboards.
          </p>
        </div>
        <Clock />
      </header>

      <div className="mt-6 space-y-6">
        <FilterBar
          query={query}
          onQuery={setQuery}
          platform={platform}
          onPlatform={setPlatform}
          classification={classification}
          onClassification={setClassification}
        />
        <StatusDock feed={feed} refreshing={refreshing} error={error} onRefresh={() => void refresh(true)} />
        <FeedGrid items={items} loading={!feed && refreshing} />
      </div>
    </div>
  );
}
