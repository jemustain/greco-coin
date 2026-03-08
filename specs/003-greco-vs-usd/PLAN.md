# Spec 003: Greco Coin vs USD Visualization

## Goal
Visualize how the Greco Coin (backed by 32-commodity basket) behaves over time vs the US dollar.

## What Already Exists
- ✅ 32 commodities defined with weights in `src/data/commodities.json`
- ✅ World Bank price data fetched and stored in `src/data/prices/`
- ✅ Greco time-series calculator (`src/lib/data/calculator-optimized.ts`)
- ✅ API route `/api/greco-timeseries` returning Greco values over time
- ✅ Basic `TimeSeriesChart` component using the API
- ✅ Homepage already shows a Greco value chart with date range controls

## Gap Analysis
The current homepage already shows Greco values over time in a selected currency. What's missing for the new requirements:

### 1. Greco Coin vs USD (Normalized to 1.0)
**Current:** Chart shows raw Greco value in USD (the absolute price of the basket).
**Needed:** Normalize so that Greco = 1.0 at a user-selected baseline year, then show relative movement.

**Changes:**
- Add a "Baseline Year" selector (dropdown or slider) to `ChartControls`
- Normalize the time-series: divide all values by the baseline year's value
- Y-axis label: "Greco Coin Value (1.0 = baseline year)"
- This effectively shows: "If you defined 1 Greco = 1 USD in year X, what would it be worth now?"

### 2. Commodity Price Trends (Overlay)
**Needed:** Toggle individual commodity price lines on the same or a companion chart.

**Changes:**
- New API route or extend existing: `/api/commodity-timeseries?commodities=gold,silver&startDate=...&endDate=...`
- Commodity selector (multi-select checkboxes or dropdown)
- Normalize commodity prices to same baseline year for apples-to-apples comparison
- Overlay on same chart or show as a second chart below

### 3. Production Trends (Later — Out of Scope for v1)
- Noted for future. No work needed now.

---

## Implementation Plan

### Phase 1: Normalized Greco vs USD Chart
**Effort:** Small — mostly UI changes + a normalization function

1. **Add normalization utility** (`src/lib/utils/normalize.ts`)
   - `normalizeToBaseline(data[], baselineDate) → data[]` — divides all values by the value at baseline
   
2. **Add Baseline Year selector** to `ChartControls`
   - Dropdown of available years from the data range
   - Default: earliest year with good data coverage (e.g., 1980 or 1990)

3. **Update homepage** to apply normalization before passing to chart
   - Raw data from API → normalize → chart
   - Y-axis: "Value relative to baseline (1.0)"

4. **Chart annotation** — horizontal line at y=1.0 to show the baseline reference

### Phase 2: Commodity Price Overlay
**Effort:** Medium — new data pipeline + multi-line chart

1. **New API route** `/api/commodity-timeseries`
   - Params: `commodities` (comma-separated IDs), `startDate`, `endDate`, `interval`
   - Returns price arrays per commodity

2. **Commodity selector component** (`src/components/charts/CommoditySelector.tsx`)
   - Multi-select from the 32 commodities
   - Grouped by category (Metals, Agricultural, etc.)
   - Limit to ~5 selected at once for readability

3. **Extend `TimeSeriesChart`** (or create `MultiLineChart`)
   - Support multiple named series with different colors
   - Legend showing commodity names + colors
   - All normalized to same baseline year

4. **Wire up on homepage**
   - Commodity selector below chart controls
   - Selected commodities overlaid on the Greco line

### Phase 3: Polish & UX
- Tooltip showing exact values on hover
- "What's driving changes" insight panel (which commodities moved most)
- Responsive design for mobile
- Export normalized data as CSV

---

## Data Notes
- **Best baseline year range:** 1982–2024 (petroleum data starts 1982; most commodities go back to 1960)
- **9 commodities have no World Bank data** (cement, sulphur, cotton-seed, tallow, jute, oats, rye, wool, hides) — these are excluded from calculation already
- **Effective basket = 23 commodities** with real data; completeness % already tracked

## File Changes Summary

| File | Change |
|------|--------|
| `src/lib/utils/normalize.ts` | NEW — normalization functions |
| `src/components/charts/ChartControls.tsx` | Add baseline year selector |
| `src/app/page.tsx` | Apply normalization, wire up commodity overlay |
| `src/app/api/commodity-timeseries/route.ts` | NEW — commodity price API |
| `src/components/charts/CommoditySelector.tsx` | NEW — multi-select commodity picker |
| `src/components/charts/TimeSeriesChart.tsx` | Support multi-line series |

## Open Questions
1. **Default baseline year?** — Suggest 1990 as a nice round number with good data coverage
2. **Should the Greco line and commodity lines share one chart or be stacked?** — Suggest same chart with dual Y-axes (Greco normalized on left, commodity USD on right) or all normalized
3. **Monthly vs annual granularity for v1?** — Monthly exists already, keep it
