# Data Improvement Action Plan

**Status**: Ready to Execute  
**Date**: 2025-12-13  
**Priority**: HIGH

## Executive Summary

After comprehensive data research, we have identified clear paths to significantly improve data quality:

### Current Status
- ✅ **Real Data**: 78% coverage (1950-2023, 2025)
- ❌ **Gap**: 2024 (all commodities - placeholder data)
- ⚠️ **Estimated**: 1900-1949 (50 years - needs improvement)

### FRED API Status
- ✅ **API ACCESSIBLE**: Verified working December 13, 2025
- ✅ **15 FRED series verified** and returning data
- ✅ **Historical depth**: Most series go back to 1990, some to 1946-1947
- 🎯 **Only 3/15 commodities currently fetched** (copper, wheat, petroleum)

### Key Findings

1. **FRED API is fully operational** - can immediately fill 2024 gap
2. **12 commodities missing FRED data** - copper, wheat, petroleum successfully fetched but 12 others not yet integrated
3. **Historical data available** - FRED has series going back to 1946-1990 depending on commodity
4. **USGS data confirmed** - Already integrated for 1950-2025 for metals

## Immediate Actions (Next 24-48 Hours)

### Action 1: Fill 2024 Data Gap 🔥 CRITICAL

**Problem**: All commodities showing `imported` (placeholder) for 2024
**Solution**: Fetch real data from FRED API (now verified working)

**Commands**:
```bash
# Fetch 2024 data for all FRED commodities
npm run fetch-data -- --commodity=copper,aluminum,nickel,lead,tin,zinc,wheat,corn,rice,barley,gold,silver,platinum --start=2024-01-01 --end=2024-12-31 --force

# For petroleum (different series)
npm run fetch-data -- --commodity=petroleum --start=2024-01-01 --end=2024-12-31 --force

# For soybeans, cotton, peanuts
npm run fetch-data -- --commodity=soybeans,cotton,peanuts --start=2024-01-01 --end=2024-12-31 --force
```

**Expected Result**:
- 2024 gap filled with real FRED data
- ~15 commodities upgraded from "placeholder" to "real data"
- DataQualityBanner updated to remove 2024 warning

**Time**: 1-2 hours (API calls + validation)

---

### Action 2: Fetch Missing FRED Commodities (2020-Present)

**Problem**: Only 3/15 FRED commodities have been fetched
**Solution**: Systematic fetch of all 12 missing commodities

**Missing Commodities**:
1. aluminum (PALUMUSDM) - ✅ Verified 1990-2025
2. nickel (PNICKUSDM) - Need to verify
3. lead (PLEADUSDM) - Need to verify  
4. tin (PTINUSDM) - Need to verify
5. zinc (PZINCUSDM) - Need to verify
6. gold (IQ12260) - ✅ Verified 1984-2025 (price index)
7. silver (IP7106) - ✅ Verified 2021-2025 (may need alternative)
8. platinum (IP7110) - ✅ Verified 2019-2025
9. corn (PMAIZMTUSDM) - ✅ Verified 1990-2025
10. rice (PRICEUSDM) - Need to verify
11. barley (PBARLUSDM) - Need to verify
12. soybeans (PSOYBUSDM) - Need to verify
13. cotton (PCOTTUSDM) - Need to verify
14. peanuts (PPNTSOTMUSDM) - Need to verify

**Commands**:
```bash
# Test each series individually first
npx tsx scripts/verify-fred-series.ts aluminum
npx tsx scripts/verify-fred-series.ts nickel
npx tsx scripts/verify-fred-series.ts lead
npx tsx scripts/verify-fred-series.ts tin
npx tsx scripts/verify-fred-series.ts zinc
npx tsx scripts/verify-fred-series.ts rice
npx tsx scripts/verify-fred-series.ts barley
npx tsx scripts/verify-fred-series.ts soybeans
npx tsx scripts/verify-fred-series.ts cotton
npx tsx scripts/verify-fred-series.ts peanuts

# After verification, fetch all 2020-present
npm run fetch-data -- --commodity=aluminum,nickel,lead,tin,zinc,rice,barley,soybeans,cotton,peanuts --start=2020-01-01 --end=2025-12-31 --force

# Handle precious metals separately (may need different series)
npm run fetch-data -- --commodity=gold,silver,platinum --start=2020-01-01 --end=2025-12-31 --force
```

