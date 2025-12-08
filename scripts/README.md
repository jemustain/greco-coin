# Admin Scripts

This directory contains administrative scripts for managing Greco Coin data.

## Available Scripts

### 1. Data Validation (`validate-data.ts`)

Validates all commodity price data and greco values for completeness and quality.

**Usage:**
```bash
npm run script:validate
```

**What it checks:**
- ✅ JSON file structure
- ✅ Required fields present
- ✅ Data types correct
- ✅ Value ranges reasonable
- ✅ Date ranges and coverage
- ⚠️  Missing optional fields
- ⚠️  Data quality indicators

**Output:**
- Summary of all validated files
- Detailed errors and warnings
- Statistics (total records, date ranges)
- Exit code 0 for success, 1 for failure

---

### 2. Greco Calculation (`calculate-greco.ts`)

Regenerates `greco-values.json` from commodity prices and basket weights.

**Usage:**
```bash
npm run script:calculate
```

**Process:**
1. Loads basket weights from `src/data/basket-weights.json`
2. Loads all commodity prices from `src/data/prices/*.json`
3. Generates date range (1900-2025, quarterly before 1950, monthly after)
4. For each date, calculates weighted average of commodity prices
5. Tracks completeness (% of basket with available data)
6. Determines quality indicator (high/medium/low)
7. Saves results to `src/data/greco-values.json`

**Algorithm:**
- Finds closest price within 1 year for each commodity
- Multiplies price by basket weight
- Sums weighted prices
- Calculates completeness ratio
- Uses lowest quality indicator from contributing commodities

**Output:**
- Progress indicator
- Statistics (completeness, quality distribution)
- Total Greco values generated

---

### 3. Data Import (`import-prices.ts`)

Imports commodity price data from CSV files with validation.

**Usage:**
```bash
npm run script:import -- <csv-file> <commodity-id>
```

**Example:**
```bash
npm run script:import -- ./data/gold-prices.csv gold
```

**CSV Format:**

Required columns (case-insensitive):
- `date` - Date in YYYY-MM-DD format
- `price` - Price in USD (numeric)

Optional columns:
- `unit` - Unit of measurement (default: "unit")
- `source` - Source ID (default: "imported")
- `quality` - Quality indicator: high/medium/low (default: "medium")

**Example CSV:**
```csv
date,price,unit,source,quality
2024-01-01,2050.00,troy-ounce,usgs-metals,high
2024-02-01,2080.50,troy-ounce,usgs-metals,high
```

**Process:**
1. Parses CSV file
2. Validates each row
3. Converts to CommodityPrice format
4. Sorts by date
5. Saves to `src/data/prices/<commodity-id>.json`

**Output:**
- Parsing statistics
- Conversion results (records imported, rows skipped)
- Data statistics (date range, price range)
- Next steps recommendation

---

## Workflow

### Adding New Commodity Data

1. **Prepare CSV file** with columns: date, price, unit, source, quality
2. **Import data:**
   ```bash
   npm run script:import -- ./my-data.csv wheat
   ```
3. **Validate:**
   ```bash
   npm run script:validate
   ```
4. **Recalculate Greco values:**
   ```bash
   npm run script:calculate
   ```
5. **Validate again:**
   ```bash
   npm run script:validate
   ```

### Updating Existing Data

1. **Edit JSON files** in `src/data/prices/`
2. **Validate changes:**
   ```bash
   npm run script:validate
   ```
3. **Recalculate if needed:**
   ```bash
   npm run script:calculate
   ```

### Regular Maintenance

Run validation periodically to ensure data integrity:
```bash
npm run script:validate
```

---

## Package.json Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "script:validate": "ts-node scripts/validate-data.ts",
    "script:calculate": "ts-node scripts/calculate-greco.ts",
    "script:import": "ts-node scripts/import-prices.ts"
  }
}
```

---

## Data Files Structure

```
src/data/
├── basket-weights.json      # Commodity weights (e.g., 1/32 each)
├── greco-values.json         # Calculated Greco values (generated)
├── prices/
│   ├── gold.json            # Gold price history
│   ├── wheat.json           # Wheat price history
│   ├── ...                  # Other commodities
└── ...
```

---

## Troubleshooting

### Import fails with "invalid row"
- Check CSV format matches expected columns
- Ensure dates are in YYYY-MM-DD format
- Verify prices are numeric (no commas or currency symbols)

### Calculation produces low completeness
- Check that all 32 commodities have price data
- Verify date ranges overlap with calculation period
- Ensure prices are within 1 year of calculation dates

### Validation reports errors
- Review error messages for specific issues
- Fix data files and re-run validation
- Common issues: missing fields, invalid dates, out-of-range values

---

## Notes

- Scripts use TypeScript and require `ts-node`
- All paths are relative to project root
- Scripts exit with code 0 on success, 1 on failure
- Backup data files before running calculation or import scripts
- Validation is non-destructive (read-only)

---

## Future Enhancements

- [ ] Support for multiple currencies in calculation
- [ ] Automated data fetching from APIs
- [ ] Historical data gap filling algorithms
- [ ] Data quality scoring system
- [ ] Export to other formats (Excel, SQL)
