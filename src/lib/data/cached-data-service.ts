/**
 * T032: Cached Data Service
 * 
 * Wrapper around data-service.ts that implements Next.js unstable_cache
 * for API route caching. This provides a 3rd layer of caching (after browser
 * and Next.js ISR) specifically for data fetching operations.
 */

import { unstable_cache } from 'next/cache';
import * as dataService from './data-service';
import type { GetPricesOptions, GetPricesResult } from './data-service';

/**
 * Cache tags for selective invalidation
 */
export const CACHE_TAGS = {
  commodityPrices: 'commodity-prices',
  homepage: 'homepage',
  allCommodities: 'all-commodities',
  commodity: (id: string) => `commodity-${id}`,
};

/**
 * Cache configuration
 */
const DEFAULT_REVALIDATE = 86400; // 24 hours
const HOMEPAGE_REVALIDATE = 3600; // 1 hour (more frequent for homepage)

/**
 * Cached version of getPrices
 */
export const getCachedPrices = unstable_cache(
  async (commodityId: string, options: GetPricesOptions = {}) => {
    return dataService.getPrices(commodityId, options);
  },
  ['get-prices'],
  {
    revalidate: DEFAULT_REVALIDATE,
    tags: [CACHE_TAGS.commodityPrices],
  }
);

/**
 * Cached version of getRecentPrices (optimized for homepage)
 */
export const getCachedRecentPrices = unstable_cache(
  async (commodityId: string, count: number = 12) => {
    return dataService.getRecentPrices(commodityId, count);
  },
  ['get-recent-prices'],
  {
    revalidate: HOMEPAGE_REVALIDATE,
    tags: [CACHE_TAGS.homepage, CACHE_TAGS.commodityPrices],
  }
);

/**
 * Cached version of getAllPrices
 */
export const getCachedAllPrices = unstable_cache(
  async (commodityId: string) => {
    return dataService.getAllPrices(commodityId);
  },
  ['get-all-prices'],
  {
    revalidate: DEFAULT_REVALIDATE,
    tags: [CACHE_TAGS.commodityPrices],
  }
);

/**
 * Cached version of getBatchPrices
 */
export const getCachedBatchPrices = unstable_cache(
  async (commodityIds: string[], options: GetPricesOptions = {}) => {
    return dataService.getBatchPrices(commodityIds, options);
  },
  ['get-batch-prices'],
  {
    revalidate: HOMEPAGE_REVALIDATE,
    tags: [CACHE_TAGS.homepage, CACHE_TAGS.commodityPrices],
  }
);

/**
 * Get available commodities (cached for 24 hours)
 */
export const getCachedAvailableCommodities = unstable_cache(
  async () => {
    return dataService.getAvailableCommodities();
  },
  ['get-available-commodities'],
  {
    revalidate: DEFAULT_REVALIDATE,
    tags: [CACHE_TAGS.allCommodities],
  }
);

/**
 * Check if commodity exists (cached)
 */
export function hasCachedCommodity(commodityId: string): boolean {
  // This is a synchronous check, so we use the non-cached version
  return dataService.hasCommodity(commodityId);
}

// Re-export types
export type { GetPricesOptions, GetPricesResult } from './data-service';

export default {
  getCachedPrices,
  getCachedRecentPrices,
  getCachedAllPrices,
  getCachedBatchPrices,
  getCachedAvailableCommodities,
  hasCachedCommodity,
  CACHE_TAGS,
};
