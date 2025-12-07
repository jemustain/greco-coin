# Data Structure Contracts

**Feature**: Greco Historical Currency Tracker  
**Purpose**: Define JSON schemas for all data files and API responses

---

## JSON File Schemas

### commodities.json

Master list of all 32 commodities.

```typescript
interface CommoditiesFile {
  version: string;               // Schema version (e.g., "1.0.0")
  lastUpdated: string;          // ISO 8601 timestamp
  commodities: Commodity[];
}

interface Commodity {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  category: CommodityCategory;   // Classification
  unit: string;                  // Unit ID (references units.json)
  symbol: string;                // Unit symbol for display
  description: string;           // Brief description
  inceptionDate: string;         // ISO 8601 date
  metadata?: {
    casNumber?: string;
    alternateNames?: string[];
    alternateUnits?: string[];   // For dual-unit commodities
  };
}

enum CommodityCategory {
  Metals = "Metals",
  Energy_Materials = "Energy_Materials",
  Agricultural_Grains = "Agricultural_Grains",
  Agricultural_Products = "Agricultural_Products",
  Fibers = "Fibers",
  Animal_Products = "Animal_Products"
}
```

**File Location**: `data/commodities.json`

**Example**:
```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-12-06T00:00:00Z",
  "commodities": [
    {
      "id": "gold",
      "name": "Gold",
      "category": "Metals",
      "unit": "troy-ounce",
      "symbol": "oz t",
      "description": "Precious metal used in jewelry, electronics, and as a store of value",
      "inceptionDate": "1800-01-01",
      "metadata": {
        "casNumber": "7440-57-5",
        "alternateNames": ["Au"]
      }
    }
  ]
}
```

---

### currencies.json

Master list of 9 tracked currencies/assets.

```typescript
interface CurrenciesFile {
  version: string;
  lastUpdated: string;
  currencies: Currency[];
}

interface Currency {
  id: string;                    // ISO code or identifier
  name: string;                  // Full name
  symbol: string;                // Display symbol
  type: "fiat" | "crypto" | "precious-metal";
  inceptionDate: string;         // ISO 8601 date
  terminationDate?: string;      // ISO 8601 date (if discontinued)
  metadata: {
    isoCode?: string;            // ISO 4217 for fiat
    decimalPlaces: number;       // Precision
    country?: string;            // For fiat currencies
    region?: string;             // e.g., "Eurozone" for EUR
  };
}
```

**File Location**: `data/currencies.json`

**Example**:
```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-12-06T00:00:00Z",
  "currencies": [
    {
      "id": "USD",
      "name": "United States Dollar",
      "symbol": "$",
      "type": "fiat",
      "inceptionDate": "1900-01-01",
      "metadata": {
        "isoCode": "USD",
        "decimalPlaces": 2,
        "country": "United States"
      }
    },
    {
      "id": "BTC",
      "name": "Bitcoin",
      "symbol": "₿",
      "type": "crypto",
      "inceptionDate": "2009-01-03",
      "metadata": {
        "decimalPlaces": 8
      }
    }
  ]
}
```

---

### prices/[commodity-id].json

Historical price data for each commodity (32 files total).

```typescript
interface CommodityPricesFile {
  version: string;
  commodity: {
    id: string;
    name: string;
    unit: string;
  };
  lastUpdated: string;
  pricePoints: CommodityPricePoint[];
}

interface CommodityPricePoint {
  date: string;                  // ISO 8601 date
  priceUSD: number;             // Price in US Dollars
  granularity: "annual" | "monthly";
  dataQuality: DataQualityIndicator;
  sourceId: string;             // References data-sources.json
  notes?: string;
}

interface DataQualityIndicator {
  confidence: "high" | "medium" | "low";
  flags: string[];              // Array of DataQualityFlag values
  derivationMethod?: "measured" | "interpolated" | "estimated";
}
```

**File Location**: `data/prices/gold.json`, `data/prices/wheat.json`, etc.

**Example**:
```json
{
  "version": "1.0.0",
  "commodity": {
    "id": "gold",
    "name": "Gold",
    "unit": "troy-ounce"
  },
  "lastUpdated": "2025-12-06T00:00:00Z",
  "pricePoints": [
    {
      "date": "1950-01-01",
      "priceUSD": 34.77,
      "granularity": "annual",
      "dataQuality": {
        "confidence": "high",
        "flags": ["historical-uncertainty"],
        "derivationMethod": "measured"
      },
      "sourceId": "usgs-minerals-1950"
    },
    {
      "date": "1951-01-01",
      "priceUSD": 35.00,
      "granularity": "monthly",
      "dataQuality": {
        "confidence": "high",
        "flags": [],
        "derivationMethod": "measured"
      },
      "sourceId": "lbma-gold-prices"
    }
  ]
}
```

