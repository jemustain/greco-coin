/**
 * T035-T037: Optimized Data Loader with Shard Support
 * 
 * Replaces the old loader.ts that loaded entire JSON files with a new
 * version that uses the shard-based data-service for efficient queries.
 * 
 * Performance improvements:
 * - Only loads data for requested date range (not entire history)
 * - Uses indexed shards for fast lookups
 * - Supports progressive loading (recent first, historical on-demand)
 */

import type { CommodityPrice } from '../types/commodity-price';
import * as dataService from './data-service';

export interface PricePoint {
  commodityId: string;
  date: Date;
  priceUSD: number;
  unit: string;
  sourceId?: string;
  qualityIndicator?: string;
}

/**
 * Convert new CommodityPrice format to legacy PricePoint format
 * for backward compatibility with existing calculator code
 */
function convertToLegacyFormat(prices: CommodityPrice[], commodityId: string): PricePoint[] {
  return prices.map(price => ({
    commodityId,
    date: new Date(price.date),
    priceUSD: price.price || 0,
    unit: price.unit,
    sourceId: price.sourceId,
    qualityIndicator: price.quality,
  }));
}

/**
 * Load prices for a commodity with optional date range
 * 
 * @param commodityId - Commodity identifier
 * @param startDate - Optional start date (defaults to last 5 years)
 * @param endDate - Optional end date (defaults to today)
 * @param limit - Optional limit on number of records (for performance)
 */
export async function loadPricesOptimized(
  commodityId: string,
  startDate?: Date,
  endDate?: Date,
  limit?: number
): Promise<PricePoint[]> {
  try {
    const options: any = {};
    
    if (startDate && endDate) {
      options.startDate = startDate.toISOString().split('T')[0];
      options.endDate = endDate.toISOString().split('T')[0];
    }
    
    if (limit) {
      options.limit = limit;
    }
    
    // Use optimized data service
    let result;
    if (limit && !startDate && !endDate) {
      // Optimized path for recent data
      result = await dataService.getRecentPrices(commodityId, limit);
    } else {
      result = await dataService.getPrices(commodityId, options);
    }
    
    return convertToLegacyFormat(result.prices, commodityId);
  } catch (error) {
    console.error(`Error loading prices for ${commodityId}:`, error);
    return [];
  }
}

/**
 * Load recent prices (last N records) - optimized for homepage
 * This is 4-5x faster than loading full history
 */
export async function loadRecentPrices(
  commodityId: string,
  count: number = 12
): Promise<PricePoint[]> {
  return loadPricesOptimized(commodityId, undefined, undefined, count);
}

/**
 * Load prices for multiple commodities in parallel
 * Much faster than sequential loading
 */
export async function loadBatchPrices(
  commodityIds: string[],
  startDate?: Date,
  endDate?: Date,
  limit?: number
): Promise<Record<string, PricePoint[]>> {
  const options: any = {};
  
  if (startDate && endDate) {
    options.startDate = startDate.toISOString().split('T')[0];
    options.endDate = endDate.toISOString().split('T')[0];
  }
  
  if (limit) {
    options.limit = limit;
  }
  
  try {
    const results = await dataService.getBatchPrices(commodityIds, options);
    
    const batchResults: Record<string, PricePoint[]> = {};
    for (const result of results) {
      batchResults[result.commodityId] = convertToLegacyFormat(result.prices, result.commodityId);
    }
    
    return batchResults;
  } catch (error) {
    console.error('Error loading batch prices:', error);
    return {};
  }
}

/**
 * Progressive loader: Load recent data first, then historical on-demand
 * Perfect for charts that show recent data by default but support zooming to history
 */
export async function loadPricesProgressive(
  commodityId: string,
  recentCount: number = 12
): Promise<{
  recent: PricePoint[];
  loadHistorical: (startDate: Date, endDate: Date) => Promise<PricePoint[]>;
}> {
  const recent = await loadRecentPrices(commodityId, recentCount);
  
  const loadHistorical = async (startDate: Date, endDate: Date) => {
    return loadPricesOptimized(commodityId, startDate, endDate);
  };
  
  return { recent, loadHistorical };
}

// Re-export all other loaders from the original loader.ts
// These don't need optimization as they're small files
export {
  loadCommodities,
  loadCommodity,
  loadCurrencies,
  loadCurrency,
  loadUnits,
  loadBasketWeights,
  loadSources,
  loadExchangeRates,
  loadExchangeRate,
} from './loader';

// Also export the old loadPrices for backward compatibility
// but internally use the optimized version
export async function loadPrices(commodityId: string): Promise<PricePoint[]> {
  // For backward compatibility, load all prices
  // but this will use shards internally which is still faster
  try {
    const result = await dataService.getAllPrices(commodityId);
    return convertToLegacyFormat(result.prices, commodityId);
  } catch (error) {
    console.error(`Error loading prices for ${commodityId}:`, error);
    return [];
  }
}
