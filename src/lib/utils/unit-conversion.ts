/**
 * Unit conversion factors to normalize price × production into USD.
 *
 * Goal: marketValue = pricePerUnit × productionInMatchingUnits
 *
 * Price units vary (usd/metric-ton, usd/kilogram, usd/troy-ounce, usd/barrel, usd/bushel, usd/pound, usd/dry-metric-ton).
 * Production units are either "metric-tons" or "million-metric-tons".
 *
 * We convert everything so that:
 *   marketValue (USD) = price (in original unit) × conversionFactor × production (in original unit)
 *
 * The conversion factor bridges the gap between price unit and production unit.
 */

// How many of the price unit fit in one production unit
// e.g., if price is usd/kg and production is million-metric-tons:
//   1 million metric tons = 1e6 × 1000 kg = 1e9 kg
//   so factor = 1e9

export interface ConversionEntry {
  priceUnit: string
  productionUnit: string
  factor: number // multiply price × factor × production to get USD
  notes?: string
}

const MT_TO_KG = 1000
const MMT_TO_MT = 1_000_000
const MMT_TO_KG = MMT_TO_MT * MT_TO_KG // 1e9
const TROY_OZ_PER_MT = 32_150.7 // 1 metric ton ≈ 32,150.7 troy ounces
const LB_PER_MT = 2_204.62
const BARRELS_PER_MT_PETROLEUM = 7.33 // ~7.33 barrels per metric ton of crude oil
const BUSHELS_PER_MT_OATS = 68.89 // 1 MT oats ≈ 68.89 bushels (14.515 kg/bu)
const BUSHELS_PER_MT_RYE = 39.37 // 1 MT rye ≈ 39.37 bushels (25.4 kg/bu)

/**
 * Get the conversion factor for a commodity based on its price and production units.
 * Returns the factor such that: marketValue = price × factor × production
 */
export function getConversionFactor(
  commodityId: string,
  priceUnit: string,
  productionUnit: string
): number {
  const prodIsMillion = productionUnit === 'million-metric-tons'
  const prodMultiplier = prodIsMillion ? MMT_TO_MT : 1 // convert production to metric tons

  // Normalize price unit
  const pu = priceUnit.toLowerCase().replace('usd/', '')

  switch (pu) {
    case 'metric-ton':
      // price is per MT, production in MT (after conversion)
      return prodMultiplier

    case 'dry-metric-ton':
      // ~same as metric-ton for iron ore
      return prodMultiplier

    case 'kilogram':
      // price per kg; need to convert production MT → kg
      return prodMultiplier * MT_TO_KG

    case 'troy-ounce':
      // price per troy oz; production in MT
      return prodMultiplier * TROY_OZ_PER_MT

    case 'pound':
      // price per lb; production in MT
      return prodMultiplier * LB_PER_MT

    case 'barrel':
      // price per barrel; production in MT (petroleum)
      return prodMultiplier * BARRELS_PER_MT_PETROLEUM

    case 'mmbtu':
      // price per MMBtu; natural gas production in billion cubic meters
      // For natural gas, production unit is billion-cubic-meters, not metric tons
      // 1 bcm ≈ 35,314,667 MMBtu
      // But if production is in million-metric-tons, 1 MT ≈ 48.7 MMBtu
      if (productionUnit === 'billion-cubic-meters') return 35_314_667
      return prodMultiplier * 48.7

    case 'bushel':
      // bushel size varies by commodity
      if (commodityId === 'oats') return prodMultiplier * BUSHELS_PER_MT_OATS
      if (commodityId === 'rye') return prodMultiplier * BUSHELS_PER_MT_RYE
      // fallback for other grains (~36.74 bu/MT for wheat)
      return prodMultiplier * 36.74

    default:
      // If unit doesn't start with "usd/", it might be just the unit name
      // (some estimated commodities have bare units like "metric-ton")
      if (priceUnit === 'metric-ton' || priceUnit === 'usd/metric-ton') {
        return prodMultiplier
      }
      console.warn(`Unknown price unit "${priceUnit}" for ${commodityId}, using 1`)
      return prodMultiplier
  }
}

/**
 * Compute market value (price × quantity) for a commodity at a given year.
 * Returns value in millions of USD for readability.
 */
export function computeMarketValue(
  price: number,
  production: number,
  commodityId: string,
  priceUnit: string,
  productionUnit: string
): number {
  const factor = getConversionFactor(commodityId, priceUnit, productionUnit)
  const rawValue = price * factor * production
  return rawValue / 1_000_000 // Convert to millions USD
}
