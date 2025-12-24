# Data Improvement Plan: Historical Data Research & Integration

**Feature**: 002-real-data-api  
**Date**: 2025-12-13  
**Status**: Planning

## Current Data Status

### Coverage Analysis

Based on investigation of the current sharded data:

**Time Period Coverage**:
- **1900-1949** (50 years): `imported` source - estimated/historical data only
- **1950-1999** (50 years): `usgs` source - REAL DATA from USGS annual reports
- **2000-2019** (20 years): `usgs` source - REAL DATA from USGS monthly data
- **2020-2023** (4 years): `usgs` source - REAL DATA confirmed verified
- **2024** (1 year): `imported` source - PLACEHOLDER/GAP (FRED API unavailable)
- **2025** (current): `usgs` source - REAL DATA (current year updates)

**Data Quality Summary**:
- ✅ **REAL DATA**: 1950-2023, 2025 (98 years = 78% coverage)
- ⚠️ **ESTIMATED**: 1900-1949 (50 years = 40% of historical period)
- ❌ **GAP**: 2024 (1 year - placeholder while FRED unavailable)

### Commodity-Specific Status (Sample: Copper)

```
copper/1900-1949.json: 50 records, source="imported"
copper/1950-1999.json: 200 records, source="usgs"
copper/2000-2019.json: 240 records, source="usgs"
copper/2020-present.json: 
  - 2020-2023: 48 records, source="usgs" ✅
  - 2024: 12 records, source="imported" ❌
  - 2025: 12 records, source="usgs" ✅
```

## Problem Statement

**Issue 1: Pre-1950 Data Quality**
- 1900-1949 contains only estimated/interpolated data (`imported` source)
- 50 years of "fake-looking" data undermines user trust
- Need authoritative historical sources for this period

**Issue 2: 2024 Data Gap**
- All commodities show `imported` for 2024
- FRED API was unavailable during initial data fetch
- Need to retry FRED API or find alternative sources

**Issue 3: Missing FRED Commodities**
- Only 3 commodities successfully fetched from FRED: copper, wheat, petroleum
- 12 other FRED-mapped commodities not yet fetched
- Need systematic FRED data collection

## Research Plan: Historical Data Sources (1900-1949)

### Priority 1: USGS Historical Data (Metals Only)

**Source**: USGS Mineral Commodity Summaries - Historical Statistics
- **URL**: https://www.usgs.gov/centers/national-minerals-information-center/historical-statistics-mineral-and-material-commodities-united
- **Coverage**: All major metals back to 1900 (aluminum, copper, gold, iron, lead, nickel, platinum, silver, tin, zinc)
- **Format**: Excel/CSV files with annual prices
- **Quality**: Authoritative US government data
- **Granularity**: Annual (monthly not available pre-1950)

**Action Items**:
1. Download USGS historical statistics files for each metal
2. Extract annual price data for 1900-1949
3. Convert to monthly by repeating annual average (flagged as `annual_average`)
4. Replace current `imported` estimates with USGS historical data

**Expected Outcome**: 10/32 commodities upgraded from "estimated" to "USGS historical"

### Priority 2: FRED Historical Series

**Source**: FRED Economic Data - Historical Series
- **Coverage**: Some series extend back to 1900s-1930s
- **Potential Series**:
  - Gold: Multiple series including London Fix (from 1968), US Mint price (from 1833)
  - Silver: Historical NY price series
  - Wheat: USDA prices from 1908
  - Petroleum: Historical crude oil prices from 1920s
- **Quality**: Federal Reserve data, highly reliable
- **Granularity**: Varies (annual, monthly, quarterly)

**Action Items**:
1. Research FRED for longest-running historical series per commodity
2. Identify series that extend before 1950
3. Download and integrate historical data
4. Handle frequency conversion (annual → monthly with appropriate flags)

**Expected Outcome**: 5-8 commodities with improved historical depth

### Priority 3: World Bank Historical Data

**Source**: World Bank Commodity Price Data (Pink Sheet)
- **Coverage**: Most series from 1960, some from 1950
- **Limitation**: Generally doesn't extend before 1950
- **Use Case**: Validation and gap-filling for 1950-1960 period

**Action Items**:
1. Verify World Bank historical depth for each commodity
2. Use as secondary source to validate USGS/FRED data
3. Fill any gaps in 1950-1960 period

### Priority 4: Academic & Historical Sources

**Sources**:
- **Global Financial Database** (requires subscription - may have free historical data)
- **Historical commodity price databases** (academic research papers)
- **Jacks, David S. (2019) "From Boom to Bust: A Typology of Real Commodity Prices in the Long Run"**
  - Comprehensive commodity price database 1850-2015
  - Available from NBER or author's website
