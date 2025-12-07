# Implementation Plan Summary

**Feature**: 001-greco-tracker  
**Command**: `/speckit.plan`  
**Completed**: 2025-12-06  
**Status**: ✅ COMPLETE - Ready for Phase 2 (tasks generation)

---

## What Was Created

### Phase 0: Research & Technology Decisions
- **research.md** (2,654 lines)
  - 10 major technology decisions with detailed rationale
  - Alternatives considered for each decision
  - Risk assessment (3 HIGH, 2 MEDIUM, 2 LOW risks)
  - Technology stack summary table

### Phase 1: Architecture & Contracts
- **data-model.md** (476 lines)
  - 12 entity definitions (Commodity, Currency, PricePoint, GrecoValue, etc.)
  - Relationships diagram
  - Validation rules for data integrity
  - JSON and SQLite storage schemas
  - Data quality indicators

- **contracts/api-export.md** (263 lines)
  - POST /api/export endpoint specification
  - Request/response schemas
  - Error handling (400, 413, 500, 504)
  - CSV format specifications
  - Performance constraints (1M rows max, 30s timeout)

- **contracts/data-structures.md** (438 lines)
  - JSON file schemas for all 8 data files
  - Zod validation schemas
  - API response formats
  - Unit conversion contracts

- **quickstart.md** (518 lines)
  - Developer setup guide (15-20 min)
  - Project structure overview
  - Testing commands (unit, component, E2E)
  - Admin script usage
  - Troubleshooting section

- **plan.md** (435 lines)
  - Complete implementation plan (this summary references it)
  - Technical context
  - Constitution gate checks (all 6 principles passing)
  - Project structure (detailed file tree)
  - Outstanding dependencies
  - Next steps

### Agent Context Update
- **.github/agents/copilot-instructions.md**
  - Technology stack documented for GitHub Copilot
  - Language: TypeScript 5.3+ / JavaScript (ES2022)
  - Framework: Next.js 14 (App Router), React 18, Recharts, Tailwind CSS
  - Database: JSON files (~37K records), SQLite for dev/admin

---

## Key Decisions Made

### Framework & Architecture
- **Next.js 14** with App Router for modern React patterns, SEO, and static generation
- **TypeScript 5.3+** for type safety across 37K data points
- **Recharts** for performant time-series visualizations
- **Tailwind CSS** for responsive design (320px-4K)
- **JSON files** for immutable historical data (no database overhead)
- **SQLite** for admin/dev workflows only (not deployed)

### Data Model
- **32 commodities** organized into 6 categories (Metals, Energy, Grains, etc.)
- **9 currencies/assets** (USD, EUR, GBP, CNY, RUB, INR, Gold, Silver, BTC)
- **~37,000 price points** (1900-2025, annual pre-1950, monthly 1950+)
- **Data quality indicators** (confidence, flags, derivation method)
- **Versioned basket weights** (v1.0.0 equal weights, future versions from Tom Greco methodology)

### API Design
- **POST /api/export** for CSV exports with filtering
- **Rate limiting**: 10 exports/hour per IP
- **Size limits**: 1M rows max, 100MB max, 30s timeout
- **Validation**: Date ranges, currency inception dates, commodity IDs

### Testing Strategy
- **Vitest** for unit tests (calculator, converter, validator)
- **React Testing Library** for component tests
- **Playwright** for E2E tests (one per user story)
- **Accessibility testing** with axe-core for WCAG 2.1 AA

---

## Constitutional Alignment

All 6 constitutional principles verified and passing:

| Principle | Status | Key Requirements Met |
|-----------|--------|---------------------|
| **I. Data Integrity** | ✅ PASS | Source attribution (FR-014), validation (FR-022), methodology docs (FR-015) |
| **II. Accessibility** | ✅ PASS | WCAG 2.1 AA (Assumption #7), responsive design (FR-018), CSV export (FR-009) |
| **III. Transparency** | ✅ PASS | Basket documented (FR-012), open source (GitHub), educational content (US-4) |
| **IV. Flexibility** | ✅ PASS | Time-series (FR-001), multi-currency (FR-004), pivot tables (FR-010) |
| **V. Historical Depth** | ✅ PASS | 1900+ coverage (FR-003), 37K records (Q1), gap handling (FR-016) |
| **VI. Educational Value** | ✅ PASS | Greco theory explained (US-4), contextual info (FR-013), comprehension goal (SC-007) |

---

## Outstanding Dependencies

### HIGH PRIORITY (Blockers)
1. **Historical Data Sources** (Dependency #2)
   - Need to research and identify reliable sources for 32 commodities
   - Suggested: USGS, FRED, IMF, World Bank, LME, NYMEX
   - Timeline: Start research now, can implement with sample data initially

2. **Commodity Weighting Methodology** (Dependency #4)
   - Must review "The End of Money and the Future of Civilization" (Tom Greco, 2009)
   - Currently using equal weights (1/32) as placeholder
   - Timeline: Complete before finalizing Greco calculations

### MEDIUM PRIORITY
3. **Unit Anomaly Resolution** (Dependency #5)
   - Verify Cement in troy ounces (likely error)
   - Choose primary units for dual-unit commodities (Wheat, Cocoa, Cotton Seed, Copra)
   - Timeline: Resolve during data import implementation

---

## Project Structure Overview

```
greco-coin/
├── src/
│   ├── app/                    # Next.js pages (4 routes: home, compare, data, about)
│   ├── components/             # React components (charts, data table, filters)
│   ├── lib/                    # Business logic (calculator, converter, validator)
│   ├── data/                   # JSON files (8 files: commodities, currencies, prices, etc.)
│   └── scripts/                # Admin tools (calculate, validate, import)
├── tests/                      # Unit, component, E2E tests
├── specs/001-greco-tracker/    # This directory (spec, plan, research, etc.)
└── .github/agents/             # Agent context files
```

---

## Next Steps

### For Developer (You)
1. ✅ Review plan.md, research.md, data-model.md (generated artifacts)
2. ⏳ **Run `/speckit.tasks`** to generate tasks.md with implementation breakdown
3. ⏳ Create initial JSON data files with sample/placeholder data
4. ⏳ Begin Dependency #2 research (historical data sources)
5. ⏳ Review Tom Greco's book for Dependency #4 (commodity weighting)

### For Implementation Phase
**After tasks.md generated**:
1. Phase A (P1 Core): Data files → loader → time-series chart → homepage
2. Phase B (P1/P2): Greco calculator → unit converter → multi-currency chart → comparison page
3. Phase C (P3): Validation → data table → pivot → CSV export API → raw data page
4. Phase D (P4): Educational content → about pages → methodology docs
5. Phase E (Polish): Accessibility audit → performance optimization → E2E tests → Vercel deployment

**Estimated**: 23-30 tasks total across 4 user stories (P1-P4)

---

## Complexity Assessment

| Phase | Complexity | Task Count | Risk Level |
|-------|-----------|------------|-----------|
| P1: View Greco trends | MEDIUM | 8-10 tasks | MEDIUM (data availability) |
| P2: Compare currencies | MEDIUM | 5-7 tasks | LOW (builds on P1) |
| P3: Access raw data | MEDIUM | 6-8 tasks | MEDIUM (export performance) |
| P4: Learn about Greco | LOW | 4-5 tasks | LOW (mostly content) |

**Total Estimated Effort**: ~23-30 tasks, MEDIUM overall complexity

**Highest Risks**:
1. Historical data availability (HIGH) - mitigate with sample data, parallel population
2. Commodity weighting methodology (HIGH) - mitigate with placeholder equal weights
3. Unit conversion accuracy (MEDIUM) - mitigate with centralized service + extensive tests
4. Chart performance (MEDIUM) - mitigate with data sampling for large ranges

---

## Files Generated (Summary)

| File | Lines | Purpose |
|------|-------|---------|
| plan.md | 435 | Complete implementation plan |
| research.md | 2,654 | Technology decisions & rationale |
| data-model.md | 476 | Entity definitions & relationships |
| contracts/api-export.md | 263 | CSV export API specification |
| contracts/data-structures.md | 438 | JSON schemas & validation |
| quickstart.md | 518 | Developer setup guide |
| .github/agents/copilot-instructions.md | ~50 | Agent context for GitHub Copilot |

**Total**: ~4,834 lines of planning documentation

---

## Success Criteria Checklist

From spec.md, all 7 success criteria have implementation plans:

- [x] SC-001: Charts load <3s (performance monitoring planned)
- [x] SC-002: WCAG 2.1 AA accessible (Radix UI + testing)
- [x] SC-003: Time-series chart (TimeSeriesChart component in P1)
- [x] SC-004: Responsive 320px-4K (Tailwind breakpoints)
- [x] SC-005: Greco 80% complete (completeness validation in calculator)
- [x] SC-006: CSV export <5s (streaming implementation)
- [x] SC-007: 80% comprehension (educational content + user testing)

---

## Planning Phase Complete ✅

**Readiness**: 
- ✅ Technology stack finalized
- ✅ Architecture designed
- ✅ Data model defined
- ✅ API contracts specified
- ✅ Developer quickstart written
- ✅ Agent context updated
- ✅ Constitutional gates passing

**Next Command**: `/speckit.tasks` to break down implementation into specific ordered tasks

**Timeline**: Ready to begin implementation after tasks.md generated and sample data files created

---

*Generated by: spec-kit `/speckit.plan` command*  
*Date: 2025-12-06*  
*Feature: 001-greco-tracker (Greco Historical Currency Tracker)*
