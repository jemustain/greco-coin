/**
 * Formatting utilities for numbers, currency, and percentages
 */

/**
 * Format currency value
 * @param value - Numeric value
 * @param currencySymbol - Currency symbol (e.g., "$", "€")
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currencySymbol = '$', decimals = 2): string {
  return `${currencySymbol}${formatNumber(value, decimals)}`
}

/**
 * Format number with thousands separators
 * @param value - Numeric value
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string
 */
export function formatNumber(value: number, decimals = 2): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * Format percentage
 * @param value - Numeric value (0-100)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${formatNumber(value, decimals)}%`
}

/**
 * Format large numbers with abbreviations (K, M, B)
 * @param value - Numeric value
 * @returns Abbreviated string
 */
export function formatAbbreviated(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`
  }
  return value.toFixed(0)
}

/**
 * Get currency symbol from currency ID
 * @param currencyId - Currency ID (e.g., "USD", "EUR")
 * @returns Currency symbol
 */
export function getCurrencySymbol(currencyId: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CNY: '¥',
    RUB: '₽',
    INR: '₹',
    GOLD: 'Au',
    SILVER: 'Ag',
    BTC: '₿',
  }

  return symbols[currencyId] || currencyId
}

/**
 * Format data quality indicator for display
 * @param indicator - Quality indicator ('high', 'medium', 'low', 'missing')
 * @returns Human-readable string
 */
export function formatQualityIndicator(indicator: string): string {
  const labels: Record<string, string> = {
    high: 'High Quality',
    medium: 'Medium Quality',
    low: 'Low Quality',
    missing: 'Missing Data',
  }

  return labels[indicator] || indicator
}