- **Svedberg & Tilton papers** on historical commodity prices

**Action Items**:
1. Search for open-access historical commodity price datasets
2. Review academic papers with data appendices
3. Contact authors for permission to use data
4. Cross-reference multiple sources for validation

**Expected Outcome**: 8-12 additional commodities with pre-1950 data

### Priority 5: Manual Historical Research (Last Resort)

**For poorly-covered commodities**: cocoa, coffee, copra, cotton-seed, hides, jute, tallow, wool

**Approach**:
1. Search historical agricultural yearbooks (USDA Historical Statistics)
2. Review international trade statistics (UN Comtrade historical data)
3. Check commodity exchange historical records
4. Use historical inflation/price indices to estimate where no direct data exists

**Quality Flag**: Mark as `historical_research` with source citation

## Integration Plan: 2024 Data Gap

### Option A: Retry FRED API (Recommended)

**Status Check**:
- Original fetch failed due to FRED API being unavailable
- FRED API key is configured (`FRED_API_KEY` in .env.local)
- API should be accessible now (December 2025)

**Action Items**:
1. ✅ Verify FRED API is currently accessible
2. ✅ Test connection with `scripts/verify-fred-series.ts`
3. ✅ Run `scripts/fetch-commodity-data.ts` for 2024 date range
4. ✅ Update shards with fetched 2024 data
5. ✅ Regenerate date-range-index.json

**Command**:
```bash
# Test FRED connection
npm run script:verify-fred

# Fetch 2024 data for all FRED commodities
npm run fetch-data -- --commodity=copper,aluminum,nickel,lead,tin,zinc,petroleum,wheat,corn,rice,barley,soybeans,cotton,peanuts --start=2024-01-01 --end=2024-12-31 --force

# Regenerate index
npm run script:generate-index
```

### Option B: World Bank API Fallback

If FRED API remains unavailable:

**Action Items**:
1. Use World Bank Pink Sheet data for 2024
2. Map commodities to World Bank indicator codes
3. Fetch via World Bank Data API (no auth required)
4. Update shards with World Bank data (mark source as `worldbank`)

### Option C: USGS Current Data

**Source**: USGS Mineral Commodity Summaries 2025
- **URL**: https://www.usgs.gov/centers/national-minerals-information-center/mineral-commodity-summaries
- **Coverage**: Annual data for 2024 (published January 2025)
- **Quality**: Authoritative, but only annual granularity

**Use Case**: Metals only, as validation or last resort

## Integration Plan: Missing FRED Commodities

### Current FRED Status

**Successfully Fetched** (3/15):
- ✅ copper (PCOPPUSDM)
- ✅ wheat (PWHEAMTUSDM)
- ✅ petroleum (MCOILWTICO)

**Not Yet Fetched** (12/15):
- ❌ gold (IQ12260 - index)
- ❌ silver (IP7106 - index)
- ❌ platinum (IP7110 - index)
- ❌ aluminum (PALUMUSDM)
- ❌ nickel (PNICKUSDM)
- ❌ lead (PLEADUSDM)
- ❌ tin (PTINUSDM)
- ❌ zinc (PZINCUSDM)
- ❌ corn (PMAIZMTUSDM)
- ❌ rice (PRICEUSDM)
- ❌ barley (PBARLUSDM)
- ❌ soybeans (PSOYBUSDM)
- ❌ cotton (PCOTTUSDM)
- ❌ peanuts (PPNTSOTMUSDM)

### Systematic Fetch Plan

**Phase 1: Verify All Series Exist** (Test Phase)
```bash
# Run verification script to check all FRED series
npm run script:verify-fred
```

**Phase 2: Fetch Historical Data** (2020-Present)
```bash
# Fetch all missing FRED commodities from 2020 onwards
npm run fetch-data -- \
  --commodity=gold,silver,platinum,aluminum,nickel,lead,tin,zinc,corn,rice,barley,soybeans,cotton,peanuts \
  --start=2020-01-01 \
  --end=2025-12-31 \
  --force
```

**Phase 3: Backfill Historical Data** (If series extend back)
```bash
# Fetch full historical data for series that support it
npm run fetch-data -- \
  --commodity=aluminum,nickel,lead,tin,zinc,corn,rice,barley,soybeans,cotton,peanuts \
  --start=1960-01-01 \
  --end=2019-12-31 \
  --force
```

**Phase 4: Handle Index Series** (Gold, Silver, Platinum)

These are price indices, not absolute prices. Need special handling:

1. Fetch index data from FRED
2. Convert index to price using baseline year
3. Cross-reference with other sources (London Fix for gold, COMEX for silver)
4. Consider switching to better FRED series or using World Bank instead

### Alternative: Direct Price Series Research

