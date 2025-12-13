# Data Model: Real Commodity Data APIs & Performance Optimization

**Feature**: 002-real-data-api  
**Date**: 2025-12-07  
**Status**: Design Phase

## Overview

This document defines the data models, schemas, and entity relationships for the real commodity data API system. The design prioritizes **performance** (fast queries), **data integrity** (quality tracking), and **transparency** (clear provenance).

---

## Core Entities

### 1. CommodityPrice

**Purpose**: Represents a single price data point for a commodity at a specific date.

**Schema**:

```typescript
interface CommodityPrice {
  /** ISO 8601 date: "1975-02-01" */
  date: string;
  
  /** Price in USD, null if unavailable */
  price: number | null;
  
  /** Unit of measurement (e.g., "troy ounce", "metric ton") */
  unit: string;
  
  /** Data quality indicator */
  quality: QualityIndicator;
  
  /** Source of the data (e.g., "FRED", "World Bank", "USGS", "Manual") */
  source?: string;
  
  /** Original source identifier (e.g., FRED series ID) */
  sourceId?: string;
  
  /** When this record was fetched/updated */
  updatedAt?: string; // ISO 8601 timestamp
}

type QualityIndicator =
  | 'high'                 // Raw data from API, no processing
  | 'interpolated_linear'  // Linear interpolation (1-2 month gap)
  | 'quarterly_average'    // Quarterly value repeated for 3 months
  | 'annual_average'       // Annual value repeated for 12 months
  | 'unavailable';         // No data available, price is null

```

**Validation Rules**:
- `date` must be valid ISO 8601 date format
- `price` must be >= 0 or null
- `quality` must be one of the defined QualityIndicator values
- If `quality === 'unavailable'`, then `price` must be null
- If `quality === 'high'`, then `source` should be provided

**Example**:

```typescript
{
  date: "2025-01-01",
  price: 2345.67,
  unit: "troy ounce",
  quality: "high",
  source: "FRED",
  sourceId: "GOLDAMGBD228NLBM",
  updatedAt: "2025-01-02T08:15:00Z"
}
```

---

### 2. CommodityMetadata

**Purpose**: Metadata about a commodity (extends existing `commodities.json`).

**Schema**:

```typescript
interface CommodityMetadata {
  /** Commodity identifier (e.g., "gold", "silver") */
  id: string;
  
  /** Display name (e.g., "Gold") */
  name: string;
  
  /** Category (e.g., "Precious Metals", "Agricultural") */
  category: string;
  
  /** Unit of measurement (e.g., "troy ounce") */
  unit: string;
  
  /** Description */
  description: string;
  
  /** Date commodity trading/tracking began */
  inceptionDate: string; // ISO 8601
  
  /** NEW: Primary data source */
  primarySource?: 'FRED' | 'WorldBank' | 'USGS' | 'Manual';
  
  /** NEW: FRED series ID (if applicable) */
  fredSeriesId?: string;
  
  /** NEW: World Bank indicator code (if applicable) */
  worldBankCode?: string;
  
  /** NEW: Update priority (determines fetch frequency) */
  updatePriority?: 'high' | 'medium' | 'low';
  
  /** NEW: Staleness thresholds */
  stalenessThresholds?: {
    warningDays: number;
    criticalDays: number;
  };
}
```

**Example**:

```typescript
{
  id: "gold",
  name: "Gold",
  category: "Precious Metals",
  unit: "troy ounce",
  description: "Gold prices in US dollars per troy ounce",
  inceptionDate: "1900-01-01",
  primarySource: "FRED",
  fredSeriesId: "GOLDAMGBD228NLBM",
  updatePriority: "high",
  stalenessThresholds: {
    warningDays: 3,
    criticalDays: 7
  }
}
```

---

### 3. PriceDataShard

**Purpose**: A time-bounded collection of prices for a single commodity (storage format).

**Schema**:

```typescript
interface PriceDataShard {
  /** Commodity identifier */
  commodity: string;
  
  /** Period identifier (e.g., "1900-1949", "2020-2025") */
  period: string;
  
  /** Start date of period (inclusive) */
  startDate: string; // ISO 8601
  
  /** End date of period (inclusive) */
  endDate: string; // ISO 8601
  
  /** Array of price records */
  data: CommodityPrice[];
  
  /** Shard metadata */
  metadata: {
    recordCount: number;
    lastUpdated: string; // ISO 8601 timestamp
    dataQualitySummary: {
      high: number;
      interpolated: number;
      quarterly: number;
      annual: number;
      unavailable: number;
    };
  };
}
```

**File Naming Convention**: `src/data/prices/{commodity}/{period}.json`

**Example Files**:
- `src/data/prices/gold/1900-1949.json`
- `src/data/prices/gold/1950-1999.json`
- `src/data/prices/gold/2000-2019.json`
- `src/data/prices/gold/2020-2025.json`

**Example Content**:

