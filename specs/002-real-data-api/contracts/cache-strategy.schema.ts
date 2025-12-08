/**
 * Cache Strategy Configuration
 * 
 * Defines caching behavior for different data access patterns.
 */

/**
 * Cache layer types
 */
export type CacheLayer =
  | 'static-generation'   // Build-time static generation
  | 'isr'                 // Incremental Static Regeneration
  | 'browser'             // Browser HTTP caching
  | 'api-route';          // Server-side API route caching

/**
 * Cache configuration for a specific route or operation
 */
export interface CacheConfig {
  /** Unique identifier for this cache config */
  id: string;

  /** Description of what this caches */
  description: string;

  /** Which cache layers are enabled */
  layers: CacheLayer[];

  /** Cache TTL in seconds */
  ttl: number;

  /** Stale-while-revalidate duration in seconds */
  staleWhileRevalidate?: number;

  /** Cache tags for invalidation */
  tags: string[];

  /** Whether to cache on client (browser) */
  clientCache: boolean;

  /** Custom cache key function */
  cacheKeyPattern?: string;
}

/**
 * Homepage cache configuration
 */
export const HOMEPAGE_CACHE: CacheConfig = {
  id: 'homepage',
  description: 'Homepage with recent 12 months for all commodities',
  layers: ['static-generation', 'isr', 'browser'],
  ttl: 86400, // 24 hours
  staleWhileRevalidate: 86400,
  tags: ['homepage', 'commodity-prices', 'all-commodities'],
  clientCache: true,
  cacheKeyPattern: '/',
};

/**
 * Commodity page cache configuration
 */
export const COMMODITY_PAGE_CACHE: CacheConfig = {
  id: 'commodity-page',
  description: 'Individual commodity page with default date range',
  layers: ['static-generation', 'isr', 'browser'],
  ttl: 86400, // 24 hours
  staleWhileRevalidate: 86400,
  tags: ['commodity-pages', 'commodity-prices'],
  clientCache: true,
  cacheKeyPattern: '/data/[commodity]',
};

/**
 * API route cache configuration (dynamic queries)
 */
export const API_ROUTE_CACHE: CacheConfig = {
  id: 'api-route',
  description: 'API routes for custom date range queries',
  layers: ['api-route', 'browser'],
  ttl: 3600, // 1 hour
  staleWhileRevalidate: 3600,
  tags: ['commodity-prices', 'api-queries'],
  clientCache: true,
  cacheKeyPattern: '/api/prices/[commodity]?start=[start]&end=[end]',
};

/**
 * Static asset cache configuration (shard files)
 */
export const SHARD_FILE_CACHE: CacheConfig = {
  id: 'shard-file',
  description: 'JSON shard files (static assets)',
  layers: ['browser'],
  ttl: 3600, // 1 hour
  staleWhileRevalidate: 86400,
  tags: ['shard-files'],
  clientCache: true,
  cacheKeyPattern: '/data/prices/[commodity]/[period].json',
};

/**
 * Cache invalidation strategy
 */
export interface CacheInvalidationStrategy {
  /** Trigger type */
  trigger: 'manual' | 'scheduled' | 'data-update';

  /** Tags to invalidate */
  tags: string[];

  /** Specific paths to revalidate (optional) */
  paths?: string[];

  /** Whether to invalidate immediately or on next request */
  immediate: boolean;
}

/**
 * Common invalidation strategies
 */
export const INVALIDATION_STRATEGIES = {
  /** Invalidate specific commodity after data update */
  commodityUpdate: (commodity: string): CacheInvalidationStrategy => ({
    trigger: 'data-update',
    tags: ['commodity-prices', `commodity-${commodity}`],
    paths: [
      '/', // Homepage includes this commodity
      `/data/${commodity}`, // Commodity page
    ],
    immediate: true,
  }),

  /** Invalidate all commodities (bulk update) */
  bulkUpdate: (): CacheInvalidationStrategy => ({
    trigger: 'data-update',
    tags: ['commodity-prices', 'all-commodities', 'homepage'],
    paths: ['/'],
    immediate: true,
  }),

  /** Scheduled daily invalidation for high-priority commodities */
  dailyRefresh: (commodities: string[]): CacheInvalidationStrategy => ({
    trigger: 'scheduled',
    tags: ['commodity-prices', ...commodities.map(c => `commodity-${c}`)],
    immediate: false,
  }),
};

