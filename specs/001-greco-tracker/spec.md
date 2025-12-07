# Feature Specification: Greco Historical Currency Tracker

**Feature Branch**: `001-greco-tracker`  
**Created**: 2025-12-06  
**Status**: Draft  
**Input**: User description: "Create tracking tool website based on Tom Greco's basket of goods from 'The End of Money and the Future of Civilization' (2009). Track monthly pricing across multiple currencies and assets (USD, EUR, GBP, CNY, RUB, INR, Gold, Silver, Bitcoin) with historical data back to 1900. Standardize basket value as 'Greco' unit. Web page format with lookup/visualization capabilities, display Greco value over time, and raw data access with pivot functionality."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Greco Unit Value Over Time (Priority: P1)

A researcher wants to understand how the purchasing power of a standardized basket of goods has changed across different currencies from 1900 to present. They visit the website and can immediately see a time-series chart showing the Greco unit value for any selected currency, providing insight into long-term monetary stability.

**Why this priority**: This is the core value proposition - visualizing century-scale purchasing power trends. Without this, the tool provides no unique value. This single feature delivers the essential educational insight about monetary history.

**Independent Test**: Can be fully tested by loading the homepage, selecting a currency (e.g., USD), and verifying that a chart displays showing Greco unit values from 1900 to present with monthly or annual data points. Delivers immediate educational value about purchasing power trends.

**Acceptance Scenarios**:

1. **Given** a user visits the website, **When** they select "US Dollar" from the currency dropdown, **Then** a time-series chart displays showing Greco unit values from 1900 to 2025 with appropriate granularity (monthly for recent years, annual for historical data)

2. **Given** a user is viewing the USD chart, **When** they hover over any data point, **Then** the exact date, Greco value, and basket composition summary appear in a tooltip (showing the 32 commodities and their contribution to the total value)

3. **Given** a user wants to focus on a specific period, **When** they select a date range (e.g., 1950-2000), **Then** the chart zooms to show only that period with increased detail

4. **Given** a user wants to understand what they're seeing, **When** they view the chart, **Then** explanatory text describes the Greco unit concept and what rising/falling values indicate about purchasing power

---

### User Story 2 - Compare Multiple Currencies Side-by-Side (Priority: P2)

An economics student wants to compare how different currencies' purchasing power has changed relative to each other over the same time period. They can select multiple currencies and view them overlaid on the same chart, making patterns of inflation, deflation, and currency stability immediately apparent.

**Why this priority**: Comparison is essential for understanding relative currency performance. This builds on P1 by enabling comparative analysis, a key research use case. Still valuable independently as it enables cross-currency insights.

**Independent Test**: Can be tested by selecting 2-3 currencies (e.g., USD, GBP, CNY) and verifying they appear on the same chart with distinct colors and a legend. Delivers comparative purchasing power analysis.

**Acceptance Scenarios**:

1. **Given** a user is viewing the USD chart, **When** they check boxes for "British Pound" and "Chinese Yuan", **Then** all three currencies appear on the same chart with distinct colors and a legend identifying each

2. **Given** a user has multiple currencies displayed, **When** they hover over a specific year, **Then** values for all selected currencies at that point in time are shown simultaneously

3. **Given** a user wants to compare assets vs currencies, **When** they select "Gold" and "US Dollar", **Then** both appear on the same chart showing how gold's Greco value compares to fiat currency over time

4. **Given** a user has 5+ currencies selected, **When** the chart becomes cluttered, **Then** the interface provides options to toggle individual currencies on/off without removing them from the selection

---

### User Story 3 - Access Raw Data with Pivot Functionality (Priority: P3)

A researcher needs the underlying data for their own analysis. They can access a data view showing all historical pricing data in a tabular format with filtering, sorting, and export capabilities. They can pivot the data to show different perspectives (e.g., all currencies for a specific year, or all years for a specific currency).

**Why this priority**: Enables advanced users to perform custom analysis beyond what the visualizations provide. Critical for academic/research credibility but not needed for casual learning. Can be used independently to extract specific datasets.

**Independent Test**: Can be tested by navigating to "Data" section, viewing a table of historical prices, applying filters (e.g., year range, specific currencies), and exporting to CSV. Delivers raw data access for external analysis.

**Acceptance Scenarios**:

1. **Given** a user clicks "View Data" link, **When** the data page loads, **Then** a table displays showing columns for Date, Currency/Asset, Greco Value, and Basket Price with pagination for large datasets

2. **Given** a user is viewing the data table, **When** they apply filters (e.g., "Date: 1950-1960", "Currency: USD, EUR"), **Then** the table updates to show only matching records

