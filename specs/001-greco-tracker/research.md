# Research & Technology Decisions

**Feature**: Greco Historical Currency Tracker  
**Date**: 2025-12-06  
**Phase**: 0 - Architecture & Technology Selection

## Overview

This document captures technology decisions, rationale, and alternatives considered for implementing the Greco Historical Currency Tracker. All decisions align with constitutional principles and functional requirements.

---

## Decision 1: Frontend Framework

**Decision**: Next.js 14 with App Router

**Rationale**:
- **Static Site Generation (SSG)**: Historical data is immutable; SSG provides optimal performance (<3s load time requirement)
- **SEO-friendly**: Server-side rendering helps educational content reach broader audience
- **React ecosystem**: Rich charting libraries (Recharts, Chart.js) and accessibility tools available
- **Vercel deployment**: Seamless integration with hosting platform (clarified in Q4)
- **TypeScript support**: Built-in type safety for complex data models (32 commodities, 9 currencies)
- **App Router**: Modern patterns, improved performance, and better data fetching

**Alternatives Considered**:
- **Vite + React SPA**: Rejected - Requires client-side data loading, slower initial render, poor SEO
- **Astro**: Considered - Great for static content but less mature chart.js integration, smaller ecosystem
- **SvelteKit**: Rejected - Smaller ecosystem, team less familiar, fewer charting library options
- **Plain HTML/JavaScript**: Rejected - Cannot meet complexity needs (37K data points, pivot tables)

**Performance Impact**: SSG with incremental static regeneration allows sub-3s page loads while keeping data fresh during monthly/quarterly updates.

---

## Decision 2: Data Storage Strategy

**Decision**: JSON files for historical data + SQLite for dev/admin workflows

**Rationale**:
- **Historical data immutability**: 1900-1950 data never changes; perfect for static JSON files
- **Bundle optimization**: Can split data by year/currency, lazy load as needed
- **37K records manageable**: ~5-10MB total when compressed, acceptable for web delivery
- **No database server needed**: Eliminates operational complexity, aligns with best-effort availability (Clarification Q2)
- **SQLite for admin**: Local database for validating/transforming data before export to JSON
- **Version control friendly**: JSON files can be committed, providing data provenance audit trail

**Alternatives Considered**:
- **PostgreSQL/MySQL**: Rejected - Overkill for read-only historical data, adds hosting costs and complexity
- **Vercel KV (Redis)**: Rejected for MVP - Useful for future caching layer but not needed initially
- **Supabase/PlanetScale**: Rejected - Serverless databases add latency, cost, and operational overhead
- **CSV files**: Rejected - Less efficient parsing in browser, no nested structure support

**Data Organization**:
```
data/
  commodities/
    gold.json         # [{date, price_usd, source}, ...]
    silver.json
    [... 30 more]
  currencies/
    usd.json          # [{date, exchange_rates: {...}}, ...]
    [... 8 more]
  metadata/
    basket-weights.json   # Commodity weightings for Greco calculation
    units.json            # Unit definitions & conversion factors
    sources.json          # Data source citations (transparency requirement)
```

---

## Decision 3: Charting Library

**Decision**: Recharts (primary) with Chart.js fallback option

**Rationale**:
- **React-native**: Recharts built specifically for React, uses SVG (accessible, scalable)
- **Responsive by default**: Handles 320px to 4K requirement (SC-004)
- **Accessibility**: SVG output works with screen readers (WCAG 2.1 AA requirement)
- **Customization**: Full control over tooltips, legends, colors for multi-currency comparison
- **Performance**: Handles 1,000+ data points smoothly (meets <500ms interaction requirement)
- **TypeScript support**: Strong typing for data props

**Alternatives Considered**:
- **Chart.js**: Kept as fallback - Canvas-based, better for very large datasets but accessibility concerns
- **D3.js**: Rejected - Too low-level, slower development, steep learning curve
- **Victory**: Rejected - Heavier bundle size, less active maintenance
- **Plotly**: Rejected - Larger bundle, overkill for our needs, commercial licensing concerns

**Accessibility Considerations**:
- SVG charts provide text alternatives for screen readers
- Keyboard navigation for chart controls
- High contrast color palettes for visibility
- Data table view (P3) provides non-visual access to all data

---

## Decision 4: Styling Approach

**Decision**: Tailwind CSS with custom component library

