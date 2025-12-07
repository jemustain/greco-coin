# Implementation Plan: Greco Historical Currency Tracker

**Branch**: `001-greco-tracker` | **Date**: 2025-12-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-greco-tracker/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a web-based historical economic data tracker that visualizes purchasing power trends of a standardized basket of 32 commodities (the "Greco unit") across 9 currencies/assets from 1900 to present. The system provides interactive time-series charts, multi-currency comparisons, data export capabilities, and educational content explaining Tom Greco's alternative monetary theory. Primary technical approach: Static site generation with Vercel hosting, using TypeScript/Next.js for the frontend, with historical data (~37,000 price points) served from JSON files or lightweight database, emphasizing performance (<3s load, <500ms queries) and accessibility (WCAG 2.1 AA).

## Technical Context

**Language/Version**: TypeScript 5.3+ / JavaScript (ES2022)  
**Primary Dependencies**: Next.js 14 (App Router), React 18, Recharts/Chart.js (visualization), Tailwind CSS (styling)  
**Storage**: JSON files for static historical data (~37K records), potential SQLite for dev/admin, Vercel KV for future caching  
**Testing**: Vitest (unit), Playwright (E2E), React Testing Library (component)  
**Target Platform**: Vercel (serverless deployment), browser-based (Chrome, Firefox, Safari, Edge - current + previous versions)
**Project Type**: Web application (Next.js static + dynamic routes)  
**Performance Goals**: <3s initial page load, <500ms interactive queries, support 320px-4K displays  
**Constraints**: Static site generation for historical data (immutable), WCAG 2.1 AA accessibility, CSV export under 5s  
**Scale/Scope**: ~37K historical price points (32 commodities + 9 currencies × ~900-1000 records each), read-heavy workload, no authentication required

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Data Integrity (NON-NEGOTIABLE) ✅
- [ ] All historical price data includes source attribution and citations
- [ ] Data quality indicators visible to users (completeness, confidence levels)
- [ ] Known data gaps explicitly noted rather than interpolated
- [ ] Admin scripts validate data format and perform range checks before import
- [ ] Methodology documentation explains all calculations

**Status**: PASS - FR-014 (source documentation), FR-015 (methodology), FR-022 (validation), FR-024 (admin scripts with validation)

### II. Accessibility ✅
- [ ] WCAG 2.1 AA compliance (keyboard navigation, screen readers, color contrast)
- [ ] Responsive design for 320px mobile to 4K desktop
- [ ] Progressive enhancement: core functionality without JavaScript
- [ ] Clear navigation for non-technical users
- [ ] CSV/JSON export for external analysis

**Status**: PASS - FR-018 (responsive design), Assumption #7 (WCAG 2.1 AA), FR-009 (export), Success Criteria SC-004

### III. Transparency ✅
- [ ] Basket composition fully documented (32 commodities with units)
- [ ] Exchange rate calculation methods explained
- [ ] Source code publicly available (GitHub)
- [ ] User-facing documentation explains Greco unit concept
- [ ] Data provenance traceable for every value

**Status**: PASS - FR-012 (basket documented), FR-013 (educational content), FR-014 (sources), User Story 4 (methodology page)

### IV. Flexibility ✅
- [ ] Time-series charts with adjustable date ranges
- [ ] Multi-currency comparison (all 9 assets)
- [ ] Pivot table functionality for data reorganization
- [ ] Filtering by currency, asset type, time period
- [ ] Greco unit value normalized against any currency/asset

**Status**: PASS - FR-001 (time-series), FR-004 (multi-currency), FR-010 (pivot), FR-006 (filtering), FR-011 (exchange rates)

### V. Historical Depth ✅
- [ ] Data coverage from 1900 where available
- [ ] Monthly granularity (1950+), annual granularity (1900-1950)
- [ ] Data gaps handled gracefully with annotations
- [ ] Currency inception dates respected (EUR 1999+, BTC 2009+)
- [ ] ~37K historical price points across all commodities/currencies

**Status**: PASS - FR-003 (1900+ coverage with granularity), FR-016 (gap handling), FR-017 (inception dates), Clarification Q1 (data volume)