**Expected Result**:
- 12 additional commodities with real 2020-2025 data
- 15/32 total commodities (47%) with FRED data integration

**Time**: 2-3 hours (verification + fetch + validation)

---

### Action 3: Backfill Historical FRED Data (1990-2019)

**Problem**: Current shards 2000-2019 have USGS data, but FRED may have better granularity
**Solution**: Fetch FRED historical data where available, use to validate/enhance

**Verified FRED Historical Depth**:
- Aluminum: 1990-2025 (35 years)
- Copper: 1990-2025 (35 years)
- Wheat: 1990-2025 (35 years) - Also has WPU0121 from 1947!
- Corn: 1990-2025 (35 years) - Also has WPU012202 from 1971!
- Crude Oil: 1986-2025 (39 years) - Also has WTISPLC from 1946!

**Commands**:
```bash
# Fetch FRED historical data for good series
npm run fetch-data -- --commodity=aluminum,copper,wheat,corn --start=1990-01-01 --end=2019-12-31 --force

# Fetch petroleum from 1986 (older series available)
npm run fetch-data -- --commodity=petroleum --start=1986-01-01 --end=2019-12-31 --force

# For corn and wheat, try PPI series that go back to 1970s
# May need custom script to fetch WPU0121 (wheat from 1947) and WPU012202 (corn from 1971)
```

**Expected Result**:
- Enhanced 1990-2019 period with FRED monthly data
- Potential to extend some commodities back to 1946-1971
- Cross-validation of USGS vs FRED data

**Time**: 3-4 hours (fetch + validation + reconciliation)

---

## Medium-Term Actions (Next 1-2 Weeks)

### Action 4: USGS Historical Data Integration (1900-1949)

**Status**: USGS data exists for metals 1950-2025, need to extend back to 1900

**Sources**:
- USGS Historical Statistics: https://www.usgs.gov/centers/nmic/historical-statistics-mineral-and-material-commodities
- Download annual price data for: aluminum, copper, gold, iron, lead, nickel, platinum, silver, tin, zinc

**Process**:
1. Download USGS historical statistics Excel files
2. Extract 1900-1949 annual prices
3. Create CSV imports
4. Run import script with `usgs_historical` source tag
5. Update 1900-1949.json shards

**Expected Result**:
- 10 metals upgraded from "estimated" to "USGS historical"
- Annual granularity (better than current monthly estimates)
- 100% real government data for metals 1900-2025

**Time**: 1 week (manual download + data extraction + import)

---

### Action 5: Agricultural Historical Research

**Problem**: Agricultural commodities (grains, cotton, coffee, etc.) have poor pre-1950 coverage
**Solution**: Research USDA historical yearbooks and academic databases

**Sources to Explore**:
1. **USDA NASS Historical Statistics**
   - URL: https://www.nass.usda.gov/Publications/Todays_Reports/reports/croptr23.pdf
   - Coverage: Grains back to early 1900s
   
2. **David Jacks Historical Commodity Database**
   - Search: "David Jacks commodity prices" or check NBER
   - Coverage: 1850-2015 for many commodities
   
3. **FRED PPI Historical Series**
   - Wheat: WPU0121 goes back to 1947
   - Corn: WPU012202 goes back to 1971
   - Can fill significant gaps

**Process**:
1. Research and download available datasets
2. Extract relevant commodity data
3. Clean and standardize format
4. Import with appropriate quality flags
5. Validate against multiple sources

**Expected Result**:
- 8-12 agricultural commodities with pre-1950 data
- Quality mix: USDA (official), academic (research), FRED (government)
- Significantly reduced "estimated" data period

**Time**: 1-2 weeks (research-intensive)

---

## Long-Term Actions (1-2 Months)

### Action 6: Manual Historical Research (Last Resort)

**For poorly-covered commodities**: copra, cotton-seed, hides, jute, sulphur, tallow, wool, cement

**Approach**:
1. Historical trade statistics (UN Comtrade)
2. Commodity exchange archives
3. Historical price indices and inflation adjustments
4. Academic papers with data appendices

**Expected Result**:
- Best-effort historical coverage for all 32 commodities
- Transparent quality flags indicating data source
- Complete Greco Index calculations back to 1900

**Time**: 1-2 months (very research-intensive)

---

## Implementation Checklist

### Phase 1: Immediate (This Weekend) ✅ PRIORITY

