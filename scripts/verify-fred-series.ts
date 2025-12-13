/**
 * Verify FRED series IDs for commodities
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import axios from 'axios';

const FRED_API_KEY = process.env.FRED_API_KEY;
const FRED_BASE = 'https://api.stlouisfed.org/fred';

async function searchFRED(searchTerm: string) {
  try {
    const response = await axios.get(`${FRED_BASE}/series/search`, {
      params: {
        search_text: searchTerm,
        api_key: FRED_API_KEY,
        file_type: 'json',
        limit: 10,
      },
    });
    
    return response.data.seriess || [];
  } catch (error) {
    console.error(`Error searching for "${searchTerm}":`, error instanceof Error ? error.message : String(error));
    return [];
  }
}

async function testSeries(seriesId: string) {
  try {
    const response = await axios.get(`${FRED_BASE}/series/observations`, {
      params: {
        series_id: seriesId,
        api_key: FRED_API_KEY,
        file_type: 'json',
        limit: 5,
        sort_order: 'desc',
      },
    });
    
    const obs = response.data.observations || [];
    if (obs.length > 0) {
      return {
        success: true,
        latest: obs[0],
        count: response.data.count,
      };
    }
    return { success: false };
  } catch (error: any) {
    return { success: false, error: error.response?.data || error.message };
  }
}

async function main() {
  console.log('='.repeat(70));
  console.log('FRED Series ID Verification');
  console.log('='.repeat(70));
  
  const commodities = [
    { name: 'Gold', search: 'gold price' },
    { name: 'Silver', search: 'silver price' },
    { name: 'Copper', search: 'copper price' },
    { name: 'Platinum', search: 'platinum price' },
    { name: 'Aluminum', search: 'aluminum price' },
    { name: 'Crude Oil', search: 'crude oil wti' },
    { name: 'Wheat', search: 'wheat price' },
    { name: 'Corn', search: 'corn price' },
  ];
  
  for (const commodity of commodities) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`${commodity.name}`);
    console.log('='.repeat(70));
    
    const results = await searchFRED(commodity.search);
    
    if (results.length === 0) {
      console.log('  No series found');
      continue;
    }
    
    console.log(`Found ${results.length} series:\n`);
    
    for (const series of results.slice(0, 5)) {
      const test = await testSeries(series.id);
      const status = test.success ? '✓' : '✗';
      const freq = series.frequency_short || '?';
      const dates = `${series.observation_start} to ${series.observation_end}`;
      
      console.log(`${status} ${series.id} [${freq}] ${dates}`);
      console.log(`  ${series.title}`);
      
      if (test.success && test.latest) {
        console.log(`  Latest: ${test.latest.date} = ${test.latest.value} (${test.count} total obs)`);
      }
      console.log('');
    }
  }
}

main();
