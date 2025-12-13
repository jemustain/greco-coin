/**
 * Fetch Commodity Data CLI Script
 * 
 * T047-T049: Command-line script to fetch commodity price data from APIs
 * 
 * Usage:
 *   npm run fetch-data -- --commodity=gold --start=2020-01-01 --end=2024-12-31
 *   npm run fetch-data -- --commodity=all --start=2024-01-01
 *   npm run fetch-data -- --commodity=gold,silver,copper --force
 * 
 * Options:
 *   --commodity  Commodity ID(s) to fetch (comma-separated) or "all"
 *   --start      Start date (YYYY-MM-DD) - default: 1 year ago
 *   --end        End date (YYYY-MM-DD) - default: today
 *   --force      Force re-fetch even if data exists
 *   --dry-run    Preview what would be fetched without actually fetching
 *   --priority   Filter by update priority (P1-daily, P2-weekly, P3-monthly, P4-quarterly)
 *   --parallel   Number of concurrent fetches (default: 3)
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

import { adapterFactory } from '../src/lib/api/adapters/adapter-factory';
import { COMMODITY_MAPPINGS, getCommoditiesByPriority, type UpdatePriority } from '../src/lib/api/config/commodity-mapping';
import { priceValidator } from '../src/lib/validation/price-validator';
import type { CommodityPrice } from '../src/lib/types/commodity-price';
import type { FetchResult } from '../src/lib/api/adapters/base-adapter';

/**
 * CLI arguments parsed from command line
 */
interface CLIArgs {
  commodities: string[];
  startDate: string;
  endDate: string;
  force: boolean;
  dryRun: boolean;
  priority?: UpdatePriority;
  parallel: number;
}

/**
 * Fetch result with additional metadata
 */
interface FetchJobResult {
  commodityId: string;
  success: boolean;
  recordsFetched: number;
  source: string;
  duration: number;
  error?: string;
}

/**
 * Parse command-line arguments
 */
