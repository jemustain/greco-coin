/**
 * Greco unit calculation types
 */

import { DataQualityIndicator } from './commodity'

export interface BasketWeight {
  version: string // e.g., "1.0.0"
  effectiveDate: Date
  description: string
  weights: Array<{
    commodityId: string
    weight: number // Fraction (e.g., 1/32 = 0.03125)
    rationale?: string
  }>
}

export interface GrecoValue {
  date: Date
  currencyId: string
  value: number // Greco unit price in target currency
  completeness: number // Percentage of basket commodities with data (0-100)
  qualityIndicator: DataQualityIndicator
  basketVersion: string
  contributingCommodities: string[] // IDs of commodities included
}

export interface GrecoTimeSeriesData {
  currency: string
  data: Array<{
    date: string
    value: number
    completeness: number
    quality: DataQualityIndicator
  }>
}

export interface DataSource {
  id: string
  name: string
  url?: string
  description: string
  type: 'primary' | 'secondary' | 'estimated'
  coveragePeriod: {
    start: Date
    end: Date
  }
  commodities: string[] // Commodity IDs this source covers
}
