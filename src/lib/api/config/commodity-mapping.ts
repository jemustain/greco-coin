/**
 * Commodity Mapping Configuration
 * 
 * T019: Central mapping of commodities to API sources (FRED series IDs and World Bank indicators)
 * 
 * This file provides a complete reference for all commodity mappings across different
 * data sources, including metadata like units, update priorities, and historical depth.
 */

import type { DataSource, QualityIndicator } from '../../types/commodity-price';

/**
 * Update priority tiers based on research findings (R4)
 * - P1 (daily): Precious metals, petroleum - actively traded, volatile
 * - P2 (weekly): Base metals, major grains - moderately volatile
 * - P3 (monthly): Industrial, agricultural - stable, monthly data source
 */
export type UpdatePriority = 'P1-daily' | 'P2-weekly' | 'P3-monthly' | 'P4-quarterly';

/**
 * Commodity metadata and API mapping
 */
export interface CommodityMapping {
  id: string;
  name: string;
  category: 'metals' | 'energy' | 'industrial' | 'agricultural';
  unit: string;
  primarySource: DataSource;
  fallbackSource: DataSource | null;
  
  // API-specific identifiers
  fredSeriesId?: string;
  worldBankIndicatorId?: string;
  
  // Update configuration
  updatePriority: UpdatePriority;
  staleness: {
    warningDays: number;  // Show warning after this many days
    errorDays: number;    // Show error after this many days
  };
  
  // Historical coverage
  historicalStart?: string; // ISO 8601 date (YYYY-MM-DD)
  granularity: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
}

/**
 * Complete commodity mapping configuration
 * Based on research findings from R1 (API Selection)
 */
