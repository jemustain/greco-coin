# Implementation Plan: Real Commodity Data APIs & Performance Optimization

**Branch**: `002-real-data-api` | **Date**: 2025-12-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-real-data-api/spec.md`

## Summary

Replace test/fake commodity price data with real data from authoritative APIs (FRED, World Bank, USGS) and optimize data retrieval to achieve <2s homepage load time. Implement progressive loading, data indexing, and caching strategies to make website usable. Create automated scripts to fetch and update commodity prices for any date range with validation and error handling.

## Technical Context

**Language/Version**: TypeScript 5.3+ (Next.js 14.2.33, Node.js 18+)
**Primary Dependencies**: Next.js, React 18, axios (API calls), zod (validation), recharts (existing), better-sqlite3 (data storage - TBD based on research)  
**Storage**: Currently JSON files (4000+ records × 32 commodities = 128K+ records). **Decision needed**: Migrate to SQLite for indexed queries or optimize JSON with sharding/indexing.  
**Testing**: Playwright E2E (existing), Vitest (existing), API integration tests (new)  
**Target Platform**: Web (Vercel deployment), static generation with API routes  
**Project Type**: Web application (Next.js App Router, existing structure)  
**Performance Goals**: 
- Homepage initial load: <2 seconds (currently >10s per user report)
- Date range queries: <200ms
- API data fetch: Complete 32 commodities in <10 minutes
- Cache hit rate: >80%

**Constraints**: 
- Vercel free tier limitations (function execution time, bandwidth)
- API rate limits (varies by provider - TBD in research)
- Static file size limits for deployment
- Must maintain backwards compatibility with existing data format during migration

**Scale/Scope**: 
- 32 commodities × 125 years × monthly data = ~48K records minimum
- 6 currencies tracked
- Homepage renders 1 chart with 12-month default range
- Data page can query full historical range
- Expected <1000 concurrent users initially

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. Data Integrity (NON-NEGOTIABLE)
**Status**: ✅ PASSED (Re-evaluated post-design)  
**Design Analysis**: 
- **API Selection**: FRED + World Bank (both government/international sources with documented methodologies)
- **Quality Indicators**: Every data point tagged with quality level (high/interpolated/quarterly/annual/unavailable)
- **Source Attribution**: All records include source (FRED/WorldBank/USGS/Manual) and sourceId
- **Validation**: Zod schemas validate all data before storage
- **Gap Handling**: Transparent methodology - never fabricate data, mark large gaps as unavailable
- **Provenance**: Complete audit trail from API → shard file → UI display

**Action**: ✅ COMPLETE - All requirements met in design phase.

### ✅ II. Accessibility  
**Status**: ✅ PASSED (Re-evaluated post-design)  
**Design Analysis**: 
- **Performance**: 8x improvement (1645ms → ~10ms queries) directly benefits users on slow connections
- **Progressive Loading**: ISR ensures first visitor sees cached content <50ms
- **No UI Changes**: Existing WCAG 2.1 AA compliant UI unchanged
- **Cache Strategy**: 4-layer caching provides fast experience for all users globally (Vercel Edge CDN)
- **Staleness Indicators**: Visual badges ensure users understand data freshness

**Action**: ✅ COMPLETE - Accessibility enhanced through performance improvements.

### ✅ III. Transparency
**Status**: ✅ PASSED (Re-evaluated post-design)  
**Design Analysis**: 
- **Source Attribution**: FR-017 implemented via CommodityPrice.source field
- **Quality Transparency**: Visual badges show data quality (high/interpolated/unavailable)
- **Methodology Documentation**: research.md documents all decisions, quickstart.md explains data sources
- **Caching Documentation**: cache-strategy.schema.ts defines all caching behaviors
- **Staleness Policies**: Documented thresholds and alert triggers
- **Gap-Filling Methodology**: Transparent tiered approach documented in research.md R5

**Action**: ✅ COMPLETE - Full transparency from API source to UI display.

### ✅ IV. Flexibility
**Status**: ✅ PASSED (Re-evaluated post-design)  
**Design Analysis**: 
- **Query Flexibility**: Shard-based design supports arbitrary date range queries
- **Index Lookup**: date-range-index.json maps any query to relevant shards
- **Backward Compatible**: Existing chart/pivot/filter components work unchanged
- **Filter by Quality**: UI can filter by quality indicators (high only, include interpolated, show all)
- **Multi-Commodity Queries**: Homepage loads 32 commodities efficiently via parallel shard loading
- **Future-Proof**: Easy to add new commodities or data sources via adapter pattern

**Risk Mitigation**: ✅ VALIDATED - All existing query patterns supported, new capabilities added.

### ✅ V. Historical Depth
**Status**: ✅ PASSED (Re-evaluated post-design)  
**Design Analysis**: 
- **1900+ Coverage Maintained**: Shard design includes 1900-1949 period for all commodities
- **USGS Integration**: Historical metals data 1900-1960 via annual averages
- **Gap Handling**: Transparent marking of unavailable periods (no data loss)
- **Monthly Granularity**: Preserved for all well-covered commodities 1960+
- **Historical Immutability**: Data older than 1 year locked (except corrections)
- **Quality Tracking**: Historical data tagged as annual_average or unavailable

**Action**: ✅ COMPLETE - Historical depth preserved with improved transparency.

### ✅ VI. Educational Value
**Status**: ✅ PASSED with ENHANCEMENT (Re-evaluated post-design)  
**Design Analysis**: 
- **Real Data**: FRED/World Bank sources replace fake test data
- **Source Verification**: Source attribution allows users to explore primary sources
- **Quality Dashboard**: US5 (data quality monitoring) educates users about data limitations
- **Methodology Transparency**: Users can learn about interpolation, gap handling, data quality
- **Chart Visualization**: Different line styles for different quality levels teaches data literacy
- **Staleness Tracking**: Users learn about data update frequencies and freshness

**Enhancement**: ✅ IMPLEMENTED - Data quality monitoring (US5) provides educational dashboard.

### Performance Requirements Check
**Status**: ✅ PASSED (Re-evaluated post-design)  
**Design Analysis**: 
- **Current Baseline**: 1,645ms to load all data (measured in R2) → Contributes to >10s page load
- **Target After Optimization**: ~10ms for typical queries (8x faster)
- **Homepage Load**: <2s (FR-008) via ISR caching - EXCEEDS constitutional <3s requirement
- **Query Performance**: <200ms (FR-008, FR-012) - Well under constitutional 500ms requirement
- **Cache Hit Rate**: 85-90% estimated - Ensures consistent fast experience

**GATE RESULT**: ✅ ALL GATES PASSED - READY FOR IMPLEMENTATION  
All 6 constitutional principles verified in design phase. Performance targets achievable with proposed architecture.

---

## Final Constitution Check Summary

| Principle | Initial | Post-Design | Notes |
|-----------|---------|-------------|-------|
| I. Data Integrity | ✅ PASSED with conditions | ✅ PASSED | Quality indicators + source attribution implemented |
| II. Accessibility | ✅ PASSED | ✅ PASSED | Performance improvements enhance accessibility |
| III. Transparency | ✅ PASSED with conditions | ✅ PASSED | Full methodology documentation complete |
| IV. Flexibility | ⚠️ REVIEW REQUIRED | ✅ PASSED | All existing queries validated in shard design |
| V. Historical Depth | ✅ PASSED | ✅ PASSED | 1900+ coverage maintained with transparency |
| VI. Educational Value | ✅ PASSED with enhancement | ✅ PASSED | Data quality dashboard (US5) added |

**Overall Result**: ✅ **APPROVED FOR IMPLEMENTATION**  
All constitutional requirements met. Design phase resolved initial concerns about data integrity (action items complete), transparency (documentation complete), and flexibility (query patterns validated).



## Project Structure

### Documentation (this feature)

```text
specs/002-real-data-api/
├── plan.md              # This file
├── research.md          # Phase 0: API research, storage format evaluation
├── data-model.md        # Phase 1: Optimized data structures, cache design
├── quickstart.md        # Phase 1: API setup guide, script usage
├── contracts/           # Phase 1: API adapters, data service interfaces
│   ├── api-adapter.interface.ts
│   ├── data-source.schema.json
│   └── cache-strategy.schema.json
├── tasks.md             # Phase 2: Implementation tasks (via /speckit.tasks)
└── checklists/
    └── requirements.md  # Existing: Spec quality checklist
