# API Contract: Data Export

**Endpoint**: `/api/export`  
**Method**: `POST`  
**Purpose**: Generate CSV export of historical data with custom filters

## Request Schema

```typescript
interface ExportRequest {
  format: "csv";  // Only CSV supported in MVP
  dataType: "greco-values" | "commodity-prices" | "exchange-rates";
  filters: {
    dateRange: {
      start: string;  // ISO 8601 date (YYYY-MM-DD)
      end: string;    // ISO 8601 date (YYYY-MM-DD)
    };
    currencies?: string[];      // Filter by currency IDs (for greco-values)
    commodities?: string[];     // Filter by commodity IDs (for commodity-prices)
    granularity?: "annual" | "monthly";  // Default: all available
  };
  options?: {
    includeMetadata: boolean;   // Include quality flags (default: false)
    includeHeaders: boolean;    // CSV column headers (default: true)
  };
}
```

### Example Request

```json
{
  "format": "csv",
  "dataType": "greco-values",
  "filters": {
    "dateRange": {
      "start": "1950-01-01",
      "end": "2025-01-01"
    },
    "currencies": ["USD", "EUR", "BTC"],
    "granularity": "monthly"
  },
  "options": {
    "includeMetadata": true,
    "includeHeaders": true
  }
}
```

## Response Schema

### Success Response (200 OK)

**Headers**:
```http
Content-Type: text/csv
Content-Disposition: attachment; filename="greco-values-1950-2025.csv"
X-Row-Count: 2700
X-Generation-Time-Ms: 145
```

**Body** (CSV):
```csv
Date,Currency,Value,Completeness,Quality
1950-01-01,USD,1234.56,0.95,medium
1950-01-01,EUR,,0.00,missing-data
1950-02-01,USD,1240.12,0.93,medium
...
```

### Error Responses

#### 400 Bad Request

**Scenario**: Invalid input parameters

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid date range",
    "details": {
      "field": "filters.dateRange.start",
      "reason": "Date must be between 1900-01-01 and present"
    }
  }
}
```

#### 413 Payload Too Large

**Scenario**: Result set exceeds 100MB or 1M rows

```json
{
  "error": {
    "code": "RESULT_TOO_LARGE",
    "message": "Export would exceed 1,000,000 rows. Please narrow date range or filters.",
    "details": {
      "estimatedRows": 2500000,
      "maxRows": 1000000,
      "suggestion": "Split request into multiple date ranges"
    }
  }
}
```

#### 500 Internal Server Error

**Scenario**: Unexpected server failure

```json
{
  "error": {
    "code": "EXPORT_FAILED",
    "message": "Failed to generate export",
    "details": {
      "timestamp": "2025-12-06T10:30:00Z",
      "requestId": "req_abc123"
    }
  }
}
```

## Validation Rules

### Request Validation

1. **Date Range**:
   - `start` MUST be ≥ 1900-01-01
   - `end` MUST be ≤ current date
   - `end` MUST be ≥ `start`
   - Date range MUST NOT exceed 125 years (full dataset)

2. **Currency Filters**:
   - All IDs MUST exist in currencies table
   - MUST NOT request EUR before 1999-01-01
   - MUST NOT request BTC before 2009-01-03

3. **Commodity Filters**:
   - All IDs MUST exist in commodities table
   - Maximum 32 commodities (full basket)

4. **Data Type**:
   - MUST be one of: "greco-values", "commodity-prices", "exchange-rates"

### Response Constraints

1. **Row Limits**:
   - Maximum 1,000,000 rows per export
   - Estimated before generation; reject if exceeded

2. **File Size**:
   - Maximum 100MB CSV file
   - Use streaming for large exports

3. **Timeout**:
   - Maximum 30 seconds generation time
   - Return 504 Gateway Timeout if exceeded

## CSV Format Specifications

### greco-values Export

**Columns**:
- `Date` (YYYY-MM-DD)
- `Currency` (ISO code or ID)
- `Value` (decimal, 2-8 places depending on currency)
- `Completeness` (decimal 0.00-1.00, if includeMetadata=true)
- `Quality` (comma-separated flags, if includeMetadata=true)

**Example**:
```csv
Date,Currency,Value,Completeness,Quality
1950-01-01,USD,1234.56,0.95,medium:historical-uncertainty
1950-01-01,GBP,456.78,0.93,medium:historical-uncertainty
```

### commodity-prices Export

**Columns**:
- `Date` (YYYY-MM-DD)
- `Commodity` (ID)
- `PriceUSD` (decimal)
- `Unit` (symbol)
- `Granularity` (annual/monthly)
- `Quality` (if includeMetadata=true)

**Example**:
```csv
Date,Commodity,PriceUSD,Unit,Granularity,Quality
1950-01-01,gold,34.77,oz t,annual,medium:historical-uncertainty
1950-01-01,wheat,2.15,bu,annual,medium:historical-uncertainty
```

### exchange-rates Export

**Columns**:
- `Date` (YYYY-MM-DD)
- `BaseCurrency` (ID)
- `TargetCurrency` (ID)
- `Rate` (decimal)
- `Granularity` (annual/monthly)

**Example**:
```csv
Date,BaseCurrency,TargetCurrency,Rate,Granularity
1950-01-01,USD,GBP,0.357,annual
1950-01-01,USD,CNY,2.46,annual
```

## Implementation Notes

### Performance Considerations

1. **Data Streaming**: Use Node.js streams for large datasets
2. **Caching**: Cache common queries (e.g., full dataset exports) for 24 hours
3. **Rate Limiting**: 10 exports per IP per hour (prevents abuse)

### Security Considerations

1. **Input Sanitization**: Validate all inputs against schema
2. **SQL Injection**: Use parameterized queries (SQLite)
3. **CORS**: Allow all origins (public API, read-only data)

### Testing Requirements

1. **Unit Tests**: Validate all error conditions
2. **Integration Tests**: End-to-end export flow
3. **Performance Tests**: 100k+ row exports under 5 seconds

## Future Enhancements (Post-MVP)

- JSON export format
- Excel (.xlsx) export format
- API key authentication for higher rate limits
- Webhook notifications for long-running exports
- Incremental exports (delta since last export)
- Custom column selection
- Pre-scheduled exports (daily/weekly)

---

**Contract Version**: 1.0.0  
**Last Updated**: 2025-12-06  
**Status**: Draft - Ready for Implementation
