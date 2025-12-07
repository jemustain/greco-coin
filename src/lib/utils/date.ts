/**
 * Date utilities for the Greco tracker
 */

import { format, parse, startOfMonth, endOfMonth, addMonths, addYears } from 'date-fns'

/**
 * Format date for display
 * @param date - Date to format
 * @param formatStr - Format string (default: 'MMM yyyy')
 * @returns Formatted date string
 */
export function formatDate(date: Date, formatStr = 'MMM yyyy'): string {
  return format(date, formatStr)
}

/**
 * Parse date from string
 * @param dateStr - Date string (YYYY-MM-DD)
 * @returns Date object
 */
export function parseDate(dateStr: string): Date {
  return parse(dateStr, 'yyyy-MM-dd', new Date())
}

/**
 * Get date range between two dates
 * @param startDate - Start date
 * @param endDate - End date
 * @param interval - 'monthly' or 'annual'
 * @returns Array of dates
 */
export function getDateRange(
  startDate: Date,
  endDate: Date,
  interval: 'monthly' | 'annual' = 'monthly'
): Date[] {
  const dates: Date[] = []
  let current = startOfMonth(startDate)
  const end = endOfMonth(endDate)

  while (current <= end) {
    dates.push(new Date(current))

    if (interval === 'monthly') {
      current = addMonths(current, 1)
    } else {
      current = addYears(current, 1)
    }
  }

  return dates
}

/**
 * Check if a date is within the inception period for a currency
 * @param currencyId - Currency ID
 * @param date - Date to check
 * @returns True if the currency existed at that date
 */
export function checkCurrencyInception(currencyId: string, date: Date): boolean {
  const inceptionDates: Record<string, Date> = {
    EUR: new Date('1999-01-01'),
    BTC: new Date('2009-01-03'),
    CNY: new Date('1949-12-01'),
  }

  const inceptionDate = inceptionDates[currencyId]
  if (!inceptionDate) {
    return true // Currency pre-dates tracking period
  }

  return date >= inceptionDate
}

/**
 * Get preset date ranges
 */
export const presetRanges = {
  all: {
    label: 'Full History (1900-Present)',
    start: new Date('1900-01-01'),
    end: new Date(),
  },
  modern: {
    label: 'Modern Era (1950-Present)',
    start: new Date('1950-01-01'),
    end: new Date(),
  },
  recent: {
    label: 'Recent History (2000-Present)',
    start: new Date('2000-01-01'),
    end: new Date(),
  },
  lastDecade: {
    label: 'Last Decade',
    start: addYears(new Date(), -10),
    end: new Date(),
  },
  lastYear: {
    label: 'Last Year',
    start: addYears(new Date(), -1),
    end: new Date(),
  },
}

/**
 * Format date for API requests (YYYY-MM-DD)
 * @param date - Date to format
 * @returns ISO date string
 */
export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/**
 * Get year from date
 * @param date - Date object
 * @returns Year as number
 */
export function getYear(date: Date): number {
  return date.getFullYear()
}

/**
 * Create date from year and month
 * @param year - Year (1900-2025)
 * @param month - Month (1-12)
 * @returns Date object
 */
export function createDate(year: number, month = 1): Date {
  return new Date(year, month - 1, 1)
}
