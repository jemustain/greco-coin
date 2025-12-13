/**
 * T026: Index Reader
 * 
 * Reads and queries the date-range-index.json to determine which shard files
 * contain data for a given date range query.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { ShardInfo } from './shard-loader';

interface CommodityIndex {
  commodityId: string;
  totalRecords: number;
  totalSize: number;
  shards: ShardInfo[];
  dateRange: {
    start: string;
    end: string;
  };
}

interface DateRangeIndex {
  generatedAt: string;
  commodityCount: number;
  totalRecords: number;
  totalSize: number;
  commodities: Record<string, CommodityIndex>;
}

let cachedIndex: DateRangeIndex | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 60000; // Cache for 1 minute

/**
 * Load the date-range-index.json file
 * Implements simple in-memory caching to avoid repeated file reads
 */
export function loadIndex(): DateRangeIndex {
  const now = Date.now();
  
  // Return cached index if still valid
  if (cachedIndex && (now - cacheTimestamp) < CACHE_TTL_MS) {
    return cachedIndex;
  }
  
  try {
    const indexPath = path.join(process.cwd(), 'src', 'data', 'indexes', 'date-range-index.json');
    
    if (!fs.existsSync(indexPath)) {
      throw new Error(`Index file not found: ${indexPath}`);
    }
    
    const rawData = fs.readFileSync(indexPath, 'utf-8');
    cachedIndex = JSON.parse(rawData);
    cacheTimestamp = now;
    
    return cachedIndex as DateRangeIndex;
  } catch (error) {
    console.error('Error loading date-range index:', error);
    throw error;
  }
}

/**
 * Invalidate the cached index (useful after regenerating the index)
 */
export function invalidateCache(): void {
  cachedIndex = null;
  cacheTimestamp = 0;
}

/**
 * Get index data for a specific commodity
 */
export function getCommodityIndex(commodityId: string): CommodityIndex | null {
  const index = loadIndex();
  return index.commodities[commodityId] || null;
}

/**
 * Get all commodities with their basic metadata
 */
export function getAllCommodities(): Array<{
  id: string;
  totalRecords: number;
  dateRange: { start: string; end: string };
}> {
  const index = loadIndex();
  
  return Object.values(index.commodities).map(commodity => ({
    id: commodity.commodityId,
    totalRecords: commodity.totalRecords,
    dateRange: commodity.dateRange
  }));
}

/**
 * Get shards that overlap with a given date range
 */
export function getShardsForDateRange(
  commodityId: string,
  startDate: string,
  endDate: string
): ShardInfo[] {
  const commodityIndex = getCommodityIndex(commodityId);
  
  if (!commodityIndex) {
    console.warn(`No index data found for commodity: ${commodityId}`);
    return [];
  }
  
  // Filter shards that overlap with the query range
  return commodityIndex.shards.filter(shard => {
    // Shard overlaps if: shard.start <= query.end AND shard.end >= query.start
    return shard.startDate <= endDate && shard.endDate >= startDate;
  });
}

/**
 * Get all shards for a commodity (full history)
 */
export function getAllShards(commodityId: string): ShardInfo[] {
  const commodityIndex = getCommodityIndex(commodityId);
  return commodityIndex?.shards || [];
}

/**
 * Get the most recent shard for a commodity (latest data)
 */
export function getMostRecentShard(commodityId: string): ShardInfo | null {
  const shards = getAllShards(commodityId);
  
  if (shards.length === 0) {
    return null;
  }
  
  // Find shard with latest end date
  return shards.reduce((latest, shard) => {
    return shard.endDate > latest.endDate ? shard : latest;
  });
}

/**
 * Get index statistics
 */
export function getIndexStats(): {
  generatedAt: string;
  commodityCount: number;
  totalRecords: number;
  totalSizeMB: number;
} {
  const index = loadIndex();
  
  return {
    generatedAt: index.generatedAt,
    commodityCount: index.commodityCount,
    totalRecords: index.totalRecords,
    totalSizeMB: index.totalSize / (1024 * 1024)
  };
}

export default {
  loadIndex,
  invalidateCache,
  getCommodityIndex,
  getAllCommodities,
  getShardsForDateRange,
  getAllShards,
  getMostRecentShard,
  getIndexStats
};
