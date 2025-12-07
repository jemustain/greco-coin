/**
 * Commodity types for the Greco Historical Currency Tracker
 * 32 commodities organized by category
 */

export enum CommodityCategory {
  METALS = 'Metals',
  ENERGY_MATERIALS = 'Energy_Materials',
  AGRICULTURAL_GRAINS = 'Agricultural_Grains',
  AGRICULTURAL_PRODUCTS = 'Agricultural_Products',
  FIBERS = 'Fibers',
  ANIMAL_PRODUCTS = 'Animal_Products',
}

export enum UnitType {
  MASS = 'mass',
  VOLUME = 'volume',
  COUNT = 'count',
}

export interface UnitOfMeasure {
  id: string
  name: string
  symbol: string
  type: UnitType
  baseConversion?: {
    toMetricTon: number
    formula?: string
  }
  aliases: string[]
}

export interface Commodity {
  id: string
  name: string
  category: CommodityCategory
  unit: string // References UnitOfMeasure.id
  symbol: string
  description: string
  inceptionDate: Date
  metadata: {
    casNumber?: string
    alternateNames: string[]
    physicalProperties?: Record<string, unknown>
  }
}

export interface CommodityPricePoint {
  commodityId: string
  date: Date
  priceUSD: number // Base currency price
  unit: string
  sourceId?: string
  qualityIndicator?: DataQualityIndicator
}

export enum DataQualityIndicator {
  HIGH = 'high', // Complete data, primary source
  MEDIUM = 'medium', // Interpolated or secondary source
  LOW = 'low', // Estimated or incomplete
  MISSING = 'missing', // No data available
}