Search FRED for better series:
- Gold: "London gold price" or "COMEX gold"
- Silver: "Silver price" or "COMEX silver"
- Platinum: "Platinum price" or "NYMEX platinum"

## Implementation Roadmap

### Phase 1: Fill 2024 Gap (IMMEDIATE - HIGH PRIORITY)
**Timeline**: 1-2 days  
**Effort**: Low (automated scripts exist)

**Tasks**:
- [ ] Verify FRED API access
- [ ] Run fetch-commodity-data script for 2024
- [ ] Update 2020-present.json shards
- [ ] Regenerate date-range-index.json
- [ ] Test homepage with real 2024 data
- [ ] Update DataQualityBanner to remove "Sample Data (2024)" warning

**Success Criteria**: All commodities show real data for 2024

---

### Phase 2: Fetch Missing FRED Commodities (HIGH PRIORITY)
**Timeline**: 2-3 days  
**Effort**: Low-Medium (API calls + data validation)

**Tasks**:
- [ ] Verify all 15 FRED series codes
- [ ] Test fetch for each commodity (dry-run)
- [ ] Fetch 2020-2025 data for all 12 missing commodities
- [ ] Handle special cases (index series for precious metals)
- [ ] Validate data quality (check for gaps, outliers)
- [ ] Update shards with new data
- [ ] Regenerate index

**Success Criteria**: 15/15 FRED commodities successfully integrated

---

### Phase 3: USGS Historical Data (MEDIUM PRIORITY)
**Timeline**: 1 week  
**Effort**: Medium (manual download + data extraction)

**Tasks**:
- [ ] Download USGS historical statistics files for 10 metals
- [ ] Extract 1900-1949 annual price data
- [ ] Convert annual to monthly (repeat with `annual_average` flag)
- [ ] Create import script for USGS historical format
- [ ] Run import and update 1900-1949.json shards
- [ ] Validate historical data quality
- [ ] Update DataQualityBanner to reflect improved historical coverage

**Success Criteria**: 10 metals upgraded from "estimated" to "USGS historical" for 1900-1949

---

### Phase 4: FRED Historical Backfill (MEDIUM PRIORITY)
**Timeline**: 3-5 days  
**Effort**: Low-Medium (API calls + gap analysis)