### VI. Educational Value ✅
- [ ] Tom Greco's basket of goods theory explained
- [ ] Contextual information interpreting trends
- [ ] Links to primary sources and additional reading
- [ ] Purchasing power comparisons highlighted
- [ ] Currency stability/instability visualized

**Status**: PASS - User Story 4 (educational content), FR-013 (explanation), Success Criteria SC-007 (80% comprehension)

### Overall Gate Status: ✅ PASS
All constitutional principles satisfied. No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/001-greco-tracker/
├── plan.md                     # This file (/speckit.plan command output)
├── spec.md                     # Feature specification
├── research.md                 # Phase 0 output (technology decisions & rationale)
├── data-model.md               # Phase 1 output (entities & relationships)
├── quickstart.md               # Phase 1 output (developer getting started guide)
├── BASKET_COMPOSITION.md       # Reference: 32 commodities with units
├── basket-commodities.csv      # Reference: commodity data in CSV format
├── checklists/
│   └── requirements.md         # Specification quality checklist
└── contracts/                  # Phase 1 output (API contracts if needed)
```

### Source Code (repository root)

```text
src/
├── app/                        # Next.js 14 App Router
│   ├── layout.tsx             # Root layout with metadata
│   ├── page.tsx               # Homepage (P1: view Greco trends)
│   ├── compare/               # P2: multi-currency comparison
│   │   └── page.tsx
│   ├── data/                  # P3: raw data with pivot functionality
│   │   └── page.tsx
│   ├── about/                 # P4: educational content
│   │   ├── page.tsx           # About Greco unit
│   │   ├── methodology/
│   │   │   └── page.tsx       # Calculation methodology
│   │   └── sources/
│   │       └── page.tsx       # Data sources & citations
│   └── api/                   # API routes (if needed for dynamic features)
│       └── export/
│           └── route.ts       # CSV export endpoint
├── components/
│   ├── charts/
│   │   ├── TimeSeriesChart.tsx        # P1: main visualization
│   │   ├── MultiCurrencyChart.tsx     # P2: comparison chart
│   │   └── ChartControls.tsx          # Date range, currency selection
│   ├── data/
│   │   ├── DataTable.tsx              # P3: tabular data view
│   │   ├── PivotControls.tsx          # P3: pivot functionality
│   │   └── ExportButton.tsx           # P3: CSV export
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   └── ui/                            # Reusable UI components
│       ├── Button.tsx
│       ├── Select.tsx
│       └── Tooltip.tsx
├── lib/
│   ├── data/
│   │   ├── loader.ts                  # Load historical data from JSON
│   │   ├── calculator.ts              # Greco unit calculations
│   │   ├── converter.ts               # Unit conversions
│   │   └── validator.ts               # Data validation
│   ├── utils/
│   │   ├── date.ts                    # Date range utilities
│   │   ├── format.ts                  # Number/currency formatting
│   │   └── export.ts                  # CSV generation
│   └── types/
│       ├── commodity.ts               # Commodity types & interfaces
│       ├── currency.ts                # Currency/asset types
│       └── greco.ts                   # Greco unit types
├── data/                              # Historical data files
│   ├── commodities/
│   │   ├── gold.json                  # Price data per commodity
│   │   ├── silver.json
│   │   └── [... 30 more]
│   ├── currencies/
│   │   ├── usd.json                   # Currency exchange data
│   │   ├── eur.json
│   │   └── [... 7 more]
│   └── metadata/
│       ├── basket-weights.json        # Commodity weightings
│       ├── units.json                 # Unit definitions & conversions
│       └── sources.json               # Data source citations
└── styles/
    └── globals.css                    # Tailwind & custom styles

scripts/                               # Admin & data management
├── import-data.ts                     # Import historical price data
├── validate-data.ts                   # Validate data integrity
├── calculate-greco.ts                 # Calculate Greco unit values
└── generate-metadata.ts               # Update metadata files

