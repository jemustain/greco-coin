# Data Model

**Feature**: Greco Historical Currency Tracker  
**Date**: 2025-12-06  
**Phase**: 1 - Entity Design & Relationships

## Overview

This document defines all entities, their attributes, relationships, validation rules, and state transitions for the Greco Historical Currency Tracker. The model supports 32 commodities, 9 currencies/assets, and ~37,000 historical price points spanning 1900-2025.

---

## Core Entities

### 1. Commodity

Represents a physical commodity in the Greco basket (32 total).

**Attributes**:
```typescript
interface Commodity {
  id: string;                    // Unique identifier (e.g., "gold", "wheat", "petroleum")
  name: string;                  // Display name (e.g., "Gold", "Wheat", "Petroleum")
  category: CommodityCategory;   // Classification
  unit: UnitOfMeasure;          // Standard measurement unit
  symbol: string;               // Unit symbol (e.g., "oz t", "bu", "tonne")
  description: string;          // Brief description
  inceptionDate: Date;          // When commodity trading began (typically pre-1900)
  metadata: {
    casNumber?: string;         // Chemical Abstracts Service number (if applicable)
    alternateNames: string[];   // Historical or regional name variations
    physicalProperties?: object; // Density, etc. for conversions
  };
}
```

**Validation Rules**:
- `id` MUST be unique, lowercase, alphanumeric with hyphens
- `name` MUST be non-empty, max 100 characters
- `category` MUST be one of defined categories
- `unit` MUST be one of supported units
- `inceptionDate` MUST be before 2000-01-01 (all commodities well-established)

**Relationships**:
- 1 Commodity → Many CommodityPricePoints
- 1 Commodity → 1 BasketWeight
- 1 Commodity → Many DataSources

---

### 2. CommodityCategory

Classification of commodities into logical groups.

**Enum Values**:
```typescript
enum CommodityCategory {
  METALS = "Metals",                          // 10 commodities
  ENERGY_MATERIALS = "Energy_Materials",      // 4 commodities
  AGRICULTURAL_GRAINS = "Agricultural_Grains",// 6 commodities
  AGRICULTURAL_PRODUCTS = "Agricultural_Products", // 6 commodities
  FIBERS = "Fibers",                          // 3 commodities
  ANIMAL_PRODUCTS = "Animal_Products"         // 3 commodities
}
```

**Purpose**: UI grouping, filtering, analysis by sector

---

### 3. UnitOfMeasure

Standard measurement units with conversion factors.

**Attributes**:
```typescript
interface UnitOfMeasure {
  id: string;                      // e.g., "troy-ounce", "metric-ton", "bushel"
  name: string;                    // Full name
  symbol: string;                  // Display symbol (oz t, tonne, bu)
  type: UnitType;                  // Mass, volume, count
  baseConversion?: {
    toMetricTon: number;          // Conversion factor to standard base unit
    formula?: string;             // For commodity-specific conversions (e.g., bushel varies)
  };
  aliases: string[];              // Alternative names
}
```

**Supported Units** (from basket-commodities.csv):
- Troy Ounce (oz t): 3 commodities
- Metric Ton (tonne): 17 commodities  
- Bushel (bu): 7 commodities
- Pound (lb): 3 commodities
- Kilogram (kg): 2 commodities
- Barrel (bbl): 1 commodity
- Hundredweight (cwt): 1 commodity (dual unit)

**Validation Rules**:
- `baseConversion.toMetricTon` MUST be positive number
- Bushel conversions MUST specify commodity (varies by density)

---

### 4. CommodityPricePoint

Historical price data for a specific commodity at a specific date.

**Attributes**:
```typescript
interface CommodityPricePoint {
  commodityId: string;           // Foreign key to Commodity
  date: Date;                    // ISO 8601 date
  priceUSD: number;             // Price in US Dollars (base currency)
  unit: string;                 // Unit of measure for this price
  granularity: "annual" | "monthly" | "daily";
  dataQuality: DataQualityIndicator;
  sourceId: string;             // Foreign key to DataSource
  notes?: string;               // Any anomalies or context
  calculatedFields?: {
    normalizedPrice?: number;   // Converted to standard unit if needed
    inflationAdjusted?: number; // Future enhancement
  };
}
```

