#!/usr/bin/env ts-node
/**
 * Greco Calculation Script
 * Regenerates greco-values.json from commodity prices and basket weights
 * 
 * Usage: npm run script:calculate
 */

import * as fs from 'fs'
import * as path from 'path'

interface CommodityPrice {
  commodityId: string
  date: string
  priceUSD: number
  unit: string
  sourceId: string
  qualityIndicator: string
}

interface BasketWeight {
  commodityId: string
  weight: number
}

interface GrecoValue {
  date: Date
  currencyId: string
  value: number
  completeness: number
  qualityIndicator: string
  basketVersion: string
  contributingCommodities: string[]
}

/**
 * Load basket weights
 */
function loadBasketWeights(): BasketWeight[] {
  const weightsPath = path.join(process.cwd(), 'src', 'data', 'basket-weights.json')
  
  if (!fs.existsSync(weightsPath)) {
    throw new Error('basket-weights.json not found')
  }

  const data = JSON.parse(fs.readFileSync(weightsPath, 'utf-8'))
  
  // Handle different basket weight formats
  if (Array.isArray(data)) {
    return data[0].weights || []
  }
  if (data.weights) {
    return data.weights
  }
  
  throw new Error('Invalid basket weights format')
}

/**
 * Load all commodity prices
 */
function loadCommodityPrices(): Map<string, CommodityPrice[]> {
  const pricesDir = path.join(process.cwd(), 'src', 'data', 'prices')
  const pricesMap = new Map<string, CommodityPrice[]>()

  if (!fs.existsSync(pricesDir)) {
    throw new Error('prices directory not found')
  }

  const priceFiles = fs.readdirSync(pricesDir).filter((f) => f.endsWith('.json'))

  for (const file of priceFiles) {
    const filePath = path.join(pricesDir, file)
    const prices: CommodityPrice[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    
    if (prices.length > 0) {
      const commodityId = prices[0].commodityId
      pricesMap.set(commodityId, prices)
    }
  }

  return pricesMap
}

/**
 * Calculate Greco value for a specific date
 */
function calculateGrecoForDate(
  date: Date,
  weights: BasketWeight[],
  pricesMap: Map<string, CommodityPrice[]>
): Omit<GrecoValue, 'currencyId'> | null {
  let totalValue = 0
  let totalWeight = 0
  let minQuality: 'high' | 'medium' | 'low' = 'high'
  const contributingCommodities: string[] = []

  for (const { commodityId, weight } of weights) {
    const prices = pricesMap.get(commodityId)
    if (!prices || prices.length === 0) continue

    // Find price closest to date
    const closestPrice = prices.reduce((closest, price) => {
      const priceDiff = Math.abs(new Date(price.date).getTime() - date.getTime())
      const closestDiff = Math.abs(new Date(closest.date).getTime() - date.getTime())
      return priceDiff < closestDiff ? price : closest
    })

    // Only use if within 1 year
    const timeDiff = Math.abs(new Date(closestPrice.date).getTime() - date.getTime())
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24)
    
    if (daysDiff <= 365) {
      totalValue += closestPrice.priceUSD * weight
      totalWeight += weight
      contributingCommodities.push(commodityId)
      
      // Track minimum quality
      if (closestPrice.qualityIndicator === 'low') minQuality = 'low'
      else if (closestPrice.qualityIndicator === 'medium' && minQuality !== 'low') minQuality = 'medium'
    }
  }

  if (totalWeight === 0) return null

  return {
    date,
    value: totalValue,
    completeness: totalWeight / weights.reduce((sum, w) => sum + w.weight, 0),
    qualityIndicator: minQuality,
    basketVersion: '1.0.0',
    contributingCommodities,
  }
}

/**
 * Generate date range
 */
function generateDateRange(startYear: number, endYear: number): Date[] {
  const dates: Date[] = []
  
  for (let year = startYear; year <= endYear; year++) {
    // Quarterly data before 1950, monthly after
    const frequency = year < 1950 ? 4 : 12
    const step = 12 / frequency
    
    for (let month = 0; month < 12; month += step) {
      dates.push(new Date(year, month, 1))
    }
  }
  
  return dates
}

/**
 * Main calculation function
 */
async function main() {
  console.log('💰 Greco Value Calculation Script\n')

  try {
    // Load data
    console.log('📊 Loading basket weights...')
    const weights = loadBasketWeights()
    console.log(`  ✅ Loaded ${weights.length} commodity weights`)

    console.log('\n📦 Loading commodity prices...')
    const pricesMap = loadCommodityPrices()
    console.log(`  ✅ Loaded prices for ${pricesMap.size} commodities`)

    // Generate dates
    console.log('\n📅 Generating date range (1900-2025)...')
    const dates = generateDateRange(1900, 2025)
    console.log(`  ✅ Generated ${dates.length} date points`)

    // Calculate Greco values
    console.log('\n🧮 Calculating Greco values...')
    const grecoValues: GrecoValue[] = []
    const currencies = ['USD'] // Can expand to other currencies
    
    let calculated = 0
    for (const date of dates) {
      const baseValue = calculateGrecoForDate(date, weights, pricesMap)
      
      if (baseValue) {
        for (const currencyId of currencies) {
          grecoValues.push({
            ...baseValue,
            currencyId,
          })
          calculated++
        }
      }
      
      if (calculated % 100 === 0) {
        process.stdout.write(`\r  Progress: ${calculated} / ${dates.length * currencies.length}`)
      }
    }
    console.log(`\n  ✅ Calculated ${grecoValues.length} Greco values`)

    // Statistics
    const avgCompleteness = grecoValues.reduce((sum, v) => sum + v.completeness, 0) / grecoValues.length
    console.log(`\n📊 Statistics:`)
    console.log(`  Average completeness: ${(avgCompleteness * 100).toFixed(1)}%`)
    console.log(`  High quality: ${grecoValues.filter((v) => v.qualityIndicator === 'high').length}`)
    console.log(`  Medium quality: ${grecoValues.filter((v) => v.qualityIndicator === 'medium').length}`)
    console.log(`  Low quality: ${grecoValues.filter((v) => v.qualityIndicator === 'low').length}`)

    // Save to file
    const outputPath = path.join(process.cwd(), 'src', 'data', 'greco-values.json')
    console.log(`\n💾 Saving to ${path.relative(process.cwd(), outputPath)}...`)
    
    fs.writeFileSync(
      outputPath,
      JSON.stringify(grecoValues, null, 2),
      'utf-8'
    )
    
    console.log('  ✅ Saved successfully')
    console.log(`\n✨ Done! Generated ${grecoValues.length} Greco values`)

  } catch (error) {
    console.error('\n❌ Error:', (error as Error).message)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}
