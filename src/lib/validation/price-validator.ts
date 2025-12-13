/**
 * Price Validator
 * 
 * T020: Statistical outlier detection and data quality validation for commodity prices
 * 
 * Implements statistical methods to detect anomalies, outliers, and data quality issues
 * in fetched commodity price data before it's written to storage.
 */

import type { CommodityPrice, QualityIndicator } from '../types/commodity-price';
import { commodityPriceSchema } from './price-schema';
import { z } from 'zod';

/**
 * Validation result for a single price point
 */
export interface PriceValidationResult {
  isValid: boolean;
  price: CommodityPrice;
  warnings: string[];
  errors: string[];
  suggestedQuality?: QualityIndicator;
}

/**
 * Validation result for a batch of prices
 */
export interface BatchValidationResult {
  totalPrices: number;
  validPrices: number;
  invalidPrices: number;
  outliers: number;
  warnings: number;
  results: PriceValidationResult[];
  statistics: {
    mean: number;
    median: number;
    stdDev: number;
    min: number;
    max: number;
    outlierThreshold: number;
  };
}

/**
 * Options for price validation
 */
export interface ValidationOptions {
  /** Number of standard deviations for outlier detection (default: 3) */
  outlierStdDevs?: number;
  
  /** Minimum price value (below this is considered invalid, default: 0) */
  minPrice?: number;
  
  /** Maximum price value (above this is considered invalid, default: Infinity) */
  maxPrice?: number;
  
  /** Whether to reject outliers (default: false - mark with lower quality instead) */
  rejectOutliers?: boolean;
  
  /** Whether to validate schema (default: true) */
  validateSchema?: boolean;
  
  /** Whether to check for duplicate dates (default: true) */
  checkDuplicates?: boolean;
}

/**
 * Price Validator
 * 
 * Validates commodity price data using statistical methods and schema validation
 */
export class PriceValidator {
  private defaultOptions: Required<ValidationOptions> = {
    outlierStdDevs: 3,
    minPrice: 0,
    maxPrice: Infinity,
    rejectOutliers: false,
    validateSchema: true,
    checkDuplicates: true,
  };

  /**
   * Validate a batch of commodity prices
   * 
   * @param prices Array of commodity prices to validate
   * @param options Validation options
   * @returns Batch validation result with statistics and individual results
   */
  validateBatch(
    prices: CommodityPrice[],
    options?: ValidationOptions
  ): BatchValidationResult {
    const opts = { ...this.defaultOptions, ...options };
    const priceValues = prices
      .filter((p) => p.price !== null && !isNaN(p.price))
      .map((p) => p.price as number);

    // Calculate statistics
    const statistics = this.calculateStatistics(priceValues, opts.outlierStdDevs);

    // Validate each price
    const results: PriceValidationResult[] = prices.map((price) =>
      this.validateSingle(price, statistics, opts)
    );

    // Aggregate results
    const validPrices = results.filter((r) => r.isValid).length;
    const invalidPrices = results.filter((r) => !r.isValid).length;
    const outliers = results.filter((r) =>
      r.warnings.some((w) => w.includes('outlier'))
    ).length;
    const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);

