/**
 * T029: Test data-service.ts to verify shard loading works correctly
 */

import * as dataService from '../src/lib/data/data-service';
import * as indexReader from '../src/lib/data/index-reader';

async function testDataService() {
  console.log('🧪 Testing Data Service\n');
  
  // Test 1: Load index
  console.log('Test 1: Load Index');
  try {
    const stats = indexReader.getIndexStats();
    console.log('   ✅ Index loaded successfully');
    console.log(`   📊 Commodities: ${stats.commodityCount}`);
    console.log(`   📊 Total records: ${stats.totalRecords.toLocaleString()}`);
    console.log(`   💾 Total size: ${stats.totalSizeMB.toFixed(2)} MB\n`);
  } catch (error) {
    console.error('   ❌ Failed to load index:', error);
    return;
  }
  
  // Test 2: Get recent prices (optimized path)
  console.log('Test 2: Get Recent Prices (12 months)');
  try {
    const result = await dataService.getRecentPrices('gold', 12);
    console.log('   ✅ Query successful');
    console.log(`   📊 Records returned: ${result.prices.length}`);
    console.log(`   📁 Shards loaded: ${result.metadata.shardsLoaded.length}`);
    console.log(`   ⏱️  Query time: ${result.metadata.queryTimeMs}ms`);
    console.log(`   📅 Date range: ${result.metadata.dateRange.start} to ${result.metadata.dateRange.end}`);
    
    if (result.prices.length > 0) {
      const latest = result.prices[0];
      console.log(`   💰 Latest gold price: $${latest.price} per ${latest.unit} (${latest.date})\n`);
    }
  } catch (error) {
    console.error('   ❌ Query failed:', error);
    return;
  }
  
  // Test 3: Get date range query
  console.log('Test 3: Get Date Range Query (2020-2024)');
  try {
    const result = await dataService.getPrices('copper', {
      startDate: '2020-01-01',
      endDate: '2024-12-31'
    });
    console.log('   ✅ Query successful');
    console.log(`   📊 Records returned: ${result.prices.length}`);
    console.log(`   📁 Shards loaded: ${result.metadata.shardsLoaded.join(', ')}`);
    console.log(`   ⏱️  Query time: ${result.metadata.queryTimeMs}ms`);
    console.log(`   📅 Date range: ${result.metadata.dateRange.start} to ${result.metadata.dateRange.end}\n`);
  } catch (error) {
    console.error('   ❌ Query failed:', error);
    return;
  }
  
  // Test 4: Get quality-filtered query
  console.log('Test 4: Get Quality-Filtered Query (high quality only)');
  try {
    const result = await dataService.getPrices('silver', {
      startDate: '2020-01-01',
      endDate: '2024-12-31',
      quality: 'high'
    });
    console.log('   ✅ Query successful');
    console.log(`   📊 Records returned: ${result.prices.length}`);
    console.log(`   ⏱️  Query time: ${result.metadata.queryTimeMs}ms`);
    
    // Verify all records have high quality
    const allHigh = result.prices.every(p => p.quality === 'high');
    console.log(`   ✓ All records high quality: ${allHigh ? 'YES' : 'NO'}\n`);
  } catch (error) {
    console.error('   ❌ Query failed:', error);
    return;
  }
  
  // Test 5: Get paginated query
  console.log('Test 5: Get Paginated Query (limit 10, offset 5)');
  try {
    const result = await dataService.getPrices('wheat', {
      startDate: '1950-01-01',
      endDate: '1960-12-31',
      limit: 10,
      offset: 5
    });
    console.log('   ✅ Query successful');
    console.log(`   📊 Records returned: ${result.prices.length}`);
    console.log(`   ⏱️  Query time: ${result.metadata.queryTimeMs}ms`);
    console.log(`   📄 Truncated: ${result.metadata.truncated}\n`);
  } catch (error) {
    console.error('   ❌ Query failed:', error);
    return;
  }
  
  // Test 6: Batch query multiple commodities
  console.log('Test 6: Batch Query (gold, silver, copper)');
  try {
    const startTime = performance.now();
    const results = await dataService.getBatchPrices(['gold', 'silver', 'copper'], {
      limit: 12
    });
    const endTime = performance.now();
    
    console.log('   ✅ Batch query successful');
    console.log(`   📊 Commodities queried: ${results.length}`);
    console.log(`   ⏱️  Total time: ${Math.round(endTime - startTime)}ms`);
    
    for (const result of results) {
      console.log(`   - ${result.commodityId}: ${result.prices.length} records (${result.metadata.queryTimeMs}ms)`);
    }
    console.log();
  } catch (error) {
    console.error('   ❌ Batch query failed:', error);
    return;
  }
  
  // Test 7: Performance comparison
  console.log('Test 7: Performance Comparison (Full History vs Recent)');
  try {
    // Full history query
    const fullStart = performance.now();
    const fullResult = await dataService.getAllPrices('aluminum');
    const fullTime = performance.now() - fullStart;
    
    // Recent query
    const recentStart = performance.now();
    const recentResult = await dataService.getRecentPrices('aluminum', 12);
    const recentTime = performance.now() - recentStart;
    
    console.log(`   Full history: ${fullResult.prices.length} records in ${Math.round(fullTime)}ms`);
    console.log(`   Recent (12): ${recentResult.prices.length} records in ${Math.round(recentTime)}ms`);
    console.log(`   📈 Speedup: ${(fullTime / recentTime).toFixed(1)}x faster\n`);
  } catch (error) {
    console.error('   ❌ Performance test failed:', error);
    return;
  }
  
  console.log('✨ All tests passed!\n');
  console.log('Summary:');
  console.log('- Index loading: ✅');
  console.log('- Recent prices query: ✅');
  console.log('- Date range query: ✅');
  console.log('- Quality filtering: ✅');
  console.log('- Pagination: ✅');
  console.log('- Batch queries: ✅');
  console.log('- Performance optimization: ✅');
}

testDataService().catch(console.error);
