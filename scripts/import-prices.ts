#!/usr/bin/env ts-node
/**
 * Data Import Script
 * Imports commodity price data from CSV files with validation
 * 
 * Usage: npm run script:import -- <csv-file> <commodity-id>
 * Example: npm run script:import -- ./data/gold-prices.csv gold
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

/**
 * Parse CSV file
 */
function parseCSV(filePath: string): string[][] {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.trim().split('\n')
  return lines.map((line) => line.split(',').map((cell) => cell.trim()))
}

/**
 * Convert CSV row to CommodityPrice
 */
function rowToPrice(
  row: string[],
  commodityId: string,
  headers: string[]
): CommodityPrice | null {
  try {
    // Expected CSV format: date, price, unit, source, quality
    const dateIdx = headers.findIndex((h) => h.toLowerCase().includes('date'))
    const priceIdx = headers.findIndex((h) => h.toLowerCase().includes('price'))
    const unitIdx = headers.findIndex((h) => h.toLowerCase().includes('unit'))
    const sourceIdx = headers.findIndex((h) => h.toLowerCase().includes('source'))
    const qualityIdx = headers.findIndex((h) => h.toLowerCase().includes('quality'))

    if (dateIdx === -1 || priceIdx === -1) {
      throw new Error('CSV must have date and price columns')
    }

    const price: CommodityPrice = {
      commodityId,
      date: row[dateIdx],
      priceUSD: parseFloat(row[priceIdx]),
      unit: unitIdx >= 0 ? row[unitIdx] : 'unit',
      sourceId: sourceIdx >= 0 ? row[sourceIdx] : 'imported',
      qualityIndicator: qualityIdx >= 0 ? row[qualityIdx] : 'medium',
    }

    // Validate
    if (isNaN(price.priceUSD)) return null
    if (!price.date || price.date === '') return null
    
    // Validate date format
    const date = new Date(price.date)
    if (isNaN(date.getTime())) return null

    return price
  } catch (error) {
    return null
  }
}

/**
 * Main import function
 */
async function main() {
  console.log('📥 Greco Coin Data Import Script\n')

  // Parse arguments
  const args = process.argv.slice(2)
  
  if (args.length < 2) {
    console.error('❌ Usage: npm run script:import -- <csv-file> <commodity-id>')
    console.error('Example: npm run script:import -- ./data/gold-prices.csv gold')
    process.exit(1)
  }

  const csvFile = args[0]
  const commodityId = args[1]

  // Validate inputs
  if (!fs.existsSync(csvFile)) {
    console.error(`❌ File not found: ${csvFile}`)
    process.exit(1)
  }

  console.log(`📊 Importing data for commodity: ${commodityId}`)
  console.log(`📁 From file: ${csvFile}\n`)

  try {
    // Parse CSV
    console.log('🔍 Parsing CSV...')
    const rows = parseCSV(csvFile)
    
    if (rows.length < 2) {
      throw new Error('CSV file must have at least a header row and one data row')
    }

    const headers = rows[0]
    const dataRows = rows.slice(1)
    console.log(`  ✅ Found ${dataRows.length} rows with headers: ${headers.join(', ')}`)

    // Convert to prices
    console.log('\n🔄 Converting to price records...')
    const prices: CommodityPrice[] = []
    let skipped = 0

    for (const row of dataRows) {
      const price = rowToPrice(row, commodityId, headers)
      if (price) {
        prices.push(price)
      } else {
        skipped++
      }
    }

    console.log(`  ✅ Converted ${prices.length} records`)
    if (skipped > 0) {
      console.log(`  ⚠️  Skipped ${skipped} invalid rows`)
    }

    // Sort by date
    prices.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Statistics
    const dateRange = {
      start: prices[0].date,
      end: prices[prices.length - 1].date,
    }
    const avgPrice = prices.reduce((sum, p) => sum + p.priceUSD, 0) / prices.length

    console.log(`\n📊 Statistics:`)
    console.log(`  Date range: ${dateRange.start} to ${dateRange.end}`)
    console.log(`  Average price: $${avgPrice.toFixed(2)}`)
    console.log(`  Min price: $${Math.min(...prices.map((p) => p.priceUSD)).toFixed(2)}`)
    console.log(`  Max price: $${Math.max(...prices.map((p) => p.priceUSD)).toFixed(2)}`)

    // Save to file
    const outputDir = path.join(process.cwd(), 'src', 'data', 'prices')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const outputPath = path.join(outputDir, `${commodityId}.json`)
    console.log(`\n💾 Saving to ${path.relative(process.cwd(), outputPath)}...`)

    fs.writeFileSync(outputPath, JSON.stringify(prices, null, 2), 'utf-8')

    console.log('  ✅ Saved successfully')
    console.log(`\n✨ Done! Imported ${prices.length} price records for ${commodityId}`)
    console.log(`\n💡 Next steps:`)
    console.log(`  1. Run validation: npm run script:validate`)
    console.log(`  2. Recalculate Greco values: npm run script:calculate`)

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