---

### exchange-rates.json

Historical currency exchange rates.

```typescript
interface ExchangeRatesFile {
  version: string;
  lastUpdated: string;
  baseCurrency: string;          // Always "USD" for simplicity
  exchangeRates: ExchangeRatePoint[];
}

interface ExchangeRatePoint {
  date: string;                  // ISO 8601 date
  targetCurrency: string;        // Currency ID
  rate: number;                  // Target currency per 1 USD
  granularity: "annual" | "monthly";
  sourceId: string;
}
```

**File Location**: `data/exchange-rates.json`

**Example**:
```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-12-06T00:00:00Z",
  "baseCurrency": "USD",
  "exchangeRates": [
    {
      "date": "1950-01-01",
      "targetCurrency": "GBP",
      "rate": 0.357,
      "granularity": "annual",
      "sourceId": "imf-exchange-rates"
    }
  ]
}
```

---

### greco-values.json

Pre-calculated Greco unit values (generated by admin scripts).

```typescript
interface GrecoValuesFile {
  version: string;
  lastUpdated: string;
  basketWeightVersion: string;   // e.g., "1.0.0"
  grecoValues: GrecoValuePoint[];
}

interface GrecoValuePoint {
  date: string;                  // ISO 8601 date
  currency: string;              // Currency ID
  value: number;                 // Cost of Greco basket
  granularity: "annual" | "monthly";
  calculationMetadata: {
    completenessRatio: number;   // 0.0-1.0
    missingCommodities: string[]; // IDs of missing data
  };
  calculatedAt: string;          // ISO 8601 timestamp
}
```

**File Location**: `data/greco-values.json`

**Example**:
```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-12-06T00:00:00Z",
  "basketWeightVersion": "1.0.0",
  "grecoValues": [
    {
      "date": "1950-01-01",
      "currency": "USD",
      "value": 1234.56,
      "granularity": "annual",
      "calculationMetadata": {
        "completenessRatio": 0.95,
        "missingCommodities": ["jute"]
      },
      "calculatedAt": "2025-12-06T10:00:00Z"
    }
  ]
}
```

---

### basket-weights.json

Commodity weighting schemes for Greco calculation.

```typescript
interface BasketWeightsFile {
  version: string;
  lastUpdated: string;
  weightSchemes: WeightScheme[];
}

interface WeightScheme {
  version: string;               // e.g., "1.0.0"
  effectiveDate: string;         // ISO 8601 date
  expirationDate?: string;       // ISO 8601 date (if superseded)
  rationale: string;             // Why these weights
  sourceReference: string;       // Citation to Tom Greco's work
  weights: CommodityWeight[];
}

interface CommodityWeight {
  commodityId: string;
  weight: number;                // 0.0-1.0 (all sum to 1.0)
}
```

**File Location**: `data/basket-weights.json`

**Example**:
```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-12-06T00:00:00Z",
  "weightSchemes": [
    {
      "version": "1.0.0",
      "effectiveDate": "1900-01-01",
      "rationale": "Equal weighting placeholder pending Tom Greco methodology analysis",
      "sourceReference": "The End of Money and the Future of Civilization (2009) - TBD specific page",
      "weights": [
        { "commodityId": "gold", "weight": 0.03125 },
        { "commodityId": "silver", "weight": 0.03125 }
      ]
    }
  ]
}
```

---

### data-sources.json

Documentation of all data sources.

```typescript
interface DataSourcesFile {
  version: string;
  lastUpdated: string;
  sources: DataSource[];
}

interface DataSource {
  id: string;                    // Unique identifier
  name: string;                  // Organization name
  type: "government" | "exchange" | "academic" | "commercial";
  url?: string;                  // Online source
  citation: string;              // Full bibliographic citation
  reliability: "high" | "medium" | "low";
  coverage: {
    commodities?: string[];      // Commodity IDs
    currencies?: string[];       // Currency IDs
    dateRange: {
      start: string;             // ISO 8601 date
      end: string;               // ISO 8601 date
    };
  };
  accessMethod: string;
  notes?: string;
  lastVerified: string;          // ISO 8601 date
}
```

