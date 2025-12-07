# Tasks: Greco Historical Currency Tracker

**Feature**: 001-greco-tracker  
**Input**: Design documents from `/specs/001-greco-tracker/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Not explicitly requested in specification - focusing on implementation tasks only. E2E tests will be added in Polish phase for validation.

**Organization**: Tasks grouped by user story (P1-P4) to enable independent implementation and testing. Each story delivers a complete, independently verifiable increment.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story this task belongs to (US1, US2, US3, US4)
- Exact file paths included in descriptions

---

## Phase 1: Setup (Project Initialization) ✅

**Purpose**: Initialize Next.js project and core infrastructure

- [x] T001 Initialize Next.js 14 project with TypeScript 5.3+ using `npx create-next-app@latest greco-coin --typescript --tailwind --app --src-dir`
- [x] T002 Install core dependencies: `npm install recharts zod date-fns`
- [x] T003 [P] Install dev dependencies: `npm install -D vitest @testing-library/react @testing-library/jest-dom @playwright/test`
- [x] T004 [P] Configure Vitest in `vitest.config.ts` with React Testing Library setup
- [x] T005 [P] Configure Playwright in `playwright.config.ts` for E2E tests
- [x] T006 [P] Setup Tailwind CSS configuration in `tailwind.config.ts` with responsive breakpoints (320px-4K)
- [x] T007 Create project directory structure: `src/data/`, `src/data/prices/`, `src/data/metadata/`, `scripts/`
- [x] T008 [P] Configure TypeScript path aliases in `tsconfig.json` (@/components, @/lib, @/data)
- [x] T009 [P] Create `.env.local` for environment variables (API URLs, etc.)
- [x] T010 [P] Setup ESLint configuration for Next.js and accessibility rules

**Checkpoint**: ✅ Project initialized with all dependencies and configuration files ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Data Files & Types ✅

- [x] T011 [P] Create TypeScript types in `src/lib/types/commodity.ts` (Commodity, CommodityCategory, CommodityPricePoint)
- [x] T012 [P] Create TypeScript types in `src/lib/types/currency.ts` (Currency, CurrencyExchangeRate)
- [x] T013 [P] Create TypeScript types in `src/lib/types/greco.ts` (GrecoValue, BasketWeight, DataQualityIndicator)
- [x] T014 [P] Create Zod validation schemas in `src/lib/validation/schemas.ts` for all data types
- [x] T015 Create sample `src/data/commodities.json` with all 32 commodities (Gold, Silver, Iron, Copper, Aluminum, Tin, Lead, Zinc, Nickel, Platinum, Petroleum, Cement, Rubber, Sulphur, Rice, Wheat, Corn, Barley, Oats, Rye, Peanuts, Soy Beans, Coffee, Cocoa, Sugar, Cotton Seed, Cotton, Wool, Jute, Hides, Copra, Tallow)
- [x] T016 Create sample `src/data/currencies.json` with 9 currencies/assets (USD, EUR, GBP, CNY, RUB, INR, Gold, Silver, BTC)
- [x] T017 [P] Create `src/data/units.json` with unit definitions and conversion factors (Troy Ounce, Metric Ton, Bushel, Pound, Kilogram, Barrel, Hundredweight)
- [x] T018 [P] Create `src/data/metadata/basket-weights.json` with v1.0.0 equal weighting scheme (1/32 per commodity)
- [x] T019 [P] Create `src/data/metadata/sources.json` with placeholder data source citations
- [x] T020 Create sample price data in `src/data/prices/gold.json` (100 sample records 1900-2025)
- [x] T021 [P] Create sample price data in `src/data/prices/wheat.json` (100 sample records 1900-2025)
- [x] T022 [P] Create sample `src/data/exchange-rates.json` with USD base rates (50 sample records)

### Core Data Services ✅

- [x] T023 Implement data loader in `src/lib/data/loader.ts` (loadCommodities, loadCurrencies, loadPrices, loadExchangeRates)
- [x] T024 Implement Greco calculator in `src/lib/data/calculator.ts` (calculateGrecoValue, validateCompleteness ≥80%)
- [x] T025 [P] Implement unit converter in `src/lib/data/converter.ts` (convertToMetricTon, handleBushelConversions)
- [x] T026 [P] Implement data validator in `src/lib/data/validator.ts` (validatePricePoint, checkDateRanges, flagOutliers)

### Utility Functions ✅

- [x] T027 [P] Create date utilities in `src/lib/utils/date.ts` (formatDate, getDateRange, checkCurrencyInception)
- [x] T028 [P] Create formatting utilities in `src/lib/utils/format.ts` (formatCurrency, formatNumber, formatPercentage)
- [x] T029 [P] Create export utilities in `src/lib/utils/export.ts` (generateCSV, streamLargeDataset)

### Shared UI Components ✅

- [x] T030 [P] Create Button component in `src/components/ui/Button.tsx` with Tailwind styling
- [x] T031 [P] Create Select component in `src/components/ui/Select.tsx` for dropdowns
- [x] T032 [P] Create Tooltip component in `src/components/ui/Tooltip.tsx` for data point details
- [x] T033 [P] Create Header component in `src/components/layout/Header.tsx` with navigation
- [x] T034 [P] Create Footer component in `src/components/layout/Footer.tsx` with links
- [x] T035 Create root layout in `src/app/layout.tsx` with metadata, Tailwind imports, Header, Footer

**Checkpoint**: ✅ Foundation complete - data loading, calculations, and shared UI ready. User story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - View Greco Trends (Priority: P1) 🎯 MVP

**Goal**: Enable users to view time-series charts showing Greco unit values for any selected currency from 1900 to present

**Independent Test**: Load homepage → Select USD from currency dropdown → Verify chart displays with 1900-2025 data → Hover over data point → Verify tooltip shows date, value, and basket summary → Change date range → Verify chart updates

### US1 Components ✅

- [x] T036 [P] [US1] Create ChartControls component in `src/components/charts/ChartControls.tsx` (currency selector, date range inputs)
- [x] T037 [US1] Create TimeSeriesChart component in `src/components/charts/TimeSeriesChart.tsx` using Recharts (LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer)
- [x] T038 [US1] Implement chart data transformation in `src/lib/utils/chart.ts` (convertToTimeSeriesData, sampleDataForPerformance, handleDataGaps)

### US1 Pages & Integration 🔄

- [x] T039 [US1] Create homepage in `src/app/page.tsx` integrating TimeSeriesChart and ChartControls
- [x] T040 [US1] Implement data loading logic for homepage (load currencies, load prices, calculate Greco values)
- [x] T041 [US1] Add date range filtering functionality (custom ranges, preset ranges: 1900-2025, 1950-2025, 2000-2025)
- [x] T042 [US1] Implement tooltip with basket composition summary (show 32 commodities contribution)
- [x] T043 [US1] Add explanatory text about Greco unit concept below chart (FR-013)
- [x] T044 [US1] Implement data gap handling with annotations in chart (FR-016)
- [x] T045 [US1] Add currency inception date validation (show only valid dates for EUR 1999+, BTC 2009+)

### US1 Styling & Responsiveness ✅

- [x] T046 [US1] Implement responsive chart sizing in `src/styles/globals.css` (320px mobile to 4K desktop)
- [x] T047 [US1] Add loading states and error boundaries for data fetching
- [x] T048 [US1] Optimize chart performance for <500ms interaction (implement data sampling if needed)

**Checkpoint**: ✅ User Story 1 complete - users can view Greco trends for any currency with interactive time-series chart. This is the MVP!

---

## Phase 4: User Story 2 - Compare Multiple Currencies (Priority: P2) ✅

**Goal**: Enable users to compare purchasing power of multiple currencies/assets side-by-side on the same chart

**Independent Test**: Navigate to homepage → Select USD, GBP, and Gold checkboxes → Verify all 3 appear on chart with distinct colors and legend → Hover over 1950 → Verify tooltip shows values for all 3 → Toggle off GBP → Verify it disappears from chart

### US2 Components ✅

- [x] T049 [P] [US2] Create MultiCurrencyChart component in `src/components/charts/MultiCurrencyChart.tsx` (multiple Line series, Legend)
- [x] T050 [US2] Enhance ChartControls in `src/components/charts/ChartControls.tsx` with multi-select currency checkboxes
- [x] T051 [US2] Implement multi-currency data aggregation in `src/lib/utils/chart.ts` (mergeTimeSeriesData, assignColors)

### US2 Pages & Integration ✅

- [x] T052 [US2] Create comparison page in `src/app/compare/page.tsx` integrating MultiCurrencyChart
- [x] T053 [US2] Implement multi-currency selection logic (max 9 currencies, toggle on/off)
- [x] T054 [US2] Add ComparisonInsights panel showing performance metrics and detailed data table
- [x] T055 [US2] Implement CSV export functionality with proper filename and date formatting
- [x] T056 [US2] Add URL state persistence using searchParams for currency selections
- [x] T057 [US2] Implement mobile-responsive layout with stacked components

### US2 Styling & Features ✅

- [x] T058 [US2] Add Loading states with skeleton placeholders during data fetching
- [x] T059 [US2] Add ErrorBoundary components wrapping chart and insights sections
- [x] T060 [US2] Update navigation in Header component to link to /compare page (already existed)

**Checkpoint**: ✅ User Story 2 complete - users can compare multiple currencies side-by-side, view performance insights, export CSV data, and share comparison URLs

---

## Phase 5: User Story 3 - Access Raw Data (Priority: P3) ✅

**Goal**: Enable users to view, filter, export, and pivot historical price data in tabular format

**Independent Test**: Navigate to /data page → Verify table displays with Date, Currency, Greco Value columns → Apply filter (Date: 1950-1960, Currency: USD) → Verify table updates → Click "Export CSV" → Verify CSV downloads with correct data → Select "Pivot by Year" → Verify table reorganizes to show all currencies as columns

### US3 Components ✅

- [x] T061 [P] [US3] Create DataTable component in `src/components/data/DataTable.tsx` with sorting and pagination
- [x] T062 [P] [US3] Create PivotControls component in `src/components/data/PivotControls.tsx` (pivot by Year/Currency options)
- [x] T063 [P] [US3] Create ExportButton component in `src/components/data/ExportButton.tsx` (trigger CSV download)
- [x] T064 [US3] Implement pivot transformation logic in `src/lib/utils/chart.ts` (pivotByYear, pivotByCurrency)

### US3 API & Export ✅

- [x] T065 [US3] Create CSV export API endpoint in `src/app/api/export/route.ts` (POST request handler)
- [x] T066 [US3] Implement export request validation (Zod schema, max 1M rows, 100MB size limit)
- [x] T067 [US3] Implement CSV generation with streaming for large datasets
- [x] T068 [US3] Add export rate limiting (10 exports/hour per IP) using in-memory rate limiting
- [x] T069 [US3] Implement error responses (400 Bad Request, 413 Payload Too Large, 500 Internal Server Error)

### US3 Pages & Integration ✅

- [x] T070 [US3] Create data page in `src/app/data/page.tsx` integrating DataTable, PivotControls, ExportButton
- [x] T071 [US3] Implement table filtering by date range, currency/asset, value ranges
- [x] T072 [US3] Implement table sorting by any column (ascending/descending)
- [x] T073 [US3] Add pagination controls (50/100/500 rows per page)
- [x] T074 [US3] Implement pivot views (by year showing currencies as columns, by currency showing years as columns)
- [x] T075 [US3] Add export options modal (CSV format, include metadata checkbox, include headers checkbox)

### US3 Styling & Performance ✅

- [x] T076 [US3] Style DataTable with responsive card layout for mobile (<768px)
- [x] T077 [US3] Implement data statistics cards showing total records, currencies, and date range
- [x] T078 [US3] Update navigation in Header component to link to /data page (already existed)

**Checkpoint**: ✅ User Story 3 complete - users can access raw data, apply filters, pivot views, and export to CSV for external analysis

---

## Phase 6: User Story 4 - Learn About Greco Concept (Priority: P4) ✅

**Goal**: Provide educational content explaining the Greco unit, basket composition, data sources, and methodology

**Independent Test**: Navigate to /about page → Verify Tom Greco's concept explained with citations → Navigate to /about/methodology → Verify 32 commodities listed with categories and weights → View calculation examples → Navigate to /about/sources → Verify complete data source citations with links

### US4 Content Creation ✅

- [x] T079 [P] [US4] Write about page content explaining Greco unit concept (Tom Greco's theory, basket of goods approach, purchasing power measurement)
- [x] T080 [P] [US4] Write methodology page content (32 commodities list organized by 6 categories, weighting rationale, calculation steps with examples)
- [x] T081 [P] [US4] Write data sources page content (complete citations for all sources, links to primary sources: USGS, FRED, USDA, etc.)

### US4 Pages ✅

- [x] T082 [US4] Create about page in `src/app/about/page.tsx` with Greco unit explanation and citations to "The End of Money and the Future of Civilization" (2009)
- [x] T083 [US4] Create methodology page in `src/app/about/methodology/page.tsx` with basket composition table (32 commodities organized by 6 categories, calculation steps)
- [x] T084 [US4] Create data sources page in `src/app/about/sources/page.tsx` with complete bibliographic citations and data quality indicators
- [x] T085 [US4] Add visual aids: basket composition tables showing 32 items grouped by 6 categories with percentages

### US4 Integration ✅

- [x] T086 [US4] Update navigation in Header component with hover dropdown menu (About Greco Unit, Methodology, Data Sources) with descriptions
- [x] T087 [US4] Add contextual help via title attributes on navigation links describing what each page offers
- [x] T088 [US4] Implement "Learn More" links in about pages pointing to related sections (methodology ↔ sources ↔ data page)

**Checkpoint**: ✅ User Story 4 complete - users can understand the Greco unit concept, basket composition, and data provenance

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements affecting multiple user stories and final validation

### Accessibility & Performance

- [ ] T089 [P] Run Lighthouse accessibility audit and fix WCAG 2.1 AA violations (color contrast, keyboard navigation, ARIA labels)
- [ ] T090 [P] Implement keyboard navigation for all interactive elements (charts, tables, filters)
- [ ] T091 [P] Add screen reader support with proper ARIA attributes on charts and tables
- [ ] T092 [P] Optimize images and assets for <3s initial page load (compress, lazy load)
- [ ] T093 Implement chart performance optimization across all pages (data sampling for >10K points)

### Testing & Validation

- [ ] T094 [P] Create E2E test for User Story 1 in `tests/e2e/user-story-1.spec.ts` (homepage, chart interaction, date filtering)
- [ ] T095 [P] Create E2E test for User Story 2 in `tests/e2e/user-story-2.spec.ts` (multi-currency comparison)
- [ ] T096 [P] Create E2E test for User Story 3 in `tests/e2e/user-story-3.spec.ts` (data table, pivot, export)
- [ ] T097 [P] Create E2E test for User Story 4 in `tests/e2e/user-story-4.spec.ts` (educational pages navigation)
- [ ] T098 Run all E2E tests and fix failures (target: 100% pass rate)

### Admin Scripts & Data Management

- [ ] T099 [P] Create data validation script in `scripts/validate-data.ts` (check all JSON files against schemas)
- [ ] T100 [P] Create Greco calculation script in `scripts/calculate-greco.ts` (regenerate greco-values.json from prices + weights)
- [ ] T101 [P] Create data import script in `scripts/import-prices.ts` (import new price data from CSV with validation)
- [ ] T102 [P] Create admin quickstart documentation in `scripts/README.md` (how to run scripts, update data)

### Documentation & Deployment

- [ ] T103 [P] Update main README.md with project overview, setup instructions, and deployment guide
- [ ] T104 [P] Verify quickstart.md instructions work end-to-end (clone → install → run → test)
- [ ] T105 [P] Create `.github/workflows/ci.yml` for GitHub Actions (run tests on PR)
- [ ] T106 [P] Create `.github/workflows/deploy.yml` for Vercel deployment automation
- [ ] T107 Deploy to Vercel and verify all 4 user stories work in production
- [ ] T108 Run final performance validation (SC-001: <3s load, SC-003: <500ms interactions)

**Checkpoint**: All polish tasks complete - project ready for production use

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Setup - **BLOCKS all user stories**
- **User Stories (Phase 3-6)**: All depend on Foundational completion
  - Can proceed in parallel if multiple developers
  - Or sequentially: P1 → P2 → P3 → P4
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Foundational only - no story dependencies
- **User Story 2 (P2)**: Foundational only - builds on US1 chart components but independently testable
- **User Story 3 (P3)**: Foundational only - independent data access functionality
- **User Story 4 (P4)**: Foundational only - pure content, no technical dependencies

### Within Each User Story

**User Story 1**:
- T036, T037, T038 [P] → Components (can run in parallel)
- T039 → T040 → T041-T045 (sequential page implementation)
- T046-T048 [P] → Styling/optimization (can run in parallel)

**User Story 2**:
- T049, T050, T051 [P] → Components (can run in parallel)
- T052 → T053-T057 (sequential page implementation)
- T058-T060 [P] → Styling/features (can run in parallel)

**User Story 3**:
- T061, T062, T063, T064 [P] → Components (can run in parallel)
- T065 → T066-T069 (sequential API implementation)
- T070 → T071-T075 (sequential page implementation)
- T076-T078 [P] → Styling/optimization (can run in parallel)

**User Story 4**:
- T079, T080, T081 [P] → Content (can run in parallel)
- T082-T085 [P] → Pages (can run in parallel after content)
- T086-T088 → Integration (sequential)

### Parallel Opportunities

**Phase 1 (Setup)**: T002, T003, T004, T005, T006, T008, T009, T010 can run in parallel

**Phase 2 (Foundational)**:
- T011, T012, T013, T014 [P] → All type definitions
- T016, T017, T018, T019, T021, T022 [P] → All sample data files (except T015, T020 which create dependencies)
- T025, T026, T027, T028, T029 [P] → All utilities
- T030, T031, T032, T033, T034 [P] → All UI components

**User Story Phases**: Once Foundational completes, all 4 user stories (Phase 3-6) can proceed in parallel with different developers

**Phase 7 (Polish)**: T089-T093, T094-T097, T099-T102, T103-T106 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all US1 components together:
Task T036: "Create ChartControls component in src/components/charts/ChartControls.tsx"
Task T037: "Create TimeSeriesChart component in src/components/charts/TimeSeriesChart.tsx"
Task T038: "Implement chart data transformation in src/lib/utils/chart.ts"

# Then launch styling/optimization together:
Task T046: "Implement responsive chart sizing in src/styles/globals.css"
Task T047: "Add loading states and error boundaries"
Task T048: "Optimize chart performance for <500ms interaction"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

**Fastest path to working product**:

1. ✅ Complete Phase 1: Setup (T001-T010)
2. ✅ Complete Phase 2: Foundational (T011-T035) - **CRITICAL PATH**
3. ✅ Complete Phase 3: User Story 1 (T036-T048)
4. **STOP and VALIDATE**: Test homepage with time-series chart
5. Deploy to Vercel for demo/feedback
6. **Timeline**: ~3-4 days for solo developer

**MVP Success Criteria**:
- Homepage loads in <3 seconds
- User can select USD and see 1900-2025 Greco trend chart
- Chart is interactive with tooltips showing values
- Date range filtering works
- Responsive on mobile and desktop

### Incremental Delivery

**Add features one story at a time**:

1. **Week 1**: Setup + Foundational → Foundation ready
2. **Week 2**: User Story 1 → **Deploy MVP** (homepage with charts)
3. **Week 3**: User Story 2 → **Deploy v1.1** (add comparison page)
4. **Week 4**: User Story 3 → **Deploy v1.2** (add data export)
5. **Week 5**: User Story 4 → **Deploy v1.3** (add educational content)
6. **Week 6**: Polish → **Deploy v2.0** (production ready)

**Benefits**:
- Each week delivers working, testable increment
- Early feedback on core functionality
- Can stop at any story if priorities change
- Reduced risk (working software every week)

### Parallel Team Strategy

**With 4 developers**:

1. **Week 1**: All devs collaborate on Setup + Foundational
2. **Week 2+**: Parallel story development
   - **Developer A**: User Story 1 (P1) - Charts
   - **Developer B**: User Story 2 (P2) - Comparison
   - **Developer C**: User Story 3 (P3) - Data access
   - **Developer D**: User Story 4 (P4) - Education
3. **Integration Week**: Merge all stories, resolve conflicts, test together
4. **Polish Week**: All devs on accessibility, testing, deployment

**Timeline**: ~3 weeks to complete all stories vs 6 weeks solo

---

## Task Summary

| Phase | Task Count | Parallel Tasks | Estimated Time (Solo) | Status |
|-------|-----------|----------------|----------------------|--------|
| Phase 1: Setup | 10 | 7 [P] | 0.5 days | ✅ Complete |
| Phase 2: Foundational | 25 | 19 [P] | 2-3 days | ✅ Complete |
| Phase 3: US1 (P1) | 13 | 3 [P] | 1-2 days | ✅ Complete |
| Phase 4: US2 (P2) | 12 | 3 [P] | 1-1.5 days | ✅ Complete |
| Phase 5: US3 (P3) | 18 | 6 [P] | 2 days | ✅ Complete |
| Phase 6: US4 (P4) | 10 | 5 [P] | 1 day | ✅ Complete |
| Phase 7: Polish | 20 | 16 [P] | 2-3 days | 🔄 Ready |
| **TOTAL** | **108 tasks** | **59 parallelizable** | **10-13 days** | **88/108 complete (81%)** |

---

## Notes

- **[P] marker**: 59 tasks can run in parallel (different files, no dependencies)
- **[Story] label**: All user story tasks labeled for traceability (US1-US4)
- **Independent testing**: Each user story has clear acceptance criteria in spec.md
- **MVP scope**: Phase 1-3 (Setup + Foundational + US1) = 48 tasks, ~4 days
- **Commit strategy**: Commit after each task or logical group
- **Validation checkpoints**: Stop at each phase checkpoint to verify story independently
- **Data note**: Using sample data initially (100 records per file). Full historical data (37K records) can be populated incrementally without code changes.

---

*Tasks generated by: `/speckit.tasks` command*  
*Date: 2025-12-06*  
*Total Tasks: 108*  
*MVP Tasks (P1 only): 48*  
*Parallelizable Tasks: 59*
