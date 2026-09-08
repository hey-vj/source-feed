import type { FeedResponse } from "../../shared/types";
import { PLATFORMS } from "../lib/platforms";
import { relativeTime } from "../lib/time";

export function StatusDock({
  feed,
  refreshing,
  error,
  onRefresh,
}: {
  feed: FeedResponse | null;
  refreshing: boolean;
  error?: string;
  onRefresh: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-white/40">
      <button
        type="button"
        onClick={onRefresh}
        className="rounded-full border border-white/8 px-2.5 py-1 text-white/70 transition-colors duration-150 hover:border-white/16 hover:text-white active:scale-[0.98]"
      >
        {refreshing ? "Updating…" : "Pull latest"}
      </button>
      {feed ? (
        <span>
          {feed.fromCache ? "Cached copy from " : "Fetched "}
          {relativeTime(feed.fetchedAt)}
        </span>
      ) : null}
      {feed?.sources.map((source) => (
        <span key={source.platform} className="inline-flex items-center gap-1.5">
          <span
            className={`size-1.5 rounded-full ${
              source.status === "live"
                ? "bg-[var(--accent)]"
                : source.status === "empty"
                  ? "bg-amber-300/80"
                  : "bg-rose-400/80"
            }`}
          />
          {PLATFORMS[source.platform].label}
          {source.status === "live" ? ` ${source.kept}` : source.status === "empty" ? " quiet" : " down"}
        </span>
      ))}
      {error ? <span className="text-rose-300/80">{error}</span> : null}
    </div>
  );
}