3. **Given** a user wants to analyze the data externally, **When** they click "Export", **Then** the filtered dataset downloads as a CSV file with properly formatted headers

4. **Given** a user wants to see all currencies for a single year, **When** they select "Pivot by Year" and choose "1975", **Then** the table reorganizes to show all tracked currencies/assets as columns with their Greco values for that year

5. **Given** a user wants to compare exchange rates, **When** they select "Show Exchange Rates" toggle, **Then** additional columns appear showing conversion rates between all currency pairs for the filtered time period

---

### User Story 4 - Learn About the Greco Basket Concept (Priority: P4)

A curious visitor wants to understand what the "Greco unit" means and what's in the basket of goods. They can access educational content explaining Tom Greco's concept, the specific items in the basket, why they were chosen, and how values are calculated.

**Why this priority**: Educational context is important for proper interpretation but not blocking for basic functionality. Users can derive value from visualizations even without deep understanding. Can stand alone as reference documentation.

**Independent Test**: Can be tested by navigating to "About" or "Methodology" page and verifying complete documentation of basket composition, calculation methods, and data sources. Delivers educational value about alternative monetary concepts.

**Acceptance Scenarios**:

1. **Given** a user wants to understand the tool, **When** they click "About the Greco Unit" link, **Then** they see a page explaining Tom Greco's basket of goods concept with citations to the source book

2. **Given** a user wants to know what's in the basket, **When** they view the methodology page, **Then** a detailed list shows all 32 basket commodities organized by category (Metals, Energy/Materials, Agricultural Grains, Agricultural Products, Fibers, Animal Products) with their weightings and rationale for inclusion

3. **Given** a user questions data accuracy, **When** they view the data sources section, **Then** complete citations and links to primary sources are provided for each currency/asset's historical data

4. **Given** a user wants to understand calculations, **When** they view the calculation methodology, **Then** step-by-step explanations with example calculations show how Greco values are derived from basket prices

---

### Edge Cases

- **What happens when historical data is missing for a currency/date?** Display a gap in the chart with a notation indicating data unavailability. In data tables, show "N/A" with a footnote explaining the gap. Document known data limitations in methodology section.

- **How does the system handle currencies that didn't exist in 1900?** Euro (1999+) and Bitcoin (2009+) display data only from their inception dates. Charts automatically adjust timeframes to avoid showing zero/null values before currency existence. Filter options prevent selecting date ranges before currency inception.

- **What if basket composition changed over time?** Document any historical basket adjustments in methodology section. Provide option to view data with "frozen basket" (using current composition retroactively) vs "historical basket" (using period-appropriate basket). Default to frozen basket for consistency.

- **How does system handle extreme data outliers or suspected errors?** Flag suspected anomalies with visual indicators (different color, annotation). Provide mechanism for users to report data errors via contact form or email. Basic validation ensures values are positive and within reasonable ranges during data entry. Document validation rules in methodology section.

- **What if user selects too many currencies making chart unreadable?** Warn users when selecting more than 5 currencies. Provide toggle controls to show/hide individual currencies. Offer alternative view modes (small multiples, separate tabs per currency).

- **How does system handle different device screen sizes?** Charts automatically adapt to viewport width. Mobile users get simplified chart controls with swipe gestures. Data tables switch to card-based layout on small screens. Export functionality remains available on all devices.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display time-series visualizations showing Greco unit values for any selected currency or asset from its earliest available data point to present

- **FR-002**: System MUST support the following currencies and assets: US Dollar (USD), Euro (EUR), British Pound (GBP), Chinese Yuan (CNY), Russian Ruble (RUB), Indian Rupee (INR), Gold (troy ounce), Silver (troy ounce), and Bitcoin (BTC)

- **FR-003**: System MUST provide historical data coverage starting from 1900 where data exists, with monthly granularity for post-1950 data and annual granularity for 1900-1950 period (approximately 10,000 total historical price points across all 9 currencies/assets)

- **FR-004**: System MUST allow users to select and compare multiple currencies/assets simultaneously on the same visualization

- **FR-005**: System MUST provide interactive tooltips/details showing exact values, dates, and contextual information when users hover over or select data points

- **FR-006**: System MUST enable users to filter data by custom date ranges (year, decade, or custom start/end dates)

- **FR-007**: System MUST provide a tabular data view showing all historical price data with columns for Date, Currency/Asset, Greco Value, and source basket price

- **FR-008**: System MUST enable filtering and sorting of tabular data by date range, currency/asset type, and value ranges

- **FR-009**: System MUST provide data export functionality allowing users to download filtered datasets in CSV format

