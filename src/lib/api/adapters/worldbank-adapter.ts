/**
 * World Bank Commodity Price Data (Pink Sheet) API Adapter
 * 
 * T013: World Bank API integration for commodity price data
 * 
 * World Bank publishes monthly commodity prices (Pink Sheet) covering metals,
 * energy, and agricultural commodities with historical data back to 1960.
 * 
 * API Documentation: https://datahelpdesk.worldbank.org/knowledgebase/articles/898599
 */

import axios from 'axios';
import { API_CONFIG } from '../../config/api-config';
import { worldBankResponseSchema } from '../../validation/price-schema';
import type { CommodityPrice, DataSource } from '../../types/commodity-price';
import {
  BaseAdapter,
  type DateRange,
  type FetchOptions,
  type FetchResult,
  type RateLimitInfo,
  type SourceMetadata,
} from './base-adapter';
import {
  APIError,
  RateLimitError,
  NotFoundError,
  ValidationError,
  TimeoutError,
  NetworkError,
} from '../errors/api-error';
import { withRetry, RateLimiter } from '../../utils/retry-logic';

/**
 * World Bank indicator mapping for commodities
 * Format: COMMODITY_PRICE_INDICATOR
 */
const WORLDBANK_INDICATOR_MAP: Record<string, { indicatorId: string; unit: string }> = {
  // Metals
  'aluminum': { indicatorId: 'PALUMWORLDM', unit: 'metric ton' },
  'copper': { indicatorId: 'PCOPPWORLDM', unit: 'metric ton' },
  'gold': { indicatorId: 'PGOLDWORLDM', unit: 'troy ounce' },
  'iron': { indicatorId: 'PIORECWORLDM', unit: 'dmtu' },
  'lead': { indicatorId: 'PLEADWORLDM', unit: 'metric ton' },
  'nickel': { indicatorId: 'PNICKWORLDM', unit: 'metric ton' },
  'platinum': { indicatorId: 'PPLATWORLDM', unit: 'troy ounce' },
  'silver': { indicatorId: 'PSILVWORLDM', unit: 'troy ounce' },
  'tin': { indicatorId: 'PTINWORLDM', unit: 'metric ton' },
  'zinc': { indicatorId: 'PZINCWORLDM', unit: 'metric ton' },
  
  // Energy
  'petroleum': { indicatorId: 'POILWTIUSDM', unit: 'barrel' },
  
  // Industrial
  'rubber': { indicatorId: 'PRUBBUSDM', unit: 'metric ton' },
  'hides': { indicatorId: 'PHIDESUSDM', unit: 'kg' },
  
  // Agricultural - Grains
  'barley': { indicatorId: 'PBARUSDM', unit: 'metric ton' },
  'rice': { indicatorId: 'PRICEUSDM', unit: 'metric ton' },
  'wheat': { indicatorId: 'PWHEUSDM', unit: 'metric ton' },
  
  // Agricultural - Other
  'cocoa': { indicatorId: 'PCOCOUSDM', unit: 'metric ton' },
  'coffee': { indicatorId: 'PCOFFOTMUSDM', unit: 'kg' },
  'copra': { indicatorId: 'PCOPRUSDM', unit: 'metric ton' },
  'cotton': { indicatorId: 'PCOTTUSDM', unit: 'kg' },
  'sugar': { indicatorId: 'PSUGUSDM', unit: 'kg' },
  'wool': { indicatorId: 'PWOOLCUSDM', unit: 'kg' },
};

/**
 * World Bank API Adapter
 * Implements commodity price data fetching from World Bank Pink Sheet data
 */
export class WorldBankAdapter extends BaseAdapter {
  private rateLimiter: RateLimiter;

  constructor() {
    super();
    // World Bank has no official rate limit, but we use 300 requests/min to be conservative
    this.rateLimiter = new RateLimiter(API_CONFIG.worldBank.rateLimit.maxRequestsPerMinute);
  }

  getSource(): DataSource {
    return 'worldbank';
  }

  getMetadata(): SourceMetadata {
    return {
      name: 'World Bank Commodity Price Data (Pink Sheet)',
      description: 'Monthly commodity prices from World Bank with historical data back to 1960',
      url: 'https://www.worldbank.org/en/research/commodity-markets',
      updateFrequency: 'monthly',
      historicalDepth: '1960-present',
      dataGranularity: 'monthly',
    };
  }

  getRateLimit(): RateLimitInfo {
    return {
      requestsPerMinute: API_CONFIG.worldBank.rateLimit.maxRequestsPerMinute,
      currentTokens: this.rateLimiter.getTokenCount(),
    };
  }

  supports(commodityId: string): boolean {
    return commodityId in WORLDBANK_INDICATOR_MAP;
  }