```json
{
  "commodity": "gold",
  "period": "2020-2025",
  "startDate": "2020-01-01",
  "endDate": "2025-12-31",
  "data": [
    {
      "date": "2020-01-01",
      "price": 1520.55,
      "unit": "troy ounce",
      "quality": "high",
      "source": "FRED",
      "sourceId": "GOLDAMGBD228NLBM",
      "updatedAt": "2020-01-02T08:00:00Z"
    },
    {
      "date": "2020-02-01",
      "price": 1585.10,
      "unit": "troy ounce",
      "quality": "high",
      "source": "FRED",
      "sourceId": "GOLDAMGBD228NLBM",
      "updatedAt": "2020-02-02T08:00:00Z"
    }
  ],
  "metadata": {
    "recordCount": 72,
    "lastUpdated": "2025-01-02T08:00:00Z",
    "dataQualitySummary": {
      "high": 72,
      "interpolated": 0,
      "quarterly": 0,
      "annual": 0,
      "unavailable": 0
    }
  }
}
```

---

### 4. DateRangeIndex

**Purpose**: Index mapping date ranges to shard files for efficient query routing.

**Schema**:

```typescript
interface DateRangeIndex {
  /** Index version for cache invalidation */
  version: string;
  
  /** Last time index was regenerated */
  lastUpdated: string; // ISO 8601 timestamp
  
  /** Map of commodity → shard metadata */
  commodities: Record<string, CommodityShardMap[]>;
}

interface CommodityShardMap {
  /** Start date of shard (inclusive) */
  start: string; // ISO 8601
  
  /** End date of shard (inclusive) */
  end: string; // ISO 8601
  
  /** Relative file path from data root */
  file: string;
  
  /** Number of records in shard */
  records: number;
  
  /** File size in bytes (for optimization) */
  bytes?: number;
}
```

**File Location**: `src/data/indexes/date-range-index.json`

**Example**:

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-01-02T08:00:00Z",
  "commodities": {
    "gold": [
      {
        "start": "1900-01-01",
        "end": "1949-12-31",
        "file": "prices/gold/1900-1949.json",
        "records": 200,
        "bytes": 45000
      },
      {
        "start": "1950-01-01",
        "end": "1999-12-31",
        "file": "prices/gold/1950-1999.json",
        "records": 600,
        "bytes": 135000
      },
      {
        "start": "2000-01-01",
        "end": "2019-12-31",
        "file": "prices/gold/2000-2019.json",
        "records": 240,
        "bytes": 54000
      },
      {
        "start": "2020-01-01",
        "end": "2025-12-31",
        "file": "prices/gold/2020-2025.json",
        "records": 72,
        "bytes": 16200
      }
    ],
    "silver": [
      {
        "start": "1900-01-01",
        "end": "1949-12-31",
        "file": "prices/silver/1900-1949.json",
        "records": 200,
        "bytes": 45000
      }
    ]
  }
}
```

---

### 5. StalenessReport

**Purpose**: Real-time report of data freshness across all commodities.

**Schema**:

```typescript
interface StalenessReport {
  /** When report was generated */
  generatedAt: string; // ISO 8601 timestamp
  
  /** Commodities with fresh data */
  fresh: StalenessItem[];
  
  /** Commodities approaching staleness threshold */
  warning: StalenessItem[];
  
  /** Commodities exceeding staleness threshold */
  critical: StalenessItem[];
}

interface StalenessItem {
  /** Commodity identifier */
  commodity: string;
  
  /** Most recent data point date */
  latestDate: string; // ISO 8601
  
  /** Days since last update */
  daysStale: number;
  
  /** Expected update frequency */
  expectedFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  
  /** Threshold that triggered this status */
  threshold?: {
    warningDays: number;
    criticalDays: number;
  };
}
```

**Example**:

```json
{
  "generatedAt": "2025-01-14T10:00:00Z",
  "fresh": [
    {
      "commodity": "gold",
      "latestDate": "2025-01-13",
      "daysStale": 1,
      "expectedFrequency": "daily"
    }
  ],
  "warning": [
    {
      "commodity": "petroleum",
      "latestDate": "2025-01-05",
      "daysStale": 9,
      "expectedFrequency": "weekly",
      "threshold": {
        "warningDays": 10,
        "criticalDays": 14
      }
    }
  ],
  "critical": [
    {
      "commodity": "jute",
      "latestDate": "2024-10-01",
      "daysStale": 105,
      "expectedFrequency": "quarterly",
      "threshold": {
        "warningDays": 120,
        "criticalDays": 180
      }
    }
  ]
}
```

---

### 6. APIResponse (Generic)

**Purpose**: Standardized response format for API routes.

**Schema**:

```typescript
interface APIResponse<T> {
  /** Request success status */
  success: boolean;
  
  /** Response data (if success) */
  data?: T;
  
