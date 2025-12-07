<!--
Sync Impact Report:
- Version change: none → 1.0.0
- Initial constitution creation for greco-coin project
- Principles defined: 6 core principles established
- Added sections: Data Requirements, Target Users & Success Criteria
- Templates status: ⚠ pending review of plan-template.md, spec-template.md, tasks-template.md
- Follow-up TODOs: Finalize specific basket of goods items after reviewing Tom Greco's book
-->

# Greco-Coin Constitution

## Core Principles

### I. Data Integrity (NON-NEGOTIABLE)
Historical economic data MUST be accurate, sourced, and verifiable. All data points MUST include:
- Primary source attribution with citation
- Collection methodology documentation
- Known limitations or gaps explicitly noted
- Data quality indicators where applicable

Rationale: The tool's value depends entirely on trustworthy data. Users making research or 
educational decisions need confidence in the underlying information. Inaccurate data undermines
the project's educational mission and could lead to incorrect conclusions about monetary history.

### II. Accessibility
The web-based interface MUST be intuitive for non-technical users. Requirements:
- Clear navigation without requiring technical knowledge
- Responsive design supporting desktop, tablet, and mobile devices
- Visual accessibility meeting WCAG 2.1 AA standards minimum
- Progressive enhancement: core functionality works without JavaScript
- Export capabilities for further analysis in common formats (CSV, JSON)

Rationale: Economic history insights should be available to everyone, not just technical users.
Broad accessibility maximizes educational impact and democratizes access to monetary research.

### III. Transparency
All calculations, data sources, and methodology MUST be clearly documented and auditable:
- Basket composition defined with specific items and weightings
- Exchange rate calculation methods explicitly stated
- Source code publicly available and well-commented
- User-facing documentation explains "Greco unit" concept clearly
- Data provenance traceable for every displayed value

Rationale: Users need to understand how values are derived to trust and properly interpret results.
Academic and research use requires reproducible methodology.

### IV. Flexibility
Users MUST be able to explore data through multiple visualizations and perspectives:
- Time-series charts with adjustable date ranges
- Currency comparison views (all pairings)
- Pivot table functionality for custom analysis
- Filtering by currency, asset type, or time period
- Greco unit value normalized against any tracked currency/asset

Rationale: Different users have different research questions. Flexible exploration tools enable
discovery and support diverse use cases from academic research to casual learning.

### V. Historical Depth
Prioritize long-term historical perspective (1900+) over real-time or high-frequency updates:
- Historical data back to 1900 where available
- Monthly or annual granularity acceptable for pre-digital era
- Data gaps handled gracefully with interpolation methodology documented
- Modern data (post-2000) may have higher frequency where appropriate
- New currencies/assets (Euro, Bitcoin) included from inception dates

Rationale: The project's unique value is providing century-scale perspective on purchasing power
and monetary stability. Real-time tracking is well-served by existing tools; historical depth is not.

### VI. Educational Value
The tool MUST help users understand monetary history and alternative economic concepts:
- Contextual information about Tom Greco's basket of goods theory
- Explanatory text interpreting trends and patterns
- Links to primary sources and additional reading
- Comparison features highlighting purchasing power changes
- Clear visualization of currency stability/instability over time

Rationale: Raw data without context has limited educational value. The tool should illuminate
economic history and make alternative monetary theories accessible to curious learners.

## Data Requirements

### Tracked Currencies and Assets
The following currencies and assets MUST be tracked with complete historical data:

**Fiat Currencies:**
- US Dollar (USD) - primary reference currency
- Euro (EUR) - from 1999 inception
- British Pound (GBP)
- Chinese Yuan (CNY)
- Russian Ruble (RUB)
- Indian Rupee (INR)

**Precious Metals:**
- Gold (troy ounce)
- Silver (troy ounce)

**Cryptocurrency:**
- Bitcoin (BTC) - from 2009 inception

**Exchange Rates:**
All possible pairings between tracked currencies and assets MUST be calculable, either through
direct rates or triangulation through USD as intermediate currency.

### Basket of Goods Definition
The standardized basket (1 Greco unit) composition SHALL be based on Tom Greco's specifications
in "The End of Money and the Future of Civilization" (2009). Specific items and weightings
pending review of source material.

Basket MUST represent:
- Essential goods with consistent utility across time
- Items with reliable historical pricing data
- Diversified categories (food, shelter, energy, etc.)
- Minimal technological obsolescence

## Target Users & Success Criteria

### Primary User Personas
1. **Economic Researchers & Historians**: Analyzing long-term monetary trends
2. **Alternative Economics Enthusiasts**: Studying complementary currency concepts
3. **Students of Monetary Theory**: Learning about purchasing power and currency stability
4. **General Public**: Understanding personal finance in historical context

### Success Criteria
The project is successful when:
- Users can visualize Greco value trends across any date range (1900-present)
- Clear side-by-side purchasing power comparisons across all currencies
- Tool accessible and comprehensible to non-technical audiences
- Data sourcing is transparent with full citation trail
- At least 80% historical data coverage for each tracked currency (where data exists)
- Page load performance under 3 seconds for standard queries
- Mobile responsive with full functionality on small screens

## Technical Architecture Standards

### Web-First Design
- Primary interface MUST be web-based (no spreadsheet dependencies)
- Static site generation preferred where feasible for performance
- Client-side computation for interactive filtering/visualization
- Server-side rendering for initial data load and SEO
- API endpoints available for programmatic data access

### Performance Requirements
- Initial page load: < 3 seconds on 3G connection
- Interactive queries: < 500ms response time
- Support for datasets spanning 125+ years (1900-2025+)
- Efficient caching strategy for historical (immutable) data
- Progressive loading for large time-range queries

### Data Architecture
- Normalized database schema for currency/asset pricing
- Temporal data modeling supporting point-in-time queries
- Audit trail for all data updates and corrections
- Version control for basket composition changes over time
- Automated data validation and anomaly detection

### Extensibility
Architecture MUST support future additions:
- New currencies or assets without schema changes
- Alternative basket definitions for comparison
- Additional visualization types via plugin architecture
- Third-party data source integration
- Internationalization (i18n) for non-English users

## Governance

This constitution establishes the foundational principles for greco-coin development. All
implementation decisions, feature additions, and architectural choices MUST align with these
principles. When conflicts arise, principles are prioritized in order: Data Integrity, 
Transparency, Educational Value, Accessibility, Flexibility, Historical Depth.

### Amendment Process
Constitution amendments require:
1. Written proposal with rationale
2. Impact assessment on existing specifications and implementations
3. Community review period (if project becomes collaborative)
4. Documentation of version bump reasoning (MAJOR/MINOR/PATCH)
5. Update of all dependent templates and documentation

### Compliance & Review
- All features MUST be reviewed against applicable constitutional principles
- Data integrity violations are blocking issues
- Accessibility regressions require immediate remediation
- Quarterly constitutional review recommended as project matures

### Versioning Policy
- MAJOR: Fundamental principle changes, backward-incompatible governance shifts
- MINOR: New principles added, substantial expansions to existing principles
- PATCH: Clarifications, wording improvements, non-semantic refinements

**Version**: 1.0.0 | **Ratified**: 2025-12-06 | **Last Amended**: 2025-12-06
