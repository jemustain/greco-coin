/**
 * T022: Generate date-range-index.json mapping date ranges to shard files
 * 
 * Creates a central index that allows efficient lookup of which shard file
 * contains data for a given date range query.
 */

import * as fs from 'fs';
import * as path from 'path';

interface ShardInfo {
  /** Shard file path relative to prices directory */
  file: string;
  
  /** Earliest date in this shard (ISO 8601) */
  startDate: string;
  
  /** Latest date in this shard (ISO 8601) */
  endDate: string;
  
  /** Number of records in this shard */
  recordCount: number;
  
  /** File size in bytes */
  sizeBytes: number;
}

interface CommodityIndex {
  /** Commodity identifier */
  commodityId: string;
  
  /** Total records across all shards */
  totalRecords: number;
  
  /** Total size across all shards (bytes) */
  totalSize: number;
  
  /** Array of shards for this commodity */
  shards: ShardInfo[];
  
  /** Overall date range */
  dateRange: {
    start: string;
    end: string;
  };
}

interface DateRangeIndex {
  /** When this index was generated */
  generatedAt: string;
  
  /** Total number of commodities indexed */
  commodityCount: number;
  
  /** Total records across all commodities and shards */
  totalRecords: number;
  
  /** Total storage size (bytes) */
  totalSize: number;
  
  /** Per-commodity index data */
  commodities: Record<string, CommodityIndex>;
}

/**
 * Scan a shard directory and collect shard information
 */
function scanCommodityShards(commodityId: string, shardDir: string): CommodityIndex | null {
  if (!fs.existsSync(shardDir)) {
    return null;
  }
  
  const shardFiles = fs.readdirSync(shardDir)
    .filter(f => f.endsWith('.json'))
    .sort(); // Sort to ensure consistent ordering
  
  const shards: ShardInfo[] = [];
  let totalRecords = 0;
  let totalSize = 0;
  let overallStart: string | null = null;
  let overallEnd: string | null = null;
  
  for (const file of shardFiles) {
    const filePath = path.join(shardDir, file);
    const stats = fs.statSync(filePath);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    if (!Array.isArray(data) || data.length === 0) {
      continue; // Skip empty shards
    }
    
    // Find date range (data is sorted descending, so first = latest, last = earliest)
    const latest = data[0].date;
    const earliest = data[data.length - 1].date;
    
    shards.push({
      file: `${commodityId}/${file}`,
      startDate: earliest,
      endDate: latest,
      recordCount: data.length,
      sizeBytes: stats.size
    });
    
    totalRecords += data.length;
    totalSize += stats.size;
    
    // Update overall range
    if (!overallStart || earliest < overallStart) overallStart = earliest;
    if (!overallEnd || latest > overallEnd) overallEnd = latest;
  }
  
  if (shards.length === 0) {
    return null;
  }
  
  return {
    commodityId,
    totalRecords,
    totalSize,
    shards,
    dateRange: {
      start: overallStart!,
      end: overallEnd!
    }
  };
}

/**
 * Generate the complete date-range index
 */
async function generateIndex() {
  console.log('📋 Generating date-range index...\n');
  
  const pricesDir = path.join(__dirname, '../src/data/prices');
  const entries = fs.readdirSync(pricesDir, { withFileTypes: true });
  
  const commodities: Record<string, CommodityIndex> = {};
  let totalRecords = 0;
  let totalSize = 0;
  let commodityCount = 0;
  
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue; // Skip non-directory entries (backup files, etc.)
    }
    
    const commodityId = entry.name;
    const shardDir = path.join(pricesDir, commodityId);
    
    console.log(`📊 Indexing ${commodityId}...`);
    
    const commodityIndex = scanCommodityShards(commodityId, shardDir);
    
    if (commodityIndex) {
      commodities[commodityId] = commodityIndex;
      totalRecords += commodityIndex.totalRecords;
      totalSize += commodityIndex.totalSize;
      commodityCount++;
      
      console.log(`   ✅ ${commodityIndex.shards.length} shards, ${commodityIndex.totalRecords} records, ${(commodityIndex.totalSize / 1024).toFixed(2)} KB`);
    } else {
      console.log(`   ⚠️  No shards found`);
    }
  }
  
  const index: DateRangeIndex = {
    generatedAt: new Date().toISOString(),
    commodityCount,
    totalRecords,
    totalSize,
    commodities
  };
  
  // Write index
  const indexesDir = path.join(__dirname, '../src/data/indexes');
  if (!fs.existsSync(indexesDir)) {
    fs.mkdirSync(indexesDir, { recursive: true });
  }
  
  const indexPath = path.join(indexesDir, 'date-range-index.json');
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
  
  console.log(`\n✨ Index generated successfully!`);
  console.log(`   📄 File: ${indexPath}`);
  console.log(`   📦 Commodities: ${commodityCount}`);
  console.log(`   📊 Total records: ${totalRecords.toLocaleString()}`);
  console.log(`   💾 Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
}

generateIndex().catch(console.error);
