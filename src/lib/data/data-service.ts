/**
 * T027: Data Service
 * 
 * Main service layer for querying commodity price data.
 * Uses shard-loader and index-reader to efficiently load only the data needed
 * for a given query without loading entire datasets into memory.
 */

import type { CommodityPrice, QualityIndicator } from '../types/commodity-price';
import * as indexReader from './index-reader';
import * as shardLoader from './shard-loader';

export interface GetPricesOptions {
  /** ISO 8601 start date (YYYY-MM-DD) */
  startDate?: string;
  
  /** ISO 8601 end date (YYYY-MM-DD) */
  endDate?: string;
  
  /** Filter by quality indicator */
  quality?: QualityIndicator | QualityIndicator[];
  
  /** Limit number of results (most recent first) */
  limit?: number;
  
  /** Skip first N results (for pagination) */
  offset?: number;
}

export interface GetPricesResult {
  /** Commodity identifier */
  commodityId: string;
  
  /** Price data matching the query */
  prices: CommodityPrice[];
  
  /** Query metadata */
  metadata: {
    /** Date range of returned data */
    dateRange: {
      start: string;
      end: string;
    };
    
    /** Number of records returned */
    recordCount: number;
    
    /** Which shard files were loaded */
    shardsLoaded: string[];
    
    /** Query execution time (ms) */
    queryTimeMs: number;
    
    /** Whether results were truncated by limit */
    truncated: boolean;
  };
}

/**
 * Calculate default date range (last 5 years if no range specified)
 */
function getDefaultDateRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const fiveYearsAgo = new Date(now);
  fiveYearsAgo.setFullYear(now.getFullYear() - 5);
  
  return {
    startDate: fiveYearsAgo.toISOString().split('T')[0],
    endDate: now.toISOString().split('T')[0]
  };
}

/**
 * Filter prices by quality indicator
 */
function filterByQuality(
  prices: CommodityPrice[],
  quality: QualityIndicator | QualityIndicator[]
): CommodityPrice[] {
  const qualitySet = Array.isArray(quality) ? new Set(quality) : new Set([quality]);
  return prices.filter(price => qualitySet.has(price.quality));
}

/**
 * Apply pagination (limit and offset)
 */
function applyPagination(
  prices: CommodityPrice[],
  limit?: number,
  offset?: number
): { prices: CommodityPrice[]; truncated: boolean } {
  const start = offset || 0;
  const end = limit ? start + limit : undefined;
  
  const paginated = prices.slice(start, end);
  const truncated = limit !== undefined && prices.length > start + limit;
  
  return { prices: paginated, truncated };
}

/**
 * Main function: Get prices for a commodity with optional filters
 */
export async function getPrices(
  commodityId: string,
  options: GetPricesOptions = {}
): Promise<GetPricesResult> {
  const startTime = performance.now();
  
  try {
    // Get commodity index
    const commodityIndex = indexReader.getCommodityIndex(commodityId);
    
    if (!commodityIndex) {
      throw new Error(`Commodity not found: ${commodityId}`);
    }
    
    // Determine date range
    const { startDate, endDate } = options.startDate && options.endDate
      ? { startDate: options.startDate, endDate: options.endDate }
      : getDefaultDateRange();
    
    // Find relevant shards
    const shards = indexReader.getShardsForDateRange(commodityId, startDate, endDate);
    
    // Load shard data
    let loadResult: shardLoader.ShardLoadResult;
    
    if (options.limit && !options.startDate && !options.endDate) {
      // Optimized path: load only recent data
      loadResult = shardLoader.loadRecentPrices(commodityIndex.shards, options.limit + (options.offset || 0));
    } else {
      // Standard path: load date range
      loadResult = shardLoader.loadShardsForDateRange(shards, startDate, endDate);
    }
    
    // Apply filters
    let filteredPrices = loadResult.prices;
    
    if (options.quality) {
      filteredPrices = filterByQuality(filteredPrices, options.quality);
    }
    
    // Apply pagination
    const { prices: paginatedPrices, truncated } = applyPagination(
      filteredPrices,
      options.limit,
      options.offset
    );
    
    const endTime = performance.now();
    
    return {
      commodityId,
      prices: paginatedPrices,
      metadata: {
        dateRange: loadResult.dateRange,
        recordCount: paginatedPrices.length,
        shardsLoaded: loadResult.shardsLoaded,
        queryTimeMs: Math.round(endTime - startTime),
        truncated
      }
    };
  } catch (error) {
    const endTime = performance.now();
    throw new Error(`Failed to get prices for ${commodityId}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get the most recent N prices for a commodity (optimized for homepage)
 */
export async function getRecentPrices(
  commodityId: string,
  count: number = 12
): Promise<GetPricesResult> {
  return getPrices(commodityId, { limit: count });
}

/**
 * Get all prices for a commodity (full history)
 */
export async function getAllPrices(commodityId: string): Promise<GetPricesResult> {
  const startTime = performance.now();
  
  const commodityIndex = indexReader.getCommodityIndex(commodityId);
  
  if (!commodityIndex) {
    throw new Error(`Commodity not found: ${commodityId}`);
  }
  
  const shards = indexReader.getAllShards(commodityId);
  const loadResult = shardLoader.loadShards(shards.map(s => s.file));
  
  const endTime = performance.now();
  
  return {
    commodityId,
    prices: loadResult.prices,
    metadata: {
      dateRange: loadResult.dateRange,
      recordCount: loadResult.recordCount,
      shardsLoaded: loadResult.shardsLoaded,
      queryTimeMs: Math.round(endTime - startTime),
      truncated: false
    }
  };
}

/**
 * Get prices for multiple commodities (batch query)
 */
export async function getBatchPrices(
  commodityIds: string[],
  options: GetPricesOptions = {}
): Promise<GetPricesResult[]> {
  const results = await Promise.all(
    commodityIds.map(id => getPrices(id, options))
  );
  
  return results;
}

/**
 * Check if a commodity has data available
 */
export function hasCommodity(commodityId: string): boolean {
  const index = indexReader.getCommodityIndex(commodityId);
  return index !== null && index.totalRecords > 0;
}

/**
 * Get list of all available commodities
 */
export function getAvailableCommodities(): string[] {
  return indexReader.getAllCommodities().map(c => c.id);
}

export default {
  getPrices,
  getRecentPrices,
  getAllPrices,
  getBatchPrices,
  hasCommodity,
  getAvailableCommodities
};
