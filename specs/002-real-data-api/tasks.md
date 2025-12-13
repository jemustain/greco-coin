# Implementation Tasks: Real Commodity Data APIs & Performance Optimization

**Feature**: 002-real-data-api  
**Generated**: 2025-12-07  
**Status**: Ready for Implementation

---

## Feature Overview

Replace test/fake commodity price data with real data from FRED and World Bank APIs. Optimize data storage using indexed JSON shards to achieve <2s homepage load (currently >10s). Implement progressive loading, 4-layer caching, and automated update scripts.

**Tech Stack**: TypeScript, Next.js 14 App Router, React 18, axios, zod  
**Storage**: Indexed JSON shards (time-partitioned)  
**APIs**: FRED (15 commodities) + World Bank (20 commodities) = 24/32 automated  
**Performance Target**: 8x improvement (1645ms → ~10ms queries)

---

## Phase 1: Setup & Infrastructure

### Goal
Initialize project dependencies, configure API credentials, and set up development environment for API integration work.

### Independent Test
Run `npm run test:api-connection` and verify FRED + World Bank APIs respond successfully with sample data.

### Tasks

- [X] T001 Install axios for HTTP requests in package.json
- [X] T002 [P] Install zod for schema validation in package.json
- [X] T003 Create .env.example with FRED_API_KEY placeholder
- [X] T004 Add .env.local to .gitignore if not present
- [X] T005 Update README.md with API key setup instructions
- [X] T006 [P] Create lib/config/api-config.ts with API base URLs and configuration
- [X] T007 [P] Create lib/types/commodity-price.ts with CommodityPrice, QualityIndicator types
- [X] T008 [P] Create lib/validation/price-schema.ts with zod schemas for API responses
- [X] T009 Create scripts/test-api-connection.ts to verify FRED and World Bank connectivity
- [X] T010 Document Vercel environment variable setup in quickstart.md

---

## Phase 2: Foundational Components

### Goal
Build reusable API adapters, data validation, and error handling infrastructure that all user stories depend on.

### Independent Test
Unit test each adapter with mocked API responses. Verify adapters correctly transform API data to CommodityPrice format with quality indicators.

### Tasks

- [X] T011 [P] Create lib/api/adapters/base-adapter.ts implementing APIAdapter interface
- [X] T012 [P] Create lib/api/adapters/fred-adapter.ts with FRED API integration
- [X] T013 [P] Create lib/api/adapters/worldbank-adapter.ts with World Bank API integration
- [X] T014 [P] Create lib/api/errors/api-error.ts with APIError, RateLimitError, AuthenticationError classes
- [X] T015 Create lib/api/adapters/adapter-factory.ts to select best adapter per commodity
- [ ] T016 [P] Create tests/unit/adapters/fred-adapter.test.ts
- [ ] T017 [P] Create tests/unit/adapters/worldbank-adapter.test.ts
- [X] T018 [P] Create lib/utils/retry-logic.ts with exponential backoff for rate limiting
- [X] T019 Create lib/api/config/commodity-mapping.ts mapping commodities → FRED series IDs and World Bank indicators
- [X] T020 Create lib/validation/price-validator.ts with statistical outlier detection

---

## Phase 3: User Story 1 - Fast Initial Page Load

### Goal
Optimize homepage to load initial chart data (last 12 months) in under 2 seconds using indexed JSON shards and 4-layer caching.

**Why critical**: Website currently >10s load time - completely unusable. This is the #1 blocker for production use.

### Independent Test
Run Lighthouse audit on homepage. Performance score >90, Time to Interactive <2s. Subsequent visits from cache <50ms.

### Tasks

#### Data Migration to Shards

