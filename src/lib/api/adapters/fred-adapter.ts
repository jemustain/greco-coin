/**
 * FRED (Federal Reserve Economic Data) API Adapter
 * 
 * T012: Integration with FRED API for commodity price data
 * API Documentation: https://fred.stlouisfed.org/docs/api/fred/
 */

import { API_CONFIG } from '../../config/api-config';
import { fredResponseSchema } from '../../validation/price-schema';
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
  AuthenticationError,
  RateLimitError,
  NotFoundError,
  ValidationError,
  TimeoutError,
  NetworkError,
} from '../errors/api-error';
import { withRetry, RateLimiter } from '../../utils/retry-logic';

/**
 * FRED series ID mapping for commodities
 * Series IDs verified 2025-12-12 using FRED API search
 * Format: Monthly global prices in USD (suffix: USDM)
 */
const FRED_SERIES_MAP: Record<string, { seriesId: string; unit: string }> = {
  // Note: Gold, Silver, Platinum don't have direct FRED global price series
  // Using import/export price indices instead, or rely on World Bank
  'gold': { seriesId: 'IQ12260', unit: 'index' }, // Export Price Index: Nonmonetary Gold
  'silver': { seriesId: 'IP7106', unit: 'index' }, // Import Price Index: Silver
  'platinum': { seriesId: 'IP7110', unit: 'index' }, // Import Price Index: Platinum
  
  // Base metals - verified working series
  'copper': { seriesId: 'PCOPPUSDM', unit: 'USD/metric ton' },
  'aluminum': { seriesId: 'PALUMUSDM', unit: 'USD/metric ton' },
  'nickel': { seriesId: 'PNICKUSDM', unit: 'USD/metric ton' },
  'lead': { seriesId: 'PLEADUSDM', unit: 'USD/metric ton' },
  'tin': { seriesId: 'PTINUSDM', unit: 'USD/metric ton' },
  'zinc': { seriesId: 'PZINCUSDM', unit: 'USD/metric ton' },
  
  // Energy - verified working
  'petroleum': { seriesId: 'MCOILWTICO', unit: 'USD/barrel' },
  
  // Agricultural - verified working series
  'wheat': { seriesId: 'PWHEAMTUSDM', unit: 'USD/metric ton' },
  'corn': { seriesId: 'PMAIZMTUSDM', unit: 'USD/metric ton' }, // Fixed: PMAIZMTUSDM not PMAIZUSDM
  'rice': { seriesId: 'PRICEUSDM', unit: 'USD/metric ton' },
  'barley': { seriesId: 'PBARLUSDM', unit: 'USD/metric ton' },
  'soybeans': { seriesId: 'PSOYBUSDM', unit: 'USD/metric ton' },
  'cotton': { seriesId: 'PCOTTUSDM', unit: 'USD/kg' },
  'peanuts': { seriesId: 'PPNTSOTMUSDM', unit: 'USD/metric ton' },
};

/**
 * FRED API Adapter
 */
export class FREDAdapter extends BaseAdapter {
  private rateLimiter: RateLimiter;
  
  constructor() {
    super();
    // FRED allows 120 requests/minute
    this.rateLimiter = new RateLimiter(API_CONFIG.fred.rateLimit.maxRequestsPerMinute);
  }
  
  getSource(): DataSource {
    return 'fred';
  }
  
  getMetadata(): SourceMetadata {
    return {
      source: 'fred',
      name: 'Federal Reserve Economic Data (FRED)',
      url: 'https://fred.stlouisfed.org/',
      docsUrl: 'https://fred.stlouisfed.org/docs/api/fred/',
      supportedCommodities: Object.keys(FRED_SERIES_MAP),
      updateFrequency: 'Daily for most series',
    };
  }
  
  getRateLimit(): RateLimitInfo {
    return {
      maxRequestsPerMinute: API_CONFIG.fred.rateLimit.maxRequestsPerMinute,
      remainingRequests: this.rateLimiter.getTokenCount(),
    };
  }
  
  supports(commodityId: string): boolean {
    return commodityId in FRED_SERIES_MAP;
  }
  