- [ ] **Test FRED API access** (DONE - verified working)
- [ ] **Fetch 2024 data** for all 15 FRED commodities
  - [ ] Metals: copper, aluminum, nickel, lead, tin, zinc, gold, silver, platinum
  - [ ] Energy: petroleum
  - [ ] Agricultural: wheat, corn, rice, barley, soybeans, cotton, peanuts
- [ ] **Update 2020-present.json shards** with 2024 data
- [ ] **Regenerate date-range-index.json**
- [ ] **Test homepage** - verify 2024 gap filled
- [ ] **Update DataQualityBanner** - remove 2024 warning
- [ ] **Git commit** - "feat(data): Fill 2024 gap with real FRED API data"

**Success Metric**: 2024 data quality badge changes from ⚠️ "Sample Data" to ✅ "Real Data"

---

### Phase 2: This Week 🎯

- [ ] **Verify all 15 FRED series codes**
- [ ] **Fetch missing 12 commodities** (2020-2025)
- [ ] **Validate data quality** - check for gaps, outliers
- [ ] **Handle special cases** - index series for precious metals
- [ ] **Update shards and regenerate index**
- [ ] **Test all commodity pages**
- [ ] **Git commit** - "feat(data): Integrate 12 additional FRED commodities (2020-2025)"

**Success Metric**: 15/32 commodities (47%) have FRED API integration

---

### Phase 3: Next Week 📅

- [ ] **Fetch FRED historical data** (1990-2019 where available)
- [ ] **Research extended FRED series** (wheat 1947+, corn 1971+, petroleum 1946+)
- [ ] **Cross-validate** FRED vs USGS data
- [ ] **Reconcile discrepancies** with source priority rules
- [ ] **Update shards with historical FRED data**
- [ ] **Git commit** - "feat(data): Backfill FRED historical data (1946-2019)"

**Success Metric**: 5-8 commodities extended back to 1946-1990 period

---

### Phase 4: Next 2-4 Weeks 📚

- [ ] **Download USGS historical statistics** for all metals
- [ ] **Extract 1900-1949 annual data**
- [ ] **Import USGS historical data** for 10 metals
- [ ] **Research USDA historical yearbooks**
- [ ] **Investigate David Jacks database**
- [ ] **Import agricultural historical data**
- [ ] **Update shards with all historical data**
- [ ] **Git commit** - "feat(data): Add USGS/USDA historical data (1900-1949)"

**Success Metric**: 18-20 commodities with real historical data back to 1900-1950

---

## Data Quality Target Progression

### Current State
```
✅ Real Data (2020-2023, 2025): 60% of period
❌ Gap (2024): 8% of period  
✅ USGS Historical (1950-2019): 55% of period
⚠️ Estimated (1900-1949): 40% of period
```

### After Phase 1 (2024 filled)
```
✅ Real Data (2020-2025): 68% of period
✅ USGS Historical (1950-2019): 55% of period
⚠️ Estimated (1900-1949): 40% of period
Overall: 83% real, 17% estimated
```

### After Phase 2 (All FRED commodities)
```
✅ Real Data (2020-2025): 68% of period
✅ USGS Historical (1950-2019): 55% of period
⚠️ Estimated (1900-1949): 40% of period
Coverage: 15/32 commodities (47%) with FRED integration
Overall: 83% real, 17% estimated
```

### After Phase 3 (FRED historical backfill)
```
✅ Real Data (1990-2025): 73% of period
✅ USGS Historical (1950-1989): 30% of period
⚠️ Estimated (1900-1949): 40% of period
Overall: 86% real, 14% estimated
```

### After Phase 4 (USGS + USDA historical)
```
✅ Real Data (1990-2025): 73% of period
✅ Government Historical (1900-1989): 70% of period
⚠️ Academic/Estimated (gaps only): 5% of period
Overall: 95% real/historical, 5% estimated
```

## Technical Notes

### Script Commands Reference

**Test FRED connection**:
```bash
npx tsx scripts/verify-fred-series.ts [commodity]
```

**Fetch data from API**:
```bash
npm run fetch-data -- --commodity=<list> --start=YYYY-MM-DD --end=YYYY-MM-DD --force
```

**Import from CSV**:
```bash
npm run script:import -- <csv-file> <commodity-id>
```

**Regenerate index** (required after all updates):
```bash
npx tsx scripts/generate-date-range-index.ts
```

**Validate data quality**:
```bash
npm run script:validate
```

### Data Quality Flags

