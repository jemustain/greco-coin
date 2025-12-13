/**
 * Commodity Price Types
 * 
 * T007: Core type definitions for commodity price data with quality indicators
 */

/**
 * Quality indicator for data points
 * Reflects the reliability and processing applied to the data
 */
export type QualityIndicator =
  | 'high'                 // Raw data from authoritative API, no processing
  | 'interpolated_linear'  // Linear interpolation used to fill 1-2 month gaps
  | 'quarterly_average'    // Quarterly value repeated for 3 months
  | 'annual_average'       // Annual value repeated for 12 months
  | 'unavailable';         // No data available for this period

/**
 * Data source identifier
 */
export type DataSource = 
  | 'fred'        // Federal Reserve Economic Data
  | 'worldbank'   // World Bank Commodity Price Data (Pink Sheet)
  | 'usgs'        // US Geological Survey Mineral Summaries
  | 'manual'      // Manually researched/entered data
  | 'imported';   // Legacy imported data

/**
 * Individual commodity price data point
 */
export interface CommodityPrice {
  /** ISO 8601 date string (YYYY-MM-DD) */
  date: string;
  
  /** Price in USD */
  price: number | null;
  
  /** Unit of measurement (e.g., "troy ounce", "metric ton", "barrel") */
  unit: string;
  
  /** Data quality indicator */
  quality: QualityIndicator;
  
  /** Source API or system that provided this data */
  source: DataSource;
  
  /** Original series ID or indicator code from source API (optional) */
  sourceId?: string;
  
  /** Timestamp when this data was fetched/created (ISO 8601) */
  fetchedAt?: string;
}

/**
 * Update priority for automated fetching
 */
export type UpdatePriority = 'high' | 'medium' | 'low';

/**
 * Commodity metadata
 */
export interface CommodityMetadata {
  /** Commodity identifier (lowercase, kebab-case) */
  id: string;
  
  /** Display name */
  name: string;
  
  /** Commodity category */
  category: 'metal' | 'energy' | 'industrial' | 'agricultural';
  
  /** Primary data source */
  primarySource: DataSource;
  
  /** FRED series ID (if applicable) */
  fredSeriesId?: string;
  
  /** World Bank indicator code (if applicable) */
  worldBankIndicator?: string;
  
  /** Update priority for automated fetching */
  updatePriority: UpdatePriority;
  
  /** Standard unit of measurement */
  unit: string;
}

/**
 * Time-partitioned data shard
 */
export interface PriceDataShard {
  /** Commodity identifier */
  commodityId: string;
  
  /** Start date of shard (ISO 8601) */
  startDate: string;
  
  /** End date of shard (ISO 8601) */
  endDate: string;
  
  /** Array of price data points */
  prices: CommodityPrice[];
  
  /** Number of records in shard */
  recordCount: number;
  
  /** Data quality summary */
  dataQualitySummary?: {
    high: number;
    interpolated: number;
    quarterly: number;
    annual: number;
    unavailable: number;
  };
  
  /** Last updated timestamp (ISO 8601) */
  lastUpdated: string;
}

/**
 * Date range index entry
 */
export interface DateRangeIndexEntry {
  /** Commodity identifier */
  commodityId: string;
  
  /** Start date (ISO 8601) */
  startDate: string;
  
  /** End date (ISO 8601) */
  endDate: string;
  
  /** Relative path to shard file */
  file: string;
  
  /** Number of records in shard */
  recordCount: number;
  
  /** File size in bytes (optional, for query planning) */
  fileSizeBytes?: number;
}

/**
 * Master date range index
 */
export interface DateRangeIndex {
  /** Index format version */
  version: string;
  
  /** Index entries by commodity */
  commodities: Record<string, DateRangeIndexEntry[]>;
  
  /** Last updated timestamp (ISO 8601) */
  lastUpdated: string;
}
