/**
 * Chart utilities - Transform data for Recharts visualization
 */

import { GrecoValue } from '../types/greco'
import { formatDate } from './date'

export interface TimeSeriesDataPoint {
  date: string
  dateObj: Date
  value: number
  formattedDate: string
  completeness: number
  quality: string
  currency: string
  contributingCommodities?: string[] // IDs of commodities included in calculation
}

export interface MultiCurrencyDataPoint {
  date: string
  dateObj: Date
  formattedDate: string
  [currencyId: string]: string | number | Date | null // Dynamic currency values
}

/**
 * Convert Greco values to time-series data points for Recharts
 * @param grecoValues - Array of Greco values
 * @returns Array of data points ready for Recharts
 */
export function convertToTimeSeriesData(
  grecoValues: GrecoValue[]
): TimeSeriesDataPoint[] {
  return grecoValues.map((gv) => ({
    date: gv.date.toISOString().split('T')[0],
    dateObj: gv.date,
    value: gv.value,
    formattedDate: formatDate(gv.date, 'MMM yyyy'),
    completeness: gv.completeness,
    quality: gv.qualityIndicator,
    currency: gv.currencyId,
    contributingCommodities: gv.contributingCommodities,
  }))
}

/**
 * Sample data for performance optimization
 * @param data - Time-series data
 * @param maxPoints - Maximum number of points to display (default: 500)
 * @returns Sampled data
 */
export function sampleDataForPerformance<T>(data: T[], maxPoints = 500): T[] {
  if (data.length <= maxPoints) {
    return data
  }

  const step = Math.ceil(data.length / maxPoints)
  const sampled: T[] = []

  for (let i = 0; i < data.length; i += step) {
    sampled.push(data[i])
  }

  // Always include last point
  if (sampled[sampled.length - 1] !== data[data.length - 1]) {
    sampled.push(data[data.length - 1])
  }

  return sampled
}

/**
 * Handle data gaps by identifying missing periods
 * @param data - Time-series data
 * @returns Array of gap annotations { start, end, duration }
 */
export function handleDataGaps(data: TimeSeriesDataPoint[]): Array<{
  start: Date
  end: Date
  durationMonths: number
}> {
  if (data.length < 2) return []

  const gaps: Array<{ start: Date; end: Date; durationMonths: number }> = []
  const sortedData = [...data].sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())

  for (let i = 1; i < sortedData.length; i++) {
    const prevDate = sortedData[i - 1].dateObj
    const currDate = sortedData[i].dateObj

    const monthsDiff =
      (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24 * 30)

    // Flag gaps > 3 months
    if (monthsDiff > 3) {
      gaps.push({
        start: prevDate,
        end: currDate,
        durationMonths: Math.round(monthsDiff),
      })
    }
  }

  return gaps
}

/**
 * Merge multiple currency time series for comparison
 * @param currencyData - Map of currency ID to Greco values
 * @returns Merged data points
 */
export function mergeTimeSeriesData(
  currencyData: Map<string, GrecoValue[]>
): MultiCurrencyDataPoint[] {
  // Get all unique dates
  const allDates = new Set<string>()
  currencyData.forEach((values) => {
    values.forEach((gv) => {
      allDates.add(gv.date.toISOString().split('T')[0])
    })
  })

  // Create merged data points
  const sortedDates = Array.from(allDates).sort()
  const mergedData: MultiCurrencyDataPoint[] = []

  for (const dateStr of sortedDates) {
    const dateObj = new Date(dateStr)
    const dataPoint: MultiCurrencyDataPoint = {
      date: dateStr,
      dateObj,
      formattedDate: formatDate(dateObj, 'MMM yyyy'),
    }

    // Add value for each currency
    currencyData.forEach((values, currencyId) => {
      const value = values.find(
        (gv) => gv.date.toISOString().split('T')[0] === dateStr
      )
      dataPoint[currencyId] = value?.value || null
    })

    mergedData.push(dataPoint)
  }

  return mergedData
}