function parseArgs(): CLIArgs {
  const args = process.argv.slice(2);
  const parsed: any = {
    commodities: [],
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year ago
    endDate: new Date().toISOString().split('T')[0], // Today
    force: false,
    dryRun: false,
    parallel: 3,
  };

  for (const arg of args) {
    if (arg.startsWith('--commodity=')) {
      const value = arg.split('=')[1];
      if (value === 'all') {
        parsed.commodities = Object.keys(COMMODITY_MAPPINGS);
      } else {
        parsed.commodities = value.split(',').map((c) => c.trim());
      }
    } else if (arg.startsWith('--start=')) {
      parsed.startDate = arg.split('=')[1];
    } else if (arg.startsWith('--end=')) {
      parsed.endDate = arg.split('=')[1];
    } else if (arg === '--force') {
      parsed.force = true;
    } else if (arg === '--dry-run') {
      parsed.dryRun = true;
    } else if (arg.startsWith('--priority=')) {
      parsed.priority = arg.split('=')[1] as UpdatePriority;
    } else if (arg.startsWith('--parallel=')) {
      parsed.parallel = parseInt(arg.split('=')[1], 10);
    }
  }

  // Apply priority filter if specified
  if (parsed.priority) {
    const priorityCommodities = getCommoditiesByPriority(parsed.priority).map((m) => m.id);
    if (parsed.commodities.length === 0) {
      parsed.commodities = priorityCommodities;
    } else {
      parsed.commodities = parsed.commodities.filter((c: string) => priorityCommodities.includes(c));
    }
  }

  // Validate
  if (parsed.commodities.length === 0) {
    console.error('❌ Error: No commodities specified. Use --commodity=gold or --commodity=all');
    process.exit(1);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(parsed.startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(parsed.endDate)) {
    console.error('❌ Error: Invalid date format. Use YYYY-MM-DD');
    process.exit(1);
  }

  return parsed;
}

/**
 * Fetch data for a single commodity
 */
async function fetchCommodity(
  commodityId: string,
  startDate: string,
  endDate: string,
  force: boolean
): Promise<FetchJobResult> {
  const startTime = Date.now();
  
  try {
    // Get adapter for commodity
    const adapter = adapterFactory.getPrimaryAdapter(commodityId);
    const source = adapter.getSource();

    console.log(`\n📊 Fetching ${commodityId} from ${source}...`);

    // Fetch data
    const result: FetchResult = await adapter.fetchPrices(
      commodityId,
      { startDate, endDate },
      { timeoutMs: 30000 }
    );

    // Validate fetched data
    const validation = priceValidator.validateBatch(result.prices, {
      outlierStdDevs: 3,
      rejectOutliers: false,
    });

    console.log(`   ✅ Fetched ${result.prices.length} records`);
    console.log(`   📈 Range: ${result.prices[result.prices.length - 1]?.date || startDate} to ${result.prices[0]?.date || endDate}`);
    console.log(`   📊 Quality: ${validation.validPrices} valid, ${validation.outliers} outliers, ${validation.warnings} warnings`);

    if (validation.outliers > 0) {
      console.log(`   ⚠️  Outliers detected (will be kept with quality indicators)`);
    }

    // Write to file (simplified - would normally update shards)
    const dataDir = resolve(process.cwd(), 'src/data/prices');
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }

    const filePath = resolve(dataDir, `${commodityId}.json`);
    
    // Check if file exists and merge if not forcing
    let existingPrices: CommodityPrice[] = [];
    if (existsSync(filePath) && !force) {
      try {
        const existing = await readFile(filePath, 'utf-8');
        existingPrices = JSON.parse(existing);
        console.log(`   📝 Merging with ${existingPrices.length} existing records`);
      } catch (error) {
        console.log(`   ⚠️  Could not read existing file, will overwrite`);
      }
    }

    // Merge prices (keep newest for duplicate dates)
    const priceMap = new Map<string, CommodityPrice>();
    
    // Add existing prices first
    for (const price of existingPrices) {
      priceMap.set(price.date, price);
    }
    
    // Overwrite with new prices
    for (const price of result.prices) {
      priceMap.set(price.date, price);
    }

    // Sort by date (newest first)
    const mergedPrices = Array.from(priceMap.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    await writeFile(filePath, JSON.stringify(mergedPrices, null, 2), 'utf-8');
    console.log(`   💾 Saved to ${filePath} (${mergedPrices.length} total records)`);

    const duration = Date.now() - startTime;
    return {
      commodityId,
      success: true,
      recordsFetched: result.prices.length,
      source,
      duration,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.log(`   ❌ Error: ${error.message}`);
    return {
      commodityId,
      success: false,
      recordsFetched: 0,
      source: 'unknown',
      duration,
      error: error.message,
    };
  }
}

/**
 * Fetch commodities in parallel batches
 */
async function fetchBatch(
  commodities: string[],
  startDate: string,
  endDate: string,
  force: boolean,
  parallel: number
): Promise<FetchJobResult[]> {
  const results: FetchJobResult[] = [];
  
  for (let i = 0; i < commodities.length; i += parallel) {
    const batch = commodities.slice(i, i + parallel);
    console.log(`\n🔄 Processing batch ${Math.floor(i / parallel) + 1}/${Math.ceil(commodities.length / parallel)}...`);
    
    const batchResults = await Promise.all(
      batch.map((commodityId) => fetchCommodity(commodityId, startDate, endDate, force))
    );
    
    results.push(...batchResults);
    
    // Rate limiting: wait 1 second between batches
    if (i + parallel < commodities.length) {
      console.log('\n⏱️  Waiting 1 second before next batch...');
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

/**
 * Print summary report
 */
function printSummary(results: FetchJobResult[]) {
  console.log('\n' + '='.repeat(70));
  console.log('📋 FETCH SUMMARY');
  console.log('='.repeat(70));
  
  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);
  const totalRecords = successful.reduce((sum, r) => sum + r.recordsFetched, 0);
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  
  console.log(`\n✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);
  console.log(`📊 Total records fetched: ${totalRecords.toLocaleString()}`);
  console.log(`⏱️  Total time: ${(totalDuration / 1000).toFixed(2)}s`);
  console.log(`📈 Average: ${(totalDuration / results.length / 1000).toFixed(2)}s per commodity`);
  
  if (successful.length > 0) {
    console.log('\n✅ Successfully fetched:');
    for (const result of successful) {
      console.log(`   - ${result.commodityId}: ${result.recordsFetched} records from ${result.source} (${(result.duration / 1000).toFixed(2)}s)`);
    }
  }
  
  if (failed.length > 0) {
    console.log('\n❌ Failed to fetch:');
    for (const result of failed) {
      console.log(`   - ${result.commodityId}: ${result.error}`);
    }
  }
  
  console.log('\n' + '='.repeat(70));
}

/**
 * Main execution
 */
async function main() {
  console.log('='.repeat(70));
  console.log('🌍 Greco Coin - Commodity Data Fetcher');
  console.log('='.repeat(70));
  
  const args = parseArgs();
  
  console.log('\n📋 Configuration:');
  console.log(`   Commodities: ${args.commodities.join(', ')}`);
  console.log(`   Date range: ${args.startDate} to ${args.endDate}`);
  console.log(`   Force: ${args.force}`);
  console.log(`   Dry run: ${args.dryRun}`);
  console.log(`   Parallel: ${args.parallel}`);
  if (args.priority) {
    console.log(`   Priority: ${args.priority}`);
  }
  
  if (args.dryRun) {
    console.log('\n🔍 DRY RUN MODE - No data will be fetched or written');
    console.log(`\nWould fetch ${args.commodities.length} commodities:`);
    for (const commodityId of args.commodities) {
      const mapping = COMMODITY_MAPPINGS[commodityId];
      if (mapping) {
        console.log(`   - ${mapping.name} (${commodityId}) from ${mapping.primarySource}`);
      }
    }
    return;
  }
  
  const results = await fetchBatch(
    args.commodities,
    args.startDate,
    args.endDate,
    args.force,
    args.parallel
  );
  
  printSummary(results);
  
  // T034: Trigger cache invalidation if any commodities were successfully updated
  const successfulCommodities = results.filter((r) => r.success).map((r) => r.commodityId);
  if (successfulCommodities.length > 0 && !args.dryRun) {
    console.log('\n🔄 Triggering cache invalidation...');
    try {
      // Determine if we should trigger revalidation
      // In development, skip if REVALIDATION_URL not set
      const revalidationUrl = process.env.REVALIDATION_URL || 'http://localhost:3000/api/revalidate';
      const revalidationSecret = process.env.REVALIDATION_SECRET || 'dev-secret-change-in-production';
      
      // Build cache tags to invalidate
      const tags = ['commodity-prices', 'homepage'];
      for (const commodityId of successfulCommodities) {
        tags.push(`commodity-${commodityId}`);
      }
      
      const response = await fetch(revalidationUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: revalidationSecret, tags }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Cache invalidated for ${tags.length} tags`);
        console.log(`   📅 Timestamp: ${data.timestamp}`);
      } else {
        console.log(`   ⚠️  Cache revalidation returned ${response.status}: ${response.statusText}`);
        console.log(`   ℹ️  Data was fetched successfully, but cache may not be updated`);
      }
    } catch (error: any) {
      console.log(`   ⚠️  Cache revalidation failed: ${error.message}`);
      console.log(`   ℹ️  Data was fetched successfully, but cache may not be updated`);
    }
  }
  
  const failedCount = results.filter((r) => !r.success).length;
  process.exit(failedCount > 0 ? 1 : 0);
}

// Run the script
main().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