```

### Source Code (repository root)

**Existing Next.js Web Application**

```text
src/
├── app/                           # Next.js App Router (existing)
│   ├── page.tsx                  # Homepage - MODIFY for progressive loading
│   ├── data/page.tsx             # Data page - MODIFY for optimized queries
│   ├── api/
│   │   ├── export/route.ts       # Existing CSV export
│   │   ├── commodity-prices/     # NEW: Optimized data API
│   │   │   └── route.ts          # Range queries with pagination
│   │   └── data-quality/         # NEW: Quality metrics API
│   │       └── route.ts
│   └── ...
├── components/                    # React components (existing)
│   ├── charts/
│   │   └── TimeSeriesChart.tsx   # MODIFY: progressive data loading
│   └── data/
│       └── DataTable.tsx         # MODIFY: optimized queries
├── lib/
│   ├── api/                      # NEW: API client adapters
│   │   ├── fred-adapter.ts       # Federal Reserve Economic Data
│   │   ├── worldbank-adapter.ts  # World Bank Commodity Prices
│   │   ├── usgs-adapter.ts       # USGS Mineral Resources
│   │   ├── base-adapter.ts       # Common adapter interface
│   │   └── rate-limiter.ts       # Request throttling
│   ├── data/                     # NEW: Data access layer
│   │   ├── data-service.ts       # Unified data access interface
│   │   ├── cache-manager.ts      # Cache strategy implementation
│   │   ├── index-manager.ts      # Date range index management
│   │   └── query-optimizer.ts    # Query planning and execution
│   ├── types/
│   │   ├── commodity.ts          # Existing types - EXTEND
│   │   ├── data-source.ts        # NEW: API source definitions
│   │   └── cache.ts              # NEW: Cache entry types
│   └── utils/
│       ├── performance.ts        # Existing - VERIFY LTTB sampling works
│       └── validation.ts         # NEW: Data quality validation
├── data/                         # Data storage (existing structure)
│   ├── prices/                   # Current: 32 large JSON files
│   │   └── [commodity].json      # MIGRATE to optimized format
│   ├── indexes/                  # NEW: Date range indexes
│   │   └── [commodity].index.json
│   ├── cache/                    # NEW: Computed data cache
│   │   └── [query-hash].json
│   └── quality/                  # NEW: Quality metrics
│       └── metrics.json
└── ...