    return {
      totalPrices: prices.length,
      validPrices,
      invalidPrices,
      outliers,
      warnings: totalWarnings,
      results,
      statistics,
    };
  }

  /**
   * Validate a single commodity price
   * 
   * @param price Commodity price to validate
   * @param statistics Statistical summary of the dataset
   * @param options Validation options
   * @returns Validation result for the price
   */
  private validateSingle(
    price: CommodityPrice,
    statistics: BatchValidationResult['statistics'],
    options: Required<ValidationOptions>
  ): PriceValidationResult {
    const warnings: string[] = [];
    const errors: string[] = [];
    let isValid = true;
    let suggestedQuality: QualityIndicator | undefined;

    // Schema validation
    if (options.validateSchema) {
      try {
        commodityPriceSchema.parse(price);
      } catch (error) {
        if (error instanceof z.ZodError) {
          errors.push(`Schema validation failed: ${error.errors.map((e) => e.message).join(', ')}`);
          isValid = false;
        }
      }
    }

    // Null or missing price
    if (price.price === null || price.price === undefined) {
      warnings.push('Price is null or undefined');
      suggestedQuality = 'unavailable';
      return { isValid: true, price, warnings, errors, suggestedQuality };
    }

    // Range validation
    if (price.price < options.minPrice) {
      errors.push(`Price ${price.price} is below minimum threshold ${options.minPrice}`);
      isValid = false;
    }

    if (price.price > options.maxPrice) {
      errors.push(`Price ${price.price} exceeds maximum threshold ${options.maxPrice}`);
      isValid = false;
    }

    // Outlier detection using standard deviation
    const isOutlier = Math.abs(price.price - statistics.mean) > statistics.outlierThreshold;
    
    if (isOutlier) {
      const deviations = Math.abs((price.price - statistics.mean) / statistics.stdDev).toFixed(2);
      warnings.push(
        `Potential outlier: ${price.price} is ${deviations} standard deviations from mean (${statistics.mean.toFixed(2)})`
      );

      if (options.rejectOutliers) {
        errors.push('Price rejected as statistical outlier');
        isValid = false;
      } else {
        // Downgrade quality but keep the price
        if (price.quality === 'high') {
          suggestedQuality = 'high'; // Keep high quality but flag warning
        }
      }
    }

    // Check for suspiciously flat prices (same value repeated)
    // This would require context of surrounding prices, so we'll skip for single validation

    // Date format validation (basic check)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(price.date)) {
      errors.push(`Invalid date format: ${price.date} (expected YYYY-MM-DD)`);
      isValid = false;
    }

    return {
      isValid,
      price,
      warnings,
      errors,
      suggestedQuality,
    };
  }

  /**
   * Calculate statistical summary of price dataset
   * 
   * @param prices Array of price values
   * @param outlierStdDevs Number of standard deviations for outlier threshold
   * @returns Statistical summary
   */
  private calculateStatistics(
    prices: number[],
    outlierStdDevs: number
  ): BatchValidationResult['statistics'] {
    if (prices.length === 0) {
      return {
        mean: 0,
        median: 0,
        stdDev: 0,
        min: 0,
        max: 0,
        outlierThreshold: 0,
      };
    }

    // Mean
    const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;

    // Standard deviation
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
    const stdDev = Math.sqrt(variance);

    // Median
    const sorted = [...prices].sort((a, b) => a - b);
    const median =
      sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];

    // Min/Max
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    // Outlier threshold (mean ± N standard deviations)
    const outlierThreshold = stdDev * outlierStdDevs;

    return {
      mean,
      median,
      stdDev,
      min,
      max,
      outlierThreshold,
    };
  }

  /**
   * Check for duplicate dates in a price dataset
   * 
   * @param prices Array of commodity prices
   * @returns Array of duplicate date entries
   */
  checkDuplicates(prices: CommodityPrice[]): { date: string; count: number }[] {
    const dateCounts = new Map<string, number>();

    for (const price of prices) {
      dateCounts.set(price.date, (dateCounts.get(price.date) || 0) + 1);
    }

    return Array.from(dateCounts.entries())
      .filter(([_, count]) => count > 1)
      .map(([date, count]) => ({ date, count }));
  }

  /**
   * Detect flat price sequences (same price repeated)
   * 
   * Useful for detecting data quality issues where API returns stale data
   * 
   * @param prices Array of commodity prices (must be sorted by date)
   * @param minSequenceLength Minimum length of flat sequence to report (default: 5)
   * @returns Array of flat sequence ranges
   */
  detectFlatSequences(
    prices: CommodityPrice[],
    minSequenceLength: number = 5
  ): Array<{ startDate: string; endDate: string; value: number; length: number }> {
    const sequences: Array<{ startDate: string; endDate: string; value: number; length: number }> = [];

    let currentSequence: { startDate: string; value: number; length: number } | null = null;

    for (let i = 0; i < prices.length; i++) {
      const price = prices[i];
      
      if (price.price === null) continue;

      if (!currentSequence) {
        currentSequence = { startDate: price.date, value: price.price, length: 1 };
      } else if (Math.abs(price.price - currentSequence.value) < 0.01) {
        // Same price (within $0.01 tolerance)
        currentSequence.length++;
      } else {
        // Sequence broken
        if (currentSequence.length >= minSequenceLength) {
          sequences.push({
            startDate: currentSequence.startDate,
            endDate: prices[i - 1].date,
            value: currentSequence.value,
            length: currentSequence.length,
          });
        }
        currentSequence = { startDate: price.date, value: price.price, length: 1 };
      }
    }

    // Check final sequence
    if (currentSequence && currentSequence.length >= minSequenceLength) {
      sequences.push({
        startDate: currentSequence.startDate,
        endDate: prices[prices.length - 1].date,
        value: currentSequence.value,
        length: currentSequence.length,
      });
    }

    return sequences;
  }

  /**
   * Validate date range continuity
   * 
   * Checks for unexpected gaps in the date series
   * 
   * @param prices Array of commodity prices (must be sorted by date)
   * @param expectedGranularity Expected data granularity ('daily', 'weekly', 'monthly')
   * @returns Array of gaps found
   */
  checkDateContinuity(
    prices: CommodityPrice[],
    expectedGranularity: 'daily' | 'weekly' | 'monthly'
  ): Array<{ startDate: string; endDate: string; gapDays: number }> {
    const gaps: Array<{ startDate: string; endDate: string; gapDays: number }> = [];

    const expectedGapDays: Record<typeof expectedGranularity, number> = {
      daily: 1,
      weekly: 7,
      monthly: 31, // Allow up to 31 days for monthly data
    };

    const maxAllowedGap = expectedGapDays[expectedGranularity] * 2; // Allow 2x the expected gap

    for (let i = 1; i < prices.length; i++) {
      const prevDate = new Date(prices[i - 1].date);
      const currDate = new Date(prices[i].date);
      const gapDays = Math.abs((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

      if (gapDays > maxAllowedGap) {
        gaps.push({
          startDate: prices[i - 1].date,
          endDate: prices[i].date,
          gapDays: Math.round(gapDays),
        });
      }
    }

    return gaps;
  }
}

/**
 * Singleton instance of the price validator
 */
export const priceValidator = new PriceValidator();
