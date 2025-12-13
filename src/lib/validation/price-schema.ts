/**
 * Zod Schemas for API Response Validation
 * 
 * T008: Schema validation for commodity price data from external APIs
 */

import { z } from 'zod';

/**
 * Quality indicator schema
 */
export const qualityIndicatorSchema = z.enum([
  'high',
  'interpolated_linear',
  'quarterly_average',
  'annual_average',
  'unavailable',
]);

/**
 * Data source schema
 */
export const dataSourceSchema = z.enum([
  'fred',
  'worldbank',
  'usgs',
  'manual',
  'imported',
]);

/**
 * Commodity price schema
 */
export const commodityPriceSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  price: z.number().nullable(),
  unit: z.string().min(1),
  quality: qualityIndicatorSchema,
  source: dataSourceSchema,
  sourceId: z.string().optional(),
  fetchedAt: z.string().optional(),
});

/**
 * FRED API series observation schema
 * https://fred.stlouisfed.org/docs/api/fred/series_observations.html
 */
export const fredObservationSchema = z.object({
  realtime_start: z.string(),
  realtime_end: z.string(),
  date: z.string(),
  value: z.string(), // FRED returns numeric values as strings
});

export const fredResponseSchema = z.object({
  realtime_start: z.string(),
  realtime_end: z.string(),
  observation_start: z.string(),
  observation_end: z.string(),
  units: z.string(),
  output_type: z.number(),
  file_type: z.string(),
  order_by: z.string(),
  sort_order: z.string(),
  count: z.number(),
  offset: z.number(),
  limit: z.number(),
  observations: z.array(fredObservationSchema),
});

/**
 * World Bank API response schema
 * https://datahelpdesk.worldbank.org/knowledgebase/articles/898599
 */
export const worldBankDataPointSchema = z.object({
  indicator: z.object({
    id: z.string(),
    value: z.string(),
  }),
  country: z.object({
    id: z.string(),
    value: z.string(),
  }),
  countryiso3code: z.string(),
  date: z.string(),
  value: z.number().nullable(),
  unit: z.string().optional(),
  obs_status: z.string().optional(),
  decimal: z.number().optional(),
});

export const worldBankResponseSchema = z.tuple([
  z.object({
    page: z.number(),
    pages: z.number(),
    per_page: z.number(),
    total: z.number(),
    sourceid: z.string().optional(),
    lastupdated: z.string().optional(),
  }),
  z.array(worldBankDataPointSchema),
]);

/**
 * Price data shard schema
 */
export const priceDataShardSchema = z.object({
  commodityId: z.string(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  prices: z.array(commodityPriceSchema),
  recordCount: z.number().int().nonnegative(),
  dataQualitySummary: z.object({
    high: z.number().int().nonnegative(),
    interpolated: z.number().int().nonnegative(),
    quarterly: z.number().int().nonnegative(),
    annual: z.number().int().nonnegative(),
    unavailable: z.number().int().nonnegative(),
  }).optional(),
  lastUpdated: z.string(),
});

/**
 * Date range index entry schema
 */
export const dateRangeIndexEntrySchema = z.object({
  commodityId: z.string(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  file: z.string(),
  recordCount: z.number().int().nonnegative(),
  fileSizeBytes: z.number().int().nonnegative().optional(),
});

/**
 * Date range index schema
 */
export const dateRangeIndexSchema = z.object({
  version: z.string(),
  commodities: z.record(z.array(dateRangeIndexEntrySchema)),
  lastUpdated: z.string(),
});

/**
 * Type exports (inferred from schemas)
 */
export type FredObservation = z.infer<typeof fredObservationSchema>;
export type FredResponse = z.infer<typeof fredResponseSchema>;
export type WorldBankDataPoint = z.infer<typeof worldBankDataPointSchema>;
export type WorldBankResponse = z.infer<typeof worldBankResponseSchema>;
export type PriceDataShard = z.infer<typeof priceDataShardSchema>;
export type DateRangeIndexEntry = z.infer<typeof dateRangeIndexEntrySchema>;
export type DateRangeIndex = z.infer<typeof dateRangeIndexSchema>;
