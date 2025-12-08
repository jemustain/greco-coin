/**
 * API Adapter Interface
 * 
 * Defines the contract for fetching commodity price data from external APIs.
 * Implementations: FREDAdapter, WorldBankAdapter, USGSAdapter, ManualAdapter
 */

import { CommodityPrice, QualityIndicator } from './data-model.schema';

/**
 * Base interface for all API adapters
 */
export interface APIAdapter {
  /**
   * Unique identifier for the adapter (e.g., "FRED", "WorldBank")
   */
  readonly name: string;

  /**
   * Fetch price data for a specific commodity within a date range
   * 
   * @param commodity Commodity identifier (e.g., "gold", "silver")
   * @param startDate Start date (ISO 8601: "2020-01-01")
   * @param endDate End date (ISO 8601: "2025-12-31")
   * @returns Array of commodity prices (may be empty if no data available)
   * @throws APIError if request fails
   */
  fetchPrices(
    commodity: string,
    startDate: string,
    endDate: string
  ): Promise<CommodityPrice[]>;

  /**
   * Check if this adapter supports a given commodity
   * 
   * @param commodity Commodity identifier
   * @returns True if supported, false otherwise
   */
  supports(commodity: string): boolean;

  /**
   * Get the list of all commodities supported by this adapter
   * 
   * @returns Array of commodity identifiers
   */
  getSupportedCommodities(): string[];

  /**
   * Get metadata about data availability for a commodity
   * 
   * @param commodity Commodity identifier
   * @returns Metadata or null if not supported
   */
  getAvailability(commodity: string): Promise<AvailabilityMetadata | null>;
}

/**
 * Metadata about data availability from an API source
 */
export interface AvailabilityMetadata {
  /** Commodity identifier */
  commodity: string;

  /** API source name */
  source: string;

  /** Earliest available date (ISO 8601) */
  earliestDate: string;

  /** Latest available date (ISO 8601) */
  latestDate: string;

  /** Data frequency (e.g., "daily", "monthly", "quarterly", "annual") */
  frequency: 'daily' | 'monthly' | 'quarterly' | 'annual';

  /** Estimated completeness percentage (0-100) */
  completeness: number;

  /** Source-specific identifier (e.g., FRED series ID) */
  sourceId?: string;

  /** Last time availability was checked */
  checkedAt: string; // ISO 8601 timestamp
}

/**
 * Configuration for FRED API adapter
 */
export interface FREDConfig {
  /** FRED API key (required) */
  apiKey: string;

  /** Base URL (default: https://api.stlouisfed.org/fred) */
  baseUrl?: string;

  /** Request timeout in milliseconds (default: 10000) */
  timeout?: number;

  /** Map of commodity → FRED series ID */
  seriesMap: Record<string, string>;
}

/**
 * Configuration for World Bank API adapter
 */
export interface WorldBankConfig {
  /** Base URL (default: https://api.worldbank.org/v2) */
  baseUrl?: string;

  /** Request timeout in milliseconds (default: 10000) */
  timeout?: number;

  /** Map of commodity → World Bank indicator code */
  indicatorMap: Record<string, string>;
}

/**
 * Configuration for USGS API adapter
 */
export interface USGSConfig {
  /** Base URL for USGS data files */
  baseUrl?: string;

  /** Local cache directory for bulk downloads */
  cacheDir?: string;

  /** Map of commodity → USGS commodity code */
  commodityMap: Record<string, string>;
}

/**
 * Error thrown by API adapters
 */
export class APIError extends Error {
  constructor(
    message: string,
    public readonly source: string,
    public readonly statusCode?: number,
    public readonly originalError?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Rate limit error (specific type of APIError)
 */
export class RateLimitError extends APIError {
  constructor(
    source: string,
    public readonly retryAfter?: number // seconds until retry allowed
  ) {
    super(`Rate limit exceeded for ${source}`, source, 429);
    this.name = 'RateLimitError';
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends APIError {
  constructor(source: string, message: string) {
    super(message, source, 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * Response type for batch fetch operations
 */
export interface BatchFetchResult {
  /** Successfully fetched prices */
  success: Array<{
    commodity: string;
    prices: CommodityPrice[];
  }>;

  /** Failed fetches */
  errors: Array<{
    commodity: string;
    error: APIError;
  }>;

  /** Summary statistics */
  summary: {
    total: number;
    succeeded: number;
    failed: number;
    durationMs: number;
  };
}

/**
 * Adapter for FRED (Federal Reserve Economic Data)
 */
export interface FREDAdapter extends APIAdapter {
  name: 'FRED';

  /**
   * Fetch data for multiple commodities in a single batch
   * (More efficient than individual calls)
   */
  fetchBatch(
    commodities: string[],
    startDate: string,
    endDate: string
  ): Promise<BatchFetchResult>;

  /**
   * Get the FRED series ID for a commodity
   */
  getSeriesId(commodity: string): string | null;
}

/**
 * Adapter for World Bank Commodity Price Data
 */
export interface WorldBankAdapter extends APIAdapter {
  name: 'WorldBank';

  /**
   * Fetch data for multiple commodities in a single batch
   */
  fetchBatch(
    commodities: string[],
    startDate: string,
    endDate: string
  ): Promise<BatchFetchResult>;

  /**
   * Get the World Bank indicator code for a commodity
   */
  getIndicatorCode(commodity: string): string | null;
}

/**
 * Adapter for USGS (US Geological Survey) historical data
 * Note: USGS typically provides annual data only
 */
export interface USGSAdapter extends APIAdapter {
  name: 'USGS';

  /**
   * Download and cache bulk data files locally
   * (USGS provides bulk downloads, not per-commodity APIs)
   */
  downloadBulkData(): Promise<void>;

  /**
   * Check if bulk data is cached and up-to-date
   */
  isCacheValid(): Promise<boolean>;
}

/**
 * Adapter for manually researched/entered data
 */
export interface ManualAdapter extends APIAdapter {
  name: 'Manual';

  /**
   * Import data from CSV or JSON file
   */
  importFromFile(
    commodity: string,
    filePath: string,
    format: 'csv' | 'json'
  ): Promise<CommodityPrice[]>;

  /**
   * Add a single manual price entry
   */
  addPrice(price: CommodityPrice): Promise<void>;
}

/**
 * Factory for creating appropriate adapter instances
 */
export interface AdapterFactory {
  /**
   * Create an adapter by name
   */
  createAdapter(
    name: 'FRED' | 'WorldBank' | 'USGS' | 'Manual',
    config?: FREDConfig | WorldBankConfig | USGSConfig
  ): APIAdapter;

  /**
   * Get the best adapter for a specific commodity
   * (Prioritizes FRED > World Bank > USGS > Manual)
   */
  getBestAdapter(commodity: string): APIAdapter | null;

  /**
   * Get all adapters that support a commodity
   */
  getAdaptersFor(commodity: string): APIAdapter[];
}