- **FR-010**: System MUST support pivot table functionality enabling users to reorganize data views (e.g., all currencies for a specific year, all years for specific currency)

- **FR-011**: System MUST calculate and display exchange rates between all tracked currency pairs for any selected time period

- **FR-012**: System MUST define and document the standardized basket of goods (the "Greco unit") consisting of 32 commodities with their standard units of measure: Gold (Troy Ounce), Silver (Troy Ounce), Iron (Metric Ton), Copper (Metric Ton), Aluminum (Metric Ton), Tin (Metric Ton), Lead (Metric Ton), Zinc (Metric Ton), Nickel (Metric Ton), Platinum (Metric Ton), Petroleum (Metric Ton), Cement (Troy Ounce), Rubber (Pound), Sulphur (Metric Ton), Rice (Metric Ton), Wheat (Hundredweight or Ton), Corn (Bushel), Barley (Bushel), Oats (Bushel), Rye (Bushel), Peanuts (Bushel), Soy Beans (Metric Ton), Coffee (Bushel), Cocoa (Pound or Ton), Sugar (Metric Ton), Cotton Seed (Pound or Ton), Cotton (Barrel), Wool (Metric Ton), Jute (Kilogram), Hides (Metric Ton), Copra (Piece or Kilogram), Tallow (Metric Ton). Each commodity's weighting in the Greco unit calculation must be documented

- **FR-013**: System MUST provide educational content explaining the Greco unit concept, basket composition rationale, and how to interpret the visualizations

- **FR-014**: System MUST document all data sources with complete citations and links to primary sources for verification

- **FR-015**: System MUST document calculation methodology showing how Greco values are derived from basket prices and exchange rates

- **FR-016**: System MUST handle missing historical data gracefully by displaying gaps with explanatory annotations rather than interpolating unknown values

- **FR-017**: System MUST clearly indicate when currencies/assets did not exist for selected time periods (e.g., Euro before 1999, Bitcoin before 2009)

- **FR-018**: System MUST be responsive and functional across desktop, tablet, and mobile devices with appropriate layout adaptations

- **FR-019**: System MUST load initial page view in under 3 seconds on standard broadband connections

- **FR-020**: System MUST respond to interactive queries (date range changes, currency selections) in under 500 milliseconds

- **FR-021**: System operates on best-effort availability basis with no formal SLA. Scheduled maintenance windows are acceptable with advance notice to users (e.g., banner notification 24-48 hours prior)

- **FR-022**: System MUST validate all historical price data inputs with basic range checks (e.g., positive values, reasonable date ranges) before storage. Data quality issues beyond basic validation are expected to be identified and reported by users

- **FR-023**: System MUST utilize platform logging capabilities (Vercel) to capture application errors, warnings, and data update events for troubleshooting purposes

- **FR-024**: System MUST provide pre-written administrative scripts for data updates, allowing designated maintainers to add new historical price data on a monthly or quarterly schedule. Scripts must validate data format and perform basic range checks before committing updates

### Key Entities

- **Greco Unit**: The standardized basket of goods serving as the universal value measure. Contains 32 specific commodities organized by category: Metals (10 items: Gold, Silver, Iron, Copper, Aluminum, Tin, Lead, Zinc, Nickel, Platinum), Energy/Materials (4 items: Petroleum, Cement, Rubber, Sulphur), Agricultural Grains (6 items: Rice, Wheat, Corn, Barley, Oats, Rye), Agricultural Products (6 items: Peanuts, Soy Beans, Coffee, Cocoa, Sugar, Cotton Seed), Fibers (3 items: Cotton, Wool, Jute), and Animal Products (3 items: Hides, Copra, Tallow). Each commodity has a defined weighting based on Tom Greco's specifications. Represents consistent purchasing power across time and currencies.

- **Currency/Asset**: Any tracked monetary unit or store of value (USD, EUR, GBP, CNY, RUB, INR, Gold, Silver, Bitcoin). Each has an inception date, historical price data series, and calculated Greco values over time.

- **Historical Price Point**: A timestamped data record containing the basket price in a specific currency at a specific date. Includes source attribution, data quality indicators, and any applicable notes about calculation methods or data gaps.

- **Exchange Rate**: The conversion ratio between any two currencies/assets at a specific point in time. Can be direct (if data exists) or calculated through triangulation via USD. Used to enable cross-currency comparisons.