/**
 * Cache hit rate monitoring
 */
export interface CacheMetrics {
  /** Cache configuration ID */
  configId: string;

  /** Time period for these metrics */
  period: {
    start: string; // ISO 8601
    end: string; // ISO 8601
  };

  /** Total requests */
  totalRequests: number;

  /** Cache hits */
  hits: number;

  /** Cache misses */
  misses: number;

  /** Hit rate percentage (0-100) */
  hitRate: number;

  /** Average response time for hits (ms) */
  avgHitResponseTime: number;

  /** Average response time for misses (ms) */
  avgMissResponseTime: number;
}

/**
 * Cache warming strategy
 * Pre-populate cache with common queries before user requests
 */
export interface CacheWarmingStrategy {
  /** When to warm cache */
  trigger: 'build' | 'deploy' | 'scheduled';

  /** What to pre-generate */
  targets: Array<{
    type: 'page' | 'api-call';
    path: string;
    params?: Record<string, string>;
  }>;

  /** Priority (higher = warmed first) */
  priority: 'high' | 'medium' | 'low';
}

/**
 * Common cache warming strategies
 */
export const WARMING_STRATEGIES: CacheWarmingStrategy[] = [
  {
    trigger: 'build',
    targets: [
      { type: 'page', path: '/' },
      { type: 'page', path: '/data/gold' },
      { type: 'page', path: '/data/silver' },
      { type: 'page', path: '/data/copper' },
      { type: 'page', path: '/data/petroleum' },
      // Top 10 most viewed commodities
    ],
    priority: 'high',
  },
  {
    trigger: 'deploy',
    targets: [
      // Warm all commodity pages on deployment
      ...['gold', 'silver', 'copper', 'aluminum', 'platinum', 'petroleum', 'wheat', 'corn', 'rice', 'soybeans'].map(
        commodity => ({
          type: 'page' as const,
          path: `/data/${commodity}`,
        })
      ),
    ],
    priority: 'medium',
  },
];

/**
 * Next.js specific cache configuration helpers
 */
export interface NextJSCacheConfig {
  /** Revalidate time for ISR (seconds) */
  revalidate: number;

  /** Cache tags for revalidateTag() */
  tags: string[];

  /** Fetch cache option */
  fetchCache?: 'auto' | 'default-cache' | 'only-cache' | 'force-cache' | 'default-no-store' | 'only-no-store' | 'force-no-store';

  /** Dynamic rendering option */
  dynamic?: 'auto' | 'force-dynamic' | 'error' | 'force-static';
}

/**
 * Map cache configs to Next.js configs
 */
export function toNextJSConfig(cacheConfig: CacheConfig): NextJSCacheConfig {
  return {
    revalidate: cacheConfig.ttl,
    tags: cacheConfig.tags,
    fetchCache: cacheConfig.clientCache ? 'default-cache' : 'default-no-store',
    dynamic: cacheConfig.layers.includes('static-generation') ? 'force-static' : 'auto',
  };
}

/**
 * Browser cache control headers
 */
export interface CacheControlHeaders {
  'Cache-Control': string;
  'CDN-Cache-Control'?: string;
  'Vercel-CDN-Cache-Control'?: string;
}

/**
 * Generate Cache-Control header from cache config
 */
export function toCacheControlHeader(cacheConfig: CacheConfig): CacheControlHeaders {
  const directives: string[] = ['public'];

  if (cacheConfig.clientCache) {
    directives.push(`max-age=${cacheConfig.ttl}`);
  } else {
    directives.push('no-cache');
  }

  if (cacheConfig.staleWhileRevalidate) {
    directives.push(`stale-while-revalidate=${cacheConfig.staleWhileRevalidate}`);
  }

  return {
    'Cache-Control': directives.join(', '),
    'Vercel-CDN-Cache-Control': `max-age=${cacheConfig.ttl}`,
  };
}
