import type { IncomingMessage, ServerResponse } from "node:http";
import type { Connect, Plugin } from "vite";
import { getFeed } from "./feed.js";

async function writeFeed(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? "/", "http://source.local");
  if (url.pathname !== "/api/feed") return false;

  const force = url.searchParams.get("refresh") === "1";
  const payload = await getFeed({ force });
  const body = JSON.stringify(payload);
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=60");
  res.end(body);
  return true;
}

function middleware(): Connect.NextHandleFunction {
  return async (req, res, next) => {
    try {
      if (await writeFeed(req, res)) return;
      next();
    } catch (error) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ error: error instanceof Error ? error.message : "Feed failed" }));
    }
  };
}

export function feedPlugin(): Plugin {
  return {
    name: "source-feed-api",
    configureServer(server) {
      server.middlewares.use(middleware());
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware());
    },
  };
}