- **Basket Item**: An individual component of the Greco unit with its standard unit of measure. The basket contains 32 commodities: Gold (troy oz), Silver (troy oz), Iron (metric ton), Copper (metric ton), Aluminum (metric ton), Tin (metric ton), Lead (metric ton), Zinc (metric ton), Nickel (metric ton), Platinum (metric ton), Petroleum (metric ton), Cement (troy oz), Rubber (lb), Sulphur (metric ton), Rice (metric ton), Wheat (cwt/ton), Corn (bushel), Barley (bushel), Oats (bushel), Rye (bushel), Peanuts (bushel), Soy Beans (metric ton), Coffee (bushel), Cocoa (lb/ton), Sugar (metric ton), Cotton Seed (lb/ton), Cotton (barrel), Wool (metric ton), Jute (kg), Hides (metric ton), Copra (piece/kg), Tallow (metric ton). Each item has a defined weighting, category classification, standard unit, and historical price data from multiple sources.

- **Data Source**: Documentation of where historical price data originates. Includes citation information, methodology notes, known limitations, and confidence/quality ratings.

- **Time Period Filter**: User-defined date range for data display and analysis. Can be preset (decade, century) or custom (specific start/end dates). Automatically adjusts for currency inception dates.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view century-scale purchasing power trends for any tracked currency within 3 seconds of page load

- **SC-002**: Researchers can export filtered datasets covering any date range and currency combination in under 5 seconds

- **SC-003**: 90% of visualizations load and become interactive in under 500 milliseconds after user makes a selection

- **SC-004**: System maintains full functionality and readability on devices ranging from 320px mobile screens to 4K desktop displays

- **SC-005**: Historical data coverage achieves at least 80% completeness for each currency where records exist (recognizing some early 1900s data may be unavailable)

- **SC-006**: Users can successfully compare 3+ currencies side-by-side and identify relative purchasing power trends within one viewing session

- **SC-007**: Educational content is comprehensive enough that 80% of users can explain what a Greco unit represents and how to interpret the charts without external resources

- **SC-008**: Data source documentation provides sufficient detail that independent researchers can verify and reproduce the displayed values

- **SC-009**: Users successfully complete their primary research task (viewing trends, comparing currencies, or exporting data) on first visit without requiring support documentation in 85% of cases

- **SC-010**: System handles simultaneous display of all 9 tracked currencies/assets without performance degradation or visual confusion

## Clarifications

### Session 2025-12-06

- Q: Data Volume & Storage Planning - The specification mentions 125+ years of data for 9 currencies/assets. What is the expected total data volume? → A: Medium dataset (~10,000 total historical price points: monthly for 1950+, annual for 1900-1950, ~900-1000 records per currency)
- Q: System Availability & Uptime Requirements - What are the availability expectations for this public educational tool? → A: Best effort (no formal SLA, downtime acceptable for maintenance/updates, users notified in advance)
- Q: Data Integrity & Error Detection - How should the system handle potential data quality issues and erroneous historical prices? → A: Basic validation only (simple range checks on data input, e.g., values must be positive, no ongoing automated monitoring, errors caught by users)
- Q: Observability & Operational Monitoring - What logging and monitoring capabilities are needed for maintaining the system? → A: Basic logging included with Vercel hosting platform
- Q: Data Update Responsibility & Workflow - Who manages data updates and what is the process? → A: Manual admin updates via pre-written scripts
- Q: Basket Composition - What are the specific items in the Greco basket of goods? → A: 32 commodities confirmed: Metals (Gold, Silver, Iron, Copper, Aluminum, Tin, Lead, Zinc, Nickel, Platinum), Energy/Materials (Petroleum, Cement, Rubber, Sulphur), Agricultural Grains (Rice, Wheat, Corn, Barley, Oats, Rye), Agricultural Products (Peanuts, Soy Beans, Coffee, Cocoa, Sugar, Cotton Seed), Fibers (Cotton, Wool, Jute), Animal Products (Hides, Copra, Tallow)
- Q: Commodity Units of Measure - What are the standard units for each basket commodity? → A: Confirmed units: Gold/Silver/Cement (Troy Ounce), Iron/Copper/Aluminum/Tin/Lead/Zinc/Petroleum/Nickel/Platinum/Wool/Soy Beans/Rice/Sugar/Sulphur/Hides/Tallow (Metric Ton), Corn/Barley/Peanuts/Oats/Rye/Coffee (Bushel), Rubber/Cocoa/Cotton Seed (Pound or Ton), Wheat (Hundredweight or Ton), Jute/Copra (Kilogram), Cotton (Barrel)

## Assumptions *(optional - document key assumptions made during specification)*

