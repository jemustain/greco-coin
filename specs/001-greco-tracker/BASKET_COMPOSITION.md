# Greco Basket Composition

**Date Confirmed**: 2025-12-06  
**Source**: Tom Greco's "The End of Money and the Future of Civilization" (2009)  
**Total Commodities**: 32  
**Units of Measure**: Confirmed

## Complete Basket List with Units

### Metals (10 commodities)
1. **Gold** - Troy Ounce (oz t)
2. **Silver** - Troy Ounce (oz t)
3. **Iron** - Metric Ton (tonne)
4. **Copper** - Metric Ton (tonne)
5. **Aluminum** - Metric Ton (tonne)
6. **Tin** - Metric Ton (tonne)
7. **Lead** - Metric Ton (tonne)
8. **Zinc** - Metric Ton (tonne)
9. **Nickel** - Metric Ton (tonne)
10. **Platinum** - Metric Ton (tonne)

### Energy & Materials (4 commodities)
11. **Petroleum** - Metric Ton (tonne)
12. **Cement** - Troy Ounce (oz t)
13. **Rubber** - Pound (lb)
14. **Sulphur** - Metric Ton (tonne)

### Agricultural Grains (6 commodities)
15. **Rice** - Metric Ton (tonne)
16. **Wheat** - Hundredweight (cwt) or Ton
17. **Corn** - Bushel (bu)
18. **Barley** - Bushel (bu)
19. **Oats** - Bushel (bu)
20. **Rye** - Bushel (bu)

### Agricultural Products (6 commodities)
21. **Peanuts** - Bushel (bu)
22. **Soy Beans** - Metric Ton (tonne)
23. **Coffee** - Bushel (bu)
24. **Cocoa** - Pound (lb) or Ton
25. **Sugar** - Metric Ton (tonne)
26. **Cotton Seed** - Pound (lb) or Ton

### Fibers (3 commodities)
27. **Cotton** - Barrel (bbl)
28. **Wool** - Metric Ton (tonne)
29. **Jute** - Kilogram (kg)

### Animal Products (3 commodities)
30. **Hides** - Metric Ton (tonne)
31. **Copra** - Piece or Kilogram (kg)
32. **Tallow** - Metric Ton (tonne)

## Units of Measure Summary

### By Unit Type

**Troy Ounce (oz t)** - 3 commodities
- Gold, Silver, Cement

**Metric Ton (tonne)** - 17 commodities
- Iron, Copper, Aluminum, Tin, Lead, Zinc, Nickel, Platinum (metals)
- Petroleum, Sulphur (energy/materials)
- Rice, Soy Beans, Sugar (agricultural)
- Wool (fiber)
- Hides, Tallow (animal products)

**Bushel (bu)** - 7 commodities
- Corn, Barley, Oats, Rye (grains)
- Peanuts, Coffee (agricultural products)

**Pound (lb) or Ton** - 3 commodities
- Rubber, Cocoa, Cotton Seed
- *Note: Some sources may use ton instead of pound*

**Alternative/Mixed Units** - 5 commodities
- Wheat: Hundredweight (cwt) or Ton
- Cotton: Barrel (bbl)
- Jute: Kilogram (kg)
- Copra: Piece or Kilogram (kg)

### Unit Standardization Notes

**Metric Ton dominance**: Over 50% of commodities (17 of 32) use metric tons, indicating industrial/bulk commodity focus

**Agricultural diversity**: Grains primarily use bushels (traditional agricultural unit), while processed agricultural products use metric tons

**Precious metals**: Traditional troy ounce measurement maintained for Gold and Silver

**Anomaly**: Cement measured in troy ounces is unusual - may indicate specific historical context or data source convention

**Dual units**: Several commodities (Wheat, Cocoa, Cotton Seed, Copra) have alternative units, suggesting different market conventions or historical data source variations. Implementation should document which unit is used consistently.

## Category Distribution

| Category | Count | Percentage |
|----------|-------|------------|
| Metals | 10 | 31.3% |
| Agricultural Grains | 6 | 18.8% |
| Agricultural Products | 6 | 18.8% |
| Energy & Materials | 4 | 12.5% |
| Fibers | 3 | 9.4% |
| Animal Products | 3 | 9.4% |
| **Total** | **32** | **100%** |

## Rationale

This basket represents a comprehensive cross-section of fundamental commodities that have been essential to human economic activity throughout the modern era (1900+):

- **Metals**: Industrial and precious metals critical to construction, manufacturing, and store of value
- **Energy & Materials**: Essential inputs for infrastructure and industrial processes
- **Agricultural Grains**: Basic food staples with consistent demand across cultures
- **Agricultural Products**: Cash crops and food commodities with global trade
- **Fibers**: Textile materials for clothing and industrial use
- **Animal Products**: Livestock-derived commodities with agricultural significance

## Implementation Notes

### Data Requirements
Each commodity requires:
- Historical price data from 1900-present (where available)
- Prices consistently reported in the specified standard unit
- Standard unit of measure (now confirmed for all 32 commodities - see list above)
- Weighting factor in the Greco unit calculation (still to be determined)
- Primary data sources with citations
- Unit conversion factors if sources report in different units

### Unit Consistency Challenges
**Dual-unit commodities** require decisions:
- Wheat: Hundredweight vs Ton
- Cocoa: Pound vs Ton  
- Cotton Seed: Pound vs Ton
- Copra: Piece vs Kilogram

**Recommendation**: Select single unit per commodity based on most reliable historical data sources and document conversion factors.

### Weighting Methodology
**Status**: To be determined from Tom Greco's specifications or established through defensible methodology

Considerations for weighting:
- Relative importance in global economic activity
- Historical consistency of demand
- Liquidity and availability of price data
- Representativeness across different economic sectors

### Data Source Challenges
**Expected difficulties**:
- Early 20th century data (1900-1950) may be incomplete or estimated for some commodities
- Some commodities (Copra, Jute, Tallow) may have limited historical price records
- Standardization of units across different historical sources (especially for dual-unit commodities)
- Quality and reliability variations across commodities
- **Unit conversions**: Some historical sources may report in different units requiring conversion
- **Cement in troy ounces**: Unusual unit choice - need to verify data source convention
- **Dual-unit commodities**: Must select primary unit and document conversions

### Next Steps
1. Research historical price data availability for all 32 commodities in their specified units
2. Identify most reliable data sources (commodities exchanges, government records, academic databases)
3. For dual-unit commodities (Wheat, Cocoa, Cotton Seed, Copra), select primary unit based on data availability
4. Determine weighting methodology from Greco's work or develop justified alternative
5. Assess data completeness and gaps for each commodity
6. Define unit conversion factors for any necessary transformations
7. Define data collection and validation procedures with unit consistency checks

## References

- Greco, Thomas H. Jr. (2009). *The End of Money and the Future of Civilization*
- Historical commodity price sources to be documented during data collection phase
