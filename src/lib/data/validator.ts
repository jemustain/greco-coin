/**
 * Data validator - Validate price points and check data quality
 */

import { CommodityPricePoint, DataQualityIndicator } from '../types/commodity'

/**
 * Validate a single price point
 * @param pricePoint - Price point to validate
 * @returns Validation result with errors
 */
export function validatePricePoint(pricePoint: CommodityPricePoint): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check required fields
  if (!pricePoint.commodityId) {
    errors.push('Missing commodity ID')
  }

  if (!pricePoint.date) {
    errors.push('Missing date')
  }

  if (pricePoint.priceUSD <= 0) {
    errors.push('Price must be positive')
  }

  if (!pricePoint.unit) {
    errors.push('Missing unit')
  }

  // Check date range (1900-2025)
  if (pricePoint.date) {
    const year = pricePoint.date.getFullYear()
    if (year < 1900 || year > 2025) {
      errors.push(`Date out of range: ${year} (expected 1900-2025)`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Check if a date is within the valid range for a currency
 * @param currencyId - Currency ID
 * @param date - Date to check
 * @returns True if date is valid for this currency
 */
export function checkCurrencyInception(currencyId: string, date: Date): boolean {
  const inceptionDates: Record<string, Date> = {
    EUR: new Date('1999-01-01'),
    BTC: new Date('2009-01-03'),
    // Other currencies pre-date 1900
  }

  const inceptionDate = inceptionDates[currencyId]
  if (!inceptionDate) {
    return true // No restriction
  }

  return date >= inceptionDate
}

/**
 * Flag statistical outliers in price data
 * @param prices - Array of price points
 * @param threshold - Number of standard deviations to flag (default: 3)
 * @returns Array of outlier indices
 */
export function flagOutliers(
  prices: CommodityPricePoint[],
  threshold = 3
): number[] {
  if (prices.length < 10) {
    return [] // Need sufficient data for statistical analysis
  }

  const priceValues = prices.map((p) => p.priceUSD)
  const mean = priceValues.reduce((sum, p) => sum + p, 0) / priceValues.length
  const variance =
    priceValues.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / priceValues.length
  const stdDev = Math.sqrt(variance)

  const outlierIndices: number[] = []

  prices.forEach((price, index) => {
    const zScore = Math.abs((price.priceUSD - mean) / stdDev)
    if (zScore > threshold) {
      outlierIndices.push(index)
    }
  })

  return outlierIndices
}

/**
 * Assess overall data quality for a time series
 * @param prices - Array of price points
 * @returns Quality assessment
 */
export function assessDataQuality(prices: CommodityPricePoint[]): {
  indicator: DataQualityIndicator
  completeness: number
  issues: string[]
} {
  const issues: string[] = []

  if (prices.length === 0) {
    return {
      indicator: DataQualityIndicator.MISSING,
      completeness: 0,
      issues: ['No data available'],
    }
  }

  // Check for gaps
  const sortedPrices = [...prices].sort((a, b) => a.date.getTime() - b.date.getTime())
  let gaps = 0
  for (let i = 1; i < sortedPrices.length; i++) {
    const monthsDiff =
      (sortedPrices[i].date.getTime() - sortedPrices[i - 1].date.getTime()) /
      (1000 * 60 * 60 * 24 * 30)
    if (monthsDiff > 3) {
      gaps++
    }
  }

  if (gaps > 0) {
    issues.push(`${gaps} data gaps detected`)
  }

  // Check quality indicators
  const highQualityCount = prices.filter(
    (p) => p.qualityIndicator === DataQualityIndicator.HIGH
  ).length
  const highQualityPercentage = (highQualityCount / prices.length) * 100

  // Determine overall indicator
  let indicator: DataQualityIndicator
  if (highQualityPercentage >= 80) {
    indicator = DataQualityIndicator.HIGH
  } else if (highQualityPercentage >= 50) {
    indicator = DataQualityIndicator.MEDIUM
  } else {
    indicator = DataQualityIndicator.LOW
  }

  // Check outliers
  const outliers = flagOutliers(prices)
  if (outliers.length > 0) {
    issues.push(`${outliers.length} potential outliers detected`)
  }

  const completeness = 100 - (gaps / (prices.length - 1)) * 100

  return {
    indicator,
    completeness: Math.max(0, completeness),
    issues,
  }
}
