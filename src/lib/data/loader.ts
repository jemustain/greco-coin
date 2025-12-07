/**
 * Data loader service - Load historical data from JSON files
 */

import { Commodity } from '../types/commodity'
import { Currency, CurrencyExchangeRate } from '../types/currency'
import { BasketWeight, DataSource } from '../types/greco'
import {
  CommoditiesSchema,
  CurrenciesSchema,
  BasketWeightSchema,
  DataSourcesSchema,
  PricePointsSchema,
  ExchangeRatesSchema,
} from '../validation/schemas'

import commoditiesData from '../../data/commodities.json'
import currenciesData from '../../data/currencies.json'
import unitsData from '../../data/units.json'
import basketWeightsData from '../../data/metadata/basket-weights.json'
import sourcesData from '../../data/metadata/sources.json'
import exchangeRatesData from '../../data/exchange-rates.json'

// Import all 32 commodity price files
import goldPricesData from '../../data/prices/gold.json'
import silverPricesData from '../../data/prices/silver.json'
import ironPricesData from '../../data/prices/iron.json'
import copperPricesData from '../../data/prices/copper.json'
import aluminumPricesData from '../../data/prices/aluminum.json'
import tinPricesData from '../../data/prices/tin.json'
import leadPricesData from '../../data/prices/lead.json'
import zincPricesData from '../../data/prices/zinc.json'
import nickelPricesData from '../../data/prices/nickel.json'
import platinumPricesData from '../../data/prices/platinum.json'
import petroleumPricesData from '../../data/prices/petroleum.json'
import cementPricesData from '../../data/prices/cement.json'
import rubberPricesData from '../../data/prices/rubber.json'
import sulphurPricesData from '../../data/prices/sulphur.json'
import ricePricesData from '../../data/prices/rice.json'
import wheatPricesData from '../../data/prices/wheat.json'
import cornPricesData from '../../data/prices/corn.json'
import barleyPricesData from '../../data/prices/barley.json'
import oatsPricesData from '../../data/prices/oats.json'
import ryePricesData from '../../data/prices/rye.json'
import peanutsPricesData from '../../data/prices/peanuts.json'
import soyBeansPricesData from '../../data/prices/soy-beans.json'
import coffeePricesData from '../../data/prices/coffee.json'
import cocoaPricesData from '../../data/prices/cocoa.json'
import sugarPricesData from '../../data/prices/sugar.json'
import cottonSeedPricesData from '../../data/prices/cotton-seed.json'
import cottonPricesData from '../../data/prices/cotton.json'
import woolPricesData from '../../data/prices/wool.json'
import jutePricesData from '../../data/prices/jute.json'
import hidesPricesData from '../../data/prices/hides.json'
import copraPricesData from '../../data/prices/copra.json'
import tallowPricesData from '../../data/prices/tallow.json'

/**
 * Load all 32 commodities
 */
export async function loadCommodities(): Promise<Commodity[]> {
  const validated = CommoditiesSchema.parse(commoditiesData)
  return validated.map((c) => ({
    ...c,
    inceptionDate: new Date(c.inceptionDate),
  })) as Commodity[]
}

/**
 * Load single commodity by ID
 */
export async function loadCommodity(id: string): Promise<Commodity | null> {
  const commodities = await loadCommodities()
  return commodities.find((c) => c.id === id) || null
}

/**
 * Load all 9 currencies/assets
 */
export async function loadCurrencies(): Promise<Currency[]> {
  const validated = CurrenciesSchema.parse(currenciesData)
  return validated.map((c) => ({
    ...c,
    inceptionDate: new Date(c.inceptionDate),
  })) as Currency[]
}

/**
 * Load single currency by ID
 */
export async function loadCurrency(id: string): Promise<Currency | null> {
  const currencies = await loadCurrencies()
  return currencies.find((c) => c.id === id) || null
}

/**
 * Load unit definitions
 */
export async function loadUnits() {
  return unitsData
}

/**
 * Load basket weights (v1.0.0 equal weighting)
 */
export async function loadBasketWeights(): Promise<BasketWeight> {
  const validated = BasketWeightSchema.parse(basketWeightsData)
  return {
    ...validated,
    effectiveDate: new Date(validated.effectiveDate),
  }
}

/**
 * Load data sources
 */
export async function loadSources(): Promise<DataSource[]> {
  const validated = DataSourcesSchema.parse(sourcesData)
  return validated.map((s) => ({
    ...s,
    coveragePeriod: {
      start: new Date(s.coveragePeriod.start),
      end: new Date(s.coveragePeriod.end),
    },
  }))
}

/**
 * Load price data for a specific commodity
 * @param commodityId - Commodity ID (e.g., "gold", "wheat")
 */
export async function loadPrices(commodityId: string) {
  // Map commodity IDs to their data files
  const priceDataMap: Record<string, unknown> = {
    gold: goldPricesData,
    silver: silverPricesData,
    iron: ironPricesData,
    copper: copperPricesData,
    aluminum: aluminumPricesData,
    tin: tinPricesData,
    lead: leadPricesData,
    zinc: zincPricesData,
    nickel: nickelPricesData,
    platinum: platinumPricesData,
    petroleum: petroleumPricesData,
    cement: cementPricesData,
    rubber: rubberPricesData,
    sulphur: sulphurPricesData,
    rice: ricePricesData,
    wheat: wheatPricesData,
    corn: cornPricesData,
    barley: barleyPricesData,
    oats: oatsPricesData,
    rye: ryePricesData,
    peanuts: peanutsPricesData,
    'soy-beans': soyBeansPricesData,
    coffee: coffeePricesData,
    cocoa: cocoaPricesData,
    sugar: sugarPricesData,
    'cotton-seed': cottonSeedPricesData,
    cotton: cottonPricesData,
    wool: woolPricesData,
    jute: jutePricesData,
    hides: hidesPricesData,
    copra: copraPricesData,
    tallow: tallowPricesData,
  }

  const data = priceDataMap[commodityId]
  if (!data) {
    return [] // Return empty array for commodities without data files yet
  }

  const validated = PricePointsSchema.parse(data)
  return validated.map((p) => ({
    ...p,
    date: new Date(p.date),
  }))
}

/**
 * Load exchange rates (USD base)
 */
export async function loadExchangeRates(): Promise<CurrencyExchangeRate[]> {
  const validated = ExchangeRatesSchema.parse(exchangeRatesData)
  return validated.map((r) => ({
    ...r,
    date: new Date(r.date),
  }))
}

/**
 * Load exchange rate for specific currency and date
 */
export async function loadExchangeRate(
  currencyId: string,
  date: Date
): Promise<number | null> {
  const rates = await loadExchangeRates()
  
  // Find rate closest to target date
  const matchingRates = rates
    .filter((r) => r.targetCurrency === currencyId)
    .sort((a, b) => Math.abs(a.date.getTime() - date.getTime()) - Math.abs(b.date.getTime() - date.getTime()))
  
  return matchingRates[0]?.rate || null
}