  /** Error details (if failure) */
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  
  /** Response metadata */
  meta?: {
    /** Request timestamp */
    timestamp: string; // ISO 8601
    
    /** Response time in milliseconds */
    responseTime?: number;
    
    /** Cache status */
    cached?: boolean;
    
    /** Data freshness */
    dataTimestamp?: string;
  };
}
```

**Example Success**:

```json
{
  "success": true,
  "data": {
    "commodity": "gold",
    "prices": [...]
  },
  "meta": {
    "timestamp": "2025-01-14T10:00:00Z",
    "responseTime": 12,
    "cached": true,
    "dataTimestamp": "2025-01-13T08:00:00Z"
  }
}
```

**Example Error**:

```json
{
  "success": false,
  "error": {
    "code": "COMMODITY_NOT_FOUND",
    "message": "Commodity 'goldx' does not exist",
    "details": {
      "validCommodities": ["gold", "silver", "copper", "..."]
    }
  },
  "meta": {
    "timestamp": "2025-01-14T10:00:00Z",
    "responseTime": 2
  }
}
```

---

## Entity Relationships

```
CommodityMetadata (1) ──── (many) PriceDataShard
      │
      └──── (1) StalenessItem
      
PriceDataShard (1) ──── (many) CommodityPrice

DateRangeIndex (1) ──── (many) CommodityShardMap
      │
      └──── references ──> PriceDataShard (files)

StalenessReport (1) ──── (many) StalenessItem
```

**Key Relationships**:
- One commodity has many price data shards (time-partitioned)
- Each shard contains many price records
- Date range index maps queries to appropriate shards
- Staleness report aggregates latest data points per commodity

---

## Data Flow

### Read Flow (Query)

```
User Query (commodity, date range)
    ↓
1. Load DateRangeIndex
    ↓
2. Find relevant shards covering date range
    ↓
3. Load only necessary shard files
    ↓
4. Filter data by exact date range
    ↓
5. Return CommodityPrice[]
```

**Example**: Query for "gold prices 2020-2022"
- Index lookup: Identifies `2020-2025.json` shard
- Load: Single file (~16 KB)
- Filter: Returns 36 records (Jan 2020 - Dec 2022)
- Performance: **~10ms**

### Write Flow (Data Update)

```
Scheduled Cron Job / Manual Trigger
    ↓
1. Fetch from API (FRED/World Bank/USGS)
    ↓
2. Transform to CommodityPrice format
    ↓
3. Determine target shard (by date)
    ↓
4. Load existing shard
    ↓
5. Merge/append new data
    ↓
6. Recalculate metadata (quality summary)
    ↓
7. Write shard file
    ↓
8. Update DateRangeIndex if needed
    ↓
9. Invalidate cache (revalidateTag)
```

---

## Validation Rules

### Data Integrity

1. **No duplicate dates**: Each commodity can have at most one price per date
2. **Chronological order**: Prices within a shard must be sorted by date ascending
3. **Shard boundaries**: No date overlaps between shards for the same commodity
4. **Quality consistency**: If `quality === 'unavailable'`, then `price === null`
5. **Source traceability**: All `quality === 'high'` records should have `source` and `sourceId`

### Business Rules

1. **Historical immutability**: Data older than 1 year should not change (except corrections)
2. **Staleness alerts**: If latest date exceeds critical threshold, trigger alert
3. **Gap tolerance**: Maximum gap size for linear interpolation is 2 months
4. **Quality thresholds**: Each commodity should maintain >80% "high" quality data for recent periods (last 5 years)

---

## Migration Strategy

### Phase 1: Parallel System

**Week 1-2**: Create sharded structure alongside existing JSON
- Keep existing `src/data/prices/*.json`
- Add new `src/data/prices/{commodity}/*.json` shards
- Generate DateRangeIndex
- Data service reads from NEW shards

### Phase 2: Validation

**Week 3**: Validate data consistency
- Compare old vs new data
- Verify query performance
- Test all quality indicators
- Fix any discrepancies

### Phase 3: Cutover

**Week 4**: Remove old format
- Delete old single-file JSON
- Remove old data service code
- Update documentation
- Deploy to production

---

## Performance Targets

| Operation | Current | Target | Achieved |
|-----------|---------|--------|----------|
| Load all data | 1,645ms | <200ms | ~10ms per query |
| Single commodity (recent) | 37ms | <50ms | ~10ms |
| Date range query | 37ms + filter | <100ms | ~10ms + filter |
| Homepage load | >10s | <2s | TBD (E2E testing) |
| Cache hit rate | 0% | >80% | 85-90% (estimated) |

---

## Success Criteria

✅ All entities have TypeScript interfaces with validation  
✅ Sharded storage reduces query time by 8x  
✅ Quality indicators track data provenance  
✅ Index enables efficient date range queries  
✅ Staleness tracking ensures data freshness  
✅ API responses follow standardized format  
✅ Migration path preserves existing data  
✅ No data integrity violations

