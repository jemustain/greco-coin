/**
 * Normalization utilities - Normalize time-series data relative to a baseline year
 */

import { TimeSeriesDataPoint } from './chart'

/**
 * Normalize time-series data so the value at the baseline year = 1.0
 * All other values are expressed as ratios relative to the baseline.
 * 
 * @param data - Array of time-series data points
 * @param baselineYear - Year to use as baseline (value = 1.0)
 * @returns New array with normalized values
 */
export function normalizeToBaseline(
  data: TimeSeriesDataPoint[],
  baselineYear: number
): TimeSeriesDataPoint[] {
  if (data.length === 0) return []

  // Find the baseline value: average of all data points in the baseline year
  const baselinePoints = data.filter(
    (d) => d.dateObj.getFullYear() === baselineYear
  )

  if (baselinePoints.length === 0) {
    // If no exact match, find the closest year
    const years = [...new Set(data.map((d) => d.dateObj.getFullYear()))]
    const closestYear = years.reduce((prev, curr) =>
      Math.abs(curr - baselineYear) < Math.abs(prev - baselineYear) ? curr : prev
    )
    const closestPoints = data.filter(
      (d) => d.dateObj.getFullYear() === closestYear
    )
    const baselineValue =
      closestPoints.reduce((sum, d) => sum + d.value, 0) / closestPoints.length

    return data.map((d) => ({
      ...d,
      value: d.value / baselineValue,
    }))
  }

  const baselineValue =
    baselinePoints.reduce((sum, d) => sum + d.value, 0) / baselinePoints.length

  if (baselineValue === 0) return data

  return data.map((d) => ({
    ...d,
    value: d.value / baselineValue,
  }))
}

/**
 * Normalize raw price arrays (for commodity data) relative to a baseline year
 * 
 * @param prices - Array of { date: string, price: number, ... }
 * @param baselineYear - Year to use as baseline (value = 1.0)
 * @returns New array with normalized prices
 */
export function normalizePricesToBaseline<T extends { date: string; price: number }>(
  prices: T[],
  baselineYear: number
): (T & { normalizedPrice: number })[] {
  if (prices.length === 0) return []

  // Find baseline average
  const baselinePoints = prices.filter(
    (p) => new Date(p.date).getFullYear() === baselineYear
  )

  let baselineValue: number

  if (baselinePoints.length === 0) {
    // Closest year fallback
    const years = [...new Set(prices.map((p) => new Date(p.date).getFullYear()))]
    const closestYear = years.reduce((prev, curr) =>
      Math.abs(curr - baselineYear) < Math.abs(prev - baselineYear) ? curr : prev
    )
    const closestPoints = prices.filter(
      (p) => new Date(p.date).getFullYear() === closestYear
    )
    baselineValue =
      closestPoints.reduce((sum, p) => sum + p.price, 0) / closestPoints.length
  } else {
    baselineValue =
      baselinePoints.reduce((sum, p) => sum + p.price, 0) / baselinePoints.length
  }

  if (baselineValue === 0) {
    return prices.map((p) => ({ ...p, normalizedPrice: 0 }))
  }

  return prices.map((p) => ({
    ...p,
    normalizedPrice: p.price / baselineValue,
  }))
}

/**
 * Get available years from time-series data
 */
export function getAvailableYears(data: TimeSeriesDataPoint[]): number[] {
  const years = [...new Set(data.map((d) => d.dateObj.getFullYear()))]
  return years.sort((a, b) => a - b)
}

/**
 * Smart downsampling based on date range span.
 * - ≤ 2 years: all monthly points
 * - 2–10 years: quarterly (every 3 months)
 * - 10–30 years: semi-annual (every 6 months)
 * - 30+ years: annual (one per year)
 */
export function downsampleTimeSeries<T extends { date: string }>(
  data: T[],
  startDate: Date,
  endDate: Date
): T[] {
  if (data.length === 0) return data

  const spanMs = endDate.getTime() - startDate.getTime()
  const spanYears = spanMs / (365.25 * 24 * 60 * 60 * 1000)

  if (spanYears <= 2) return data

  let intervalMonths: number
  if (spanYears <= 10) intervalMonths = 3
  else if (spanYears <= 30) intervalMonths = 6
  else intervalMonths = 12

  // Group by bucket and pick first point in each bucket
  const seen = new Set<string>()
  return data.filter((point) => {
    const d = new Date(point.date)
    const bucketMonth = Math.floor(d.getMonth() / intervalMonths) * intervalMonths
    const key = `${d.getFullYear()}-${bucketMonth}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