/**
 * Assign colors to currencies for multi-currency charts
 * @param currencyIds - Array of currency IDs
 * @returns Map of currency ID to color
 */
export function assignColors(currencyIds: string[]): Map<string, string> {
  const colorPalette = [
    '#2563eb', // Blue
    '#dc2626', // Red
    '#16a34a', // Green
    '#ca8a04', // Yellow
    '#7c3aed', // Purple
    '#db2777', // Pink
    '#0891b2', // Cyan
    '#ea580c', // Orange
    '#6366f1', // Indigo
  ]

  const colorMap = new Map<string, string>()
  currencyIds.forEach((id, index) => {
    colorMap.set(id, colorPalette[index % colorPalette.length])
  })

  return colorMap
}

/**
 * Calculate min/max values for chart domain
 * @param data - Time-series data
 * @param padding - Percentage padding (default: 0.1 = 10%)
 * @returns Domain [min, max]
 */
export function calculateChartDomain(
  data: TimeSeriesDataPoint[],
  padding = 0.1
): [number, number] {
  if (data.length === 0) return [0, 100]

  const values = data.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)

  const range = max - min
  const paddedMin = Math.max(0, min - range * padding)
  const paddedMax = max + range * padding

  return [paddedMin, paddedMax]
}

/**
 * Pivot data by year - show currencies as columns
 * @param data - Greco values
 * @param currencyIds - Array of currency IDs to include
 * @returns Array of pivoted data with year as row and currencies as columns
 */
export function pivotByYear(
  data: GrecoValue[],
  currencyIds: string[]
): Record<string, unknown>[] {
  // Group by year
  const yearMap = new Map<string, Map<string, number>>()

  data.forEach((gv) => {
    const year = gv.date.getFullYear().toString()
    
    if (!yearMap.has(year)) {
      yearMap.set(year, new Map())
    }
    
    const yearData = yearMap.get(year)!
    
    // Average values for the same currency in the same year
    if (yearData.has(gv.currencyId)) {
      const existingValue = yearData.get(gv.currencyId)!
      yearData.set(gv.currencyId, (existingValue + gv.value) / 2)
    } else {
      yearData.set(gv.currencyId, gv.value)
    }
  })

  // Convert to array format
  const result: Record<string, unknown>[] = []
  
  Array.from(yearMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([year, currencies]) => {
      const row: Record<string, unknown> = { year }
      
      currencyIds.forEach((currencyId) => {
        row[currencyId] = currencies.get(currencyId) || null
      })
      
      result.push(row)
    })

  return result
}

/**
 * Pivot data by currency - show years as columns
 * @param data - Greco values
 * @param years - Array of years to include
 * @returns Array of pivoted data with currency as row and years as columns
 */
export function pivotByCurrency(
  data: GrecoValue[],
  years: number[]
): Record<string, unknown>[] {
  // Group by currency
  const currencyMap = new Map<string, Map<number, number>>()

  data.forEach((gv) => {
    const year = gv.date.getFullYear()
    
    if (!currencyMap.has(gv.currencyId)) {
      currencyMap.set(gv.currencyId, new Map())
    }
    
    const currencyData = currencyMap.get(gv.currencyId)!
    
    // Average values for the same year
    if (currencyData.has(year)) {
      const existingValue = currencyData.get(year)!
      currencyData.set(year, (existingValue + gv.value) / 2)
    } else {
      currencyData.set(year, gv.value)
    }
  })

  // Convert to array format
  const result: Record<string, unknown>[] = []
  
  Array.from(currencyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([currencyId, yearValues]) => {
      const row: Record<string, unknown> = { currency: currencyId }
      
      years.forEach((year) => {
        row[year.toString()] = yearValues.get(year) || null
      })
      
      result.push(row)
    })

  return result
}
