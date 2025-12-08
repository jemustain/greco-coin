# Research: Real Commodity Data APIs & Performance Optimization

**Feature**: 002-real-data-api  
**Date**: 2025-12-07  
**Status**: In Progress

## Executive Summary

*To be completed after research tasks R1-R5*

**Key Decisions**:
- [ ] Primary commodity price APIs selected
- [ ] Storage format chosen (SQLite vs indexed JSON vs hybrid)
- [ ] Caching architecture defined
- [ ] Data staleness policies established
- [ ] Gap-filling methodology documented

**Technology Stack**: TBD based on research

---

## R1: Commodity Price API Investigation

**Goal**: Identify authoritative APIs providing coverage for all 32 commodities with historical data back to 1900 where possible.

### Candidate APIs

#### Federal Reserve Economic Data (FRED)
- **URL**: https://fred.stlouisfed.org/docs/api/fred/
- **Coverage**: [TO BE RESEARCHED]
- **Historical Depth**: [TO BE RESEARCHED]
- **Frequency**: [TO BE RESEARCHED]
- **Authentication**: API key (free)
- **Rate Limits**: [TO BE RESEARCHED]
- **Cost**: Free
- **Data Quality**: [TO BE RESEARCHED]

#### World Bank Commodity Price Data
- **URL**: https://www.worldbank.org/en/research/commodity-markets
- **Coverage**: [TO BE RESEARCHED]
- **Historical Depth**: [TO BE RESEARCHED]
- **Frequency**: [TO BE RESEARCHED]
- **Authentication**: [TO BE RESEARCHED]
- **Rate Limits**: [TO BE RESEARCHED]
- **Cost**: [TO BE RESEARCHED]

#### USGS Mineral Commodity Summaries
- **URL**: https://www.usgs.gov/centers/national-minerals-information-center/
- **Coverage**: [TO BE RESEARCHED]
- **Historical Depth**: [TO BE RESEARCHED]
- **Frequency**: [TO BE RESEARCHED]
- **Authentication**: [TO BE RESEARCHED]
- **Rate Limits**: [TO BE RESEARCHED]
- **Cost**: [TO BE RESEARCHED]

#### Quandl/Nasdaq Data Link
- **URL**: https://data.nasdaq.com/
- **Coverage**: [TO BE RESEARCHED]
- **Historical Depth**: [TO BE RESEARCHED]
- **Frequency**: [TO BE RESEARCHED]
- **Authentication**: [TO BE RESEARCHED]
- **Rate Limits**: [TO BE RESEARCHED]
- **Cost**: [TO BE RESEARCHED]

### Commodity Coverage Matrix

| Commodity | FRED | World Bank | USGS | Quandl | Recommended |
|-----------|------|------------|------|--------|-------------|
| Gold | ? | ? | ? | ? | TBD |
| Silver | ? | ? | ? | ? | TBD |
| Platinum | ? | ? | ? | ? | TBD |
| Copper | ? | ? | ? | ? | TBD |
| Iron | ? | ? | ? | ? | TBD |
| Aluminum | ? | ? | ? | ? | TBD |
| ... (all 32) | | | | | |

### Recommendations

*To be completed after API investigation*

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

1. ✅ Which APIs to use? → [Answer TBD]
2. ✅ Storage format? → [Answer TBD]
3. ✅ Caching approach? → [Answer TBD]
4. ✅ Staleness thresholds? → [Answer TBD]
5. ✅ Gap handling? → [Answer TBD]

---

## Next Steps

After completing all research:
1. Update Executive Summary with key decisions
2. Proceed to Phase 1: Design (data-model.md, contracts/, quickstart.md)
3. Re-evaluate Constitution Check with finalized design
4. Generate implementation tasks with `/speckit.tasks`
