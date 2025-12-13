/**
 * API Configuration for Commodity Data Sources
 * 
 * T006: Central configuration for API base URLs and settings
 */

export const API_CONFIG = {
  fred: {
    baseUrl: 'https://api.stlouisfed.org/fred',
    get apiKey() {
      return process.env.FRED_API_KEY || '';
    },
    rateLimit: {
      maxRequestsPerMinute: 120, // FRED allows 120 requests/minute
      retryAfterMs: 1000, // Wait 1 second before retry
    },
    timeout: 10000, // 10 second timeout
  },
  worldBank: {
    baseUrl: 'https://api.worldbank.org/v2',
    apiKey: null, // World Bank API doesn't require authentication
    rateLimit: {
      maxRequestsPerMinute: 300, // Conservative limit (no official limit documented)
      retryAfterMs: 500,
    },
    timeout: 10000,
  },
  usgs: {
    baseUrl: 'https://www.usgs.gov/centers/national-minerals-information-center',
    // USGS data is accessed via bulk downloads, not REST API
    bulkDataUrl: 'https://www.usgs.gov/centers/national-minerals-information-center/historical-statistics-mineral-and-material-commodities',
  },
} as const;

/**
 * Validate that required API keys are configured
 */
export function validateApiConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!API_CONFIG.fred.apiKey) {
    errors.push('FRED_API_KEY environment variable is not set. Get your free key from https://fred.stlouisfed.org/docs/api/api_key.html');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * HTTP Headers for API requests
 */
export const DEFAULT_HEADERS = {
  'User-Agent': 'GrecoVoin/1.0 (https://github.com/jemustain/greco-coin)',
  'Accept': 'application/json',
} as const;
