# Spec 004: Production Volume Data & Chart

## Goal
Add annual world production data for all 32 commodities and display as a chart similar to the commodity price chart. This data also enables future production-based weighting.

## Current State
- Weights are equal (1/32 each) — placeholder
- No production data exists in the project
- Julie wants production-by-commodity chart + data sourcing documented on About page

## Data Sources

### Metals & Minerals (USGS Mineral Commodity Summaries)
Best free source for world mine/refinery production. Published annually.
- **URL:** https://www.usgs.gov/centers/national-minerals-information-center
- **Coverage:** Annual, typically 1900–present for major metals
- **Commodities:** gold, silver, iron, copper, aluminum, tin, lead, zinc, nickel, platinum, cement, sulphur

### Agricultural Products (FAOSTAT)
FAO's statistical database for world crop production.
- **URL:** https://www.fao.org/faostat/en/#data/QCL (Crops & Livestock)
- **API:** https://fenixservices.fao.org/faostat/api/v1/
- **Coverage:** Annual, 1961–present
- **Commodities:** rice, wheat, corn, barley, oats, rye, peanuts, soy-beans, coffee, cocoa, sugar, cotton, cotton-seed, jute, copra

### Energy (EIA)
- **URL:** https://www.eia.gov/opendata/
- **Commodities:** petroleum

### Animal Products & Others
- **tallow** — USDA or FAO (rendered fats)
- **rubber** — FAO or IRSG
- **wool** — FAO
- **hides** — FAO

## Data Format
```json
// src/data/production/{commodityId}.json
[
  {
    "year": 2023,
    "production": 3000,
    "unit": "metric-tons",
    "source": "usgs",
    "sourceId": "mineral-commodity-summaries-2024",
    "quality": "high"
  }
]
```

## Implementation Plan

### Step 1: Fetch Production Data
Create `scripts/fetch-production-data.ts` that:
1. Fetches FAOSTAT data via their API for agricultural commodities
2. Includes curated USGS data for metals (manual/scraped from summaries)
3. Writes to `src/data/production/{commodityId}.json`

### Step 2: Production API Route
`/api/production-timeseries?commodities=gold,wheat&startYear=1960&endYear=2023`

### Step 3: Production Chart on Homepage
- Third chart section below commodity price chart
- Same multi-select pattern (reuse CommoditySelector or new instance)
- Y-axis: production volume (normalized or raw)
- Since units differ wildly (troy ounces vs metric tons), normalize to baseline year like prices

### Step 4: Update About/Sources Page
Document where production data comes from for each commodity.

## Approach for Data Collection
Given API complexity, practical approach:
1. **FAOSTAT API** for agricultural products (has good REST API)
2. **Curated JSON** for metals from USGS (their data isn't easily API-accessible, but well-documented tables exist)
3. **EIA API** for petroleum
