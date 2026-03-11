#!/usr/bin/env npx tsx
/**
 * Fetch commodity price data from FRED (Federal Reserve Economic Data)
 * for commodities not available in the World Bank Pink Sheet.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

const FRED_API_KEY = process.env.FRED_API_KEY;
if (!FRED_API_KEY) {
  console.error('FRED_API_KEY environment variable required');
  process.exit(1);
}

const PRICES_DIR = path.join(__dirname, '..', 'src', 'data', 'prices');

interface FREDSeries {
  seriesId: string;
  commodityId: string;
  unit: string;
  // PPI series are index numbers, not actual prices.
  // We need a reference price to convert. null = already in USD price.
  type: 'price' | 'ppi';
  description: string;
}

const SERIES: FREDSeries[] = [
  {
    seriesId: 'PWOOLFUSDM',
    commodityId: 'wool',
    unit: 'usd/kilogram',
    type: 'price',
    description: 'Global price of Wool, Fine (IMF reports in US cents/kg — divide by 100)',
  },
  // Note: oats, rye, hides, tallow, cement are PPI (index numbers, not USD prices).
  // We'll fetch them but mark quality appropriately.
  {
    seriesId: 'WPU01220311',
    commodityId: 'oats',
    unit: 'index',
    type: 'ppi',
    description: 'PPI: Oats (index 1982=100)',
  },
  {
    seriesId: 'WPU012204',
    commodityId: 'rye',
    unit: 'index',
    type: 'ppi',
    description: 'PPI: Rye (index 1982=100)',
  },
  {
    seriesId: 'WPU041',
    commodityId: 'hides',
    unit: 'index',
    type: 'ppi',
    description: 'PPI: Hides, Skins, Leather (index 1982=100)',
  },
  {
    seriesId: 'PCU3116133116132',
    commodityId: 'tallow',
    unit: 'index',
    type: 'ppi',
    description: 'PPI: Rendering/Tallow (index)',
  },
  {
    seriesId: 'PCU3273132731',
    commodityId: 'cement',
    unit: 'index',
    type: 'ppi',
    description: 'PPI: Cement Manufacturing (index)',
  },
];

// Reference prices for PPI conversion (approximate USD price when PPI=100, base year ~1982)
// These allow us to convert PPI index values to approximate USD prices
const PPI_REFERENCE: Record<string, { basePrice: number; unit: string }> = {
  oats: { basePrice: 1.75, unit: 'usd/bushel' },        // ~$1.75/bushel in 1982
  rye: { basePrice: 2.50, unit: 'usd/bushel' },          // ~$2.50/bushel in 1982
  hides: { basePrice: 0.60, unit: 'usd/pound' },         // ~$0.60/lb in 1982
  tallow: { basePrice: 0.22, unit: 'usd/pound' },        // ~$0.22/lb in 1982
  cement: { basePrice: 55.0, unit: 'usd/metric-ton' },   // ~$55/ton in mid-1980s
};

function fetchJSON(url: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON: ${e}`));
        }
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

interface FREDObservation {
  date: string;
  value: string;
}

async function fetchSeries(series: FREDSeries): Promise<void> {
  console.log(`\nFetching ${series.commodityId} (${series.seriesId})...`);
  
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${series.seriesId}&api_key=${FRED_API_KEY}&file_type=json&observation_start=1900-01-01&frequency=m`;
  
  const data = await fetchJSON(url) as { observations?: FREDObservation[] };
  const observations = data.observations || [];
  
  console.log(`  Got ${observations.length} observations`);
  
  const pricePoints: Array<{
    date: string;
    price: number;
    unit: string;
    source: string;
    sourceId: string;
    quality: string;
    fetchedAt: string;
  }> = [];

  const ref = PPI_REFERENCE[series.commodityId];
  
  for (const obs of observations) {
    const val = parseFloat(obs.value);
    if (isNaN(val) || obs.value === '.') continue;
    
    let price: number;
    let unit: string;
    let quality: string;
    
    if (series.type === 'price') {
      // Direct USD price
      price = val;
      // PWOOLFUSDM is reported in US cents/kg by IMF — convert to USD
      if (series.seriesId === 'PWOOLFUSDM') {
        price = val / 100;
      }
      unit = series.unit;
      quality = 'high';
    } else if (ref) {
      // Convert PPI index to approximate USD price
      price = (val / 100) * ref.basePrice;
      unit = ref.unit;
      quality = 'medium'; // Converted from PPI, not direct price
    } else {
      // Raw index, can't convert
      price = val;
      unit = series.unit;
      quality = 'low';
    }
    
    pricePoints.push({
      date: obs.date,
      price: Math.round(price * 10000) / 10000, // 4 decimal places
      unit,
      source: 'fred',
      sourceId: series.seriesId,
      quality,
      fetchedAt: new Date().toISOString(),
    });
  }
  
  // Sort newest first (matching World Bank format)
  pricePoints.sort((a, b) => b.date.localeCompare(a.date));
  
  const outPath = path.join(PRICES_DIR, `${series.commodityId}.json`);
  
  // Backup existing file
  if (fs.existsSync(outPath)) {
    const backupPath = outPath + '.bak';
    fs.copyFileSync(outPath, backupPath);
    console.log(`  Backed up existing file to ${path.basename(backupPath)}`);
  }
  
  fs.writeFileSync(outPath, JSON.stringify(pricePoints, null, 2) + '\n');
  console.log(`  Wrote ${pricePoints.length} prices to ${path.basename(outPath)} (${series.type === 'ppi' ? 'converted from PPI' : 'direct price'})`);
}

async function main() {
  console.log('Fetching FRED commodity data...');
  console.log(`API Key: ${FRED_API_KEY?.slice(0, 4)}...`);
  console.log(`Output: ${PRICES_DIR}`);
  
  for (const series of SERIES) {
    try {
      await fetchSeries(series);
    } catch (err) {
      console.error(`  ERROR fetching ${series.commodityId}:`, err);
    }
  }
  
  console.log('\nDone! Commodities still needing data:');
  console.log('  - sulphur (no reliable modern FRED series)');
  console.log('  - jute (no FRED series)');
  console.log('  - cotton-seed (no direct FRED series)');
}

main().catch(console.error);
