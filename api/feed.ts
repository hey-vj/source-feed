import type { IncomingMessage, ServerResponse } from "node:http";
import { getFeed } from "../server/feed.js";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? "/", "http://source.local");
  const force = url.searchParams.get("refresh") === "1";
  const payload = await getFeed({ force });
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=86400");
  res.end(JSON.stringify(payload));
}