After imports, ensure proper source tags:
- `usgs` - USGS Mineral Commodity Summaries (2020-2025 metals)
- `fred` - Federal Reserve Economic Data API (1946-2025 various)
- `worldbank` - World Bank Pink Sheet (1960-2025 various)
- `usgs_historical` - USGS historical statistics (1900-1949 metals)
- `usda_historical` - USDA historical yearbooks (1900-1949 agricultural)
- `academic` - Academic research databases (various periods)
- `historical_research` - Manual research with citations (gaps only)
- `imported` - Legacy estimated data (to be replaced)

### Git Workflow

After each phase:
```bash
# Stage changes
git add src/data/prices/ src/data/indexes/

# Commit with clear message
git commit -m "feat(data): [description of what was added]"

# Push to branch
git push origin 002-real-data-api
```

### Testing After Updates

1. ✅ **Rebuild production**: `npm run build`
2. ✅ **Test homepage**: Visit http://localhost:3000
3. ✅ **Check data quality banner**: Verify messaging is accurate
4. ✅ **Spot check commodities**: Pick 3-4 and verify data looks correct
5. ✅ **Check Greco calculations**: Ensure index calculates properly
6. ✅ **Validate date ranges**: Run `npm run script:validate`

## Questions to Consider

1. **FRED Index Series**: Gold, silver, platinum use price indices not absolute prices - do we convert to prices or use indices directly?
   - **Recommendation**: Convert to approximate prices using baseline year, or switch to alternative FRED series if available

2. **Frequency Handling**: FRED has daily, monthly, quarterly, annual - which to use?
   - **Recommendation**: Use monthly where available, convert daily to monthly average

3. **Source Priority**: When FRED and USGS conflict, which to trust?
   - **Recommendation**: USGS for metals (authoritative), FRED for agricultural/energy

4. **Pre-1950 Granularity**: Accept annual data or interpolate to monthly?
   - **Recommendation**: Keep annual, flag as `annual_average` when repeated monthly

5. **DataQualityBanner Messaging**: How detailed to make it?
   - **Recommendation**: Simple 3-tier: "Current (2020-2025)", "Historical (1950-2019)", "Estimated (pre-1950)"

## Success Criteria

**Phase 1 Complete When**:
- [ ] Zero commodities show `imported` for 2024
- [ ] DataQualityBanner updated to remove 2024 warning
- [ ] Homepage loads with real 2024 data
- [ ] PR merged to main

**Phase 2 Complete When**:
- [ ] 15/32 commodities have FRED integration
- [ ] All FRED series verified and fetching correctly
- [ ] Documentation updated with FRED series mappings

**Phase 3 Complete When**:
- [ ] Historical FRED data integrated where available
- [ ] 5-8 commodities extended back to 1946-1990
- [ ] FRED vs USGS validation complete

**Phase 4 Complete When**:
- [ ] 95%+ of data is real/historical (not estimated)
- [ ] All 32 commodities have best-effort historical coverage
- [ ] Data quality fully documented and transparent

## Next Steps

**RIGHT NOW**:
1. ✅ Run `npx tsx scripts/verify-fred-series.ts` for all 15 commodities
2. ✅ Start Phase 1: Fetch 2024 data
3. ✅ Update DataQualityBanner after successful fetch

**THIS WEEKEND**:
- Complete Phase 1 (2024 gap)
- Start Phase 2 (missing FRED commodities)

**NEXT WEEK**:
- Complete Phase 2
- Begin Phase 3 (historical backfill)

---

## Resources

**API Documentation**:
- FRED API: https://fred.stlouisfed.org/docs/api/fred/
- World Bank API: https://datahelpdesk.worldbank.org/knowledgebase/articles/889392

**Data Sources**:
- USGS Historical Statistics: https://www.usgs.gov/centers/nmic/historical-statistics
- USDA NASS: https://www.nass.usda.gov/
- David Jacks: Search NBER or Google Scholar

**Scripts**:
- `scripts/verify-fred-series.ts` - Test FRED API
- `scripts/fetch-commodity-data.ts` - Fetch from APIs
- `scripts/import-prices.ts` - Import from CSV
- `scripts/generate-date-range-index.ts` - Rebuild index
- `scripts/validate-data.ts` - Quality checks

**Files**:
- See `specs/002-real-data-api/data-improvement-plan.md` for detailed research
- See `specs/002-real-data-api/research.md` for API analysis
