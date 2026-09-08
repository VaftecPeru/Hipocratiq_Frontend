import {
  SUPERADMIN_NAVIGATION_INVALIDATED_EVENT,
  type SuperadminNavigationScope,
} from "@/features/platform/model/superadmin-navigation-invalidation";

export type PlatformDataScope = "audit" | "emergency" | "support";

type CacheEntry = {
  scope: PlatformDataScope;
  data: unknown;
  fetchedAt: number;
};

const CACHE_TTL_MS = 15_000;
const cache = new Map<string, CacheEntry>();

function cacheKey(scope: PlatformDataScope, key: string): string {
  return `${scope}:${key}`;
}

export function readPlatformDataCache<T>(scope: PlatformDataScope, key: string): T | null {
  const entry = cache.get(cacheKey(scope, key));
  if (!entry || Date.now() - entry.fetchedAt >= CACHE_TTL_MS) {
    if (entry) cache.delete(cacheKey(scope, key));
    return null;
  }

  return entry.data as T;
}

export function writePlatformDataCache<T>(scope: PlatformDataScope, key: string, data: T): T {
  cache.set(cacheKey(scope, key), { scope, data, fetchedAt: Date.now() });
  return data;
}

export function invalidatePlatformData(scopes: readonly SuperadminNavigationScope[]): void {
  const dataScopes = new Set<PlatformDataScope>(
    scopes.filter((scope): scope is PlatformDataScope =>
      scope === "audit" || scope === "emergency" || scope === "support",
    ),
  );

  if (dataScopes.size === 0) return;

  for (const [key, entry] of cache) {
    if (dataScopes.has(entry.scope)) cache.delete(key);
  }
}

if (typeof window !== "undefined") {
  window.addEventListener(SUPERADMIN_NAVIGATION_INVALIDATED_EVENT, (event) => {
    const detail = (event as CustomEvent<{ scopes?: SuperadminNavigationScope[] }>).detail;
    invalidatePlatformData(detail?.scopes ?? []);
  });
}
