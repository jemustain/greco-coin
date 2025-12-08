# Research: Real Commodity Data APIs & Performance Optimization

**Feature**: 002-real-data-api  
**Date**: 2025-12-07  
**Status**: In Progress

## Executive Summary

### Key Decisions

✅ **R1 - APIs Selected**:
- **Primary**: FRED + World Bank (free, comprehensive, reliable)
  - FRED: 15 commodities (metals, grains, petroleum)
  - World Bank: 20 commodities (metals, agricultural, industrial)
  - Combined coverage: 24/32 commodities (75%)
- **Secondary**: USGS Mineral Summaries (annual data, historical depth to 1900)
- **Manual**: 8 poorly-covered commodities require historical research

- [ ] **R2 - Storage format chosen** (SQLite vs indexed JSON vs hybrid)
- [ ] **R3 - Caching architecture defined**
- [ ] **R4 - Data staleness policies established**
- [ ] **R5 - Gap-filling methodology documented**

### Implementation Phases

**Phase 1 MVP**: 24 commodities via FRED + World Bank APIs (automated)  
**Phase 2**: Historical backfill via USGS data (1900-1960)  
**Phase 3**: Manual research for 8 remaining commodities  

**Total Cost**: $0 (all free data sources)

**Technology Stack**: 
- FRED API (requires free API key)
- World Bank Data API (no auth required)
- USGS data files (bulk download)
- Dependencies: axios, zod validation

---

## R1: Commodity Price API Investigation

**Goal**: Identify authoritative APIs providing coverage for all 32 commodities with historical data back to 1900 where possible.

### Our 32 Commodities

**Metals (10)**: aluminum, copper, gold, iron, lead, nickel, platinum, silver, tin, zinc  
**Energy (1)**: petroleum  
**Industrial (4)**: cement, rubber, sulphur, hides  
**Agricultural - Grains (6)**: barley, corn, oats, rice, rye, wheat  
**Agricultural - Other (11)**: cocoa, coffee, copra, cotton, cotton-seed, jute, peanuts, soy-beans, sugar, tallow, wool

### Candidate APIs

#### Federal Reserve Economic Data (FRED)
- **URL**: https://fred.stlouisfed.org/docs/api/fred/
- **Coverage**: Extensive US economic data including many commodity prices
- **Historical Depth**: Varies by series, some back to 1900s
- **Frequency**: Monthly, quarterly, annual depending on series
- **Authentication**: Free API key required
- **Rate Limits**: No hard limit documented, but recommends staying under 120 requests/minute
- **Cost**: Free
- **Data Format**: JSON, XML
- **Update Frequency**: Varies by series (some daily, some monthly)
- **Example Series**: 
  - Gold (GOLDAMGBD228NLBM): Daily London price
  - Wheat (PWHEAMTUSDM): Monthly US Gulf price
  - Crude Oil (MCOILWTICO): Daily WTI spot price
- **Strengths**: Reliable, well-documented, stable API, free access
- **Weaknesses**: US-focused, not all commodities available, series names require research

#### World Bank Commodity Price Data
- **URL**: https://www.worldbank.org/en/research/commodity-markets (Pink Sheet data)
- **API**: World Bank Data API - https://datahelpdesk.worldbank.org/knowledgebase/articles/889392
- **Coverage**: ~70 commodity price series (metals, energy, agriculture)
- **Historical Depth**: Most series from 1960, some from 1950s
- **Frequency**: Monthly, annual
- **Authentication**: No API key required for basic access
- **Rate Limits**: None documented for public API
- **Cost**: Free
- **Data Format**: JSON, XML, CSV bulk downloads
- **Update Frequency**: Monthly (Pink Sheet published monthly)
- **Example Indicators**:
  - Gold: PGOLD
  - Wheat: PWHEAMT (US HRW)
  - Crude Oil: POILWTI
- **Strengths**: Comprehensive commodity coverage, reliable, no API key needed
- **Weaknesses**: Limited historical depth (<1960), monthly granularity only

#### USGS Mineral Commodity Summaries
- **URL**: https://www.usgs.gov/centers/national-minerals-information-center/
- **API**: No formal API - data available as PDFs, Excel files, and structured data files
- **Coverage**: All major minerals and metals (aluminum, copper, gold, silver, iron, etc.)
- **Historical Depth**: Annual data back to 1900s for many commodities
- **Frequency**: Annual reports
- **Authentication**: None - public data
- **Rate Limits**: N/A (file downloads)
- **Cost**: Free
- **Data Format**: PDF, Excel, sometimes CSV
- **Update Frequency**: Annual (January release for previous year)
- **Strengths**: Excellent historical depth, authoritative US government source, covers all metals
- **Weaknesses**: No real-time API, manual data extraction needed, annual granularity only, doesn't cover agricultural commodities

