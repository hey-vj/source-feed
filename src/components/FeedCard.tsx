import { useState } from "react";
import type { FeedItem } from "../../shared/types";
import { PreviewMock } from "./PreviewMock";
import { SourceBadge } from "./SourceBadge";

export function FeedCard({ item }: { item: FeedItem }) {
  const [broken, setBroken] = useState(false);
  const showImage = Boolean(item.imageUrl) && !broken;

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="feed-card group block overflow-hidden rounded-2xl border border-white/8 bg-[#101014] transition-[transform,border-color,background-color] duration-150 ease-out hover:border-white/16 hover:bg-[#14141a] active:scale-[0.99]"
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b border-white/6">
        {showImage ? (
          <img
            src={item.imageUrl}
            alt=""
            className="h-full w-full object-cover object-top transition-transform duration-200 ease-out group-hover:scale-[1.02]"
            onError={() => setBroken(true)}
          />
        ) : (
          <PreviewMock title={item.title} classification={item.classification} />
        )}
      </div>
      <div className="p-3.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <SourceBadge platform={item.platform} />
          <span className="rounded-full border border-white/8 px-2 py-0.5 text-[11px] text-white/70">
            {item.classification}
          </span>
        </div>
        <h3 className="mt-2.5 text-[15px] font-medium leading-snug tracking-tight text-white">
          {item.title}
        </h3>
        {item.prompt ? (
          <p className="mt-1.5 line-clamp-3 font-mono text-[12px] leading-relaxed text-white/45">
            {item.prompt}
          </p>
        ) : null}
        {item.creator ? (
          <p className="mt-2 text-[11px] text-white/30">@{item.creator}</p>
        ) : null}
      </div>
    </a>
  );
}
