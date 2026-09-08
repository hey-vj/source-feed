import type { ReactNode } from "react";
import type { Classification, PlatformId } from "../../shared/types";
import { PLATFORM_ORDER, PLATFORMS } from "../lib/platforms";

const CLASSES: Classification[] = [
  "Dashboard",
  "CRM",
  "Analytics",
  "Billing",
  "Agent",
  "Automation",
  "Workspace",
  "Portal",
  "Tool",
];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-2.5 py-1 text-[12px] transition-colors duration-150 ${
        active
          ? "border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent)]"
          : "border-white/8 text-white/55 hover:border-white/16 hover:text-white/80"
      }`}
    >
      {children}
    </button>
  );
}

export function FilterBar({
  query,
  onQuery,
  platform,
  onPlatform,
  classification,
  onClassification,
}: {
  query: string;
  onQuery: (value: string) => void;
  platform: PlatformId | "all";
  onPlatform: (value: PlatformId | "all") => void;
  classification: Classification | "all";
  onClassification: (value: Classification | "all") => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <label className="relative block">
        <span className="sr-only">Search builds</span>
        <input
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Search titles and prompts"
          className="w-full rounded-xl border border-white/8 bg-white/3 px-3.5 py-2.5 text-[14px] text-white outline-none placeholder:text-white/30 focus:border-white/20"
        />
      </label>
      <div className="flex flex-wrap gap-1.5">
        <Chip active={platform === "all"} onClick={() => onPlatform("all")}>
          All sources
        </Chip>
        {PLATFORM_ORDER.map((id) => (
          <Chip key={id} active={platform === id} onClick={() => onPlatform(id)}>
            {PLATFORMS[id].label}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Chip active={classification === "all"} onClick={() => onClassification("all")}>
          Any function
        </Chip>
        {CLASSES.map((label) => (
          <Chip
            key={label}
            active={classification === label}
            onClick={() => onClassification(label)}
          >
            {label}
          </Chip>
        ))}
      </div>
    </div>
  );
}
