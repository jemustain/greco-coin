/**
 * T021: Migrate existing price data to time-period shards
 * 
 * Splits large JSON files into 4 shards by time period:
 * - 1900-1949.json: Historical data
 * - 1950-1999.json: Mid-century data
 * - 2000-2019.json: Recent historical data
 * - 2020-present.json: Current data (most frequently accessed)
 * 
 * Also normalizes field names from old schema to new schema:
 * - priceUSD → price
 * - sourceId → source
 * - qualityIndicator → quality
 */

import * as fs from 'fs';
import * as path from 'path';
import { CommodityPrice, QualityIndicator, DataSource } from '../src/lib/types/commodity-price';

// Shard boundaries
const SHARDS = [
  { name: '1900-1949', start: '1900-01-01', end: '1949-12-31' },
  { name: '1950-1999', start: '1950-01-01', end: '1999-12-31' },
  { name: '2000-2019', start: '2000-01-01', end: '2019-12-31' },
  { name: '2020-present', start: '2020-01-01', end: '2099-12-31' }
];

// Old schema interface
interface OldCommodityPrice {
  commodityId?: string;
  date: string;
  priceUSD: number | null;
  unit: string;
  sourceId?: string;
  qualityIndicator?: string;
}

/**
 * Map old source IDs to new DataSource enum
 */
function mapSource(oldSourceId?: string): DataSource {
  if (!oldSourceId) return 'manual';
  
  if (oldSourceId.includes('fred') || oldSourceId === 'fred') return 'fred';
  if (oldSourceId.includes('worldbank') || oldSourceId.includes('world-bank')) return 'worldbank';
  if (oldSourceId.includes('usgs')) return 'usgs';
  if (oldSourceId.includes('manual')) return 'manual';
  
  // Default mapping for historical sources
  return 'imported';
}

/**
 * Map old quality indicators to new QualityIndicator enum
 */
function mapQuality(oldQuality?: string): QualityIndicator {
  if (!oldQuality) return 'unavailable';
  
  const normalized = oldQuality.toLowerCase().trim();
  
  if (normalized === 'high') return 'high';
  if (normalized === 'medium' || normalized === 'interpolated') return 'interpolated_linear';
  if (normalized === 'quarterly') return 'quarterly_average';
  if (normalized === 'annual') return 'annual_average';
  if (normalized === 'low' || normalized === 'unavailable') return 'unavailable';
  
  // Default for unknown
  return 'unavailable';
}

/**
 * Transform old schema record to new schema
 */
function transformRecord(old: OldCommodityPrice): CommodityPrice {
  return {
    date: old.date,
    price: old.priceUSD,
    unit: old.unit,
    quality: mapQuality(old.qualityIndicator),
    source: mapSource(old.sourceId),
    sourceId: old.sourceId,
    fetchedAt: new Date().toISOString()
  };
}

/**
 * Check which shard a date belongs to
 */
function getShardForDate(date: string): typeof SHARDS[0] | null {
  for (const shard of SHARDS) {
    if (date >= shard.start && date <= shard.end) {
      return shard;
    }
  }
  return null;
}

/**
 * Migrate a single commodity file to shards
 */
function migrateCommodity(commodityId: string) {
  const inputPath = path.join(__dirname, '../src/data/prices', `${commodityId}.json`);
  
  if (!fs.existsSync(inputPath)) {
    console.log(`⏭️  Skipping ${commodityId} (file not found)`);
    return;
  }
  
  console.log(`\n📊 Processing ${commodityId}...`);
  
  // Read old data
  const oldDataRaw = fs.readFileSync(inputPath, 'utf-8');
  const oldData: OldCommodityPrice[] = JSON.parse(oldDataRaw);
  
  console.log(`   📥 Loaded ${oldData.length} records`);
  
  // Transform and group by shard
  const shardData: Record<string, CommodityPrice[]> = {};
  SHARDS.forEach(shard => {
    shardData[shard.name] = [];
  });
  
  let skippedCount = 0;
  for (const oldRecord of oldData) {
    const shard = getShardForDate(oldRecord.date);
    if (shard) {
      const newRecord = transformRecord(oldRecord);
      shardData[shard.name].push(newRecord);
    } else {
      skippedCount++;
    }
  }
  
  if (skippedCount > 0) {
    console.log(`   ⚠️  Skipped ${skippedCount} records with dates outside shard ranges`);
  }
  
  // Create shard directory
  const shardDir = path.join(__dirname, '../src/data/prices', commodityId);
  if (!fs.existsSync(shardDir)) {
    fs.mkdirSync(shardDir, { recursive: true });
  }
  
  // Write each shard
  let totalWritten = 0;
  for (const shard of SHARDS) {
    const records = shardData[shard.name];
    if (records.length === 0) {
      continue; // Skip empty shards
    }
    
    // Sort by date descending (newest first) for efficient queries
    records.sort((a, b) => b.date.localeCompare(a.date));
    
    const shardPath = path.join(shardDir, `${shard.name}.json`);
    fs.writeFileSync(shardPath, JSON.stringify(records, null, 2));
    
    const sizeKB = (fs.statSync(shardPath).size / 1024).toFixed(2);
    console.log(`   ✅ ${shard.name}.json: ${records.length} records (${sizeKB} KB)`);
    totalWritten += records.length;
  }
  
  console.log(`   📝 Total written: ${totalWritten} records`);
  
  // Backup original file
  const backupPath = inputPath + '.backup';
  fs.copyFileSync(inputPath, backupPath);
  console.log(`   💾 Backed up original to ${path.basename(backupPath)}`);
}

/**
 * Main migration function
 */
async function main() {
  const args = process.argv.slice(2);
  
  console.log('🔄 Starting migration to sharded storage...\n');
  
  // Get list of commodities to migrate
  let commodities: string[];
  
  if (args.length > 0 && args[0] !== '--all') {
    // Migrate specific commodities
    commodities = args;
  } else {
    // Migrate all commodities
    const pricesDir = path.join(__dirname, '../src/data/prices');
    const files = fs.readdirSync(pricesDir);
    commodities = files
      .filter(f => f.endsWith('.json') && !f.includes('.backup'))
      .map(f => f.replace('.json', ''));
  }
  
  console.log(`📦 Migrating ${commodities.length} commodities\n`);
  
  for (const commodity of commodities) {
    try {
      migrateCommodity(commodity);
    } catch (error) {
      console.error(`❌ Error migrating ${commodity}:`, error);
    }
  }
  
  console.log('\n✨ Migration complete!\n');
  console.log('Next steps:');
  console.log('1. Run generate-date-range-index.ts to create index');
  console.log('2. Update commodities.json with source metadata');
  console.log('3. Test data-service.ts to verify shard loading works');
}

main().catch(console.error);