#### Quandl/Nasdaq Data Link
- **URL**: https://data.nasdaq.com/
- **Coverage**: Extensive financial and commodity data from multiple sources
- **Historical Depth**: Varies widely (some to 1800s, depends on data source)
- **Frequency**: Daily, monthly, varies by dataset
- **Authentication**: API key required (free tier available)
- **Rate Limits**: Free tier: 50 calls/day, 20,000 calls/year
- **Cost**: Free tier limited, paid plans $49-$499+/month
- **Data Format**: JSON, CSV
- **Example Datasets**:
  - LBMA Gold Price (LBMA/GOLD)
  - World Bank commodities (various)
  - Multiple agricultural data sources
- **Strengths**: Aggregates data from many sources, good historical depth
- **Weaknesses**: Free tier severely limited (50 calls/day insufficient), requires paid plan for production use

#### IMF Primary Commodity Prices
- **URL**: https://www.imf.org/en/Research/commodity-prices
- **API**: IMF Data API - https://data.imf.org/
- **Coverage**: ~60 commodity price indices (metals, energy, food, beverages)
- **Historical Depth**: Most from 1980, some from 1957
- **Frequency**: Monthly
- **Authentication**: No API key required
- **Rate Limits**: None documented
- **Cost**: Free
- **Data Format**: JSON, XML, CSV
- **Update Frequency**: Monthly
- **Strengths**: Reliable international source, free access, good coverage
- **Weaknesses**: Limited historical depth (1980+), not all 32 commodities covered

#### Alpha Vantage
- **URL**: https://www.alphavantage.co/
- **Coverage**: Focus on financial markets, limited commodity coverage
- **Historical Depth**: 20+ years for supported commodities
- **Frequency**: Daily, intraday
- **Authentication**: Free API key (required)
- **Rate Limits**: Free tier: 5 requests/minute, 500 requests/day
- **Cost**: Free tier limited, paid plans $49-$249/month
- **Strengths**: Easy API, real-time data
- **Weaknesses**: Limited commodity coverage, insufficient for our 32 commodities

### Commodity Coverage Matrix

| Commodity | FRED | World Bank | USGS | Quandl Free | IMF | Recommended Primary | Fallback |
|-----------|:----:|:----------:|:----:|:-----------:|:---:|-------------------|----------|
| **Metals** |
| Aluminum | ✓ | ✓ | ✓ Annual | ✗ Limited | ✓ | World Bank | FRED |
| Copper | ✓ | ✓ | ✓ Annual | ✗ Limited | ✓ | World Bank | FRED |
| Gold | ✓✓ | ✓ | ✓ Annual | ✗ Limited | ✓ | FRED | World Bank |
| Iron | ✓ | ✓ | ✓ Annual | ✗ Limited | ✓ | World Bank | USGS Annual |
| Lead | ✓ | ✓ | ✓ Annual | ✗ Limited | ✓ | World Bank | FRED |
| Nickel | ✓ | ✓ | ✓ Annual | ✗ Limited | ✓ | World Bank | FRED |
| Platinum | ✓ | ✓ | ✓ Annual | ✗ Limited | ✗ | FRED | World Bank |
| Silver | ✓✓ | ✓ | ✓ Annual | ✗ Limited | ✓ | FRED | World Bank |
| Tin | ✓ | ✓ | ✓ Annual | ✗ Limited | ✓ | World Bank | FRED |
| Zinc | ✓ | ✓ | ✓ Annual | ✗ Limited | ✓ | World Bank | FRED |
| **Energy** |
| Petroleum | ✓✓ | ✓✓ | ✗ | ✗ Limited | ✓✓ | FRED (WTI) | World Bank |
| **Industrial** |
| Cement | ✗ | ✗ | ✓ Annual | ✗ | ✗ | USGS Annual | Manual |
| Rubber | ✓ | ✓ | ✗ | ✗ Limited | ✓ | World Bank | FRED |
| Sulphur | ✗ | ✗ | ✓ Annual | ✗ | ✗ | USGS Annual | Manual |
| Hides | ✗ | ✓ | ✗ | ✗ | ✗ | World Bank | Manual |
| **Agricultural - Grains** |
| Barley | ✓ | ✓ | ✗ | ✗ Limited | ✓ | World Bank | FRED |
| Corn | ✓✓ | ✓ | ✗ | ✗ Limited | ✓ | FRED | World Bank |
| Oats | ✓ | ✗ | ✗ | ✗ Limited | ✗ | FRED | Manual |
| Rice | ✓ | ✓ | ✗ | ✗ Limited | ✓ | World Bank | FRED |
| Rye | ✓ | ✗ | ✗ | ✗ Limited | ✗ | FRED | Manual |
| Wheat | ✓✓ | ✓ | ✗ | ✗ Limited | ✓ | FRED | World Bank |
| **Agricultural - Other** |
| Cocoa | ✓ | ✓ | ✗ | ✗ Limited | ✓ | World Bank | FRED |
| Coffee | ✓ | ✓ | ✗ | ✗ Limited | ✓ | World Bank | FRED |
| Copra | ✗ | ✓ | ✗ | ✗ | ✓ | World Bank | IMF |
| Cotton | ✓ | ✓ | ✗ | ✗ Limited | ✓ | FRED | World Bank |
| Cotton-seed | ✗ | ✗ | ✗ | ✗ | ✗ | Manual | USDA |
| Jute | ✗ | ✗ | ✗ | ✗ | ✗ | Manual | Historical |
| Peanuts | ✓ | ✓ | ✗ | ✗ Limited | ✗ | FRED | World Bank |
| Soy-beans | ✓✓ | ✓ | ✗ | ✗ Limited | ✓ | FRED | World Bank |
| Sugar | ✓ | ✓ | ✗ | ✗ Limited | ✓ | World Bank | FRED |
| Tallow | ✗ | ✗ | ✗ | ✗ | ✗ | Manual | Historical |
| Wool | ✗ | ✓ | ✗ | ✗ | ✗ | World Bank | Manual |

