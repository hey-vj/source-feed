import type { PlatformId } from "../../shared/types";
import { PLATFORMS } from "../lib/platforms";

export function SourceBadge({ platform }: { platform: PlatformId }) {
  const meta = PLATFORMS[platform];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-black/30 px-2 py-0.5 text-[11px] font-medium tracking-wide"
      style={{ color: meta.hue }}
    >
      <span className="size-1.5 rounded-full" style={{ background: meta.hue }} />
      {meta.label}
    </span>
  );
}
