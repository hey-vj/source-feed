export type PlatformId = "websim" | "lovable" | "v0" | "bolt" | "vercel" | "netlify";

export type Classification =
  | "Dashboard"
  | "CRM"
  | "Analytics"
  | "Billing"
  | "Agent"
  | "Automation"
  | "Workspace"
  | "Portal"
  | "Tool";

export type SourceStatus = "live" | "empty" | "error";

export type FeedItem = {
  id: string;
  platform: PlatformId;
  title: string;
  prompt: string;
  url: string;
  imageUrl?: string;
  creator?: string;
  classification: Classification;
  createdAt?: string;
};

export type PlatformResult = {
  platform: PlatformId;
  status: SourceStatus;
  count: number;
  fetched: number;
  kept: number;
  error?: string;
};

export type FeedResponse = {
  items: FeedItem[];
  sources: PlatformResult[];
  fetchedAt: string;
  cacheTtlMs: number;
  fromCache: boolean;
};
