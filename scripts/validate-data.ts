#!/usr/bin/env ts-node
/**
 * Data Validation Script
 * Validates commodity price data and greco values for completeness and quality
 * 
 * Usage: npm run script:validate
 */

import * as fs from 'fs'
import * as path from 'path'

interface ValidationResult {
  file: string
  valid: boolean
  errors: string[]
  warnings: string[]
  stats: {
    totalRecords: number
    dateRange?: { start: string; end: string }
    missingDates?: number
  }
}

/**
 * Validate commodity price data file
 */
function validatePriceData(filePath: string): ValidationResult {
  const result: ValidationResult = {
    file: path.basename(filePath),
    valid: true,
    errors: [],
    warnings: [],
    stats: { totalRecords: 0 },
  }

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

    if (!Array.isArray(data)) {
      result.errors.push('Data is not an array')
      result.valid = false
      return result
    }

    result.stats.totalRecords = data.length

    // Validate each record
    data.forEach((record, index) => {
      // Required fields
      if (!record.commodityId) {
        result.errors.push(`Record ${index}: Missing commodityId`)
        result.valid = false
      }
      if (!record.date) {
        result.errors.push(`Record ${index}: Missing date`)
        result.valid = false
      }
      if (typeof record.priceUSD !== 'number') {
        result.errors.push(`Record ${index}: Invalid priceUSD`)
        result.valid = false
      }
      if (!record.unit) {
        result.errors.push(`Record ${index}: Missing unit`)
        result.valid = false
      }

      // Warnings for optional fields
      if (!record.sourceId) {
        result.warnings.push(`Record ${index}: Missing sourceId`)
      }
      if (!record.qualityIndicator) {
        result.warnings.push(`Record ${index}: Missing qualityIndicator`)
      }

      // Validate price range
      if (record.priceUSD <= 0) {
        result.warnings.push(`Record ${index}: Price is zero or negative`)
      }
      if (record.priceUSD > 1000000) {
        result.warnings.push(`Record ${index}: Unusually high price`)
      }
    })

    // Calculate date range
    if (data.length > 0) {
      const dates = data.map((r) => new Date(r.date)).sort((a, b) => a.getTime() - b.getTime())
      result.stats.dateRange = {
        start: dates[0].toISOString().split('T')[0],
        end: dates[dates.length - 1].toISOString().split('T')[0],
      }
    }
  } catch (error) {
    result.errors.push(`Failed to parse JSON: ${(error as Error).message}`)
    result.valid = false
  }

  return result
}

/**
 * Validate greco values file
 */
function validateGrecoData(filePath: string): ValidationResult {
  const result: ValidationResult = {
    file: path.basename(filePath),
    valid: true,
    errors: [],
    warnings: [],
    stats: { totalRecords: 0 },
  }

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

    if (!Array.isArray(data)) {
      result.errors.push('Data is not an array')
      result.valid = false
      return result
    }

    result.stats.totalRecords = data.length

    // Validate each record
    data.forEach((record, index) => {
      if (!record.date) result.errors.push(`Record ${index}: Missing date`)
      if (!record.currencyId) result.errors.push(`Record ${index}: Missing currencyId`)
      if (typeof record.value !== 'number') result.errors.push(`Record ${index}: Invalid value`)
      if (typeof record.completeness !== 'number') result.errors.push(`Record ${index}: Invalid completeness`)

      // Validate completeness range
      if (record.completeness < 0 || record.completeness > 1) {
        result.errors.push(`Record ${index}: Completeness out of range (0-1)`)
      }

      // Warnings
      if (record.completeness < 0.5) {
        result.warnings.push(`Record ${index}: Low completeness (${(record.completeness * 100).toFixed(1)}%)`)
      }
      if (!record.contributingCommodities || record.contributingCommodities.length === 0) {
        result.warnings.push(`Record ${index}: No contributing commodities listed`)
      }
    })

    // Calculate date range
    if (data.length > 0) {
      const dates = data.map((r) => new Date(r.date)).sort((a, b) => a.getTime() - b.getTime())
      result.stats.dateRange = {
        start: dates[0].toISOString().split('T')[0],
        end: dates[dates.length - 1].toISOString().split('T')[0],
      }
    }
  } catch (error) {
    result.errors.push(`Failed to parse JSON: ${(error as Error).message}`)
    result.valid = false
  }

  return result
}

/**
 * Main validation function
 */
async function main() {
  console.log('🔍 Greco Coin Data Validation\n')

  const dataDir = path.join(process.cwd(), 'src', 'data')
  const results: ValidationResult[] = []

  // Validate price data
  console.log('📊 Validating commodity price data...')
  const pricesDir = path.join(dataDir, 'prices')
  
  if (fs.existsSync(pricesDir)) {
    const priceFiles = fs.readdirSync(pricesDir).filter((f) => f.endsWith('.json'))
    
    for (const file of priceFiles) {
      const result = validatePriceData(path.join(pricesDir, file))
      results.push(result)
      
      console.log(`  ${result.valid ? '✅' : '❌'} ${result.file}: ${result.stats.totalRecords} records`)
      if (result.errors.length > 0) {
        result.errors.slice(0, 5).forEach((err) => console.log(`     ❌ ${err}`))
        if (result.errors.length > 5) {
          console.log(`     ... and ${result.errors.length - 5} more errors`)
        }
      }
      if (result.warnings.length > 0 && result.warnings.length <= 3) {
        result.warnings.forEach((warn) => console.log(`     ⚠️  ${warn}`))
      } else if (result.warnings.length > 3) {
        console.log(`     ⚠️  ${result.warnings.length} warnings`)
      }
    }
  }

  // Validate greco values
  console.log('\n💰 Validating greco values...')
  const grecoFile = path.join(dataDir, 'greco-values.json')
  
  if (fs.existsSync(grecoFile)) {
    const result = validateGrecoData(grecoFile)
    results.push(result)
    
    console.log(`  ${result.valid ? '✅' : '❌'} ${result.file}: ${result.stats.totalRecords} records`)
    if (result.stats.dateRange) {
      console.log(`     📅 Date range: ${result.stats.dateRange.start} to ${result.stats.dateRange.end}`)
    }
    if (result.errors.length > 0) {
      result.errors.slice(0, 5).forEach((err) => console.log(`     ❌ ${err}`))
      if (result.errors.length > 5) {
        console.log(`     ... and ${result.errors.length - 5} more errors`)
      }
    }
    if (result.warnings.length > 0 && result.warnings.length <= 5) {
      result.warnings.forEach((warn) => console.log(`     ⚠️  ${warn}`))
    } else if (result.warnings.length > 5) {
      console.log(`     ⚠️  ${result.warnings.length} warnings (showing first 5)`)
      result.warnings.slice(0, 5).forEach((warn) => console.log(`     ⚠️  ${warn}`))
    }
  } else {
    console.log('  ❌ greco-values.json not found')
  }

  // Summary
  console.log('\n📋 Validation Summary')
  console.log(`  Total files validated: ${results.length}`)
  console.log(`  Valid files: ${results.filter((r) => r.valid).length}`)
  console.log(`  Invalid files: ${results.filter((r) => !r.valid).length}`)
  console.log(`  Total errors: ${results.reduce((sum, r) => sum + r.errors.length, 0)}`)
  console.log(`  Total warnings: ${results.reduce((sum, r) => sum + r.warnings.length, 0)}`)

  // Exit with error code if any validation failed
  if (results.some((r) => !r.valid)) {
    console.log('\n❌ Validation failed')
    process.exit(1)
  } else {
    console.log('\n✅ All data validated successfully')
    process.exit(0)
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}