tests/
├── unit/
│   ├── lib/
│   │   ├── calculator.test.ts         # Greco calculations
│   │   ├── converter.test.ts          # Unit conversions
│   │   └── validator.test.ts          # Data validation
│   └── components/
│       ├── charts/
│       │   └── TimeSeriesChart.test.tsx
│       └── data/
│           └── DataTable.test.tsx
├── integration/
│   ├── data-loading.test.ts           # Data loading workflows
│   └── export.test.ts                 # CSV export functionality
└── e2e/
    ├── user-story-1.spec.ts           # P1: View Greco trends
    ├── user-story-2.spec.ts           # P2: Compare currencies
    ├── user-story-3.spec.ts           # P3: Access raw data
    └── user-story-4.spec.ts           # P4: Learn about Greco

public/
├── images/                            # Static assets
└── docs/                              # Additional documentation PDFs

.github/
├── workflows/
│   ├── ci.yml                         # Run tests on PR
│   └── deploy.yml                     # Deploy to Vercel
└── [... speckit files]
```

**Structure Decision**: Web application structure selected based on:
- Frontend-focused educational tool (no separate backend needed)
- Next.js App Router for modern React patterns and SEO
- Static data served from JSON files (historical data immutable)
- Admin scripts for data management run locally, not deployed
- Component-based architecture for reusability across 4 user stories
- Data files organized by type (commodities, currencies, metadata)

---

## Phase 0: Research & Technology Decisions

*See [research.md](./research.md) for detailed analysis*

**Summary**: Evaluated alternatives for framework (Next.js 14 vs Vite/Astro/SvelteKit), data storage (JSON files + SQLite vs PostgreSQL), charting (Recharts vs Chart.js/D3), styling (Tailwind CSS), validation (TypeScript + Zod), testing (Vitest/Playwright), accessibility (Radix UI), deployment (Vercel), weighting strategy (flexible methodology), and unit conversion (centralized service). Key risks identified: historical data availability (HIGH), commodity weighting methodology (HIGH), unit conversion accuracy (MEDIUM), chart performance (MEDIUM). Technology stack optimized for read-heavy workload with ~37K immutable historical records.

---

## Phase 1: Architecture & Contracts

### 1.1 Data Model

*See [data-model.md](./data-model.md) for complete entity definitions*

**Core Entities**: 12 total
1. **Commodity** - 32 physical goods (Gold, Wheat, Petroleum, etc.) with category, unit, metadata
2. **CommodityCategory** - 6 classifications (Metals, Energy, Grains, Products, Fibers, Animal)
3. **UnitOfMeasure** - Standard units (Troy Ounce, Metric Ton, Bushel, etc.) with conversions
4. **CommodityPricePoint** - ~37K historical prices (1900-2025, annual pre-1950, monthly 1950+)
5. **Currency** - 9 currencies/assets (USD, EUR, GBP, CNY, RUB, INR, Gold, Silver, BTC)
6. **CurrencyExchangeRate** - Exchange rates between currency pairs (USD base)
7. **BasketWeight** - Commodity weighting schemes for Greco calculation (versioned)
8. **GrecoValue** - Pre-calculated Greco unit values per currency (derived entity)
9. **DataSource** - Documentation of data provenance (government, exchange, academic, commercial)
10. **DataQualityIndicator** - Confidence levels and flags (missing-data, outlier, estimated, etc.)
11. **TimeSeriesDataPoint** - UI-optimized format for chart rendering (derived)
12. **PivotTableData** - Reorganized data for pivot views (derived)

**Key Relationships**:
- Commodity → Many CommodityPricePoints → DataSource
- Commodity → 1 BasketWeight (per version)
- Currency → Many CurrencyExchangeRates → DataSource
- Currency → Many GrecoValues (calculated from CommodityPricePoints + BasketWeights)

**Validation Rules**:
- Date ranges respect currency inception dates (EUR 1999+, BTC 2009+)
- Greco calculation requires ≥80% commodity data completeness (SC-005)
- All price points have source attribution (Constitutional Principle I)
- Basket weights sum to 1.0 per version

**Storage**:
- JSON files: `commodities.json`, `currencies.json`, `prices/*.json` (32 files), `exchange-rates.json`, `greco-values.json`, `basket-weights.json`, `units.json`, `data-sources.json`
- SQLite: `admin.db` (for admin scripts, not deployed)

### 1.2 API Contracts

*See [contracts/](./contracts/) for detailed specifications*

**Public APIs**:
1. **POST /api/export** - CSV data export with filters
   - Request: `{ format: "csv", dataType: "greco-values"|"commodity-prices"|"exchange-rates", filters: {...} }`
   - Response: CSV file with headers, max 1M rows or 100MB
   - Validation: Date ranges (1900-present), currency inception dates, commodity IDs exist
   - Performance: <5s generation, streaming for large exports
   - Rate limiting: 10 exports/hour per IP

**Internal Contracts**:
- JSON data file schemas (Zod validation): `CommoditySchema`, `PricePointSchema`, `GrecoValueSchema`, etc.
- Data quality flags: `missing-data`, `outlier`, `estimated`, `source-conflict`, `historical-uncertainty`
- Unit conversion contract: Centralized service with commodity-specific bushel conversions

**Future APIs** (post-MVP):
- GET /api/greco-values - Query Greco values with filters
- GET /api/commodities - List commodities with category filtering
- WebSocket for real-time updates (if adding current prices)

### 1.3 Developer Quickstart

*See [quickstart.md](./quickstart.md) for complete guide*

**Prerequisites**: Node.js 18.17+, npm 9.0+, Git 2.30+, VS Code 1.80+

**Setup** (15-20 minutes):
1. Clone repository: `git clone https://github.com/jemustain/greco-coin.git`
2. Install dependencies: `npm install` (234 packages)
3. Verify: `npm run check` (TypeScript, linting, tests, build)
4. Start dev server: `npm run dev` → http://localhost:3000

**Admin Scripts**:
- `npx tsx src/scripts/calculate-greco.ts` - Regenerate Greco values
- `npx tsx src/scripts/validate-data.ts` - Check data integrity
- `npx tsx src/scripts/import-prices.ts` - Import new price data from CSV

**Testing**:
- Unit tests: `npm run test:unit` (Vitest)
- Component tests: `npm run test:components` (React Testing Library)
- E2E tests: `npm run test:e2e` (Playwright)

**Database Access**: `sqlite3 src/scripts/db/admin.db` for admin workflows

**Deployment**: Vercel CLI (`vercel --prod`) or GitHub integration

### 1.4 Agent Context Update

✅ **Completed**: Updated `.github/agents/copilot-instructions.md` with:
- Language: TypeScript 5.3+ / JavaScript (ES2022)
- Framework: Next.js 14 (App Router), React 18, Recharts, Tailwind CSS
- Database: JSON files (~37K records), SQLite for dev/admin
- Project type: Web application (Next.js static + dynamic routes)

**Usage**: GitHub Copilot now has context of technology stack for inline code suggestions

---

## Phase 2: Task Breakdown

**Status**: PENDING - Run `/speckit.tasks` to generate `tasks.md`

The tasks phase will break down implementation into specific, ordered tasks organized by user story priority:
1. **P1 Tasks**: View Greco unit historical trends (Time-series chart, date range filtering, core data loading)
2. **P2 Tasks**: Compare against multiple currencies (Multi-currency chart, currency selection, exchange rate calculations)
3. **P3 Tasks**: Access raw data (Data table, pivot functionality, CSV export API)
4. **P4 Tasks**: Learn about Greco unit (Educational content pages, methodology documentation, source citations)

Each task will include:
- Specific file paths to create/edit
- Dependencies on other tasks
- Acceptance criteria
- Estimated complexity

**Next Command**: `/speckit.tasks` (after this plan is complete)

---

## Implementation Readiness

### ✅ Phase 0 Complete
- [x] research.md - 10 technology decisions with rationale
- [x] Risk assessment (3 HIGH, 2 MEDIUM, 2 LOW risks identified)
- [x] Technology stack finalized

### ✅ Phase 1 Complete
- [x] data-model.md - 12 entities with relationships, validation rules, storage schemas
- [x] contracts/api-export.md - CSV export API specification
- [x] contracts/data-structures.md - JSON file schemas and Zod validation
- [x] quickstart.md - Developer setup guide (15-20 min setup)
- [x] Agent context updated - GitHub Copilot instructions file created

### ⏳ Phase 2 Pending
- [ ] tasks.md - Awaiting `/speckit.tasks` command
- [ ] Task dependencies mapped
- [ ] Implementation order established

---

## Outstanding Dependencies

### External Dependencies (from spec.md Assumptions)

**#2 - Historical Data Sources** (HIGH PRIORITY):
- Status: NOT STARTED
- Action Required: Research and identify reliable sources for 32 commodities (1900-2025)
- Suggested Sources:
  - USGS Minerals Yearbook (metals, 1900+)
  - FRED Economic Data (grains, fibers, 1950+)
  - IMF/World Bank (currencies, exchange rates)
  - London Metal Exchange (LME) historical data
  - NYMEX/COMEX (energy, metals)
  - Academic datasets (U of Illinois agriculture data)
- Impact: Cannot populate data files until sources identified
- Blocker For: Data import scripts, CSV export testing, E2E testing

**#4 - Commodity Weighting Methodology** (HIGH PRIORITY):
- Status: NOT STARTED
- Action Required: Review "The End of Money and the Future of Civilization" (Tom Greco, 2009) to extract weighting methodology
- Current State: Equal weighting (1/32 = 0.03125) used as placeholder in basket-weights.json v1.0.0
- Impact: Greco unit calculations will be inaccurate until proper weights applied
- Blocker For: Accurate Greco value calculations, educational content explaining methodology
- Timeline: Should complete before implementation phase begins

**#5 - Unit Anomaly Resolution** (MEDIUM PRIORITY):
- Status: NOT STARTED
- Issues:
  - Cement reported in troy ounces (unusual, likely error)
  - Wheat, Cocoa, Cotton Seed, Copra have dual units (need primary selection)
- Action Required: Verify BASKET_COMPOSITION.md commodity units against authoritative sources
- Impact: Unit conversion accuracy, data import validation
- Blocker For: Unit conversion service implementation

### Internal Dependencies (Technical)

**Data Files Creation** (BLOCKS: All implementation):
- Priority: CRITICAL
- Required Files:
  - `src/data/commodities.json` (32 commodities)
  - `src/data/currencies.json` (9 currencies)
  - `src/data/units.json` (7 units with conversions)
  - `src/data/basket-weights.json` (v1.0.0 equal weights)
  - `src/data/data-sources.json` (placeholder, populate with real sources later)
  - `src/data/prices/*.json` (32 files, can start with sample data)
  - `src/data/exchange-rates.json` (sample data, populate incrementally)
  - `src/data/greco-values.json` (empty initially, generated by calculate-greco script)
- Timeline: Create initial files with sample/placeholder data during first implementation tasks

**Schema Validation Setup** (BLOCKS: Data import, API endpoints):
- Priority: HIGH
- Required: Implement Zod schemas from contracts/data-structures.md
- Timeline: First task in P3 (raw data access) user story

---

## Next Steps

### Immediate Actions (Before Implementation)

1. **Run /speckit.tasks** - Generate tasks.md with implementation breakdown
2. **Create Sample Data Files** - Initialize JSON files with placeholder data for development
3. **Research Historical Data Sources** - Begin Dependency #2 investigation
4. **Review Tom Greco's Book** - Extract commodity weighting methodology (Dependency #4)

### Implementation Sequence (After tasks.md Generated)

**Phase A: Foundation (P1 Core)**
1. Create initial data files (JSON schemas)
2. Implement data loader (`lib/data/loader.ts`)
3. Build basic time-series chart (`components/charts/TimeSeriesChart.tsx`)
4. Create homepage with chart (`app/page.tsx`)

**Phase B: Calculations (P1/P2)**
5. Implement Greco calculator (`lib/data/calculator.ts`)
6. Add unit converter (`lib/data/converter.ts`)
7. Build multi-currency chart (`components/charts/MultiCurrencyChart.tsx`)
8. Create comparison page (`app/compare/page.tsx`)

**Phase C: Data Access (P3)**
9. Implement Zod validation schemas
10. Build data table component (`components/data/DataTable.tsx`)
11. Add pivot functionality (`components/data/PivotControls.tsx`)
12. Create CSV export API (`app/api/export/route.ts`)
13. Create raw data page (`app/data/page.tsx`)

**Phase D: Education (P4)**
14. Write educational content (Markdown)
15. Create about pages (`app/about/*.tsx`)
16. Add methodology documentation
17. Link data sources

**Phase E: Polish**
18. Accessibility audit (WCAG 2.1 AA)
19. Performance optimization (<3s load, <500ms queries)
20. E2E testing (Playwright)
21. Deployment to Vercel

---

## Complexity Tracking

### Estimated Complexity by User Story

| User Story | Priority | Estimated Tasks | Complexity | Dependencies |
|-----------|----------|----------------|-----------|--------------|
| P1: View Greco trends | Must Have | ~8-10 tasks | MEDIUM | Data files, loader, calculator, chart |
| P2: Compare currencies | Must Have | ~5-7 tasks | MEDIUM | P1 complete, exchange rates, multi-chart |
| P3: Access raw data | Must Have | ~6-8 tasks | MEDIUM | P1 complete, validation, pivot, export API |
| P4: Learn about Greco | Should Have | ~4-5 tasks | LOW | Content writing, simple pages |

**Total Estimated Tasks**: 23-30 tasks

### Risk Areas Requiring Extra Attention

1. **Historical Data Availability** (HIGH RISK - Dependency #2)
   - Mitigation: Start with sample data, implement loaders early to allow parallel data population
   - Contingency: Focus on 1950+ monthly data first (more reliable sources), backfill 1900-1950 annual data later

2. **Commodity Weighting Methodology** (HIGH RISK - Dependency #4)
   - Mitigation: Use equal weights (1/32) as placeholder, isolate weighting logic in BasketWeight entity
   - Contingency: Allow user-configurable weights as feature enhancement

3. **Unit Conversion Accuracy** (MEDIUM RISK)
   - Mitigation: Centralized conversion service with extensive unit tests
   - Validation: Cross-reference calculations with external commodity price indices

4. **Chart Performance with 37K Data Points** (MEDIUM RISK)
   - Mitigation: Implement data sampling for large date ranges (see quickstart.md troubleshooting)
   - Optimization: Use Recharts' built-in performance features, consider virtualization

---

## Success Criteria Review

**From spec.md Success Criteria (SC-001 through SC-007)**:

| ID | Criterion | Implementation Notes | Status |
|----|-----------|---------------------|--------|
| SC-001 | Charts load <3s | Performance monitoring in research.md Decision 6 | Planned |
| SC-002 | Accessible WCAG 2.1 AA | Radix UI + manual testing (research.md Decision 7) | Planned |
| SC-003 | Time-series chart | TimeSeriesChart component (P1) | Planned |
| SC-004 | Responsive 320px-4K | Tailwind breakpoints (research.md Decision 4) | Planned |
| SC-005 | Greco 80% complete | GrecoValue.calculationMetadata.completenessRatio validation | Planned |
| SC-006 | CSV export <5s | Streaming implementation (contracts/api-export.md) | Planned |
| SC-007 | 80% comprehension | Educational content + user testing (P4) | Planned |

---

## Plan Completion Status

✅ **COMPLETE** - Implementation plan ready for Phase 2 (tasks generation)

**Generated Artifacts**:
- [x] plan.md (this file)
- [x] research.md (10 technology decisions)
- [x] data-model.md (12 entities, relationships, validation)
- [x] contracts/api-export.md (CSV export API)
- [x] contracts/data-structures.md (JSON schemas, Zod validation)
- [x] quickstart.md (developer setup guide)
- [x] .github/agents/copilot-instructions.md (agent context)

**Ready For**:
- `/speckit.tasks` command to generate tasks.md
- Implementation phase (`/speckit.implement` after tasks generated)

**Blocked By**:
- External data source research (Dependency #2)
- Tom Greco weighting methodology (Dependency #4)

---

*Plan generated by: `/speckit.plan` command*  
*Last updated: 2025-12-06*  
*Agent: GitHub Copilot*

