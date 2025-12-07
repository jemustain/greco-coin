/**
 * Currency and exchange rate types
 * 9 currencies/assets: USD, EUR, GBP, CNY, RUB, INR, Gold, Silver, Bitcoin
 */

export enum AssetType {
  FIAT_CURRENCY = 'fiat_currency',
  PRECIOUS_METAL = 'precious_metal',
  CRYPTOCURRENCY = 'cryptocurrency',
}

export interface Currency {
  id: string // e.g., "USD", "EUR", "BTC"
  name: string
  symbol: string // e.g., "$", "€", "₿"
  type: AssetType
  inceptionDate: Date // EUR: 1999-01-01, BTC: 2009-01-03
  description: string
  metadata: {
    iso4217Code?: string // For fiat currencies
    country?: string
    displayPrecision: number // Decimal places for display
  }
}

export interface CurrencyExchangeRate {
  baseCurrency: string // Always "USD"
  targetCurrency: string
  date: Date
  rate: number // How many target currency units per 1 USD
  sourceId?: string
}

export interface ExchangeRateTimeSeriesData {
  currency: string
  data: Array<{
    date: string
    rate: number
  }>
}