**Legend**: ✓✓ = Excellent coverage, ✓ = Available, ✗ = Not available, Limited = Requires paid tier

### Coverage Analysis

**Well Covered (24/32 commodities)**:
- All 10 metals: Multiple free API sources available
- Petroleum: Excellent coverage (FRED, World Bank, IMF)
- 2 industrial: Rubber, Hides
- All 6 grains: FRED and/or World Bank
- 5 agricultural: Cocoa, Coffee, Copra, Cotton, Peanuts, Soy-beans, Sugar, Wool

**Poorly Covered (8/32 commodities)**:
- Cement, Sulphur: USGS annual only
- Cotton-seed, Jute, Tallow: No API sources found
- Oats, Rye: FRED only (no fallback)

### Recommendations

#### Primary API Strategy

**Tier 1: FRED + World Bank (Free, Comprehensive)**
- Use **FRED** for: Gold, Silver, Platinum, Petroleum, major grains (Corn, Wheat, Soy-beans), Cotton
- Use **World Bank** for: All other metals, Rubber, Hides, remaining agricultural commodities
- **Rationale**: Both are free, reliable, well-documented, no rate limit concerns for our use case

**Tier 2: USGS (Annual Historical Data)**
- Use for: Cement, Sulphur, historical metal prices (1900-1960)
- **Rationale**: Essential for historical depth and commodities not in API sources
- **Implementation**: Manual data entry or Excel parsing (one-time for historical, annual updates)

**Tier 3: Manual Historical Research**
- Required for: Cotton-seed, Jute, Tallow
- **Sources**: Academic papers, USDA historical bulletins, trade association archives
- **Rationale**: No API alternative available, less critical commodities

#### Historical Depth Strategy

**1900-1950**: Rely heavily on USGS annual data + manual historical research  
**1950-1960**: Transition to monthly data from FRED/World Bank where available  
**1960-Present**: Full monthly coverage from FRED/World Bank APIs  
**Recent (2020+)**: Consider daily granularity from FRED for key commodities

#### Implementation Priority

**Phase 1 (MVP - 24 well-covered commodities)**:
1. Implement FRED adapter (covers 15 commodities)
2. Implement World Bank adapter (covers 20 commodities, overlap with FRED)
3. Result: 24/32 commodities with automated API fetching

**Phase 2 (Historical depth)**:
4. Parse USGS historical data (one-time import for 1900-1960)
5. Backfill gaps in Phase 1 commodities

**Phase 3 (Complete coverage)**:
6. Manual research and data entry for 8 poorly-covered commodities
7. Document data quality as "manual" with source citations

### API Authentication & Costs

**FRED**:
- Sign up: https://fred.stlouisfed.org/docs/api/api_key.html
- Free, takes ~5 minutes
- Store in `.env.local`: `FRED_API_KEY=your_key_here`

**World Bank**:
- No authentication required
- Can proceed immediately

