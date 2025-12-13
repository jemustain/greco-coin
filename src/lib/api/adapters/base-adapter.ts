/**
 * Base API Adapter Interface
 * 
 * T011: Common interface for all commodity price data adapters
 */

import type { CommodityPrice, DataSource } from '../../types/commodity-price';

/**
 * Date range for data fetching
 */
export interface DateRange {
  startDate: string; // ISO 8601: YYYY-MM-DD
  endDate: string;   // ISO 8601: YYYY-MM-DD
}

/**
 * API rate limit information
 */
export interface RateLimitInfo {
  /** Maximum requests per minute */
  maxRequestsPerMinute: number;
  
  /** Current remaining requests (if known) */
  remainingRequests?: number;
  
  /** Time until rate limit resets (milliseconds) */
  resetAfterMs?: number;
}

/**
 * Source metadata for attribution
 */
export interface SourceMetadata {
  /** Data source identifier */
  source: DataSource;
  
  /** Human-readable source name */
  name: string;
  
  /** Source website URL */
  url: string;
  
  /** API documentation URL */
  docsUrl?: string;
  
  /** List of supported commodities */
  supportedCommodities: string[];
  
  /** Update frequency description */
  updateFrequency: string;
}

/**
 * Fetch options
 */
export interface FetchOptions {
  /** Force fetch even if rate limited (will wait) */
  force?: boolean;
  
  /** Timeout in milliseconds */
  timeoutMs?: number;
  
  /** Skip validation (for debugging) */
  skipValidation?: boolean;
}

/**
 * Fetch result with metadata
 */
export interface FetchResult {
  /** Fetched commodity prices */
  prices: CommodityPrice[];
  
  /** Number of records fetched */
  count: number;
  
  /** Data source */
  source: DataSource;
  
  /** Fetch timestamp (ISO 8601) */
  fetchedAt: string;
  
  /** Rate limit info (if available) */
  rateLimit?: RateLimitInfo;
  
  /** Any warnings or issues */
  warnings?: string[];
}

/**
 * Base interface for commodity price data adapters
 */
export interface APIAdapter {
  /**
   * Get adapter source identifier
   */
  getSource(): DataSource;
  
  /**
   * Get adapter metadata
   */
  getMetadata(): SourceMetadata;
  
  /**
   * Get current rate limit information
   */
  getRateLimit(): RateLimitInfo;
  
  /**
   * Check if adapter supports a commodity
   */
  supports(commodityId: string): boolean;
  
  /**
   * Fetch commodity prices for a date range
   * 
   * @param commodityId - Commodity identifier (e.g., "gold", "wheat")
   * @param dateRange - Date range to fetch
   * @param options - Additional fetch options
   * @returns Fetch result with prices and metadata
   * @throws APIError if fetch fails
   */
  fetchPrices(
    commodityId: string,
    dateRange: DateRange,
    options?: FetchOptions
  ): Promise<FetchResult>;
  
  /**
   * Test connection to API
   * 
   * @returns True if connection successful
   */
  testConnection(): Promise<boolean>;
}

/**
 * Base adapter class with common functionality
 */
export abstract class BaseAdapter implements APIAdapter {
  abstract getSource(): DataSource;
  abstract getMetadata(): SourceMetadata;
  abstract getRateLimit(): RateLimitInfo;
  abstract supports(commodityId: string): boolean;
  abstract fetchPrices(
    commodityId: string,
    dateRange: DateRange,
    options?: FetchOptions
  ): Promise<FetchResult>;
  
  /**
   * Default test connection implementation
   */
  async testConnection(): Promise<boolean> {
    try {
      const metadata = this.getMetadata();
      if (metadata.supportedCommodities.length === 0) {
        return false;
      }
      
      // Try to fetch 1 day of data for first supported commodity
      const testCommodity = metadata.supportedCommodities[0];
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      const result = await this.fetchPrices(
        testCommodity,
        { startDate: yesterday, endDate: today },
        { timeoutMs: 5000 }
      );
      
      return result.count >= 0; // Success even if no data (might be weekend)
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Validate date range
   */
  protected validateDateRange(dateRange: DateRange): void {
    const { startDate, endDate } = dateRange;
    
    // Validate format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }
    
    // Validate order
    if (new Date(startDate) > new Date(endDate)) {
      throw new Error('Start date must be before or equal to end date');
    }
    
    // Validate not in future
    const today = new Date().toISOString().split('T')[0];
    if (startDate > today) {
      throw new Error('Start date cannot be in the future');
    }
  }
}
