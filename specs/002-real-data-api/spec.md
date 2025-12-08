# Feature Specification: Real Commodity Data APIs & Performance Optimization

**Feature Branch**: `002-real-data-api`  
**Created**: 2025-12-07  
**Status**: Draft  
**Input**: User description: "Implement real commodity data APIs and optimize data retrieval performance for fast website loading"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fast Initial Page Load (Priority: P1)

A user visits the homepage and sees the main Greco chart with real commodity data loading in under 2 seconds, with a smooth loading experience using skeletons and progressive data loading.

**Why this priority**: Website is currently unusable due to slow performance. Fast page loads are critical for user retention and are the primary blocker preventing production use.

**Independent Test**: Load homepage and measure time to interactive. Chart should render with initial data (last 12 months) in under 2 seconds. Full historical data loads progressively in background.

**Acceptance Scenarios**:

1. **Given** user visits homepage, **When** page loads, **Then** loading skeleton appears immediately and chart renders with recent data within 2 seconds
2. **Given** chart is displayed with recent data, **When** user selects longer time range, **Then** additional historical data loads progressively without blocking UI
3. **Given** user navigates between pages, **When** returning to previously viewed data, **Then** data loads instantly from cache

---

### User Story 2 - Real Commodity Price Data (Priority: P1)

The website displays actual, verifiable commodity prices from authoritative sources (USGS, World Bank, FRED, etc.) instead of test/fake data, with proper attribution and quality indicators.

**Why this priority**: Current data appears fake and undermines credibility. Real data is essential for the tool to have any practical value.

**Independent Test**: Verify any displayed price (e.g., gold on 2024-01-15) matches the source API data. All data includes source attribution visible to users.

**Acceptance Scenarios**:

1. **Given** user views commodity price, **When** checking source attribution, **Then** source (USGS, World Bank, etc.) and date are clearly displayed
2. **Given** user compares displayed price to official source, **When** verifying data, **Then** prices match within documented precision
3. **Given** API data is unavailable, **When** system attempts to fetch, **Then** cached data is used with clear indicator of cache age
4. **Given** new data is available, **When** automated script runs, **Then** latest prices are fetched and stored without manual intervention

---

### User Story 3 - Automated Data Updates (Priority: P2)

Administrators can run scripts to automatically fetch the latest commodity prices for any date range from configured APIs, with validation and error handling.

**Why this priority**: Manual data entry is error-prone and time-consuming. Automation ensures data stays current with minimal maintenance.

**Independent Test**: Run update script with date range parameter. Script fetches data from APIs, validates, stores, and reports success/failures.

**Acceptance Scenarios**:

1. **Given** administrator runs update script for specific month, **When** script executes, **Then** all available commodity data for that month is fetched and stored
2. **Given** API returns error or invalid data, **When** script processes response, **Then** error is logged, existing data preserved, and admin notified
3. **Given** multiple commodities need updating, **When** script runs, **Then** commodities are processed in parallel where possible for faster completion
4. **Given** update completes, **When** script finishes, **Then** summary report shows what was updated, what failed, and data quality metrics

---

### User Story 4 - Optimized Data Storage (Priority: P2)

Data is stored in an optimized format that enables fast queries by date range, currency, and commodity without loading entire datasets into memory.

**Why this priority**: Current approach loads all data (4000+ records per commodity × 32 commodities) on every page load. Optimized storage enables sub-second queries.

**Independent Test**: Query data for specific date range (e.g., 2020-2024) and measure response time. Should return in under 100ms without loading full dataset.

**Acceptance Scenarios**:

1. **Given** user requests data for specific date range, **When** query executes, **Then** only relevant data is loaded (not entire dataset)
2. **Given** multiple queries run simultaneously, **When** processing, **Then** each query completes in under 200ms
3. **Given** data is indexed by date, **When** user selects different time ranges, **Then** queries return progressively faster as data is cached

---

### User Story 5 - Data Quality Monitoring (Priority: P3)

System tracks data completeness, staleness, and quality indicators for each commodity, alerting administrators when data needs attention.

**Why this priority**: Ensures data reliability and helps prioritize maintenance efforts. Important but not blocking initial performance improvements.

**Independent Test**: View data quality dashboard showing completeness percentage, last update date, and quality score for each commodity.

**Acceptance Scenarios**:

1. **Given** data quality dashboard, **When** viewing commodity status, **Then** each commodity shows last update date, completeness %, and quality indicator
2. **Given** commodity data is stale (>30 days old), **When** script checks freshness, **Then** alert is generated for administrator
3. **Given** API fetch fails repeatedly, **When** quality check runs, **Then** commodity is marked as "degraded" with visible indicator on frontend

---

### Edge Cases

### Edge Cases

- What happens when API rate limits are hit during bulk updates?
- How does system handle partial data availability (some commodities have recent data, others don&apos;t)?
- What if multiple update scripts run simultaneously?
- How are gaps in historical data handled (missing months)?
- What happens when data format changes in source API?
- How does system recover from corrupted data files?

## Requirements *(mandatory)*

### Functional Requirements

#### Data Fetching & APIs

- **FR-001**: System MUST integrate with at least 3 authoritative commodity price APIs (e.g., FRED, World Bank, USGS, Quandl)
- **FR-002**: System MUST fetch commodity prices with authentication/API keys stored securely in environment variables
- **FR-003**: System MUST validate all fetched data against schema before storing (required fields, reasonable ranges, valid dates)
- **FR-004**: System MUST handle API rate limiting with exponential backoff and retry logic
- **FR-005**: System MUST log all API calls with timestamp, status, and error details for debugging
- **FR-006**: Scripts MUST accept date range parameters (start-date, end-date) to fetch specific periods
- **FR-007**: System MUST deduplicate data when same date exists from multiple sources (prefer higher quality source)

