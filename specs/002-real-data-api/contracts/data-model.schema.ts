/**
 * Data Model Schema
 * 
 * TypeScript definitions for all core data entities.
 * These schemas should be validated using Zod at runtime.
 */

/**
 * Quality indicator for commodity price data
 */
export type QualityIndicator =
  | 'high'                 // Raw data from API, no processing
  | 'interpolated_linear'  // Linear interpolation (1-2 month gap)
  | 'quarterly_average'    // Quarterly value repeated for 3 months
  | 'annual_average'       // Annual value repeated for 12 months
  | 'unavailable';         // No data available, price is null

/**
 * Single commodity price data point
 */
export interface CommodityPrice {
  /** ISO 8601 date: "1975-02-01" */
  date: string;

  /** Price in USD, null if unavailable */
  price: number | null;

  /** Unit of measurement (e.g., "troy ounce", "metric ton") */
  unit: string;

  /** Data quality indicator */
  quality: QualityIndicator;

  /** Source of the data (e.g., "FRED", "World Bank", "USGS", "Manual") */
  source?: string;

  /** Original source identifier (e.g., FRED series ID) */
  sourceId?: string;

  /** When this record was fetched/updated */
  updatedAt?: string; // ISO 8601 timestamp
}

/**
 * Commodity metadata (extends existing commodities.json)
 */
export interface CommodityMetadata {
  /** Commodity identifier (e.g., "gold", "silver") */
  id: string;

  /** Display name (e.g., "Gold") */
  name: string;

  /** Category (e.g., "Precious Metals", "Agricultural") */
  category: string;

  /** Unit of measurement (e.g., "troy ounce") */
  unit: string;

  /** Description */
  description: string;

  /** Date commodity trading/tracking began */
  inceptionDate: string; // ISO 8601

  /** Primary data source */
  primarySource?: 'FRED' | 'WorldBank' | 'USGS' | 'Manual';

  /** FRED series ID (if applicable) */
  fredSeriesId?: string;

  /** World Bank indicator code (if applicable) */
  worldBankCode?: string;

  /** Update priority (determines fetch frequency) */
  updatePriority?: 'high' | 'medium' | 'low';

  /** Staleness thresholds */
  stalenessThresholds?: {
    warningDays: number;
    criticalDays: number;
  };
}

/**
 * Time-bounded collection of prices for a single commodity
 */
export interface PriceDataShard {
  /** Commodity identifier */
  commodity: string;

  /** Period identifier (e.g., "1900-1949", "2020-2025") */
  period: string;

  /** Start date of period (inclusive) */
  startDate: string; // ISO 8601

  /** End date of period (inclusive) */
  endDate: string; // ISO 8601

  /** Array of price records */
  data: CommodityPrice[];

  /** Shard metadata */
  metadata: {
    recordCount: number;
    lastUpdated: string; // ISO 8601 timestamp
    dataQualitySummary: {
      high: number;
      interpolated: number;
      quarterly: number;
      annual: number;
      unavailable: number;
    };
  };
}

/**
 * Index entry for a single shard
 */
export interface CommodityShardMap {
  /** Start date of shard (inclusive) */
  start: string; // ISO 8601

  /** End date of shard (inclusive) */
  end: string; // ISO 8601

  /** Relative file path from data root */
  file: string;

  /** Number of records in shard */
  records: number;

  /** File size in bytes (for optimization) */
  bytes?: number;
}

/**
 * Master index mapping date ranges to shard files
 */
export interface DateRangeIndex {
  /** Index version for cache invalidation */
  version: string;

  /** Last time index was regenerated */
  lastUpdated: string; // ISO 8601 timestamp

  /** Map of commodity → shard metadata */
  commodities: Record<string, CommodityShardMap[]>;
}

/**
 * Single item in staleness report
 */
export interface StalenessItem {
  /** Commodity identifier */
  commodity: string;

  /** Most recent data point date */
  latestDate: string; // ISO 8601

  /** Days since last update */
  daysStale: number;

  /** Expected update frequency */
  expectedFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly';

  /** Threshold that triggered this status */
  threshold?: {
    warningDays: number;
    criticalDays: number;
  };
}

/**
 * Real-time report of data freshness
 */
export interface StalenessReport {
  /** When report was generated */
  generatedAt: string; // ISO 8601 timestamp

  /** Commodities with fresh data */
  fresh: StalenessItem[];

  /** Commodities approaching staleness threshold */
  warning: StalenessItem[];

  /** Commodities exceeding staleness threshold */
  critical: StalenessItem[];
}

/**
 * Standardized API response format
 */
export interface APIResponse<T> {
  /** Request success status */
  success: boolean;

  /** Response data (if success) */
  data?: T;

  /** Error details (if failure) */
  error?: {
    code: string;
    message: string;
    details?: any;
  };

  /** Response metadata */
  meta?: {
    /** Request timestamp */
    timestamp: string; // ISO 8601

    /** Response time in milliseconds */
    responseTime?: number;

    /** Cache status */
    cached?: boolean;

    /** Data freshness */
    dataTimestamp?: string;
  };
}
