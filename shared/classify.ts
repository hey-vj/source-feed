import type { Classification, FeedItem } from "./types.js";

const INCLUDE: Array<{ label: Classification; terms: string[] }> = [
  { label: "CRM", terms: ["crm", "pipeline", "leads", "contacts", "sales ops", "deal desk"] },
  { label: "Billing", terms: ["billing", "invoice", "subscription", "pricing", "payments", "stripe"] },
  { label: "Analytics", terms: ["analytics", "metrics", "insights", "reporting", "kpi"] },
  { label: "Agent", terms: ["ai agent", "agent", "copilot", "assistant"] },
  { label: "Automation", terms: ["automation", "workflow", "orchestrat", "scheduler"] },
  { label: "Dashboard", terms: ["dashboard", "admin", "settings panel", "ops console"] },
  { label: "Workspace", terms: ["workspace", "docs", "notes", "collaboration", "kanban"] },
  { label: "Portal", terms: ["portal", "b2b", "customer portal", "client portal"] },
  { label: "Tool", terms: ["saas", "tool", "utility", "platform", "internal tool"] },
];

const EXCLUDE = [
  "retro game",
  "platformer",
  "shooter",
  "3d engine",
  "webgl toy",
  "canvas toy",
  "pixel art",
  "generative art",
  "single-element animation",
  "music visualizer",
  "idle clicker",
  "arcade",
  "minecraft",
  "fps game",
  "racing game",
];

const EXCLUDE_SOFT = ["game", "3d", "canvas", "animation", "art", "toy", "retro"];

function haystack(parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(" \n ").toLowerCase();
}

function scoreTerms(text: string, terms: string[]) {
  return terms.reduce((score, term) => (text.includes(term) ? score + term.length : score), 0);
}

export function classifyText(parts: Array<string | undefined>): {
  keep: boolean;
  classification: Classification;
} {
  const text = haystack(parts);
  if (!text.trim()) return { keep: false, classification: "Tool" };

  const excludeHard = EXCLUDE.some((term) => text.includes(term));
  const excludeSoft = scoreTerms(text, EXCLUDE_SOFT);
  const includeHits = INCLUDE.map((group) => ({
    label: group.label,
    score: scoreTerms(text, group.terms),
  })).sort((a, b) => b.score - a.score);

  const best = includeHits[0] ?? { label: "Tool" as const, score: 0 };
  const keep = !excludeHard && best.score > 0 && best.score >= excludeSoft;

  return { keep, classification: best.score > 0 ? best.label : "Tool" };
}

export function classifyHosted(parts: Array<string | undefined>): {
  keep: boolean;
  classification: Classification;
} {
  const { keep, classification } = classifyText(parts);
  const text = parts.filter(Boolean).join(" \n ").toLowerCase();
  const excluded = [
    "retro game",
    "platformer",
    "shooter",
    "3d engine",
    "pixel art",
    "generative art",
    "arcade",
    "minecraft",
    "clone",
    "slot",
    "togel",
    "gacor",
    "nonton",
    "situs",
    "verification",
    "vérification",
    "bingo",
    "netflix",
    "facebook",
    "airbnb",
    "booking.com",
  ].some((term) => text.includes(term));
  if (excluded) return { keep: false, classification };
  if (keep) return { keep, classification };
  return { keep: text.trim().length > 2, classification: classification };
}

export function toFeedItem(
  item: Omit<FeedItem, "classification"> & { classification?: Classification },
  extraText: Array<string | undefined> = [],
  mode: "strict" | "hosted" = "strict",
): FeedItem | null {
  const decide = mode === "hosted" ? classifyHosted : classifyText;
  const { keep, classification } = decide([item.title, item.prompt, item.creator, ...extraText]);
  if (!keep) return null;
  return { ...item, classification: item.classification ?? classification };
}