  /**
   * Fetch commodity prices from World Bank API
   * 
   * @param commodityId Commodity identifier (e.g., "gold", "wheat")
   * @param dateRange Date range to fetch (ISO 8601 format)
   * @param options Fetch options (timeout, validation settings)
   * @returns Fetch result with commodity prices
   */
  async fetchPrices(
    commodityId: string,
    dateRange: DateRange,
    options?: FetchOptions
  ): Promise<FetchResult> {
    this.validateDateRange(dateRange);

    if (!this.supports(commodityId)) {
      throw new NotFoundError(
        `Commodity "${commodityId}" is not supported by World Bank adapter`,
        { commodityId, supportedCommodities: Object.keys(WORLDBANK_INDICATOR_MAP) }
      );
    }

    const mapping = WORLDBANK_INDICATOR_MAP[commodityId];
    const startYear = dateRange.startDate.substring(0, 4);
    const endYear = dateRange.endDate.substring(0, 4);

    try {
      const prices = await withRetry(
        async () => {
          await this.rateLimiter.acquire();
          return await this.fetchIndicatorData(
            mapping.indicatorId,
            startYear,
            endYear,
            options?.timeout
          );
        },
        {
          maxAttempts: 3,
          initialDelayMs: 1000,
          maxDelayMs: 10000,
          multiplier: 2,
        }
      );

      // Transform World Bank data to CommodityPrice format
      const transformedPrices: CommodityPrice[] = prices
        .filter((dataPoint) => dataPoint.value !== null)
        .map((dataPoint) => ({
          date: this.convertWorldBankDate(dataPoint.date),
          price: dataPoint.value as number,
          unit: mapping.unit,
          quality: 'high' as const,
          source: 'worldbank' as const,
          sourceId: mapping.indicatorId,
          fetchedAt: new Date().toISOString(),
        }));

      return {
        commodityId,
        prices: transformedPrices,
        dateRange,
        source: this.getSource(),
        metadata: {
          totalRecords: transformedPrices.length,
          startDate: transformedPrices[transformedPrices.length - 1]?.date || dateRange.start,
          endDate: transformedPrices[0]?.date || dateRange.end,
          qualitySummary: {
            high: transformedPrices.length,
            interpolated_linear: 0,
            quarterly_average: 0,
            annual_average: 0,
            unavailable: 0,
          },
        },
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw this.handleAxiosError(error, mapping.indicatorId);
    }
  }

  /**
   * Fetch indicator data from World Bank API
   * 
   * @param indicatorId World Bank indicator ID
   * @param startYear Start year (YYYY format)
   * @param endYear End year (YYYY format)
   * @param timeout Request timeout in milliseconds
   * @returns Array of World Bank data points
   */
  private async fetchIndicatorData(
    indicatorId: string,
    startYear: string,
    endYear: string,
    timeout?: number
  ): Promise<Array<{ date: string; value: number | null }>> {
    const response = await axios.get(
      `${API_CONFIG.worldBank.baseUrl}/country/WLD/indicator/${indicatorId}`,
      {
        params: {
          format: 'json',
          date: `${startYear}:${endYear}`,
          per_page: 1000, // World Bank supports up to 1000 records per page
        },
        timeout: timeout || API_CONFIG.worldBank.timeout,
        headers: {
          'User-Agent': 'GrecoVoin/1.0 (https://github.com/jemustain/greco-coin)',
          'Accept': 'application/json',
        },
      }
    );

    // Validate response with zod schema
    const validatedData = worldBankResponseSchema.parse(response.data);
    const [metadata, dataPoints] = validatedData;

    return dataPoints.map((dataPoint) => ({
      date: dataPoint.date,
      value: dataPoint.value,
    }));
  }

  /**
   * Convert World Bank date format (YYYY or YYYYMM) to ISO 8601 (YYYY-MM-DD)
   * 
   * World Bank returns dates in various formats:
   * - Annual data: "2024"
   * - Monthly data: "2024M01" or "2024-01"
   * 
   * @param dateString World Bank date string
   * @returns ISO 8601 date string (YYYY-MM-DD)
   */
  private convertWorldBankDate(dateString: string): string {
    // Handle monthly format: "2024M01" or "2024-01"
    if (dateString.includes('M')) {
      const [year, month] = dateString.split('M');
      return `${year}-${month.padStart(2, '0')}-01`;
    }
    
    // Handle hyphenated monthly format: "2024-01"
    if (dateString.includes('-') && dateString.length === 7) {
      return `${dateString}-01`;
    }
    
    // Handle annual format: "2024"
    if (dateString.length === 4) {
      return `${dateString}-12-31`;
    }

    // If already in correct format or unknown format, return as-is
    return dateString;
  }

  /**
   * Handle axios errors and convert to domain-specific APIError types
   * 
   * @param error Error from axios request
   * @param indicatorId World Bank indicator ID for context
   * @returns Appropriate APIError subclass
   */
  private handleAxiosError(error: any, indicatorId: string): APIError {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errorData = error.response?.data;

      if (status === 429) {
        const retryAfter = parseInt(error.response?.headers['retry-after'] || '60', 10);
        return new RateLimitError(
          'World Bank API rate limit exceeded',
          retryAfter * 1000,
          { indicatorId, status, errorData }
        );
      }

      if (status === 404) {
        return new NotFoundError(
          `World Bank indicator "${indicatorId}" not found`,
          { indicatorId, status, errorData }
        );
      }

      if (status && status >= 400 && status < 500) {
        return new ValidationError(
          `World Bank API validation error: ${errorData?.message || error.message}`,
          { indicatorId, status, errorData }
        );
      }

      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return new TimeoutError(
          `World Bank API request timeout for indicator ${indicatorId}`,
          { indicatorId, timeout: API_CONFIG.worldBank.timeout }
        );
      }

      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        return new NetworkError(
          `Unable to reach World Bank API: ${error.message}`,
          { indicatorId, code: error.code }
        );
      }

      return new APIError(
        `World Bank API error: ${error.message}`,
        { indicatorId, status, errorData, code: error.code }
      );
    }

    return new APIError(
      `Unexpected error fetching World Bank data: ${error.message}`,
      { indicatorId, error: String(error) }
    );
  }
}