**Rationale**:
- **Rapid development**: Utility-first CSS speeds up responsive design implementation
- **Bundle optimization**: PurgeCSS removes unused styles automatically
- **Responsive design**: Built-in breakpoints handle 320px-4K requirement
- **Accessibility utilities**: Easy to add proper focus states, color contrast
- **Consistent design system**: Custom components ensure UI consistency across 4 user stories
- **Dark mode support**: Future enhancement path without major refactoring

**Alternatives Considered**:
- **CSS Modules**: Rejected - More boilerplate, slower iteration
- **Styled Components**: Rejected - Runtime CSS-in-JS impacts performance
- **Material UI**: Rejected - Heavy bundle, opinionated design that may not fit educational aesthetic
- **Plain CSS**: Rejected - Harder to maintain responsiveness and consistency

---

## Decision 5: Data Validation & Admin Tools

**Decision**: TypeScript scripts with Zod schema validation

**Rationale**:
- **Type safety**: TypeScript catches errors during data import (32 commodities × different units)
- **Zod validation**: Runtime schema validation ensures data integrity (Constitutional Principle I)
- **Composable**: Same validation schemas used in scripts and application
- **Error reporting**: Clear validation errors help identify data quality issues
- **Node.js scripts**: Can run locally without deployment, fits manual update workflow (Clarification Q5)

**Admin Script Functions**:
1. `import-data.ts`: Import CSV/Excel price data, validate units, convert to JSON
2. `validate-data.ts`: Check data completeness, detect outliers, verify date ranges
3. `calculate-greco.ts`: Compute Greco unit values from commodity prices + weightings
4. `generate-metadata.ts`: Update sources.json with new data citations

**Alternatives Considered**:
- **Python scripts**: Rejected - Adds language complexity, team uses TypeScript
- **Custom admin UI**: Rejected for MVP - Script-based workflow sufficient for monthly/quarterly updates
- **No validation**: Rejected - Violates Data Integrity principle (NON-NEGOTIABLE)

---

## Decision 6: Testing Strategy

**Decision**: Vitest (unit) + React Testing Library (component) + Playwright (E2E)

**Rationale**:
- **Vitest**: Fast, native ESM support, great TypeScript integration, Vite-compatible
- **React Testing Library**: Component testing with accessibility focus, encourages proper practices
- **Playwright**: Cross-browser E2E testing (Chrome, Firefox, Safari), matches our browser support
- **Coverage goals**: 80%+ for calculation logic, data validation, core components

**Test Priorities**:
1. **Unit tests**: Greco calculations, unit conversions, data validation (high risk areas)
2. **Component tests**: Chart rendering, data table filtering, export functionality
3. **E2E tests**: Complete user story workflows (P1-P4)

**Alternatives Considered**:
- **Jest**: Rejected - Vitest faster, better ESM support, no config transform needed
- **Cypress**: Rejected - Playwright faster, better multi-browser support, no flakiness issues
- **No E2E tests**: Rejected - User stories need end-to-end validation

---

## Decision 7: Accessibility Implementation

**Decision**: Radix UI primitives + custom ARIA labels + automated testing

**Rationale**:
- **Radix UI**: Unstyled, accessible primitives (Select, Tooltip, etc.) that meet WCAG 2.1 AA out-of-box
- **Keyboard navigation**: Built into Radix components, works with chart interactions
- **Screen reader support**: ARIA labels on charts, tables, and controls
- **axe-core integration**: Automated accessibility testing in CI/CD pipeline
- **Progressive enhancement**: Core data viewable without JavaScript (tables with SSR)

**WCAG 2.1 AA Requirements Met**:
- Color contrast ratios ≥ 4.5:1 for text, ≥ 3:1 for UI components
- Keyboard-only navigation for all interactive elements
- Alternative text for all visual data (chart data tables)
- Responsive text sizing (rem units, user zoom support)

---

## Decision 8: Deployment & Hosting

**Decision**: Vercel with GitHub integration

**Rationale**:
- **Confirmed in Clarification Q4**: Basic logging included with Vercel platform
- **Next.js optimizations**: Automatic code splitting, image optimization, edge caching
- **Git-based deployment**: Push to branch triggers preview, merge to main deploys production
- **Zero-config**: No server management needed, aligns with best-effort availability (Q2)
- **Performance**: Global CDN ensures <3s load times worldwide
- **Cost**: Free tier sufficient for educational tool traffic patterns

**Deployment Workflow**:
1. Data update: Run admin scripts locally, commit updated JSON files
2. Push to branch: Vercel creates preview deployment
3. Validate: Test preview URL
4. Merge to main: Auto-deploy to production
5. Announce: Banner notification for maintenance window (FR-021)