**Validation Rules**:
- `date` MUST be between 1900-01-01 and current date
- `priceUSD` MUST be positive number, reasonable range (e.g., gold < $100k/oz)
- `date` + `commodityId` + `granularity` form composite unique key
- `granularity` = "annual" for dates 1900-01-01 to 1950-12-31
- `granularity` = "monthly" for dates 1951-01-01 to present
- `sourceId` MUST reference existing DataSource

**Relationships**:
- Many CommodityPricePoints → 1 Commodity
- Many CommodityPricePoints → 1 DataSource

**Lifecycle**:
- Historical data (pre-current month): Immutable
- Current month: Updateable until month closes
- Future dates: Not allowed

---

### 5. Currency

Fiat currencies or assets tracked for comparison.

**Attributes**:
```typescript
interface Currency {
  id: string;                    // ISO code or identifier (USD, EUR, BTC, GOLD, SILVER)
  name: string;                  // Full name
  symbol: string;                // Display symbol ($, €, ₿, Au, Ag)
  type: "fiat" | "crypto" | "precious-metal";
  inceptionDate: Date;          // When currency/asset began trading
  terminationDate?: Date;       // If currency no longer exists
  metadata: {
    isoCode?: string;           // ISO 4217 for fiat
    decimalPlaces: number;      // Precision (2 for USD, 8 for BTC)
    country?: string;           // For fiat currencies
  };
}
```

**Tracked Currencies** (9 total):
- USD (1900+), GBP (1900+), CNY (1900+), RUB (1900+), INR (1900+)
- EUR (1999+), BTC (2009+)
- Gold (1900+), Silver (1900+)

**Validation Rules**:
- `id` MUST be unique, uppercase
- `inceptionDate` MUST be historical fact
- `type` MUST match asset classification
- EUR `inceptionDate` = 1999-01-01
- BTC `inceptionDate` = 2009-01-03

---

### 6. CurrencyExchangeRate

Exchange rates between currencies at specific dates.

**Attributes**:
```typescript
interface CurrencyExchangeRate {
  baseCurrencyId: string;        // Base currency (typically USD)
  targetCurrencyId: string;      // Target currency
  date: Date;                    // ISO 8601 date
  rate: number;                  // Exchange rate (target per 1 base)
  granularity: "annual" | "monthly" | "daily";
  sourceId: string;              // Foreign key to DataSource
  calculationMethod?: "direct" | "triangulated"; // If calculated via USD
}
```

**Validation Rules**:
- `rate` MUST be positive number
- `date` MUST be ≥ later of two currencies' inception dates
- `date` + `baseCurrencyId` + `targetCurrencyId` + `granularity` = unique key
- Cannot have EUR exchange rates before 1999-01-01
- Cannot have BTC exchange rates before 2009-01-03

**Relationships**:
- Many CurrencyExchangeRates → 1 Currency (base)
- Many CurrencyExchangeRates → 1 Currency (target)
- Many CurrencyExchangeRates → 1 DataSource

---

### 7. BasketWeight

Weighting of each commodity in the Greco unit calculation.

**Attributes**:
```typescript
interface BasketWeight {
  commodityId: string;           // Foreign key to Commodity
  weight: number;                // 0.0 to 1.0 (all weights sum to 1.0)
  effectiveDate: Date;           // When this weighting became effective
  expirationDate?: Date;         // When replaced by new weighting (if changed)
  rationale: string;             // Why this weight (Tom Greco's methodology)
  sourceReference: string;       // Citation to Greco's work
  version: number;               // Weighting scheme version
}
```

**Validation Rules**:
- `weight` MUST be 0.0 < weight ≤ 1.0
- SUM of all `weight` for same `effectiveDate` MUST equal 1.0
- `rationale` MUST be non-empty (transparency requirement)
- `sourceReference` MUST cite specific page/section

