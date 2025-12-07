/**
 * Greco unit calculator - Calculate Greco values and validate completeness
 */

import { CommodityPricePoint, DataQualityIndicator } from '../types/commodity'
import { GrecoValue } from '../types/greco'
import { loadBasketWeights, loadPrices, loadExchangeRate } from './loader'

/**
 * Calculate Greco unit value for a specific date and currency
 * @param date - Target date
 * @param currencyId - Target currency (e.g., "USD", "EUR", "GBP")
 * @returns GrecoValue with completeness >= 80% threshold
 */
export async function calculateGrecoValue(
  date: Date,
  currencyId: string
): Promise<GrecoValue | null> {
  const basketWeights = await loadBasketWeights()
  
  // Load prices for all commodities in basket
  const commodityPrices: Array<{
    commodityId: string
    weight: number
    price: CommodityPricePoint | null
  }> = []

  for (const weightEntry of basketWeights.weights) {
    const prices = (await loadPrices(weightEntry.commodityId)) as CommodityPricePoint[]
    
    // Find price closest to target date
    const closestPrice = findClosestPrice(prices, date)
    
    commodityPrices.push({
      commodityId: weightEntry.commodityId,
      weight: weightEntry.weight,
      price: closestPrice,
    })
  }

  // Calculate completeness
  const completeness = validateCompleteness(commodityPrices)
  
  // Require >= 80% completeness per constitutional requirement
  if (completeness < 80) {
    return null
  }

  // Calculate weighted average Greco value in USD
  let grecoValueUSD = 0
  const contributingCommodities: string[] = []

  for (const item of commodityPrices) {
    if (item.price) {
      grecoValueUSD += item.price.priceUSD * item.weight
      contributingCommodities.push(item.commodityId)
    }
  }

  // Convert to target currency if not USD
  let grecoValue = grecoValueUSD
  if (currencyId !== 'USD') {
    const exchangeRate = await loadExchangeRate(currencyId, date)
    if (!exchangeRate) {
      return null // Cannot convert without exchange rate
    }
    grecoValue = grecoValueUSD * exchangeRate
  }

  // Determine quality indicator based on data quality
  const qualityIndicator = determineQualityIndicator(commodityPrices, completeness)

  return {
    date,
    currencyId,
    value: grecoValue,
    completeness,
    qualityIndicator,
    basketVersion: basketWeights.version,
    contributingCommodities,
  }
}

/**
 * Calculate completeness percentage (0-100)
 * @param commodityPrices - Array of commodity prices with weights
 * @returns Percentage of basket with available data
 */
export function validateCompleteness(
  commodityPrices: Array<{ weight: number; price: CommodityPricePoint | null }>
): number {
  const totalWeight = commodityPrices.reduce((sum, item) => sum + item.weight, 0)
  const availableWeight = commodityPrices
    .filter((item) => item.price !== null)
    .reduce((sum, item) => sum + item.weight, 0)

  return (availableWeight / totalWeight) * 100
}

/**
 * Find price point closest to target date
 * @param prices - Array of price points
 * @param targetDate - Target date
 * @returns Closest price point or null if no data
 */
function findClosestPrice(
  prices: CommodityPricePoint[],
  targetDate: Date
): CommodityPricePoint | null {
  if (prices.length === 0) return null

  return prices.reduce((closest, current) => {
    const closestDiff = Math.abs(closest.date.getTime() - targetDate.getTime())
    const currentDiff = Math.abs(current.date.getTime() - targetDate.getTime())
    return currentDiff < closestDiff ? current : closest
  })
}

/**
 * Determine overall quality indicator based on constituent data
 * @param commodityPrices - Array of commodity prices
 * @param completeness - Completeness percentage
 * @returns Overall quality indicator
 */
function determineQualityIndicator(
  commodityPrices: Array<{ price: CommodityPricePoint | null }>,
  completeness: number
): DataQualityIndicator {
  if (completeness < 80) return DataQualityIndicator.MISSING
  if (completeness < 90) return DataQualityIndicator.LOW

  // Check quality of constituent prices
  const highQualityCount = commodityPrices.filter(
    (item) => item.price?.qualityIndicator === DataQualityIndicator.HIGH
  ).length

  const totalWithData = commodityPrices.filter((item) => item.price !== null).length

  if (totalWithData === 0) return DataQualityIndicator.MISSING

  const highQualityPercentage = (highQualityCount / totalWithData) * 100

  if (highQualityPercentage >= 80) return DataQualityIndicator.HIGH
  if (highQualityPercentage >= 50) return DataQualityIndicator.MEDIUM
  return DataQualityIndicator.LOW
}

/**
 * Calculate Greco values for a date range
 * @param startDate - Start date
 * @param endDate - End date
 * @param currencyId - Target currency
 * @param interval - 'monthly' or 'annual'
 * @returns Array of Greco values
 */
export async function calculateGrecoTimeSeries(
  startDate: Date,
  endDate: Date,
  currencyId: string,
  interval: 'monthly' | 'annual' = 'monthly'
): Promise<GrecoValue[]> {
  const values: GrecoValue[] = []
  const current = new Date(startDate)

  while (current <= endDate) {
    const grecoValue = await calculateGrecoValue(current, currencyId)
    if (grecoValue) {
      values.push(grecoValue)
    }

    // Increment by interval
    if (interval === 'monthly') {
      current.setMonth(current.getMonth() + 1)
    } else {
      current.setFullYear(current.getFullYear() + 1)
    }
  }

  return values
}