**Tasks**:
- [ ] Research longest-running FRED series per commodity
- [ ] Identify series extending before 1950
- [ ] Fetch historical data from FRED
- [ ] Handle frequency conversion (annual/quarterly → monthly)
- [ ] Merge with existing data (don't overwrite USGS where it exists)
- [ ] Regenerate shards and index

**Success Criteria**: 5-8 commodities with improved pre-1950 coverage

---

### Phase 5: Academic Data Sources (LOW PRIORITY)
**Timeline**: 2-3 weeks  
**Effort**: High (research + permissions + data cleaning)

**Tasks**:
- [ ] Search for open-access commodity price datasets
- [ ] Review David Jacks' historical commodity database
- [ ] Contact authors for data access permissions
- [ ] Extract relevant commodity data
- [ ] Clean and standardize data format
- [ ] Cross-validate with existing sources
- [ ] Import into shards

**Success Criteria**: 8-12 commodities with academic-sourced pre-1950 data

---

### Phase 6: Manual Historical Research (LOWEST PRIORITY)
**Timeline**: 1-2 months  
**Effort**: Very High (manual research + data entry)

**Tasks**:
- [ ] Research historical agricultural yearbooks
- [ ] Review UN Comtrade historical records
- [ ] Check commodity exchange archives
- [ ] Manual data entry with source citations
- [ ] Peer review of data quality
- [ ] Import with `historical_research` quality flag

**Success Criteria**: All 32 commodities have best-effort historical coverage

---

## Data Quality Transparency

### Updated Banner Messages

**After Phase 1 (2024 filled)**:
```
✅ Real Data (2020-2025): Actual commodity prices from USGS and FRED APIs
⚠️ Historical (1950-2019): USGS government data (authoritative)
⚠️ Estimated (1900-1949): Interpolated prices based on historical records
```

**After Phase 3 (USGS historical)**:
```
✅ Real Data (2020-2025): USGS and FRED API data
✅ Historical (1950-2019): USGS monthly/annual government data
✅ Historical (1900-1949): USGS annual government data (metals) + estimates (agricultural)
```

**After Phase 5 (Academic data)**:
```
✅ Current (2020-2025): USGS and FRED API data
✅ Modern (1950-2019): USGS government data
✅ Historical (1900-1949): USGS + academic research data
```

### Quality Indicators by Source

| Source | Quality | Period | Commodities | Granularity |
|--------|---------|--------|-------------|-------------|
| `usgs` | ⭐⭐⭐⭐⭐ Excellent | 1950-2025 | Metals (10) | Monthly/Annual |
| `fred` | ⭐⭐⭐⭐⭐ Excellent | 1960-2025 | Mixed (15) | Daily/Monthly |
| `worldbank` | ⭐⭐⭐⭐ Very Good | 1960-2025 | Mixed (20) | Monthly |
| `usgs_historical` | ⭐⭐⭐⭐ Very Good | 1900-1949 | Metals (10) | Annual |
| `academic` | ⭐⭐⭐ Good | 1850-2000 | Various | Annual |
| `historical_research` | ⭐⭐ Fair | 1900-1949 | Agricultural | Annual |
| `imported` | ⭐ Estimated | 1900-1949 | All (legacy) | Monthly |

## Technical Implementation Notes

### Script Usage

**Verify FRED API**:
```bash
npm run script:verify-fred
```

**Fetch specific date range**:
```bash
npm run fetch-data -- --commodity=copper,wheat --start=2024-01-01 --end=2024-12-31 --force
```

**Import from CSV** (for manual data):
```bash
npm run script:import -- ./data/gold-1900-1949.csv gold
```

**Regenerate index after updates**:
```bash
npm run script:generate-index
```

### Data Validation

After each import:
1. ✅ Check shard file sizes (should increase)
2. ✅ Verify date ranges in index
3. ✅ Test homepage rendering
4. ✅ Check for data gaps (run validation script)
5. ✅ Verify source attribution correct

### Migration Safety

- ✅ **Backup before updates**: `git commit` before running fetch scripts
- ✅ **Test in dev**: Always test locally before deploying
- ✅ **Regenerate index**: Required after any shard updates
- ✅ **Cache invalidation**: May need to clear browser cache to see updates

## Success Metrics

### Target Coverage

| Phase | Time Period | Target Quality | Est. Completion |
|-------|-------------|----------------|-----------------|
| Phase 1 | 2024 | ✅ Real Data | 1-2 days |
| Phase 2 | 2020-2025 (all commodities) | ✅ Real Data | 3-5 days |
| Phase 3 | 1950-2019 (metals) | ✅ USGS Historical | 1 week |
| Phase 4 | 1960-2019 (agricultural) | ✅ FRED Historical | 1-2 weeks |
| Phase 5 | 1900-1949 (all) | ⭐⭐⭐+ Academic/Gov | 3-4 weeks |

### Quality Score Target

**Current**: 
- Real data: 78% of time period (1950-2025 minus 2024 gap)
- Estimated data: 22% (1900-1949)

**Phase 1 Target**: 
- Real data: 80% (2024 gap filled)
- Estimated data: 20%

**Phase 3 Target**:
- Real/Historical: 85% (USGS historical for metals)
- Academic: 10% (non-metal pre-1950)
- Estimated: 5% (only where no sources exist)

**Phase 5 Target**:
- Real/Historical: 90%+
- Academic: 9%
- Estimated: <1% (only truly unknown periods)

## Next Actions (Immediate)

1. ✅ **Test FRED API**: Run `npm run script:verify-fred`
2. ✅ **Fetch 2024 data**: Use fetch-commodity-data script
3. ✅ **Update shards**: Regenerate index after fetch
4. ✅ **Verify on homepage**: Test that 2024 gap is filled
5. ✅ **Update DataQualityBanner**: Remove 2024 warning

## Questions for Review

1. **Prioritization**: Should we focus on filling 2024 gap first (high user impact) or systematic FRED fetch (more comprehensive)?
2. **Historical depth**: Is pre-1950 data critical for MVP, or acceptable for Phase 2?
3. **Data quality tradeoffs**: Accept annual granularity pre-1950, or interpolate to monthly (with quality flags)?
4. **Academic sources**: Worth the effort to research and integrate, or focus on government data only?
5. **Manual research**: Define minimum acceptable quality for poorly-covered commodities

## Resources

**APIs**:
- FRED API Docs: https://fred.stlouisfed.org/docs/api/fred/
- World Bank API: https://datahelpdesk.worldbank.org/knowledgebase/articles/889392
- USGS Data: https://www.usgs.gov/centers/national-minerals-information-center/

**Historical Data**:
- USGS Historical Statistics: https://www.usgs.gov/centers/nmic/historical-statistics-mineral-and-material-commodities
- David Jacks Database: Search "David Jacks commodity prices" or NBER

**Scripts**:
- `scripts/verify-fred-series.ts` - Test FRED API connection
- `scripts/fetch-commodity-data.ts` - Fetch from APIs
- `scripts/import-prices.ts` - Import from CSV
- `scripts/generate-date-range-index.ts` - Rebuild index
- `scripts/validate-data.ts` - Check data quality
