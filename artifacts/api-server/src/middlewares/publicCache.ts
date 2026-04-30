import type { NextFunction, Request, Response } from "express";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

type CacheEntry = {
  expiresAt: number;
  body: unknown;
};

const cache = new Map<string, CacheEntry>();
const cacheDir = path.resolve(process.cwd(), "..", "..", ".local", "api-response-cache");
const CACHE_VERSION = "2026-04-30-location-fill";

const CACHEABLE_PREFIXES = [
  "/categories",
  "/chefs",
  "/products",
  "/search",
  "/dashboard/featured-chefs",
  "/dashboard/popular-dishes",
  "/dashboard/grocery-essentials",
  "/dashboard/offers",
];

function ttlForPath(path: string) {
  if (path === "/categories") return 24 * 60 * 60 * 1000;
  if (path === "/dashboard/offers") return 24 * 60 * 60 * 1000;
  if (path.startsWith("/dashboard/")) return 6 * 60 * 60 * 1000;
  if (path.startsWith("/search")) return 2 * 60 * 60 * 1000;
  return 6 * 60 * 60 * 1000;
}

function isCacheable(req: Request) {
  if (req.method !== "GET") return false;
  return CACHEABLE_PREFIXES.some((prefix) => req.path.startsWith(prefix));
}

function cachePath(key: string) {
  const hash = createHash("sha256").update(key).digest("hex");
  return path.join(cacheDir, `${hash}.json`);
}

function readDiskCache(key: string, now: number) {
  try {
    const filePath = cachePath(key);
    if (!fs.existsSync(filePath)) return null;
    const entry = JSON.parse(fs.readFileSync(filePath, "utf8")) as CacheEntry;
    if (entry.expiresAt <= now) {
      fs.rmSync(filePath, { force: true });
      return null;
    }
    cache.set(key, entry);
    return entry;
  } catch {
    return null;
  }
}

function writeDiskCache(key: string, entry: CacheEntry) {
  try {
    fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(cachePath(key), JSON.stringify(entry), "utf8");
  } catch {
    // Memory cache still protects Firestore even if disk writes are unavailable.
  }
}

export function clearPublicCache() {
  cache.clear();
  fs.rmSync(cacheDir, { recursive: true, force: true });
}

export function publicCache(req: Request, res: Response, next: NextFunction) {
  if (!isCacheable(req)) {
    next();
    return;
  }

  const key = `${CACHE_VERSION}:${req.originalUrl}`;
  const now = Date.now();
  const cached = cache.get(key) ?? readDiskCache(key, now);
  if (cached && cached.expiresAt > now) {
    res.set("X-HomeBites-Cache", "hit");
    res.set("Cache-Control", "private, max-age=21600");
    res.json(cached.body);
    return;
  }

  const originalJson = res.json.bind(res);
  res.json = (body: unknown) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const entry = { body, expiresAt: now + ttlForPath(req.path) };
      cache.set(key, entry);
      writeDiskCache(key, entry);
      res.set("X-HomeBites-Cache", "miss");
      res.set("Cache-Control", "private, max-age=21600");
    }
    return originalJson(body);
  };

  next();
}