export const COMMODITY_MAPPINGS: Record<string, CommodityMapping> = {
  // ============================================================================
  // PRECIOUS METALS (P1-daily)
  // ============================================================================
  
  'gold': {
    id: 'gold',
    name: 'Gold',
    category: 'metals',
    unit: 'troy ounce',
    primarySource: 'fred',
    fallbackSource: 'worldbank',
    fredSeriesId: 'GOLDAMGBD228NLBM',
    worldBankIndicatorId: 'PGOLDWORLDM',
    updatePriority: 'P1-daily',
    staleness: { warningDays: 3, errorDays: 7 },
    historicalStart: '1968-04-01',
    granularity: 'daily',
  },
  
  'silver': {
    id: 'silver',
    name: 'Silver',
    category: 'metals',
    unit: 'troy ounce',
    primarySource: 'fred',
    fallbackSource: 'worldbank',
    fredSeriesId: 'SILVERAMGBD228NLBM',
    worldBankIndicatorId: 'PSILVWORLDM',
    updatePriority: 'P1-daily',
    staleness: { warningDays: 3, errorDays: 7 },
    historicalStart: '1968-04-01',
    granularity: 'daily',
  },
  
  'platinum': {
    id: 'platinum',
    name: 'Platinum',
    category: 'metals',
    unit: 'troy ounce',
    primarySource: 'fred',
    fallbackSource: 'worldbank',
    fredSeriesId: 'PLATAMGBD228NLBM',
    worldBankIndicatorId: 'PPLATWORLDM',
    updatePriority: 'P1-daily',
    staleness: { warningDays: 3, errorDays: 7 },
    historicalStart: '1987-01-02',
    granularity: 'daily',
  },
  
  // ============================================================================
  // BASE METALS (P2-weekly)
  // ============================================================================
  
  'aluminum': {
    id: 'aluminum',
    name: 'Aluminum',
    category: 'metals',
    unit: 'metric ton',
    primarySource: 'worldbank',
    fallbackSource: 'fred',
    fredSeriesId: 'PALUMUSDM',
    worldBankIndicatorId: 'PALUMWORLDM',
    updatePriority: 'P2-weekly',
    staleness: { warningDays: 14, errorDays: 30 },
    historicalStart: '1960-01-01',
    granularity: 'monthly',
  },
  
  'copper': {
    id: 'copper',
    name: 'Copper',
    category: 'metals',
    unit: 'metric ton',
    primarySource: 'worldbank',
    fallbackSource: 'fred',
    fredSeriesId: 'PCOPPUSDM',
    worldBankIndicatorId: 'PCOPPWORLDM',
    updatePriority: 'P2-weekly',
    staleness: { warningDays: 14, errorDays: 30 },
    historicalStart: '1960-01-01',
    granularity: 'monthly',
  },
  
  'iron': {
    id: 'iron',
    name: 'Iron Ore',
    category: 'metals',
    unit: 'dmtu',
    primarySource: 'worldbank',
    fallbackSource: null,
    worldBankIndicatorId: 'PIORECWORLDM',
    updatePriority: 'P2-weekly',
    staleness: { warningDays: 14, errorDays: 30 },
    historicalStart: '1960-01-01',
    granularity: 'monthly',
  },
  
  'lead': {
    id: 'lead',
    name: 'Lead',
    category: 'metals',
    unit: 'metric ton',
    primarySource: 'worldbank',
    fallbackSource: 'fred',
    fredSeriesId: 'PLEADUSDM',
    worldBankIndicatorId: 'PLEADWORLDM',
    updatePriority: 'P2-weekly',
    staleness: { warningDays: 14, errorDays: 30 },
    historicalStart: '1960-01-01',
    granularity: 'monthly',
  },
  
  'nickel': {
    id: 'nickel',
    name: 'Nickel',
    category: 'metals',
    unit: 'metric ton',
    primarySource: 'worldbank',
    fallbackSource: 'fred',
    fredSeriesId: 'PNICKUSDM',
    worldBankIndicatorId: 'PNICKWORLDM',
    updatePriority: 'P2-weekly',
    staleness: { warningDays: 14, errorDays: 30 },
    historicalStart: '1960-01-01',
    granularity: 'monthly',
  },
  
  'tin': {
    id: 'tin',
    name: 'Tin',
    category: 'metals',
    unit: 'metric ton',
    primarySource: 'worldbank',
    fallbackSource: 'fred',
    fredSeriesId: 'PTINUSDM',
    worldBankIndicatorId: 'PTINWORLDM',
    updatePriority: 'P2-weekly',
    staleness: { warningDays: 14, errorDays: 30 },
    historicalStart: '1960-01-01',
    granularity: 'monthly',
  },
  
  'zinc': {
    id: 'zinc',
    name: 'Zinc',
    category: 'metals',
    unit: 'metric ton',
    primarySource: 'worldbank',
    fallbackSource: 'fred',
    fredSeriesId: 'PZINCUSDM',
    worldBankIndicatorId: 'PZINCWORLDM',
    updatePriority: 'P2-weekly',
    staleness: { warningDays: 14, errorDays: 30 },
    historicalStart: '1960-01-01',
    granularity: 'monthly',
  },
  
  // ============================================================================
  // ENERGY (P1-daily)
  // ============================================================================
  
  'petroleum': {
    id: 'petroleum',
    name: 'Crude Oil (WTI)',
    category: 'energy',
    unit: 'barrel',
    primarySource: 'fred',
    fallbackSource: 'worldbank',
    fredSeriesId: 'MCOILWTICO',
    worldBankIndicatorId: 'POILWTIUSDM',
    updatePriority: 'P1-daily',
    staleness: { warningDays: 3, errorDays: 7 },
    historicalStart: '1986-01-02',
    granularity: 'daily',
  },
  
  // ============================================================================
  // INDUSTRIAL (P3-monthly)
  // ============================================================================
  
  'rubber': {
    id: 'rubber',
    name: 'Rubber',
    category: 'industrial',
    unit: 'metric ton',
    primarySource: 'worldbank',
    fallbackSource: null,
    worldBankIndicatorId: 'PRUBBUSDM',
    updatePriority: 'P3-monthly',
    staleness: { warningDays: 45, errorDays: 90 },
    historicalStart: '1960-01-01',
    granularity: 'monthly',
  },
  
  'hides': {
    id: 'hides',
    name: 'Hides',
    category: 'industrial',
    unit: 'kg',
    primarySource: 'worldbank',
    fallbackSource: null,
    worldBankIndicatorId: 'PHIDESUSDM',
    updatePriority: 'P3-monthly',
    staleness: { warningDays: 45, errorDays: 90 },
    historicalStart: '1960-01-01',
    granularity: 'monthly',
  },
  
  // ============================================================================
  // AGRICULTURAL - GRAINS (P2-weekly for major, P3-monthly for minor)
  // ============================================================================
  
  'barley': {
    id: 'barley',
    name: 'Barley',
    category: 'agricultural',
    unit: 'metric ton',
    primarySource: 'worldbank',
    fallbackSource: 'fred',
    fredSeriesId: 'PBARLUSDM',
    worldBankIndicatorId: 'PBARUSDM',
    updatePriority: 'P3-monthly',
    staleness: { warningDays: 45, errorDays: 90 },
    historicalStart: '1960-01-01',
    granularity: 'monthly',
  },
  
  'corn': {
    id: 'corn',
    name: 'Corn (Maize)',
    category: 'agricultural',
    unit: 'metric ton',
    primarySource: 'fred',
    fallbackSource: 'worldbank',
    fredSeriesId: 'PMAIZUSDM',
    worldBankIndicatorId: 'PMAIZUSDM',
    updatePriority: 'P2-weekly',
    staleness: { warningDays: 14, errorDays: 30 },
    historicalStart: '1960-01-01',
    granularity: 'monthly',
  },
  
  'rice': {
    id: 'rice',
    name: 'Rice',
    category: 'agricultural',
    unit: 'metric ton',
    primarySource: 'worldbank',
    fallbackSource: 'fred',
    fredSeriesId: 'PRICEUSDM',
    worldBankIndicatorId: 'PRICEUSDM',
    updatePriority: 'P2-weekly',
    staleness: { warningDays: 14, errorDays: 30 },
    historicalStart: '1960-01-01',
    granularity: 'monthly',
  },
  
  'wheat': {
    id: 'wheat',
    name: 'Wheat',
    category: 'agricultural',
    unit: 'metric ton',
    primarySource: 'fred',
    fallbackSource: 'worldbank',
    fredSeriesId: 'PWHEAMTUSDM',
    worldBankIndicatorId: 'PWHEUSDM',
    updatePriority: 'P2-weekly',
    staleness: { warningDays: 14, errorDays: 30 },
    historicalStart: '1960-01-01',
    granularity: 'monthly',
  },
  
  'oats': {
    id: 'oats',
    name: 'Oats',
    category: 'agricultural',
    unit: 'bushel',
    primarySource: 'fred',
    fallbackSource: null,
    fredSeriesId: 'POATSUSDM',
    updatePriority: 'P3-monthly',
    staleness: { warningDays: 45, errorDays: 90 },
    historicalStart: '1960-01-01',
    granularity: 'monthly',
  },
  
  'rye': {
    id: 'rye',
    name: 'Rye',
    category: 'agricultural',
    unit: 'bushel',
    primarySource: 'fred',
    fallbackSource: null,
    fredSeriesId: 'PRYEUSDM',
    updatePriority: 'P3-monthly',
    staleness: { warningDays: 45, errorDays: 90 },
    historicalStart: '1960-01-01',
    granularity: 'monthly',
  },
  
  // ============================================================================
  // AGRICULTURAL - OTHER (P3-monthly)
  // ============================================================================
  
  'cocoa': {
    id: 'cocoa',
    name: 'Cocoa',
    category: 'agricultural',
    unit: 'metric ton',
    primarySource: 'worldbank',
    fallbackSource: null,
    worldBankIndicatorId: 'PCOCOUSDM',
    updatePriority: 'P3-monthly',
    staleness: { warningDays: 45, errorDays: 90 },
    historicalStart: '1960-01-01',
    granularity: 'monthly',
  },
  
  'coffee': {
    id: 'coffee',
    name: 'Coffee',
    category: 'agricultural',
    unit: 'kg',
    primarySource: 'worldbank',
    fallbackSource: null,
    worldBankIndicatorId: 'PCOFFOTMUSDM',
    updatePriority: 'P3-monthly',
    staleness: { warningDays: 45, errorDays: 90 },
    historicalStart: '1960-01-01',
    granularity: 'monthly',
  },
  
  'copra': {
    id: 'copra',
    name: 'Copra (Coconut)',
    category: 'agricultural',
    unit: 'metric ton',
    primarySource: 'worldbank',
    fallbackSource: null,
    worldBankIndicatorId: 'PCOPRUSDM',
    updatePriority: 'P3-monthly',
    staleness: { warningDays: 45, errorDays: 90 },
    historicalStart: '1960-01-01',
    granularity: 'monthly',
  },
  
  'cotton': {
    id: 'cotton',
    name: 'Cotton',
    category: 'agricultural',
    unit: 'kg',
    primarySource: 'fred',
    fallbackSource: 'worldbank',
    fredSeriesId: 'PCOTTUSDM',
    worldBankIndicatorId: 'PCOTTUSDM',
    updatePriority: 'P3-monthly',
    staleness: { warningDays: 45, errorDays: 90 },
    historicalStart: '1960-01-01',
    granularity: 'monthly',
  },
  
  'peanuts': {
    id: 'peanuts',
    name: 'Peanuts (Groundnuts)',
    category: 'agricultural',
    unit: 'metric ton',
    primarySource: 'fred',
    fallbackSource: 'worldbank',
    fredSeriesId: 'PPNTSOTMUSDM',
    worldBankIndicatorId: 'PPNTSOTMUSDM',
    updatePriority: 'P3-monthly',
    staleness: { warningDays: 45, errorDays: 90 },
    historicalStart: '1960-01-01',
    granularity: 'monthly',
  },
  
  'soybeans': {
    id: 'soybeans',
    name: 'Soybeans',
    category: 'agricultural',
    unit: 'metric ton',
    primarySource: 'fred',
    fallbackSource: 'worldbank',
    fredSeriesId: 'PSOYBUSDM',
    worldBankIndicatorId: 'PSOYBUSDM',
    updatePriority: 'P2-weekly',
    staleness: { warningDays: 14, errorDays: 30 },
    historicalStart: '1960-01-01',
    granularity: 'monthly',
  },
  
  'sugar': {
    id: 'sugar',
    name: 'Sugar',
    category: 'agricultural',
    unit: 'kg',
    primarySource: 'worldbank',
    fallbackSource: null,
    worldBankIndicatorId: 'PSUGUSDM',
    updatePriority: 'P3-monthly',
    staleness: { warningDays: 45, errorDays: 90 },
    historicalStart: '1960-01-01',
    granularity: 'monthly',
  },
  
  'wool': {
    id: 'wool',
    name: 'Wool',
    category: 'agricultural',
    unit: 'kg',
    primarySource: 'worldbank',
    fallbackSource: null,
    worldBankIndicatorId: 'PWOOLCUSDM',
    updatePriority: 'P3-monthly',
    staleness: { warningDays: 45, errorDays: 90 },
    historicalStart: '1960-01-01',
    granularity: 'monthly',
  },
};

/**
 * Get all commodity IDs that have API support
 */
export function getSupportedCommodities(): string[] {
  return Object.keys(COMMODITY_MAPPINGS);
}

/**
 * Get commodity mapping by ID
 */
export function getCommodityMapping(commodityId: string): CommodityMapping | undefined {
  return COMMODITY_MAPPINGS[commodityId];
}

/**
 * Get commodities by category
 */
export function getCommoditiesByCategory(category: CommodityMapping['category']): CommodityMapping[] {
  return Object.values(COMMODITY_MAPPINGS).filter((mapping) => mapping.category === category);
}

/**
 * Get commodities by update priority
 */
export function getCommoditiesByPriority(priority: UpdatePriority): CommodityMapping[] {
  return Object.values(COMMODITY_MAPPINGS).filter((mapping) => mapping.updatePriority === priority);
}

/**
 * Get commodities by primary data source
 */
export function getCommoditiesBySource(source: DataSource): CommodityMapping[] {
  return Object.values(COMMODITY_MAPPINGS).filter((mapping) => mapping.primarySource === source);
}

/**
 * Check if a commodity is supported
 */
export function isCommoditySupported(commodityId: string): boolean {
  return commodityId in COMMODITY_MAPPINGS;
}