**Relationships**:
- Many BasketWeights → 1 Commodity
- 32 BasketWeights per version (one per commodity)

**State Transitions**:
- Created: Initial weighting scheme established
- Updated: New version created with new effectiveDate
- Expired: expirationDate set when new version created

---

### 8. GrecoValue

Calculated value of 1 Greco unit in a specific currency at a specific date.

**Attributes**:
```typescript
interface GrecoValue {
  currencyId: string;            // Currency for this Greco value
  date: Date;                    // Calculation date
  value: number;                 // Cost of Greco basket in this currency
  granularity: "annual" | "monthly";
  basketWeightVersion: number;   // Which weighting scheme used
  calculationMetadata: {
    commodityPricesUsed: { [commodityId: string]: number }; // Audit trail
    missingData: string[];       // Commodities with gaps
    completenessRatio: number;   // 0.0-1.0, what % of basket priced
  };
  calculatedAt: Date;            // Timestamp of calculation
}
```

**Validation Rules**:
- `value` MUST be positive number
- `date` + `currencyId` + `granularity` = unique key
- `calculationMetadata.completenessRatio` MUST be ≥ 0.80 (80% requirement from SC-005)
- Cannot calculate Greco for date before all required commodity prices available

**Calculation Formula**:
```
GrecoValue(currency, date) = Σ(weight[i] × commodityPrice[i](currency, date))
  where i = 1 to 32 commodities
```

**Relationships**:
- Many GrecoValues → 1 Currency
- 1 GrecoValue → Many CommodityPricePoints (via calculation)

---

### 9. DataSource

Documentation of where historical data originates.

**Attributes**:
```typescript
interface DataSource {
  id: string;                    // Unique identifier
  name: string;                  // Organization/publication name
  type: "government" | "exchange" | "academic" | "commercial";
  url?: string;                  // Online source URL
  citation: string;              // Full bibliographic citation
  reliability: "high" | "medium" | "low";
  coverage: {
    commodities?: string[];      // Which commodities covered
    currencies?: string[];       // Which currencies covered
    dateRange: { start: Date; end: Date };
  };
  accessMethod: string;          // How data was obtained
  notes?: string;                // Limitations, caveats
  lastVerified: Date;           // When source last checked
}
```

**Validation Rules**:
- `citation` MUST be complete bibliographic reference
- `reliability` rating MUST be justified in notes
- `coverage.dateRange` MUST be accurate to source
- `url` MUST be valid HTTPS URL if provided

**Relationships**:
- 1 DataSource → Many CommodityPricePoints
- 1 DataSource → Many CurrencyExchangeRates

---

### 10. DataQualityIndicator

Metadata about confidence in a data point.

**Attributes**:
```typescript
interface DataQualityIndicator {
  confidence: "high" | "medium" | "low";
  flags: DataQualityFlag[];
  derivationMethod?: "measured" | "interpolated" | "estimated" | "extrapolated";
  lastValidated?: Date;
}

enum DataQualityFlag {
  MISSING_DATA = "missing-data",           // Gap in time series
  OUTLIER = "outlier",                     // Statistical anomaly
  ESTIMATED = "estimated",                 // Not directly measured
  SPARSE_DATA = "sparse-data",             // Low frequency for period
  SOURCE_CONFLICT = "source-conflict",     // Multiple sources disagree
  UNIT_CONVERSION = "unit-conversion",     // Converted from different unit
  HISTORICAL_UNCERTAINTY = "historical-uncertainty" // Pre-1950 data less reliable
}
```

**Usage**:
- Visual indicators in charts (different colors, icons)
- Filtering options for users
- Transparency about data limitations

---

## Derived Entities

### 11. TimeSeriesDataPoint

UI-friendly format for chart rendering.