1. **Basket Composition**: The Greco basket consists of 32 specific commodities confirmed from Tom Greco's work: Metals (Gold, Silver, Iron, Copper, Aluminum, Tin, Lead, Zinc, Nickel, Platinum), Energy/Materials (Petroleum, Cement, Rubber, Sulphur), Agricultural Grains (Rice, Wheat, Corn, Barley, Oats, Rye), Agricultural Products (Peanuts, Soy Beans, Coffee, Cocoa, Sugar, Cotton Seed), Fibers (Cotton, Wool, Jute), and Animal Products (Hides, Copra, Tallow). Individual item weightings still need to be determined based on Greco's specifications or defensible methodology.

2. **Data Availability**: Assuming reliable historical price data exists for most tracked currencies back to 1900, though early decades may have gaps. Euro (1999+), Bitcoin (2009+), and possibly early Chinese Yuan/Russian Ruble data will have limited historical depth.

3. **Data Granularity**: Monthly data granularity for recent decades (1950+) and annual granularity for earlier periods (1900-1950), resulting in approximately 10,000 total historical price points across all 9 currencies/assets (~900-1000 records per currency). Daily granularity not required for this use case.

4. **User Technical Proficiency**: Assuming primary users have basic web browsing skills but may not be technical. Interface should require no specialized knowledge beyond selecting options and reading charts.

5. **Update Frequency**: Data updates will be periodic (monthly or quarterly) via manual execution of pre-written administrative scripts by designated maintainers. Historical data is immutable; only recent periods need updates.

6. **Browser Support**: Assuming modern browser support (Chrome, Firefox, Safari, Edge - current and previous version). No IE11 support required.

7. **Accessibility**: Following WCAG 2.1 AA standards as specified in constitution, including keyboard navigation, screen reader support, and sufficient color contrast.

8. **Localization**: Initially English-only interface. Architecture should support future internationalization but not required for MVP.

9. **Authentication**: Public tool with no user authentication required. All features available to anonymous users. No personalization or saved preferences in initial version.

10. **Data Licensing**: Assuming historical economic data from government/academic sources is public domain or fair use for educational purposes. Commercial use restrictions will be documented where applicable.

## Dependencies *(optional - external factors or prerequisites)*

1. **Tom Greco's Book**: Must obtain and review "The End of Money and the Future of Civilization" (2009) to finalize exact weighting methodology for the 32 confirmed basket commodities and theoretical framework

2. **Historical Commodity Price Sources**: Must identify and secure access to reliable historical price data sources for all 32 basket commodities (Gold, Silver, Iron, Copper, Aluminum, Tin, Lead, Zinc, Nickel, Platinum, Petroleum, Cement, Rubber, Sulphur, Rice, Wheat, Corn, Barley, Oats, Rye, Peanuts, Soy Beans, Coffee, Cocoa, Sugar, Cotton Seed, Cotton, Wool, Jute, Hides, Copra, Tallow), particularly for pre-digital era (pre-1990s)

3. **Data Quality Assessment**: Must validate data accuracy and document known limitations before public release, especially for early 20th century data

4. **Basket Weighting Methodology**: Must establish defensible methodology for how the 32 basket commodities are weighted (if not explicitly specified by Greco). Weightings should reflect relative importance in economic activity and be documented with clear rationale

5. **Hosting Infrastructure**: Need web hosting capable of serving interactive visualizations and handling datasets spanning 125+ years of monthly data points. System will be hosted on Vercel platform with its included logging capabilities.

## Out of Scope *(optional - explicitly excluded features)*

1. **Real-time Data**: No live exchange rate feeds or intraday price updates. Historical focus means daily updates are sufficient.

2. **User Accounts**: No user registration, login, saved preferences, or personalization features in initial version.

3. **Predictive Analytics**: No forecasting or prediction of future Greco values. Tool focuses solely on historical data.

4. **Social Features**: No commenting, sharing, or collaborative features. Users can export data but not interact with each other through the platform.

5. **Alternative Basket Definitions**: Initial version uses single standardized Greco basket. Custom or alternative baskets not supported in MVP.

6. **Cryptocurrency Deep Dives**: Bitcoin included as one asset among nine. No detailed crypto-specific features like on-chain analysis or wallet tracking.

7. **Inflation Calculators**: Tool shows Greco values but doesn't provide direct "what would X cost in year Y" calculators. Users interpret data themselves.

8. **API Access**: No programmatic API for external applications. Export functionality provides data access.

9. **Advanced Statistical Analysis**: No built-in regression, correlation, or statistical modeling features. Pivot and export enable external analysis.

10. **Mobile Native Apps**: Web-responsive design only. No iOS/Android native applications.

---

**Next Steps**: Review this specification with stakeholders, particularly regarding basket composition assumptions (depends on book review). Once approved, proceed to `/speckit.clarify` for any remaining questions or directly to `/speckit.plan` to create implementation plan.
