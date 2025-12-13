/**
 * T025: Shard Loader
 * 
 * Responsible for loading specific price data shards based on date ranges.
 * Uses the date-range-index.json to efficiently determine which shard files
 * to load without scanning all files.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { CommodityPrice } from '../types/commodity-price';

export interface ShardLoadResult {
  /** Loaded price data */
  prices: CommodityPrice[];
  
  /** Which shard files were loaded */
  shardsLoaded: string[];
  
  /** Date range of loaded data */
  dateRange: {
    start: string;
    end: string;
  };
  
  /** Number of records loaded */
  recordCount: number;
}

export interface ShardInfo {
  file: string;
  startDate: string;
  endDate: string;
  recordCount: number;
  sizeBytes: number;
}

/**
 * Load a single shard file and return its data
 */
export function loadShard(shardPath: string): CommodityPrice[] {
  try {
    const fullPath = path.join(process.cwd(), 'src', 'data', 'prices', shardPath);
    
    if (!fs.existsSync(fullPath)) {
      console.warn(`Shard file not found: ${shardPath}`);
      return [];
    }
    
    const rawData = fs.readFileSync(fullPath, 'utf-8');
    const data = JSON.parse(rawData);
    
    if (!Array.isArray(data)) {
      console.warn(`Invalid shard data format in ${shardPath}`);
      return [];
    }
    
    return data as CommodityPrice[];
  } catch (error) {
    console.error(`Error loading shard ${shardPath}:`, error);
    return [];
  }
}

/**
 * Load multiple shards and combine their data
 */
export function loadShards(shardPaths: string[]): ShardLoadResult {
  const allPrices: CommodityPrice[] = [];
  const shardsLoaded: string[] = [];
  let minDate: string | null = null;
  let maxDate: string | null = null;
  
  for (const shardPath of shardPaths) {
    const prices = loadShard(shardPath);
    
    if (prices.length > 0) {
      allPrices.push(...prices);
      shardsLoaded.push(shardPath);
      
      // Track date range (shards are sorted descending, so first = max, last = min)
      const shardMax = prices[0].date;
      const shardMin = prices[prices.length - 1].date;
      
      if (!minDate || shardMin < minDate) minDate = shardMin;
      if (!maxDate || shardMax > maxDate) maxDate = shardMax;
    }
  }
  
  // Sort combined data by date descending (newest first)
  allPrices.sort((a, b) => b.date.localeCompare(a.date));
  
  return {
    prices: allPrices,
    shardsLoaded,
    dateRange: {
      start: minDate || '',
      end: maxDate || ''
    },
    recordCount: allPrices.length
  };
}

/**
 * Load shards for a specific date range query
 * Returns only the shards that intersect with the query range
 */
export function loadShardsForDateRange(
  shards: ShardInfo[],
  startDate: string,
  endDate: string
): ShardLoadResult {
  // Find shards that overlap with the requested date range
  const relevantShards = shards.filter(shard => {
    // Shard overlaps if: shard.start <= query.end AND shard.end >= query.start
    return shard.startDate <= endDate && shard.endDate >= startDate;
  });
  
  if (relevantShards.length === 0) {
    return {
      prices: [],
      shardsLoaded: [],
      dateRange: { start: startDate, end: endDate },
      recordCount: 0
    };
  }
  
  // Load the relevant shards
  const shardPaths = relevantShards.map(s => s.file);
  const result = loadShards(shardPaths);
  
  // Filter loaded data to exact date range
  const filteredPrices = result.prices.filter(price => {
    return price.date >= startDate && price.date <= endDate;
  });
  
  return {
    prices: filteredPrices,
    shardsLoaded: result.shardsLoaded,
    dateRange: {
      start: filteredPrices[filteredPrices.length - 1]?.date || startDate,
      end: filteredPrices[0]?.date || endDate
    },
    recordCount: filteredPrices.length
  };
}

/**
 * Load the most recent N records from shards (efficient for "last 12 months" queries)
 */
export function loadRecentPrices(
  shards: ShardInfo[],
  count: number
): ShardLoadResult {
  // Shards are ordered by date range, so start with the most recent
  const sortedShards = [...shards].sort((a, b) => b.endDate.localeCompare(a.endDate));
  
  const allPrices: CommodityPrice[] = [];
  const shardsLoaded: string[] = [];
  
  for (const shard of sortedShards) {
    if (allPrices.length >= count) {
      break; // We have enough data
    }
    
    const prices = loadShard(shard.file);
    if (prices.length > 0) {
      allPrices.push(...prices);
      shardsLoaded.push(shard.file);
    }
  }
  
  // Sort and truncate to requested count
  allPrices.sort((a, b) => b.date.localeCompare(a.date));
  const truncated = allPrices.slice(0, count);
  
  return {
    prices: truncated,
    shardsLoaded,
    dateRange: {
      start: truncated[truncated.length - 1]?.date || '',
      end: truncated[0]?.date || ''
    },
    recordCount: truncated.length
  };
}

export default {
  loadShard,
  loadShards,
  loadShardsForDateRange,
  loadRecentPrices
};