**Attributes**:
```typescript
interface TimeSeriesDataPoint {
  date: Date;                    // X-axis value
  value: number;                 // Y-axis value (Greco or price)
  currencyId?: string;           // For multi-currency charts
  commodityId?: string;          // For commodity price charts
  quality: DataQualityIndicator;
  tooltip?: string;              // Pre-formatted tooltip text
}
```

**Purpose**: Optimized for Recharts consumption

---

### 12. PivotTableData

Reorganized data for pivot table views.

**Attributes**:
```typescript
interface PivotTableData {
  rowKeys: string[];             // e.g., years or currency IDs
  columnKeys: string[];          // e.g., currency IDs or years
  cells: { [row: string]: { [col: string]: number } };
  metadata: {
    pivotBy: "year" | "currency" | "commodity";
    granularity: string;
  };
}
```

**Purpose**: Support FR-010 pivot functionality

---

## Relationships Diagram

```
Commodity ───┬─→ CommodityPricePoint ─→ DataSource
             │
             └─→ BasketWeight
             
Currency ────┬─→ CurrencyExchangeRate ─→ DataSource
             │
             └─→ GrecoValue
             
GrecoValue ──→ (calculated from) CommodityPricePoint
```

---

## Data Validation Rules Summary

### Data Integrity (Constitutional Principle I)

1. **Source Attribution**: Every price point MUST have valid sourceId
2. **Range Validation**: Prices MUST be within reasonable bounds (configurable per commodity)
3. **Date Validation**: No future dates, respect currency inception dates
4. **Completeness**: Greco calculation requires ≥ 80% commodity data
5. **Audit Trail**: calculationMetadata preserves inputs for reproducibility

### Data Quality Flags

| Flag | Trigger | Impact |
|------|---------|--------|
| MISSING_DATA | Gap > 2 months (1950+) or > 2 years (pre-1950) | Show gap in chart |
| OUTLIER | ±3 standard deviations from trend | Visual indicator |
| ESTIMATED | derivationMethod = "estimated" | Lower confidence |
| SOURCE_CONFLICT | Multiple sources differ >10% | Manual review needed |
| HISTORICAL_UNCERTAINTY | Date < 1950-01-01 | Acknowledge uncertainty |

---

## Storage Schema

### JSON File Structure

**commodities/gold.json**:
```json
{
  "commodity": {
    "id": "gold",
    "name": "Gold",
    "category": "Metals",
    "unit": "troy-ounce",
    "symbol": "oz t"
  },
  "pricePoints": [
    {
      "date": "1900-01-01",
      "priceUSD": 20.67,
      "granularity": "annual",
      "dataQuality": { "confidence": "medium", "flags": ["historical-uncertainty"] },
      "sourceId": "usgs-minerals-1900-1950"
    }
  ]
}
```

### SQLite Schema (Admin Tools)

```sql
CREATE TABLE commodities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  symbol TEXT NOT NULL,
  metadata TEXT -- JSON
);

CREATE TABLE commodity_price_points (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  commodity_id TEXT NOT NULL,
  date TEXT NOT NULL, -- ISO 8601
  price_usd REAL NOT NULL,
  granularity TEXT NOT NULL,
  source_id TEXT NOT NULL,
  data_quality TEXT, -- JSON
  UNIQUE(commodity_id, date, granularity),
  FOREIGN KEY(commodity_id) REFERENCES commodities(id)
);

CREATE TABLE currencies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  type TEXT NOT NULL,
  inception_date TEXT NOT NULL,
  metadata TEXT -- JSON
);

-- Additional tables for exchange_rates, basket_weights, data_sources...
```

---

## Migration & Versioning

**Basket Weight Versions**:
- v1.0: Initial equal weights (placeholder until Greco methodology determined)
- v2.0: Greco-specified weights (when available)
- Future: Allow users to define custom baskets

**Data Format Versions**:
- Include `schemaVersion` in all JSON files
- Admin scripts check version compatibility
- Migration scripts for format changes

---

**Data Model Complete**: All entities, relationships, and validation rules defined. Ready for contract design and quickstart guide.