  async fetchPrices(
    commodityId: string,
    dateRange: DateRange,
    options: FetchOptions = {}
  ): Promise<FetchResult> {
    // Validate inputs
    this.validateDateRange(dateRange);
    
    if (!this.supports(commodityId)) {
      throw new NotFoundError(
        `FRED does not support commodity: ${commodityId}`,
        'fred',
        { supportedCommodities: Object.keys(FRED_SERIES_MAP) }
      );
    }
    
    const { seriesId, unit } = FRED_SERIES_MAP[commodityId];
    
    // Fetch with retry logic
    const result = await withRetry(
      () => this.fetchSeriesData(seriesId, unit, dateRange, options),
      {
        maxRetries: 3,
        onRetry: (attempt, error, delayMs) => {
          console.log(
            `[FRED] Retry attempt ${attempt} for ${commodityId} after ${delayMs}ms: ${error.message}`
          );
        },
      }
    );
    
    return result;
  }
  
  /**
   * Fetch data from FRED series observations endpoint
   */
  private async fetchSeriesData(
    seriesId: string,
    unit: string,
    dateRange: DateRange,
    options: FetchOptions
  ): Promise<FetchResult> {
    const { apiKey, baseUrl, timeout } = API_CONFIG.fred;
    
    if (!apiKey) {
      throw new AuthenticationError(
        'FRED_API_KEY not configured. Get your free key from https://fred.stlouisfed.org/docs/api/api_key.html',
        'fred'
      );
    }
    
    // Wait for rate limit token
    if (!options.force) {
      await this.rateLimiter.acquire();
    }
    
    const params = new URLSearchParams({
      series_id: seriesId,
      api_key: apiKey,
      file_type: 'json',
      observation_start: dateRange.startDate,
      observation_end: dateRange.endDate,
      sort_order: 'asc',
    });
    const url = `${baseUrl}/series/observations?${params}`;
    const requestTimeout = options.timeoutMs || timeout;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), requestTimeout);

    let response: Response;
    try {
      response = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'GrecoVoin/1.0' },
        next: { revalidate: 3600 },
      } as RequestInit);
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new TimeoutError(
          `FRED API request timed out for series ${seriesId}`,
          requestTimeout,
          'fred'
        );
      }
      if (error.cause?.code === 'ENOTFOUND' || error.cause?.code === 'ECONNREFUSED') {
        throw new NetworkError(
          `Cannot connect to FRED API: ${error.message}`,
          'fred'
        );
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      this.handleFetchError(response, await response.json().catch(() => null), seriesId);
    }

    const data = await response.json();

    // Validate response schema
    if (!options.skipValidation) {
      const validatedData = fredResponseSchema.parse(data);
      
      // Transform to CommodityPrice format
      const prices: CommodityPrice[] = validatedData.observations
        .filter(obs => obs.value !== '.' && obs.value !== '') // Filter missing values
        .map(obs => ({
          date: obs.date,
          price: parseFloat(obs.value),
          unit,
          quality: 'high' as const,
          source: 'fred' as const,
          sourceId: seriesId,
          fetchedAt: new Date().toISOString(),
        }));
      
      return {
        prices,
        count: prices.length,
        source: 'fred',
        fetchedAt: new Date().toISOString(),
        rateLimit: this.getRateLimit(),
      };
    } else {
      // Skip validation (for debugging)
      return {
        prices: [],
        count: 0,
        source: 'fred',
        fetchedAt: new Date().toISOString(),
        warnings: ['Validation skipped'],
      };
    }
  }
  
  /**
   * Handle fetch HTTP errors and convert to domain errors
   */
  private handleFetchError(response: Response, data: any, seriesId: string): never {
    const status = response.status;
    
    switch (status) {
      case 400:
        throw new ValidationError(
          `Invalid request to FRED API: ${data?.error_message || response.statusText}`,
          'fred',
          data
        );
      
      case 401:
        throw new AuthenticationError(
          'Invalid FRED API key. Check your FRED_API_KEY environment variable',
          'fred',
          data
        );
      
      case 404:
        throw new NotFoundError(
          `FRED series not found: ${seriesId}`,
          'fred',
          data
        );
      
      case 429: {
        const retryAfter = response.headers.get('retry-after');
        const retryAfterMs = retryAfter ? parseInt(retryAfter) * 1000 : 60000;
        throw new RateLimitError(
          'FRED API rate limit exceeded',
          retryAfterMs,
          'fred',
          data
        );
      }
      
      case 503:
        throw new APIError(
          'FRED API temporarily unavailable',
          503,
          'fred',
          data
        );
      
      default:
        throw new APIError(
          `FRED API error: ${data?.error_message || response.statusText}`,
          status,
          'fred',
          data
        );
    }
  }
}
