/**
 * Adapter Factory
 * 
 * T015: Selects the best API adapter for each commodity based on data quality,
 * coverage, and update frequency.
 * 
 * Selection Strategy:
 * - FRED for precious metals (daily data) and major grains
 * - World Bank for other metals, industrial, and agricultural commodities
 * - Fallback to alternative adapter if primary fails
 */

import type { APIAdapter } from './base-adapter';
import { FREDAdapter } from './fred-adapter';
import { WorldBankAdapter } from './worldbank-adapter';
import { NotFoundError } from '../errors/api-error';

/**
 * Commodity-to-adapter mapping based on research findings (R1)
 * 
 * Primary source selection criteria:
 * 1. Data granularity (daily > monthly)
 * 2. Historical depth
 * 3. Update frequency
 * 4. Data quality
 */
const ADAPTER_PRIORITY_MAP: Record<string, { primary: 'fred' | 'worldbank'; fallback: 'fred' | 'worldbank' | null }> = {
  // Precious metals - FRED preferred (daily data, excellent historical depth)
  'gold': { primary: 'fred', fallback: 'worldbank' },
  'silver': { primary: 'fred', fallback: 'worldbank' },
  'platinum': { primary: 'fred', fallback: 'worldbank' },
  
  // Base metals - FRED preferred (World Bank API issues, FRED verified working)
  'aluminum': { primary: 'fred', fallback: 'worldbank' },
  'copper': { primary: 'fred', fallback: 'worldbank' },
  'iron': { primary: 'worldbank', fallback: null },
  'lead': { primary: 'fred', fallback: 'worldbank' },
  'nickel': { primary: 'fred', fallback: 'worldbank' },
  'tin': { primary: 'fred', fallback: 'worldbank' },
  'zinc': { primary: 'fred', fallback: 'worldbank' },
  
  // Energy - FRED preferred (WTI crude oil benchmark)
  'petroleum': { primary: 'fred', fallback: 'worldbank' },
  
  // Industrial - World Bank only
  'rubber': { primary: 'worldbank', fallback: null },
  'hides': { primary: 'worldbank', fallback: null },
  
  // Grains - FRED preferred (better granularity for major grains)
  'barley': { primary: 'worldbank', fallback: 'fred' },
  'corn': { primary: 'fred', fallback: 'worldbank' },
  'rice': { primary: 'worldbank', fallback: 'fred' },
  'wheat': { primary: 'fred', fallback: 'worldbank' },
  'oats': { primary: 'fred', fallback: null },
  'rye': { primary: 'fred', fallback: null },
  
  // Agricultural - World Bank preferred (comprehensive coverage)
  'cocoa': { primary: 'worldbank', fallback: null },
  'coffee': { primary: 'worldbank', fallback: null },
  'copra': { primary: 'worldbank', fallback: null },
  'cotton': { primary: 'fred', fallback: 'worldbank' },
  'peanuts': { primary: 'fred', fallback: 'worldbank' },
  'soybeans': { primary: 'fred', fallback: 'worldbank' },
  'sugar': { primary: 'worldbank', fallback: null },
  'wool': { primary: 'worldbank', fallback: null },
};

/**
 * Adapter Factory
 * 
 * Manages adapter instances and provides methods to get the best adapter
 * for a given commodity.
 */
export class AdapterFactory {
  private fredAdapter: FREDAdapter;
  private worldBankAdapter: WorldBankAdapter;

  constructor() {
    this.fredAdapter = new FREDAdapter();
    this.worldBankAdapter = new WorldBankAdapter();
  }

