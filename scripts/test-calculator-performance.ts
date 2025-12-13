/**
 * Test script for optimized calculator
 * Compares performance of old vs new calculator
 */

import { calculateGrecoTimeSeries } from '../src/lib/data/calculator';
import { calculateGrecoTimeSeriesOptimized } from '../src/lib/data/calculator-optimized';

async function testCalculators() {
  console.log('🧪 Testing Calculator Performance\n');
  console.log('='.repeat(70));
  
  // Test parameters: Last 12 months
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(endDate.getFullYear() - 1);
  
  console.log(`📅 Date range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
  console.log(`💱 Currency: USD`);
  console.log(`📊 Interval: monthly\n`);
  
  // Test old calculator
  console.log('Test 1: Original Calculator');
  console.log('-'.repeat(70));
  try {
    const oldStart = performance.now();
    const oldResults = await calculateGrecoTimeSeries(
      startDate,
      endDate,
      'USD',
      'monthly'
    );
    const oldTime = performance.now() - oldStart;
    
    console.log(`✅ Calculated ${oldResults.length} values`);
    console.log(`⏱️  Time: ${oldTime.toFixed(2)}ms`);
    console.log(`📊 Avg: ${(oldTime / oldResults.length).toFixed(2)}ms per value`);
    
    if (oldResults.length > 0) {
      const latest = oldResults[oldResults.length - 1];
      console.log(`💰 Latest Greco: $${latest.value.toFixed(2)} (${latest.completeness.toFixed(1)}% complete)\n`);
    }
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}\n`);
  }
  
  // Test new optimized calculator
  console.log('Test 2: Optimized Calculator');
  console.log('-'.repeat(70));
  try {
    const newStart = performance.now();
    const newResults = await calculateGrecoTimeSeriesOptimized(
      startDate,
      endDate,
      'USD',
      'monthly'
    );
    const newTime = performance.now() - newStart;
    
    console.log(`✅ Calculated ${newResults.length} values`);
    console.log(`⏱️  Time: ${newTime.toFixed(2)}ms`);
    console.log(`📊 Avg: ${(newTime / newResults.length).toFixed(2)}ms per value`);
    
    if (newResults.length > 0) {
      const latest = newResults[newResults.length - 1];
      console.log(`💰 Latest Greco: $${latest.value.toFixed(2)} (${latest.completeness.toFixed(1)}% complete)\n`);
    }
    
    // Compare performance
    const oldTime = 0; // Will be set from Test 1
    if (oldTime > 0) {
      const speedup = oldTime / newTime;
      console.log('Performance Comparison');
      console.log('-'.repeat(70));
      console.log(`📈 Speedup: ${speedup.toFixed(1)}x faster`);
      console.log(`⚡ Time saved: ${(oldTime - newTime).toFixed(2)}ms`);
      console.log(`💾 Old approach: Loaded all ${32} commodities × ~562 records = ~18K records`);
      console.log(`💾 New approach: Loaded only date range needed (~12-60 records per commodity)\n`);
    }
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}\n`);
  }
  
  console.log('='.repeat(70));
  console.log('✨ Tests complete!\n');
}

testCalculators().catch(console.error);