- [ ] T021 [US1] Create scripts/migrate-to-shards.ts to split existing prices/*.json into time-period shards
- [ ] T022 [US1] Generate src/data/indexes/date-range-index.json mapping date ranges to shard files
- [ ] T023 [US1] Validate migrated shards match original data with comparison script
- [ ] T024 [US1] Update src/data/commodities.json with primarySource, fredSeriesId, updatePriority fields

#### Data Service Layer

- [ ] T025 [P] [US1] Create lib/data/shard-loader.ts to load specific shards based on date range
- [ ] T026 [P] [US1] Create lib/data/index-reader.ts to query date-range-index.json
- [ ] T027 [US1] Create lib/data/data-service.ts with getPrices(commodity, startDate, endDate) method
- [ ] T028 [US1] Implement query optimization in data-service.ts to load only needed shards
- [ ] T029 [US1] Add data-service.ts unit tests verifying correct shard selection

#### Caching Implementation

- [ ] T030 [P] [US1] Configure Next.js ISR in app/page.tsx with revalidate: 86400 (24h)
- [ ] T031 [P] [US1] Add Cache-Control headers in next.config.js for browser caching
- [ ] T032 [US1] Implement unstable_cache in lib/data/data-service.ts for API route caching
- [ ] T033 [US1] Create revalidation endpoint at app/api/revalidate/route.ts
- [ ] T034 [US1] Add cache tags ('commodity-prices', 'homepage') to enable selective invalidation

#### Homepage Optimization

- [ ] T035 [US1] Update app/page.tsx to load recent 12 months only (not full history)
- [ ] T036 [US1] Add loading skeleton component for chart in components/ui/chart-skeleton.tsx
- [ ] T037 [US1] Implement progressive loading: recent data first, historical on-demand
- [ ] T038 [US1] Pre-generate homepage at build time with generateStaticParams
- [ ] T039 [US1] Update existing chart component to handle progressive data loading

#### Testing & Validation

- [ ] T040 [US1] Create tests/e2e/homepage-performance.spec.ts with Playwright measuring TTI
- [ ] T041 [US1] Add performance monitoring with Web Vitals in app/layout.tsx
- [ ] T042 [US1] Run Lighthouse audit and document baseline vs optimized metrics
- [ ] T043 [US1] Test cache hit rates with Vercel Analytics
- [ ] T044 [US1] Verify homepage loads in <2s on 3G connection throttling

---

## Phase 4: User Story 2 - Real Commodity Price Data

### Goal
Replace all test data with real prices from FRED/World Bank APIs. Display source attribution and quality indicators on every data point.

**Why critical**: Current fake data undermines credibility and makes tool unusable for real analysis.

### Independent Test
Verify gold price on 2024-01-15 matches FRED source data. All displayed prices show source badge with API provider and quality indicator.

### Tasks

#### Data Fetching

- [X] T045 [P] [US2] Implement fetchPrices method in lib/api/adapters/fred-adapter.ts
- [X] T046 [P] [US2] Implement fetchPrices method in lib/api/adapters/worldbank-adapter.ts
- [X] T047 [US2] Create scripts/fetch-commodity-data.ts CLI script with date range parameters
- [X] T048 [US2] Add command-line argument parsing (--commodity, --start, --end, --force)
- [X] T049 [US2] Implement batch fetching for multiple commodities in parallel

#### Data Transformation & Storage

- [X] T050 [US2] Transform FRED API responses to CommodityPrice format with quality: 'high'
- [ ] T051 [US2] Transform World Bank API responses to CommodityPrice format with quality: 'high'
- [X] T052 [US2] Update shard files with new data (append or merge based on date)
- [ ] T053 [US2] Recalculate shard metadata (recordCount, dataQualitySummary) after update
- [ ] T054 [US2] Regenerate date-range-index.json when shard boundaries change

#### Source Attribution UI

- [ ] T055 [P] [US2] Create components/ui/quality-badge.tsx showing quality indicator with tooltip
- [ ] T056 [P] [US2] Create components/ui/source-attribution.tsx showing API source and date
- [ ] T057 [US2] Add quality badges to chart data points on hover
- [ ] T058 [US2] Add source attribution footer to commodity data tables
- [ ] T059 [US2] Update chart legend to explain quality indicator colors/styles

#### Initial Data Population

- [ ] T060 [US2] Fetch gold prices from FRED for 1960-2025 (test run)
- [ ] T061 [US2] Fetch silver prices from World Bank for 1960-2025 (test run)
- [ ] T062 [US2] Validate fetched data matches source with spot checks
- [ ] T063 [US2] Fetch all 24 automated commodities for 2020-2025 (recent data first)
- [ ] T064 [US2] Backfill 1960-2020 data for all 24 commodities

#### Testing

- [ ] T065 [US2] Create tests/integration/fred-adapter.integration.test.ts with real API calls
- [ ] T066 [US2] Create tests/integration/worldbank-adapter.integration.test.ts with real API calls
- [ ] T067 [US2] Add E2E test verifying source badges visible on data pages
- [ ] T068 [US2] Test data quality summary shows correct high/interpolated/unavailable percentages
- [ ] T069 [US2] Verify fetched prices match official sources with manual spot checks

---

## Phase 5: User Story 3 - Automated Data Updates

### Goal
Create robust automation scripts for updating commodity data with error handling, validation, parallel processing, and admin notifications.

**Why important**: Ensures data stays current without manual intervention. Supports P1 and P2 priority commodities needing daily/weekly/monthly updates.

### Independent Test
Run `npm run fetch-data -- --priority=high --dry-run` and verify script identifies which commodities need updates, displays plan, and estimates completion time.

### Tasks

#### Script Enhancement

- [ ] T070 [P] [US3] Add --priority flag to fetch-commodity-data.ts (high/medium/low)
- [ ] T071 [P] [US3] Add --dry-run flag to preview changes without writing data
- [ ] T072 [US3] Implement parallel commodity fetching with Promise.all
- [ ] T073 [US3] Add rate limiting to respect FRED 120 req/min limit
- [ ] T074 [US3] Implement error recovery: log errors, continue with other commodities

#### Validation & Reporting

- [ ] T075 [US3] Validate fetched data against zod schema before writing
- [ ] T076 [US3] Detect and reject statistical outliers (>3 std deviations)
- [ ] T077 [US3] Generate summary report: commodities updated, records added, errors
- [ ] T078 [US3] Log all API calls with timestamp, status, duration to logs/api-calls.log
- [ ] T079 [US3] Create diff report showing what changed vs previous data

#### Automation Setup

- [ ] T080 [US3] Create vercel.json with cron job configurations (daily, weekly, monthly, quarterly)
- [ ] T081 [US3] Create app/api/cron/fetch-high-priority/route.ts for daily updates
- [ ] T082 [US3] Create app/api/cron/fetch-medium-weekly/route.ts for weekly updates
- [ ] T083 [US3] Create app/api/cron/fetch-agricultural/route.ts for monthly updates
- [ ] T084 [US3] Create app/api/cron/fetch-low-priority/route.ts for quarterly updates

#### Cache Invalidation

- [ ] T085 [US3] Trigger cache revalidation after successful data update
- [ ] T086 [US3] Invalidate specific commodity tags (commodity-gold, commodity-silver, etc.)
- [ ] T087 [US3] Invalidate homepage tag if any high-priority commodity updated
- [ ] T088 [US3] Test cache invalidation propagates to browser within 1 minute
- [ ] T089 [US3] Add retry logic if cache invalidation fails

#### Testing

- [ ] T090 [US3] Test script handles API errors gracefully (mock 500 responses)
- [ ] T091 [US3] Test script respects rate limits (mock 429 responses with Retry-After)
- [ ] T092 [US3] Test parallel fetching completes faster than sequential
- [ ] T093 [US3] Test dry-run mode doesn't modify any files
- [ ] T094 [US3] Verify cron jobs trigger on schedule in Vercel dashboard

---

## Phase 6: User Story 4 - Optimized Data Storage

### Goal
Ensure indexed JSON shard storage enables fast date-range queries (<100ms) without loading full datasets. Validate performance improvements.

**Why important**: Foundation for fast queries across all pages. Enables scaling to more commodities and longer historical ranges.

### Independent Test
Query gold prices for 2020-2024 range. Measure query time <100ms. Verify only 2020-2025.json shard loaded (not all 4 shards).

### Tasks

#### Query Optimization

- [ ] T095 [P] [US4] Implement smart shard selection in data-service.ts based on query date range
- [ ] T096 [P] [US4] Add in-memory LRU cache for recently accessed shards
- [ ] T097 [US4] Optimize JSON parsing with streaming parser for large shards
- [ ] T098 [US4] Pre-load adjacent shards for likely next query (predictive prefetch)
- [ ] T099 [US4] Add query result pagination for API routes (max 1000 records)

#### Index Optimization

- [ ] T100 [US4] Add commodity completeness metadata to date-range-index.json
- [ ] T101 [US4] Add shard file size (bytes) to index for cost-based query planning
- [ ] T102 [US4] Create index validation script to detect missing or corrupted shards
- [ ] T103 [US4] Implement index regeneration script for repair scenarios
- [ ] T104 [US4] Version the index format for future schema migrations

#### API Routes

- [ ] T105 [P] [US4] Create app/api/prices/[commodity]/route.ts for commodity price queries
- [ ] T106 [P] [US4] Add query parameters: startDate, endDate, quality filter
- [ ] T107 [US4] Implement pagination with cursor-based approach
- [ ] T108 [US4] Add response metadata: query time, cache status, data timestamp
- [ ] T109 [US4] Return standardized APIResponse<T> format with success/error handling

#### Performance Testing

- [ ] T110 [US4] Create tests/performance/query-benchmarks.test.ts
- [ ] T111 [US4] Benchmark single-shard queries (expect <50ms)
- [ ] T112 [US4] Benchmark multi-shard queries spanning periods (expect <100ms)
- [ ] T113 [US4] Benchmark full-history queries (expect <200ms)
- [ ] T114 [US4] Profile memory usage for large queries (expect <100MB)

#### Data Page Updates

- [ ] T115 [US4] Update app/data/[commodity]/page.tsx to use new data service
- [ ] T116 [US4] Add date range selector component with common presets (1Y, 5Y, 10Y, All)
- [ ] T117 [US4] Implement client-side caching of query results
- [ ] T118 [US4] Add loading states during data fetching
- [ ] T119 [US4] Test data page with all 32 commodities and various date ranges

---

## Phase 7: User Story 5 - Data Quality Monitoring

### Goal
Build admin dashboard showing data completeness, staleness, and quality scores. Implement automated alerts when data degrades.

**Why valuable**: Helps prioritize maintenance, catches data issues early, educates users about data limitations.

### Independent Test
View `/admin/staleness` dashboard. Verify each commodity shows last update date, completeness %, quality score. Stale commodities (>30 days) show critical alerts.

### Tasks

#### Staleness Tracking

- [ ] T120 [P] [US5] Create lib/data/staleness-checker.ts with checkStaleness function
- [ ] T121 [P] [US5] Define staleness thresholds per commodity priority in lib/config/staleness-config.ts
- [ ] T122 [US5] Implement checkAllCommodities function generating StalenessReport
- [ ] T123 [US5] Create app/api/staleness/route.ts exposing staleness data
- [ ] T124 [US5] Add staleness check to daily cron job

#### Quality Metrics

- [ ] T125 [P] [US5] Create lib/data/quality-calculator.ts computing completeness percentage
- [ ] T126 [P] [US5] Calculate quality distribution (high/interpolated/quarterly/annual/unavailable percentages)
- [ ] T127 [US5] Detect data gaps and missing date ranges
- [ ] T128 [US5] Track data freshness (days since last update) per commodity
- [ ] T129 [US5] Generate quality scores (0-100) based on completeness + freshness + quality mix

#### Admin Dashboard

- [ ] T130 [US5] Create app/admin/staleness/page.tsx with data quality dashboard
- [ ] T131 [US5] Display commodity list with sortable columns (name, last update, completeness, quality)
- [ ] T132 [US5] Add status indicators: Fresh (green), Warning (yellow), Critical (red)
- [ ] T133 [US5] Add "Update Now" button per commodity triggering manual fetch
- [ ] T134 [US5] Show quality score trend over time with mini sparkline charts

#### User-Facing Quality Indicators

- [ ] T135 [US5] Add quality filter to data pages (show all / high quality only / include interpolated)
- [ ] T136 [US5] Update chart component to style lines by quality (solid for high, dashed for interpolated)
- [ ] T137 [US5] Add data quality summary section to commodity pages
- [ ] T138 [US5] Show staleness warning banner if data >30 days old
- [ ] T139 [US5] Create about/methodology page explaining quality indicators

#### Alerts

- [ ] T140 [US5] Implement email notification when commodity reaches critical staleness (optional - defer if complex)
- [ ] T141 [US5] Log quality degradation events to console for monitoring
- [ ] T142 [US5] Add Vercel logs integration for staleness alerts
- [ ] T143 [US5] Create admin notification preferences (which alerts to receive)
- [ ] T144 [US5] Test alert triggers with artificially stale data

#### Testing

- [ ] T145 [US5] Test staleness checker with various last update dates
- [ ] T146 [US5] Test quality calculator with mixed quality datasets
- [ ] T147 [US5] E2E test admin dashboard loads and displays correct metrics
- [ ] T148 [US5] Test "Update Now" button triggers fetch and updates display
- [ ] T149 [US5] Verify quality filter correctly filters chart data by quality level

---

## Phase 8: Polish & Cross-Cutting Concerns

### Goal
Finalize documentation, handle edge cases, add advanced features, and prepare for production deployment.

### Independent Test
Complete end-to-end workflow: Fetch data → View on homepage → Check source attribution → View quality dashboard → Update stale commodity → Verify cache invalidated.

### Tasks

#### Gap Handling Implementation

- [ ] T150 Create lib/data/gap-filler.ts with interpolation algorithms (linear, quarterly, annual)
- [ ] T151 Implement Tier 1: Linear interpolation for 1-2 month gaps
- [ ] T152 Implement Tier 2: Quarterly average expansion
- [ ] T153 Implement Tier 3: Annual average expansion
- [ ] T154 Apply gap filling during data migration and mark with appropriate quality indicators

#### Historical Backfill

- [ ] T155 Create lib/api/adapters/usgs-adapter.ts for USGS annual data
- [ ] T156 Download USGS historical mineral data files (1900-1960)
- [ ] T157 Parse USGS data and convert to annual CommodityPrice records
- [ ] T158 Apply annual expansion (Tier 3) to create monthly records with quality: 'annual_average'
- [ ] T159 Backfill all metals commodities with USGS historical data

#### Manual Data Entry Support

- [ ] T160 Create scripts/import-manual-data.ts for CSV import
- [ ] T161 Define CSV format for manual data entry (date, price, unit, source, quality)
- [ ] T162 Validate and import manual CSV data for poorly-covered commodities
- [ ] T163 Document manual data entry workflow in quickstart.md
- [ ] T164 Create templates for manual data entry (cotton-seed, jute, tallow, etc.)

#### Documentation & Deployment

- [ ] T165 Update main README.md with feature overview and links
- [ ] T166 Document all npm scripts in package.json with descriptions
- [ ] T167 Add API key setup guide to deployment documentation
- [ ] T168 Document Vercel cron job setup in deployment guide
- [ ] T169 Create CONTRIBUTING.md with guidelines for adding new commodities

#### Error Handling & Edge Cases

- [ ] T170 Handle simultaneous update scripts with file locking or conflict detection
  - Mechanism: Use lock-file.json with PID and timestamp
  - Test: Spawn 2 fetch-data instances simultaneously
  - Expected: Second instance detects lock, logs "Update in progress (PID: XXXX)", exits code 1
  - Acceptance: No data corruption, lock auto-releases after 30min timeout
- [ ] T171 Recover from corrupted shard files with automatic rollback to last good version
  - Mechanism: Keep .backup copy of each shard before write
  - Test: Corrupt shard file (invalid JSON), trigger read
  - Expected: System detects corruption, restores from .backup, logs error
  - Acceptance: User sees stale data with warning, no application crash
- [ ] T172 Handle API format changes with version detection and adapter migration
  - Mechanism: Version field in adapter responses, schema validation with zod
  - Test: Mock API response with unexpected field structure
  - Expected: Adapter detects incompatibility, logs detailed error, fails gracefully
  - Acceptance: Clear error message for admin, other commodities continue processing
- [ ] T173 Implement graceful degradation when APIs are down (serve cached data)
  - Mechanism: Check cache first, fallback to API, serve stale on API failure
  - Test: Mock 503 Service Unavailable from FRED
  - Expected: System serves cached data with "Last updated: X days ago" banner
  - Acceptance: Users see data (albeit stale), no blank pages or errors
- [ ] T174 Add retry logic for transient failures (network errors, timeouts)
  - Mechanism: Exponential backoff (1s, 2s, 4s delays), max 3 retries
  - Test: Mock 429 Rate Limit with Retry-After header, test timeout scenarios
  - Expected: System respects Retry-After, logs retry attempts, eventually fails or succeeds
  - Acceptance: Transient errors (500, 503, ETIMEDOUT) retry, permanent errors (401, 404) fail immediately

#### Final Testing & Validation

- [ ] T175 Full regression test suite covering all user stories
- [ ] T176 Load testing: Simulate 100 concurrent users
- [ ] T177 Performance audit: Verify all success criteria met (SC-001 through SC-008)
- [ ] T178 Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] T179 Mobile responsive testing for admin dashboard

#### Production Readiness

- [ ] T180 Configure production environment variables in Vercel
- [ ] T181 Set up monitoring alerts for cron job failures
- [ ] T182 Create rollback plan if performance degrades
- [ ] T183 Schedule initial data population before launch
- [ ] T184 Prepare announcement documenting real data sources and performance improvements

#### Additional Remediation Tasks

- [ ] T185 [US5] Add storage size monitoring to data quality dashboard (warn at 8MB, critical at 10MB total storage)
- [ ] T186 [US1] Verify LTTB sampling algorithm (src/lib/utils/performance.ts) works correctly with shard-based data loading (test with 50K+ point dataset)
- [ ] T187 [US4] Update scripts/calculate-greco.ts to use lib/data/data-service.ts instead of direct JSON loading (test output matches pre-migration greco-values.json within 0.01%)
- [ ] T188 [US3] Add date range parameter validation to fetch-commodity-data.ts (validate ISO 8601 format, start < end, no future dates, clear error messages)

---

## Dependency Graph

### Story Completion Order

```
Setup (Phase 1) 
    ↓
Foundational (Phase 2)
    ↓
├─ User Story 1 (Phase 3) ──┐
├─ User Story 2 (Phase 4) ──┤
├─ User Story 3 (Phase 5) ──┼─→ User Story 5 (Phase 7)
└─ User Story 4 (Phase 6) ──┘       ↓
                              Polish (Phase 8)
```

**Critical Path**: Setup → Foundational → US1 (Performance) → US2 (Real Data) → US4 (Storage) → US3 (Automation) → US5 (Monitoring) → Polish

**Rationale**: 
- US1 and US4 must complete first (performance foundation)
- US2 can proceed in parallel with US1 after Foundational
- US3 depends on US2 (need adapters working)
- US5 depends on all others (monitors complete system)
- Polish integrates everything

### Parallel Execution Opportunities

**Phase 2 (Foundational)**: Tasks T011-T020 can run in parallel (different adapters, independent utilities)

**Phase 3 (US1)**: 
- Data Migration (T021-T024) can run while building Data Service (T025-T029)
- Caching Implementation (T030-T034) independent of Homepage Optimization (T035-T039)

**Phase 4 (US2)**:
- FRED adapter (T045, T050) parallel with World Bank adapter (T046, T051)
- UI components (T055-T059) parallel with data fetching (T045-T049)
- Gold fetch (T060) parallel with Silver fetch (T061)

**Phase 5 (US3)**:
- Cron route creation (T081-T084) all parallel
- Testing tasks (T090-T094) can run in parallel

**Phase 6 (US4)**:
- Query optimization (T095-T099) parallel with Index optimization (T100-T104)
- Benchmark tests (T111-T114) can run in parallel

**Phase 7 (US5)**:
- Dashboard UI (T130-T134) parallel with user-facing indicators (T135-T139)
- All testing tasks (T145-T149) can run in parallel

**Phase 8 (Polish)**:
- Gap handling (T150-T154) parallel with Historical backfill (T155-T159)
- Documentation tasks (T165-T169) parallel with error handling (T170-T174)

---

## Implementation Strategy

### MVP Scope (Weeks 1-2)

**Minimum for Production**: User Story 1 + User Story 2 (core performance and real data)

**Deliverables**:
- Homepage loads in <2s with real data from FRED/World Bank
- All 24 automated commodities have real data for 2020-2025
- Source attribution visible on all data points
- Indexed JSON shards + 4-layer caching operational

**Tasks**: T001-T069 (Setup, Foundational, US1, US2 core tasks)

### Full Feature (Weeks 3-4)

**Complete Implementation**: All 5 user stories

**Deliverables**:
- Automated update scripts with cron jobs
- Optimized query performance (<100ms)
- Admin quality dashboard
- Historical data backfilled to 1960
- Gap handling and interpolation

**Tasks**: T001-T184 (all phases)

### Incremental Delivery

**Week 1**: Setup + Foundational (T001-T020)
**Week 2**: US1 Performance Optimization (T021-T044)
**Week 3**: US2 Real Data + US4 Storage (T045-T119)
**Week 4**: US3 Automation + US5 Monitoring (T070-T149)
**Week 5**: Polish + Historical Backfill (T150-T184)

---

## Success Metrics

### Performance (User Story 1)

- ✅ Homepage initial load: <2 seconds (target: SC-001)
- ✅ Time to Interactive: <2 seconds
- ✅ Lighthouse Performance Score: >90
- ✅ Cache hit rate: >80% (target: SC-007)
- ✅ Date range queries: <200ms (target: SC-003)

### Data Quality (User Story 2)

- ✅ Zero fake/test data visible (target: SC-008)
- ✅ All prices verifiable against source APIs (target: SC-002)
- ✅ Source attribution visible on 100% of data points
- ✅ 24/32 commodities automated (75% coverage)
- ✅ 95%+ completeness for recent 5 years (target: SC-005)

### Automation (User Story 3)

- ✅ Full data refresh completes in <10 minutes (target: SC-006)
- ✅ Automated scripts run daily/weekly/monthly without manual intervention
- ✅ Error rate <5% on scheduled updates
- ✅ Failed updates logged with admin notifications

### Storage Performance (User Story 4)

- ✅ Query time improvement: 8x faster (1645ms → ~200ms)
- ✅ Single-shard queries: <50ms
- ✅ Multi-shard queries: <100ms
- ✅ Full-history queries: <200ms
- ✅ Memory usage for large queries: <100MB

### Monitoring (User Story 5)

- ✅ Quality dashboard accessible at /admin/staleness
- ✅ All commodities show completeness % and staleness indicators
- ✅ Stale commodities (>30 days) clearly marked
- ✅ "Update Now" functionality works for manual updates
- ✅ Quality filter functional on all data pages

---

## Notes

**Task Format**: `- [ ] T### [P] [US#] Description with file path`
- **[P]**: Parallelizable (can run simultaneously with other [P] tasks)
- **[US#]**: User Story mapping (US1, US2, US3, US4, US5)
- **T###**: Sequential task ID for tracking

**Testing Strategy**: 
- Unit tests for adapters and utilities (Vitest)
- Integration tests for API calls (with mocked responses)
- E2E tests for user flows (Playwright)
- Performance tests for query benchmarks
- Manual testing for data verification against sources

**Risk Mitigation**:
- Start with 2-3 commodities for initial testing before scaling to all 24
- Implement rollback mechanism before production deployment
- Keep old data format in parallel during migration phase
- Test API rate limits with throttled requests before bulk fetching
- Profile performance with real data volumes before optimizing

**Dependencies to Install**: axios, zod (others already in project)

**Estimated Timeline**: 4-5 weeks for full implementation (MVP: 2 weeks)

**Total Tasks**: 184 tasks across 8 phases