---

## Decision 9: Commodity Weighting Strategy

**Decision**: Deferred to data collection phase, implement flexible weighting system

**Rationale**:
- **Unknown from spec**: Tom Greco's specific weightings not yet determined (Assumption #1, Dependency #4)
- **Flexible architecture**: basket-weights.json allows easy updates without code changes
- **Default approach**: Equal weights initially, adjust based on Greco's methodology
- **Calculation transparency**: Document weighting rationale in methodology page (FR-013)

**Implementation**:
```typescript
// lib/types/greco.ts
interface BasketWeights {
  [commodityId: string]: {
    weight: number;        // 0.0-1.0, sum must equal 1.0
    rationale: string;     // Why this weight
    source: string;        // Citation
  };
}
```

---

## Decision 10: Unit Conversion System

**Decision**: Centralized conversion service with validated conversion factors

**Rationale**:
- **32 commodities, 6 unit types**: Need consistent conversion logic
- **Dual-unit commodities**: Wheat, Cocoa, Cotton Seed, Copra require conversion decisions
- **Validation**: Ensure conversion factors mathematically consistent
- **Transparency**: Document all conversion factors in units.json (Transparency principle)

**Standard Conversions Needed**:
- Troy ounce ↔ Metric ton: 1 tonne = 32,150.75 troy oz
- Bushel ↔ Metric ton: Varies by commodity density (wheat ≠ corn)
- Pound ↔ Metric ton: 1 tonne = 2,204.62 lb
- Kilogram ↔ Metric ton: 1 tonne = 1,000 kg
- Barrel: Define standard (typically 159 liters for petroleum, varies for cotton)

---

## Risk Assessment & Mitigation

### High Risk

**R1: Historical data availability for 32 commodities back to 1900**
- **Impact**: Missing data prevents Greco calculation for affected periods
- **Mitigation**: Acknowledge gaps explicitly (FR-016), prioritize most complete commodities, document limitations
- **Status**: Dependency #2 - requires research

**R2: Commodity weighting methodology unclear**
- **Impact**: Cannot calculate Greco unit without weights
- **Mitigation**: Implement flexible system, use equal weights as placeholder, document thoroughly
- **Status**: Dependency #4 - requires Tom Greco's book review

### Medium Risk

**R3: Unit conversion accuracy for historical data**
- **Impact**: Incorrect conversions undermine Data Integrity principle
- **Mitigation**: Extensive unit testing, cross-reference multiple sources, document all factors
- **Status**: Addressable in implementation with proper testing

**R4: Chart performance with 37K data points**
- **Impact**: May not meet <500ms interaction requirement
- **Mitigation**: Data aggregation for overview, lazy loading for details, use virtualization
- **Status**: Addressable with optimization techniques

### Low Risk

**R5: Accessibility compliance verification**
- **Impact**: May miss WCAG 2.1 AA requirements
- **Mitigation**: Radix UI primitives, automated axe-core testing, manual screen reader testing
- **Status**: Addressable with proper tooling

---

## Next Steps

1. **Phase 1**: Create data-model.md defining all entities, relationships, and validation rules
2. **Phase 1**: Design contracts for any API endpoints (export, if needed)
3. **Phase 1**: Create quickstart.md for developer onboarding
4. **External**: Research historical commodity price data sources (Dependency #2)
5. **External**: Review Tom Greco's book for weighting methodology (Dependency #1, #4)
6. **Phase 2**: Generate tasks.md breaking down implementation by user story

---

## Technology Stack Summary

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js | 14.x | App Router, SSG, routing |
| Language | TypeScript | 5.3+ | Type safety, developer experience |
| UI Library | React | 18.x | Component architecture |
| Styling | Tailwind CSS | 3.x | Utility-first responsive design |
| Charts | Recharts | 2.x | Accessible SVG visualizations |
| UI Components | Radix UI | Latest | Accessible primitives |
| Validation | Zod | 3.x | Schema validation |
| Testing (Unit) | Vitest | 1.x | Fast unit test runner |
| Testing (Component) | React Testing Library | 14.x | Component testing |
| Testing (E2E) | Playwright | 1.x | Cross-browser E2E tests |
| Testing (A11y) | axe-core | 4.x | Accessibility validation |
| Deployment | Vercel | N/A | Hosting, CI/CD, logging |
| Data Storage | JSON files | N/A | Static historical data |
| Dev Tools | SQLite | 3.x | Local admin data management |

---

**Research Complete**: All technology decisions documented with rationale. Ready for Phase 1 design.