**File Location**: `data/data-sources.json`

**Example**:
```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-12-06T00:00:00Z",
  "sources": [
    {
      "id": "usgs-minerals-1900-1950",
      "name": "United States Geological Survey Minerals Yearbook",
      "type": "government",
      "url": "https://www.usgs.gov/centers/national-minerals-information-center/historical-statistics",
      "citation": "USGS, Minerals Yearbook (various years), 1900-1950",
      "reliability": "high",
      "coverage": {
        "commodities": ["gold", "silver", "copper", "iron"],
        "dateRange": {
          "start": "1900-01-01",
          "end": "1950-12-31"
        }
      },
      "accessMethod": "Manual extraction from PDF archives",
      "lastVerified": "2025-12-06"
    }
  ]
}
```

---

### units.json

Unit of measure definitions and conversion factors.

```typescript
interface UnitsFile {
  version: string;
  lastUpdated: string;
  units: UnitOfMeasure[];
}

interface UnitOfMeasure {
  id: string;                    // e.g., "troy-ounce"
  name: string;                  // Full name
  symbol: string;                // Display symbol
  type: "mass" | "volume" | "energy";
  baseConversion?: {
    toMetricTon: number;         // Conversion factor
    formula?: string;            // For commodity-specific conversions
  };
  aliases: string[];
}
```

**File Location**: `data/units.json`

**Example**:
```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-12-06T00:00:00Z",
  "units": [
    {
      "id": "troy-ounce",
      "name": "Troy Ounce",
      "symbol": "oz t",
      "type": "mass",
      "baseConversion": {
        "toMetricTon": 0.00003110348,
        "formula": "1 oz t = 31.1034768 grams"
      },
      "aliases": ["ozt", "troy oz"]
    },
    {
      "id": "bushel",
      "name": "Bushel",
      "symbol": "bu",
      "type": "volume",
      "baseConversion": {
        "formula": "Varies by commodity: Wheat=60lb, Corn=56lb, Barley=48lb"
      },
      "aliases": ["bu"]
    }
  ]
}
```

---

## API Response Schemas

### GET /api/greco-values

Query Greco unit values with filters.

**Query Parameters**:
```typescript
interface GrecoValuesQuery {
  currencies?: string;           // Comma-separated currency IDs
  startDate?: string;            // ISO 8601 date
  endDate?: string;              // ISO 8601 date
  granularity?: "annual" | "monthly" | "both";
}
```

**Response**:
```typescript
interface GrecoValuesResponse {
  data: GrecoValuePoint[];
  metadata: {
    totalRecords: number;
    currencies: string[];
    dateRange: {
      start: string;
      end: string;
    };
  };
}
```

---

### GET /api/commodities

List all commodities with optional filtering.

**Query Parameters**:
```typescript
interface CommoditiesQuery {
  category?: string;             // Filter by category
}
```

**Response**:
```typescript
interface CommoditiesResponse {
  data: Commodity[];
  metadata: {
    totalRecords: number;
    categories: string[];
  };
}
```

---

## Validation Schemas (Zod)

**TypeScript validation using Zod**:

```typescript
import { z } from 'zod';

export const CommoditySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(100),
  category: z.enum(["Metals", "Energy_Materials", "Agricultural_Grains", 
                    "Agricultural_Products", "Fibers", "Animal_Products"]),
  unit: z.string(),
  symbol: z.string(),
  description: z.string(),
  inceptionDate: z.string().datetime(),
  metadata: z.object({
    casNumber: z.string().optional(),
    alternateNames: z.array(z.string()).optional(),
    alternateUnits: z.array(z.string()).optional()
  }).optional()
});

export const PricePointSchema = z.object({
  date: z.string().datetime(),
  priceUSD: z.number().positive(),
  granularity: z.enum(["annual", "monthly"]),
  dataQuality: z.object({
    confidence: z.enum(["high", "medium", "low"]),
    flags: z.array(z.string()),
    derivationMethod: z.enum(["measured", "interpolated", "estimated"]).optional()
  }),
  sourceId: z.string(),
  notes: z.string().optional()
});
```

---

**Contract Version**: 1.0.0  
**Last Updated**: 2025-12-06  
**Status**: Draft - Ready for Implementation
