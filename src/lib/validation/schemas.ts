/**
 * Zod validation schemas for all data types
 */

import { z } from 'zod'

// Commodity schemas
export const CommodityCategorySchema = z.enum([
  'Metals',
  'Energy_Materials',
  'Agricultural_Grains',
  'Agricultural_Products',
  'Fibers',
  'Animal_Products',
])

export const UnitTypeSchema = z.enum(['mass', 'volume', 'count'])

export const UnitOfMeasureSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  symbol: z.string().min(1).max(20),
  type: UnitTypeSchema,
  baseConversion: z
    .object({
      toMetricTon: z.number().positive(),
      formula: z.string().optional(),
    })
    .optional(),
  aliases: z.array(z.string()),
})

export const CommoditySchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(100),
  category: CommodityCategorySchema,
  unit: z.string(),
  symbol: z.string().min(1).max(20),
  description: z.string(),
  inceptionDate: z.coerce.date(),
  metadata: z.object({
    casNumber: z.string().optional(),
    alternateNames: z.array(z.string()),
    physicalProperties: z.record(z.unknown()).optional(),
  }),
})

export const DataQualityIndicatorSchema = z.enum([
  'high',
  'medium',
  'low',
  'missing',
])

export const CommodityPricePointSchema = z.object({
  commodityId: z.string(),
  date: z.coerce.date(),
  priceUSD: z.number().positive(),
  unit: z.string(),
  sourceId: z.string().optional(),
  qualityIndicator: DataQualityIndicatorSchema.optional(),
})

// Currency schemas
export const AssetTypeSchema = z.enum([
  'fiat_currency',
  'precious_metal',
  'cryptocurrency',
])

export const CurrencySchema = z.object({
  id: z.string().min(1).max(10),
  name: z.string().min(1),
  symbol: z.string().min(1).max(5),
  type: AssetTypeSchema,
  inceptionDate: z.coerce.date(),
  description: z.string(),
  metadata: z.object({
    iso4217Code: z.string().optional(),
    country: z.string().optional(),
    displayPrecision: z.number().int().min(0).max(8),
  }),
})

export const CurrencyExchangeRateSchema = z.object({
  baseCurrency: z.string().length(3),
  targetCurrency: z.string(),
  date: z.coerce.date(),
  rate: z.number().positive(),
  sourceId: z.string().optional(),
})

// Greco calculation schemas
export const BasketWeightSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  effectiveDate: z.coerce.date(),
  description: z.string(),
  weights: z.array(
    z.object({
      commodityId: z.string(),
      weight: z.number().min(0).max(1),
      rationale: z.string().optional(),
    })
  ),
})

export const GrecoValueSchema = z.object({
  date: z.coerce.date(),
  currencyId: z.string(),
  value: z.number().positive(),
  completeness: z.number().min(0).max(100),
  qualityIndicator: DataQualityIndicatorSchema,
  basketVersion: z.string(),
  contributingCommodities: z.array(z.string()),
})

export const DataSourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().url().optional(),
  description: z.string(),
  type: z.enum(['primary', 'secondary', 'estimated']),
  coveragePeriod: z.object({
    start: z.coerce.date(),
    end: z.coerce.date(),
  }),
  commodities: z.array(z.string()),
})

// Export utility type for arrays
export const CommoditiesSchema = z.array(CommoditySchema)
export const CurrenciesSchema = z.array(CurrencySchema)
export const UnitsSchema = z.array(UnitOfMeasureSchema)
export const PricePointsSchema = z.array(CommodityPricePointSchema)
export const ExchangeRatesSchema = z.array(CurrencyExchangeRateSchema)
export const DataSourcesSchema = z.array(DataSourceSchema)