**USGS**:
- No authentication required
- Bulk downloads available

**Total Cost**: $0 (all free sources)

---

## R2: Storage Format Evaluation

**Goal**: Select optimal data storage format balancing query performance, memory efficiency, and maintainability.

### Current Baseline (JSON Files)

**Test Setup**:
- Gold prices: ~4000 records (1900-2025, monthly)
- All 32 commodities: ~128,000 records

**Measurements**:
- [ ] Single file load time: ___ ms
- [ ] All files load time: ___ ms  
- [ ] Date range query (2020-2024): ___ ms
- [ ] Memory usage (all loaded): ___ MB
- [ ] Total file size: ___ MB

### Option A: SQLite

**Schema Design**:
```sql
-- TBD after research
```

**Measurements**:
- [ ] Import time: ___ ms
- [ ] Date range query (2020-2024): ___ ms
- [ ] Memory usage: ___ MB
- [ ] Database file size: ___ MB

### Option B: Indexed JSON Shards

**Structure**:
```
TBD after research
```

**Measurements**:
- [ ] Date range query (2020-2024): ___ ms
- [ ] Memory usage: ___ MB
- [ ] Total file size: ___ MB

### Option C: Hybrid Approach

**Design**: TBD

### Recommendation

*To be completed after benchmarking*

**Selected Approach**: TBD  
**Migration Plan**: TBD

---

## R3: Caching Strategy

**Goal**: Design caching architecture achieving >80% cache hit rate with acceptable freshness.

### Access Pattern Analysis

*Analyze current site analytics if available*

### Proposed Architecture

*To be designed after research*

**Components**:
- Build-time pre-generation
- Edge caching
- Client-side caching
- Cache invalidation strategy

### Recommendation

*To be completed after analysis*

---

## R4: Data Staleness Policies

**Goal**: Define acceptable staleness thresholds per commodity type and alert triggers.

### Commodity Categories

| Category | Commodities | Update Frequency | Warning Threshold | Critical Threshold |
|----------|-------------|------------------|-------------------|-------------------|
| Precious Metals | Gold, Silver, Platinum | TBD | TBD | TBD |
| Energy | Petroleum | TBD | TBD | TBD |
| Agricultural | Wheat, Corn, etc. | TBD | TBD | TBD |
| Industrial Metals | Copper, Iron, etc. | TBD | TBD | TBD |
| Historical | >1 year old | Immutable | N/A | N/A |

### Automated Update Schedule

*To be defined after research*

---

## R5: Historical Data Gap Handling

**Goal**: Design methodology for handling missing historical data while maintaining integrity.

### Data Availability Survey

*To be completed after API research*

**Findings**:
- Commodities with gaps 1900-1950: TBD
- Commodities with gaps 1950-2000: TBD
- Typical gap sizes: TBD

### Gap-Filling Methodology

**Options Considered**:
1. Linear interpolation
2. Carry-forward last value
3. Mark as unavailable
4. Seasonal adjustment

**Recommended Approach**: TBD

**Quality Indicators**:
- Raw data: "high" quality
- Interpolated data: "medium" quality + "interpolated" flag
- Large gaps (>1 year): "low" quality or unavailable

**User Communication**:
- Visual indicator on charts for interpolated data
- Tooltip showing interpolation method
- Data table column for quality indicator

---

## Technology Stack Summary

*To be completed after all research tasks*

**APIs Selected**:
- Primary: TBD
- Fallback: TBD

**Storage**:
- Format: TBD
- Location: TBD

**Caching**:
- Strategy: TBD
- Implementation: TBD

**Dependencies to Add**:
- [ ] axios or node-fetch (API calls)
- [ ] better-sqlite3 (if SQLite chosen)
- [ ] compression library (if needed)
- [ ] Other: TBD

---

## Open Questions Resolved

1. ✅ Which APIs to use? → **FRED + World Bank (primary), USGS (historical), Manual (8 commodities)**
   - 24/32 commodities automated via free APIs
   - Zero cost solution
   - Excellent reliability and documentation
   
2. ⏳ Storage format? → [Research R2 in progress]
3. ⏳ Caching approach? → [Research R3 pending]
4. ⏳ Staleness thresholds? → [Research R4 pending]
5. ⏳ Gap handling? → [Research R5 pending]

---

## Next Steps

After completing all research:
1. Update Executive Summary with key decisions
2. Proceed to Phase 1: Design (data-model.md, contracts/, quickstart.md)
3. Re-evaluate Constitution Check with finalized design
4. Generate implementation tasks with `/speckit.tasks`
