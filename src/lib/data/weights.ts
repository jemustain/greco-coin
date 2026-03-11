/**
 * Compute production-based basket weights from a baseline year.
 *
 * For each commodity: weight = (price × production) / Σ(price × production)
 * where price and production are from the baseline year.
 *
 * These weights are then fixed and used for all subsequent years,
 * so the Greco value reflects how prices shift relative to the
 * baseline year's economic proportions.
 */

import fs from 'fs'
import path from 'path'
import { loadBasketWeights } from './loader-optimized'
import { getConversionFactor } from '../utils/unit-conversion'

interface ProductionPoint {
  year: number
  production: number
  unit: string
}

interface RawPriceEntry {
  date: string
  price?: number
  priceUSD?: number
  unit: string
}

interface WeightResult {
  commodityId: string
  weight: number
  marketValueMillionUSD: number
}

/**
 * Compute production-based weights for a given baseline year.
 * Returns weights normalized to sum to 1.0.
 * Falls back to equal weights for commodities missing data.
 */
export async function computeProductionWeights(
  baselineYear: number
): Promise<Record<string, number>> {
  const basketWeights = await loadBasketWeights()
  const commodityIds = basketWeights.weights.map(w => w.commodityId)

  const marketValues: WeightResult[] = []
  const missingIds: string[] = []

  for (const id of commodityIds) {
    // Load production data
    const prodPath = path.join(process.cwd(), 'src', 'data', 'production', `${id}.json`)
    if (!fs.existsSync(prodPath)) {
      missingIds.push(id)
      continue
    }
    const production: ProductionPoint[] = JSON.parse(fs.readFileSync(prodPath, 'utf-8'))
    const prodEntry = production.find(p => p.year === baselineYear)
    if (!prodEntry) {
      // Try closest year within 3 years
      const nearby = production
        .filter(p => Math.abs(p.year - baselineYear) <= 3)
        .sort((a, b) => Math.abs(a.year - baselineYear) - Math.abs(b.year - baselineYear))
      if (nearby.length === 0) {
        missingIds.push(id)
        continue
      }
      // Use closest year
      const closest = nearby[0]
      const priceEntry = getPriceForYear(id, closest.year) || getPriceForYear(id, baselineYear)
      if (!priceEntry) {
        missingIds.push(id)
        continue
      }
      const factor = getConversionFactor(id, priceEntry.unit, closest.unit)
      const mv = priceEntry.price * factor * closest.production / 1_000_000
      marketValues.push({ commodityId: id, weight: 0, marketValueMillionUSD: mv })
      continue
    }

    // Load price data for baseline year
    const priceEntry = getPriceForYear(id, baselineYear)
    if (!priceEntry) {
      missingIds.push(id)
      continue
    }

    const factor = getConversionFactor(id, priceEntry.unit, prodEntry.unit)
    const mv = priceEntry.price * factor * prodEntry.production / 1_000_000
    marketValues.push({ commodityId: id, weight: 0, marketValueMillionUSD: mv })
  }

  // Calculate total market value
  const totalMV = marketValues.reduce((sum, mv) => sum + mv.marketValueMillionUSD, 0)

  // Assign proportional weights
  const weights: Record<string, number> = {}
  if (totalMV > 0) {
    for (const mv of marketValues) {
      weights[mv.commodityId] = mv.marketValueMillionUSD / totalMV
    }
  }

  // For missing commodities, assign a small equal share of remaining weight
  if (missingIds.length > 0) {
    const assignedWeight = Object.values(weights).reduce((s, w) => s + w, 0)
    const remainingWeight = 1 - assignedWeight
    const perMissing = remainingWeight / missingIds.length
    for (const id of missingIds) {
      weights[id] = perMissing
    }
  }

  return weights
}

/**
 * Get price for a commodity in a given year.
 */
function getPriceForYear(
  commodityId: string,
  year: number
): { price: number; unit: string } | null {
  const pricePath = path.join(process.cwd(), 'src', 'data', 'prices', `${commodityId}.json`)
  if (!fs.existsSync(pricePath)) return null

  const prices: RawPriceEntry[] = JSON.parse(fs.readFileSync(pricePath, 'utf-8'))
  const yearStr = String(year)

  // Find entries matching the year
  const yearPrices = prices.filter(p => p.date.startsWith(yearStr))
  if (yearPrices.length === 0) {
    // Try adjacent years
    for (const offset of [1, -1, 2, -2]) {
      const altYear = String(year + offset)
      const alt = prices.filter(p => p.date.startsWith(altYear))
      if (alt.length > 0) {
        const entry = alt[0]
        return { price: entry.priceUSD ?? entry.price ?? 0, unit: entry.unit }
      }
    }
    return null
  }

  // Average price for the year
  const avg = yearPrices.reduce((sum, p) => sum + (p.priceUSD ?? p.price ?? 0), 0) / yearPrices.length
  return { price: avg, unit: yearPrices[0].unit }
}