#### Performance & Optimization

- **FR-008**: Homepage MUST load initial chart data (last 12 months) in under 2 seconds on standard broadband
- **FR-009**: System MUST implement progressive data loading (load recent data first, historical data on-demand)
- **FR-010**: System MUST cache processed data to avoid redundant calculations on every request
- **FR-011**: System MUST index data by date to enable fast range queries without full dataset scan
- **FR-012**: API routes MUST paginate large datasets (max 1000 records per request)
- **FR-013**: System MUST implement data sampling for charts displaying &gt;10,000 points (already implemented - verify working)
- **FR-014**: System MUST prefetch likely-needed data based on user navigation patterns

#### Data Storage & Format

- **FR-015**: System MUST store commodity prices in optimized format enabling fast date-range queries
- **FR-016**: System MUST maintain separate index files mapping date ranges to data file locations
- **FR-017**: System MUST store source attribution (API source, fetch date, quality indicator) with each price point
- **FR-018**: System MUST compress historical data (&gt;1 year old) to reduce storage size
- **FR-019**: System MUST maintain data versioning to rollback corrupted updates

#### Data Quality & Monitoring

- **FR-020**: System MUST track completeness percentage for each commodity (% of expected dates with data)
- **FR-021**: System MUST track data freshness (days since last update) for each commodity
- **FR-022**: System MUST validate data quality using statistical outlier detection
- **FR-023**: System MUST generate daily data quality report accessible to administrators
- **FR-024**: System MUST alert administrators when data is stale (&gt;30 days) or quality degrades below threshold

#### Automation & Maintenance

- **FR-025**: System MUST provide script to update all commodities for specific date range
- **FR-026**: System MUST provide script to backfill missing historical data
- **FR-027**: System MUST provide script to validate and repair data integrity issues
- **FR-028**: Scripts MUST run idempotently (safe to run multiple times without duplication)
- **FR-029**: System MUST support scheduled automatic updates via cron/GitHub Actions

### Key Entities

- **CommodityPrice**: Date, price in USD, unit, source API, quality indicator, fetch timestamp
- **DataSource**: API provider name, base URL, authentication method, rate limits, supported commodities
- **DataQualityMetric**: Commodity ID, completeness %, last update date, staleness days, quality score, alert status
- **CacheEntry**: Key (query parameters hash), data, expiration timestamp, hit count
- **DataIndex**: Date range boundaries, file path, commodity ID, record count

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Homepage initial load completes in under 2 seconds (currently &gt;10 seconds based on user report)
- **SC-002**: All commodity prices displayed can be verified against source APIs within documented precision
- **SC-003**: Date range queries (e.g., 2020-2024) return in under 200ms
- **SC-004**: Full page navigation (homepage → comparison → data → about) completes in under 5 seconds total
- **SC-005**: System maintains 95%+ data completeness for all 32 commodities for recent 5 years
- **SC-006**: Automated update scripts complete full data refresh in under 10 minutes
- **SC-007**: Cache hit rate exceeds 80% for repeat queries
- **SC-008**: Zero fake/test data visible on production site (all data traceable to authoritative source)

## Assumptions

- **A-001**: Commodity price APIs provide free or reasonably-priced access tiers sufficient for project needs
- **A-002**: API authentication via environment variables is acceptable (no OAuth flow needed)
- **A-003**: Monthly price granularity is sufficient for historical data (daily for recent year)
- **A-004**: Users primarily view recent data (last 1-5 years) with occasional historical deep-dives
- **A-005**: Static site generation (SSG) with incremental regeneration is acceptable deployment model
- **A-006**: Storage costs for optimized data format are acceptable (estimated &lt;100MB compressed)
- **A-007**: Vercel platform supports required file structure and API routes for optimized data access

## Non-Goals (Out of Scope)

- Real-time streaming data updates (batch updates sufficient)
- Building custom commodity price database from scratch (use existing APIs)
- Support for user-uploaded commodity data
- Blockchain or distributed data storage
- Custom data visualization beyond existing charts
- Mobile-specific optimizations (responsive design already implemented)

## Dependencies

- **Commodity Price APIs**: Research and select 3-5 APIs with good coverage of 32 commodities
- **Environment Variables**: Secure storage for API keys (Vercel environment variables)
- **Node.js APIs**: axios/fetch for HTTP requests, zod for validation
- **Storage Solution**: Determine optimal format (SQLite, indexed JSON, or other)

## Risks & Mitigations

**Risk**: API providers change data formats or deprecate endpoints  
**Mitigation**: Abstract API access behind adapter pattern, monitor API status, maintain fallback sources

**Risk**: Rate limiting prevents fetching all commodities  
**Mitigation**: Implement request throttling, batch requests where possible, cache aggressively

**Risk**: Optimized storage format increases complexity  
**Mitigation**: Maintain backwards compatibility, provide migration script, document format thoroughly

**Risk**: Performance gains insufficient on Vercel free tier  
**Mitigation**: Profile actual performance, consider edge caching, evaluate upgrade path

## Open Questions

1. Which specific commodity price APIs provide best coverage for all 32 commodities?
2. What is optimal storage format: SQLite, indexed JSON shards, or other?
3. Should we implement server-side caching layer (Redis) or rely on static generation + browser cache?
4. What is acceptable data staleness for different commodity types?
5. How to handle commodities with sparse historical data (many gaps)?
