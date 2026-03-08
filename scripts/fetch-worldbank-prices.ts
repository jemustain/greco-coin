#!/usr/bin/env npx tsx
/**
 * Fetch real commodity price data from the World Bank Pink Sheet (CMO Historical Data Monthly).
 * Downloads the Excel file, parses it, maps to our commodity IDs, and writes JSON files.
 */

import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

const PINK_SHEET_URL = 'https://thedocs.worldbank.org/en/doc/5d903e848db1d1b83e0ec8f744e55570-0350012021/related/CMO-Historical-Data-Monthly.xlsx';
const TMP_DIR = path.join(__dirname, 'tmp');
const PRICES_DIR = path.join(__dirname, '..', 'src', 'data', 'prices');
const XLSX_PATH = path.join(TMP_DIR, 'CMO-Historical-Data-Monthly.xlsx');

// Map: our commodity ID -> { col header substring, unit for output }
const COMMODITY_MAP: Record<string, { match: string; unit: string; colIndex?: number }> = {
  'gold':      { match: 'Gold', unit: 'usd/troy-ounce' },
  'silver':    { match: 'Silver', unit: 'usd/troy-ounce' },
  'platinum':  { match: 'Platinum', unit: 'usd/troy-ounce' },
  'iron':      { match: 'Iron ore', unit: 'usd/dry-metric-ton' },
  'copper':    { match: 'Copper', unit: 'usd/metric-ton' },
  'aluminum':  { match: 'Aluminum', unit: 'usd/metric-ton' },
  'tin':       { match: 'Tin', unit: 'usd/metric-ton' },
  'lead':      { match: 'Lead', unit: 'usd/metric-ton' },
  'zinc':      { match: 'Zinc', unit: 'usd/metric-ton' },
  'nickel':    { match: 'Nickel', unit: 'usd/metric-ton' },
  'petroleum': { match: 'Crude oil, WTI', unit: 'usd/barrel' },
  'rubber':    { match: 'Rubber, TSR20', unit: 'usd/kilogram' },
  'rice':      { match: 'Rice, Thai 5%', unit: 'usd/metric-ton' },
  'wheat':     { match: 'Wheat, US HRW', unit: 'usd/metric-ton' },
  'corn':      { match: 'Maize', unit: 'usd/metric-ton' },
  'barley':    { match: 'Barley', unit: 'usd/metric-ton' },
  'peanuts':   { match: 'Groundnuts', unit: 'usd/metric-ton' },
  'soy-beans': { match: 'Soybeans', unit: 'usd/metric-ton' },
  'coffee':    { match: 'Coffee, Arabica', unit: 'usd/kilogram' },
  'cocoa':     { match: 'Cocoa', unit: 'usd/kilogram' },
  'sugar':     { match: 'Sugar, world', unit: 'usd/kilogram' },
  'cotton':    { match: 'Cotton, A Index', unit: 'usd/kilogram' },
  'wool':      { match: 'N/A', unit: 'usd/kilogram' }, // Not in Pink Sheet
  'hides':     { match: 'N/A', unit: 'usd/kilogram' }, // Not in Pink Sheet
  'copra':     { match: 'Coconut oil', unit: 'usd/metric-ton' }, // Closest proxy
};

// Commodities NOT available in Pink Sheet
const NOT_AVAILABLE = ['cement', 'sulphur', 'cotton-seed', 'tallow', 'jute', 'oats', 'rye', 'wool', 'hides'];

function download(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const get = url.startsWith('https') ? https.get : http.get;
    get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return download(response.headers.location!, dest).then(resolve).catch(reject);
      }
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (err) => { fs.unlinkSync(dest); reject(err); });
  });
}

function parseDate(dateStr: string): string | null {
  // Format: "1960M01" -> "1960-01-01"
  const m = dateStr.match(/^(\d{4})M(\d{2})$/);
  if (!m) return null;
  return `${m[1]}-${m[2]}-01`;
}