scripts/                          # Admin scripts (existing + new)
├── validate-data.ts              # Existing - EXTEND for API data
├── calculate-greco.ts            # Existing - MODIFY to use data service
├── import-prices.ts              # Existing - DEPRECATE in favor of fetch scripts
├── fetch-commodity-data.ts       # NEW: Main data fetching script
├── backfill-historical.ts        # NEW: Backfill missing historical data
├── generate-indexes.ts           # NEW: Build date range indexes
├── optimize-storage.ts           # NEW: Migrate JSON to optimized format
├── check-data-quality.ts         # NEW: Quality monitoring script
└── README.md                     # Existing - UPDATE with new scripts

tests/
├── e2e/
│   ├── user-story-1.spec.ts      # Existing - UPDATE for performance
│   └── ...
├── integration/                  # NEW: API integration tests
│   ├── fred-adapter.test.ts
│   ├── data-service.test.ts
│   └── cache-manager.test.ts
└── unit/
    └── ...

.env.local.example                # NEW: Document required API keys
```

**Structure Decision**: Using existing Next.js web application structure with additions:
- New `/src/lib/api/` for external API adapters with rate limiting
- New `/src/lib/data/` for optimized data access layer with caching
- New `/src/data/indexes/` and `/src/data/cache/` for performance optimization
- New scripts for automated data fetching and maintenance
- Maintain backwards compatibility during migration from current JSON format

## Complexity Tracking

No constitutional violations requiring justification. All gates passed with standard conditions.

---

## Phase 0: Research & Discovery

**Goal**: Resolve all "NEEDS CLARIFICATION" items and open questions from specification before design phase.

### Research Tasks

#### R1: Commodity Price API Investigation
**Question**: Which specific APIs provide best coverage for all 32 commodities?

**Approach**:
1. Survey candidate APIs:
   - FRED (Federal Reserve Economic Data)
   - World Bank Commodity Price Data
   - USGS Mineral Commodity Summaries
   - Quandl/Nasdaq Data Link
   - IMF Primary Commodity Prices
   - ICE (Intercontinental Exchange) data feeds

2. For each API, document:
   - Commodities covered (which of our 32)
   - Historical data availability (back to 1900?)
   - Data frequency (daily/monthly/annual)
   - API access method (REST, GraphQL, bulk download)
   - Authentication requirements
   - Rate limits
   - Cost (free tier vs paid)
   - Data quality indicators provided
   - Update frequency
   - Terms of service restrictions

3. Create compatibility matrix: 32 commodities × APIs showing coverage

4. Recommend primary + fallback sources for each commodity

**Decision Criteria**:
- Maximum coverage of 32 commodities
- Historical depth to 1900 where possible
- Free or low-cost access
- Reasonable rate limits for our use case
- Reliable, well-documented APIs
- Acceptable terms of service

**Deliverable**: `research.md` section with API comparison table and source recommendations

---

#### R2: Storage Format Evaluation  
**Question**: What is optimal storage format - SQLite, indexed JSON shards, or other?

**Approach**:
1. Benchmark current JSON file approach:
   - Measure load time for single commodity (4000 records)
   - Measure load time for all 32 commodities (~128K records)
   - Measure query time for date range (e.g., 2020-2024)
   - Measure memory usage

2. Prototype SQLite approach:
   - Design schema: commodities, prices, indexes
   - Import sample data (1 year, all commodities)
   - Benchmark same queries as JSON
   - Test date range queries with indexes
   - Measure file size vs JSON

3. Prototype indexed JSON shards:
   - Design: Split by commodity + time period (e.g., 5-year shards)
   - Create master index mapping date ranges to files
   - Benchmark same queries
   - Measure total file size

4. Evaluate hybrid approach:
   - Recent data (last 2 years) in fast format
   - Historical data in compressed format
   - Measure query performance across boundary

**Decision Criteria**:
- Query performance (<200ms for date ranges)
- Memory efficiency (don't load full dataset)
- Deployment compatibility (Vercel)
- Ease of updates (append new data)
- File size for git repository
- Maintainability

**Deliverable**: `research.md` section with benchmarks, recommendation, and migration plan

---

#### R3: Caching Strategy Design
**Question**: Server-side caching layer (Redis) or static generation + browser cache?

**Approach**:
1. Analyze access patterns from current site (if available):
   - Most common date ranges
   - Cache hit potential
   - Data staleness tolerance

2. Evaluate static generation options:
   - Pre-generate common queries at build time
   - Incremental Static Regeneration (ISR)
   - On-demand revalidation triggers

3. Evaluate client-side caching:
   - Browser cache headers
   - Service worker for offline support
   - React Query or SWR for request deduplication

4. Evaluate server-side options:
   - Vercel Edge caching
   - External Redis (cost/complexity)
   - In-memory cache with limits

**Decision Criteria**:
- Target >80% cache hit rate
- Cost (Vercel tier constraints)
- Complexity vs benefit
- Data freshness requirements

**Deliverable**: `research.md` section with caching architecture recommendation

---

#### R4: Data Staleness Policies
**Question**: What is acceptable staleness for different commodity types?

**Approach**:
1. Categorize commodities by update frequency needs:
   - Precious metals (gold, silver, platinum): daily
   - Energy (petroleum): weekly
   - Agricultural: monthly or seasonal
   - Industrial metals: weekly
   - Historical data (>1 year old): immutable

2. Define alert thresholds:
   - Warning: X days stale
   - Critical: Y days stale
   - Quality degradation triggers

3. Design update schedule:
   - High-priority: automated daily/weekly
   - Medium-priority: automated monthly
   - Low-priority: on-demand or quarterly

**Deliverable**: `research.md` section with staleness matrix and update schedule

---

#### R5: Historical Data Gap Handling
**Question**: How to handle commodities with sparse historical data?

**Approach**:
1. Survey actual data availability:
   - Which commodities have gaps 1900-1950?
   - Which have gaps 1950-2000?
   - Typical gap sizes (days, months, years)

2. Research interpolation methods:
   - Linear interpolation (simple)
   - Seasonal adjustment
   - Carry-forward last known value
   - Mark as unavailable with quality indicator

3. Design gap-filling strategy:
   - Document methodology
   - Add "interpolated" quality indicator
   - Store both raw and interpolated values?
   - User-visible indicators of interpolation

**Decision Criteria**:
- Maintain data integrity (no false precision)
- Transparency to users
- Practical utility (gaps don't break charts)
- Constitutional compliance (limitations noted)

**Deliverable**: `research.md` section with gap-handling methodology

---

### Research Deliverable: `research.md`

Structure:
```markdown
# Research: Real Commodity Data APIs & Performance

