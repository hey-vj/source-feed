import type { FeedItem } from "../../shared/types";
import { FeedCard } from "./FeedCard";

export function FeedGrid({
  items,
  loading,
}: {
  items: FeedItem[];
  loading: boolean;
}) {
  if (loading && items.length === 0) {
    return (
      <div className="feed-masonry">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="feed-card overflow-hidden rounded-2xl border border-white/6 bg-[#101014]"
          >
            <div className="aspect-[16/10] animate-pulse bg-white/4" />
            <div className="space-y-2 p-3.5">
              <div className="h-4 w-24 animate-pulse rounded-full bg-white/6" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-white/6" />
              <div className="h-8 w-full animate-pulse rounded bg-white/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center">
        <p className="text-[15px] text-white/80">Nothing in this slice.</p>
        <p className="mt-1 text-[13px] text-white/40">
          Clear a filter or wait for the next refresh.
        </p>
      </div>
    );
  }

  return (
    <div className="feed-masonry">
      {items.map((item) => (
        <FeedCard key={item.id} item={item} />
      ))}
    </div>
  );
}