interface PriceEntry {
  date: string;
  price: number;
  unit: string;
  quality: string;
  source: string;
  sourceId: string;
  fetchedAt: string;
}

async function main() {
  fs.mkdirSync(TMP_DIR, { recursive: true });
  fs.mkdirSync(PRICES_DIR, { recursive: true });

  // Download if not cached
  if (!fs.existsSync(XLSX_PATH)) {
    console.log('Downloading Pink Sheet...');
    await download(PINK_SHEET_URL, XLSX_PATH);
  } else {
    console.log('Using cached Pink Sheet');
  }

  const wb = XLSX.readFile(XLSX_PATH);
  const ws = wb.Sheets['Monthly Prices'];
  const range = XLSX.utils.decode_range(ws['!ref']!);
  const fetchedAt = new Date().toISOString();

  // Build header map (row 4 has names)
  const headers: Map<number, string> = new Map();
  for (let c = 0; c <= range.e.c; c++) {
    const cell = ws[XLSX.utils.encode_cell({ r: 4, c })];
    if (cell?.v) headers.set(c, String(cell.v).trim());
  }

  // Match commodity columns
  for (const [id, cfg] of Object.entries(COMMODITY_MAP)) {
    if (cfg.match === 'N/A') continue;
    for (const [col, name] of headers) {
      if (name.startsWith(cfg.match)) {
        cfg.colIndex = col;
        break;
      }
    }
  }

  // Extract data
  const results: Record<string, PriceEntry[]> = {};
  const dataStartRow = 6; // First data row

  for (let r = dataStartRow; r <= range.e.r; r++) {
    const dateCell = ws[XLSX.utils.encode_cell({ r, c: 0 })];
    if (!dateCell?.v) continue;
    const date = parseDate(String(dateCell.v));
    if (!date) continue;

    for (const [id, cfg] of Object.entries(COMMODITY_MAP)) {
      if (cfg.colIndex === undefined) continue;
      const cell = ws[XLSX.utils.encode_cell({ r, c: cfg.colIndex })];
      if (!cell || cell.v === '…' || cell.v === '' || cell.v === undefined || cell.v === null) continue;
      const price = Number(cell.v);
      if (isNaN(price) || price <= 0) continue;

      if (!results[id]) results[id] = [];
      results[id].push({
        date,
        price: Math.round(price * 100) / 100,
        unit: cfg.unit,
        quality: 'high',
        source: 'worldbank',
        sourceId: 'CMO-Pink-Sheet',
        fetchedAt,
      });
    }
  }

  // Write files (sorted newest first)
  let totalWritten = 0;
  const coverage: { id: string; count: number; earliest: string; latest: string }[] = [];

  for (const [id, entries] of Object.entries(results)) {
    entries.sort((a, b) => b.date.localeCompare(a.date));
    const outPath = path.join(PRICES_DIR, `${id}.json`);
    fs.writeFileSync(outPath, JSON.stringify(entries, null, 2) + '\n');
    totalWritten++;
    coverage.push({
      id,
      count: entries.length,
      earliest: entries[entries.length - 1].date,
      latest: entries[0].date,
    });
    console.log(`  ${id}: ${entries.length} months (${entries[entries.length - 1].date} → ${entries[0].date}) latest: $${entries[0].price}`);
  }

  console.log(`\nWrote ${totalWritten} commodity files`);
  console.log(`\nNot available in Pink Sheet: ${NOT_AVAILABLE.join(', ')}`);

  // Sanity checks
  const gold = results['gold'];
  const oil = results['petroleum'];
  if (gold) {
    const latest = gold[0];
    console.log(`\n✓ Gold sanity: $${latest.price}/oz on ${latest.date}`);
  }
  if (oil) {
    const latest = oil[0];
    console.log(`✓ Oil sanity: $${latest.price}/bbl on ${latest.date}`);
  }
}

main().catch(console.error);