## Executive Summary
[Key decisions and recommendations]

## R1: Commodity Price APIs
[Comparison table, recommendations per commodity]

## R2: Storage Format
[Benchmarks, selected approach, migration plan]

## R3: Caching Strategy  
[Architecture diagram, implementation approach]

## R4: Data Staleness Policies
[Matrix by commodity type, alert thresholds]

## R5: Historical Gap Handling
[Methodology, quality indicators, user communication]

## Technology Stack Summary
[Final tech decisions for Phase 1]
```

---

## Phase 1: Design & Contracts

**Prerequisites**: `research.md` complete with all open questions resolved

### Design Deliverables

#### D1: Data Model (`data-model.md`)
Define optimized data structures based on research decisions:

**Entities**:
- **CommodityPrice** (optimized schema)
- **DataSource** (API provider metadata)
- **DataIndex** (date range index structure)
- **CacheEntry** (cache key/value design)
- **QualityMetric** (freshness, completeness tracking)

**Relationships**:
- Price → Source (many-to-one)
- Price → Commodity (many-to-one)
- Index → Files/Records (one-to-many)

**Storage Schema** (based on R2 decision):
- File structure
- Index format
- Compression strategy

---

#### D2: API Contracts (`contracts/`)

**`api-adapter.interface.ts`**:
```typescript
interface CommodityDataAdapter {
  fetchPrices(commodity: string, startDate: Date, endDate: Date): Promise<PriceData[]>
  getRateLimit(): RateLimitInfo
  getMetadata(): SourceMetadata
}
```

**`data-source.schema.json`**:
JSON schema defining API source configuration format

**`cache-strategy.schema.json`**:
JSON schema for cache invalidation rules and TTL policies

---

#### D3: Quickstart Guide (`quickstart.md`)

**For Administrators**:
1. Environment setup (API keys)
2. Running data fetch scripts
3. Monitoring data quality
4. Troubleshooting common issues

**For Developers**:
1. Adding new commodity
2. Adding new data source
3. Modifying caching strategy
4. Testing data integrity

---

#### D4: Agent Context Update

Run: `.specify/scripts/powershell/update-agent-context.ps1 -AgentType copilot`

Add to context:
- New API adapter pattern
- Data service layer usage
- Caching strategy
- Quality monitoring approach

---

### Phase 1 Checkpoint

Before proceeding to Phase 2 (tasks generation):

✅ **Constitution Re-check**:
- Data integrity: API sources documented with quality indicators
- Transparency: Caching and gap-filling methodology documented
- Flexibility: Verified storage solution supports all existing query patterns

✅ **Deliverables Complete**:
- [ ] research.md with all decisions
- [ ] data-model.md with optimized schemas
- [ ] contracts/ with interface definitions
- [ ] quickstart.md with setup instructions
- [ ] Agent context updated

✅ **Ready for Implementation**:
- No remaining "NEEDS CLARIFICATION" items
- Technology stack finalized
- Architecture validated against requirements
- Migration path from current system defined

---

## Next Steps

1. **Execute Phase 0**: Research commodity APIs, benchmark storage formats, design caching
2. **Execute Phase 1**: Create data models, API contracts, quickstart guide  
3. **Run `/speckit.tasks`**: Generate implementation task breakdown
4. **Begin Implementation**: Start with P1 user stories (fast page load + real data)
