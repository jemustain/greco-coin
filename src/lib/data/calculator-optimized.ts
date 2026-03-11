/**
 * T037: Optimized Greco Calculator
 * 
 * Optimized version of calculator.ts that uses the new shard-based data loader
 * to only load data for the requested date range instead of all historical data.
 * 
 * Performance improvements:
 * - Uses loadPricesOptimized to only load needed date ranges
 * - Batch loads all commodities in parallel
 * - 5-10x faster for typical homepage queries (last 12 months)
 */

import { DataQualityIndicator } from '../types/commodity';
import { GrecoValue } from '../types/greco';
import { 
  loadBasketWeights, 
  loadBatchPrices,
  loadExchangeRate,
  PricePoint 
} from './loader-optimized';
import { computeProductionWeights } from './weights';

/**
 * Find price closest to target date
 */
function findClosestPrice(
  prices: Array<{ date: Date; priceUSD: number }>,
  targetDate: Date
): { date: Date; priceUSD: number } | null {
  if (prices.length === 0) return null;

  return prices.reduce((closest, price) => {
    const closestDiff = Math.abs(closest.date.getTime() - targetDate.getTime());
    const currentDiff = Math.abs(price.date.getTime() - targetDate.getTime());
    return currentDiff < closestDiff ? price : closest;
  });
}

/**
 * Calculate Greco unit value for a specific date and currency (optimized)
 */
export async function calculateGrecoValueOptimized(
  date: Date,
  currencyId: string,
  pricesCache?: Record<string, PricePoint[]>,
  customWeights?: Record<string, number>
): Promise<GrecoValue | null> {
  const basketWeights = await loadBasketWeights();
  
  // Get all commodity IDs
  const commodityIds = basketWeights.weights.map(w => w.commodityId);
  
  // Load prices in batch if not cached
  const allPrices = pricesCache || await loadBatchPrices(
    commodityIds,
    new Date(date.getTime() - 90 * 24 * 60 * 60 * 1000), // Look 90 days before
    new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000)  // Look 30 days after
  );
  
  // Find closest prices for each commodity, using custom weights if provided
  const commodityPrices = basketWeights.weights.map(weightEntry => {
    const prices = allPrices[weightEntry.commodityId] || [];
    const closestPrice = findClosestPrice(prices as Array<{ date: Date; priceUSD: number }>, date);
    const weight = customWeights ? (customWeights[weightEntry.commodityId] ?? 0) : weightEntry.weight;
    
    return {
      commodityId: weightEntry.commodityId,
      weight,
      price: closestPrice,
    };
  });

  // Calculate completeness
  const completeness = (commodityPrices.filter(c => c.price !== null).length / commodityPrices.length) * 100;
  
  // Require >= 80% completeness
  if (completeness < 80) {
    return null;
  }

  // Calculate weighted average Greco value in USD
  let grecoValueUSD = 0;
  const contributingCommodities: string[] = [];

  for (const item of commodityPrices) {
    if (item.price) {
      grecoValueUSD += item.price.priceUSD * item.weight;
      contributingCommodities.push(item.commodityId);
    }
  }

  // Convert to target currency if not USD
  let grecoValue = grecoValueUSD;
  if (currencyId !== 'USD') {
    const exchangeRate = await loadExchangeRate(currencyId, date);
    if (!exchangeRate) {
      return null;
    }
    grecoValue = grecoValueUSD * exchangeRate;
  }

  // Determine quality indicator
  const qualityIndicator: DataQualityIndicator = completeness >= 95 ? DataQualityIndicator.HIGH : DataQualityIndicator.MEDIUM;

  return {
    date,
    currencyId,
    value: grecoValue,
    completeness,
    qualityIndicator,
    basketVersion: basketWeights.version,
    contributingCommodities,
  };
}

/**
 * Calculate Greco time series (optimized version)
 * 
 * Much faster than the original because it only loads data for the requested
 * date range instead of loading all historical data for all commodities.
 */
export async function calculateGrecoTimeSeriesOptimized(
  startDate: Date,
  endDate: Date,
  currencyId: string = 'USD',
  interval: 'monthly' | 'quarterly' | 'annual' = 'monthly',
  baselineYear?: number
): Promise<GrecoValue[]> {
  console.log(`🚀 Calculating Greco time series (optimized) from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}${baselineYear ? ` [weights from ${baselineYear}]` : ''}`);
  const startTime = performance.now();
  
  // Compute production-based weights if baseline year provided
  let customWeights: Record<string, number> | undefined;
  if (baselineYear) {
    console.log(`⚖️ Computing production-based weights for baseline year ${baselineYear}...`);
    customWeights = await computeProductionWeights(baselineYear);
    const topWeights = Object.entries(customWeights)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, w]) => `${id}: ${(w * 100).toFixed(1)}%`);
    console.log(`⚖️ Top 5 weights: ${topWeights.join(', ')}`);
  }
  
  const basketWeights = await loadBasketWeights();
  const commodityIds = basketWeights.weights.map(w => w.commodityId);
  
  // Batch load all commodity prices for the date range (MUCH faster than loading each separately)
  // Add 90 days buffer before start and 30 days after end for interpolation
  const bufferStart = new Date(startDate.getTime() - 90 * 24 * 60 * 60 * 1000);
  const bufferEnd = new Date(endDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  console.log(`📦 Batch loading ${commodityIds.length} commodities...`);
  const batchStart = performance.now();
  const allPrices = await loadBatchPrices(commodityIds, bufferStart, bufferEnd);
  const batchTime = performance.now() - batchStart;
  console.log(`✅ Batch load complete in ${batchTime.toFixed(2)}ms`);
  
  // Generate date range based on interval
  const dates: Date[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    
    if (interval === 'monthly') {
      currentDate.setMonth(currentDate.getMonth() + 1);
    } else if (interval === 'quarterly') {
      currentDate.setMonth(currentDate.getMonth() + 3);
    } else {
      currentDate.setFullYear(currentDate.getFullYear() + 1);
    }
  }
  
  console.log(`📅 Calculating for ${dates.length} dates...`);
  
  // Calculate Greco value for each date (reusing the loaded prices)
  const grecoValues: GrecoValue[] = [];
  
  for (const date of dates) {
    const grecoValue = await calculateGrecoValueOptimized(date, currencyId, allPrices, customWeights);
    if (grecoValue) {
      grecoValues.push(grecoValue);
    }
  }
  
  const endTime = performance.now();
  const totalTime = endTime - startTime;
  console.log(`✨ Calculated ${grecoValues.length} Greco values in ${totalTime.toFixed(2)}ms (${(totalTime / grecoValues.length).toFixed(2)}ms per value)`);
  
  return grecoValues;
}

// Re-export original functions for backward compatibility
export { 
  calculateGrecoValue,
  calculateGrecoTimeSeries,
  validateCompleteness,
} from './calculator';