  /**
   * Get the primary adapter for a commodity
   * 
   * @param commodityId Commodity identifier (e.g., "gold", "wheat")
   * @returns Primary API adapter for the commodity
   * @throws NotFoundError if commodity is not supported
   */
  getPrimaryAdapter(commodityId: string): APIAdapter {
    const mapping = ADAPTER_PRIORITY_MAP[commodityId];
    
    if (!mapping) {
      throw new NotFoundError(
        `Commodity "${commodityId}" is not configured in adapter factory`,
        'adapter-factory',
        { 
          commodityId,
          supportedCommodities: Object.keys(ADAPTER_PRIORITY_MAP),
        }
      );
    }

    const adapter = mapping.primary === 'fred' ? this.fredAdapter : this.worldBankAdapter;
    
    if (!adapter.supports(commodityId)) {
      throw new NotFoundError(
        `Primary adapter "${mapping.primary}" does not support commodity "${commodityId}"`,
        'adapter-factory',
        { commodityId, primaryAdapter: mapping.primary }
      );
    }

    return adapter;
  }

  /**
   * Get the fallback adapter for a commodity
   * 
   * @param commodityId Commodity identifier (e.g., "gold", "wheat")
   * @returns Fallback API adapter, or null if no fallback is configured
   */
  getFallbackAdapter(commodityId: string): APIAdapter | null {
    const mapping = ADAPTER_PRIORITY_MAP[commodityId];
    
    if (!mapping || !mapping.fallback) {
      return null;
    }

    const adapter = mapping.fallback === 'fred' ? this.fredAdapter : this.worldBankAdapter;
    
    return adapter.supports(commodityId) ? adapter : null;
  }

  /**
   * Get all adapters that support a commodity (primary + fallback)
   * 
   * @param commodityId Commodity identifier (e.g., "gold", "wheat")
   * @returns Array of adapters, ordered by priority (primary first)
   */
  getAdapters(commodityId: string): APIAdapter[] {
    const adapters: APIAdapter[] = [];
    
    try {
      adapters.push(this.getPrimaryAdapter(commodityId));
    } catch (error) {
      // Primary adapter not available, skip
    }

    const fallback = this.getFallbackAdapter(commodityId);
    if (fallback) {
      adapters.push(fallback);
    }

    return adapters;
  }

  /**
   * Get adapter by source name
   * 
   * @param source Data source identifier ('fred' or 'worldbank')
   * @returns API adapter for the specified source
   * @throws NotFoundError if source is not recognized
   */
  getAdapterBySource(source: 'fred' | 'worldbank'): APIAdapter {
    if (source === 'fred') {
      return this.fredAdapter;
    } else if (source === 'worldbank') {
      return this.worldBankAdapter;
    }
    
    throw new NotFoundError(
      `Unknown adapter source: "${source}"`,
      'adapter-factory',
      { source, availableSources: ['fred', 'worldbank'] }
    );
  }

  /**
   * Get all supported commodities across all adapters
   * 
   * @returns Array of commodity IDs that have at least one configured adapter
   */
  getSupportedCommodities(): string[] {
    return Object.keys(ADAPTER_PRIORITY_MAP);
  }

  /**
   * Check if a commodity has API support
   * 
   * @param commodityId Commodity identifier
   * @returns True if at least one adapter supports the commodity
   */
  supports(commodityId: string): boolean {
    return commodityId in ADAPTER_PRIORITY_MAP;
  }

  /**
   * Get metadata about adapter configuration for a commodity
   * 
   * @param commodityId Commodity identifier
   * @returns Configuration metadata including primary and fallback adapters
   */
  getConfiguration(commodityId: string): {
    commodityId: string;
    primary: string | null;
    fallback: string | null;
    primaryMetadata: any;
    fallbackMetadata: any;
  } | null {
    if (!this.supports(commodityId)) {
      return null;
    }

    const mapping = ADAPTER_PRIORITY_MAP[commodityId];
    const primaryAdapter = this.getPrimaryAdapter(commodityId);
    const fallbackAdapter = this.getFallbackAdapter(commodityId);

    return {
      commodityId,
      primary: mapping.primary,
      fallback: mapping.fallback,
      primaryMetadata: primaryAdapter.getMetadata(),
      fallbackMetadata: fallbackAdapter?.getMetadata() || null,
    };
  }
}

/**
 * Singleton instance of the adapter factory
 */
export const adapterFactory = new AdapterFactory();
