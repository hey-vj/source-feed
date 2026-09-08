import type { PlatformId } from "../../shared/types";

export const PLATFORMS: Record<
  PlatformId,
  { label: string; hue: string; mark: string }
> = {
  vercel: { label: "Vercel", hue: "#f4f4f5", mark: "▲" },
  netlify: { label: "Netlify", hue: "#32e6c8", mark: "Nf" },
  lovable: { label: "Lovable", hue: "#ff7a93", mark: "Lv" },
  v0: { label: "v0", hue: "#e7e7ea", mark: "v0" },
  bolt: { label: "Bolt", hue: "#4aa3ff", mark: "Bt" },
  websim: { label: "Websim", hue: "#c084fc", mark: "Ws" },
};

export const PLATFORM_ORDER: PlatformId[] = [
  "vercel",
  "netlify",
  "lovable",
  "v0",
  "bolt",
  "websim",
];
