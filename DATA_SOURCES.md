# Data Sources

## World Bank Commodity Price Data (Pink Sheet)

**URL:** https://thedocs.worldbank.org/en/doc/5d903e848db1d1b83e0ec8f744e55570-0350012021/related/CMO-Historical-Data-Monthly.xlsx

**Sheet:** Monthly Prices  
**Update frequency:** Monthly (typically updated first week of month)  
**Coverage:** 1960–present  

### Commodities Covered (23 of 32)

| Commodity | Pink Sheet Column | Unit | Data Range |
|-----------|------------------|------|------------|
| gold | Gold | usd/troy-ounce | 1960–2024 |
| silver | Silver | usd/troy-ounce | 1960–2024 |
| platinum | Platinum | usd/troy-ounce | 1960–2024 |
| iron | Iron ore, cfr spot | usd/dry-metric-ton | 1960–2024 |
| copper | Copper | usd/metric-ton | 1960–2024 |
| aluminum | Aluminum | usd/metric-ton | 1960–2024 |
| tin | Tin | usd/metric-ton | 1960–2024 |
| lead | Lead | usd/metric-ton | 1960–2024 |
| zinc | Zinc | usd/metric-ton | 1960–2024 |
| nickel | Nickel | usd/metric-ton | 1960–2024 |
| petroleum | Crude oil, WTI | usd/barrel | 1982–2024 |
| rubber | Rubber, TSR20 | usd/kilogram | 1999–2024 |
| rice | Rice, Thai 5% | usd/metric-ton | 1960–2024 |
| wheat | Wheat, US HRW | usd/metric-ton | 1960–2024 |
| corn | Maize | usd/metric-ton | 1960–2024 |
| barley | Barley | usd/metric-ton | 1960–2020 |
| peanuts | Groundnuts | usd/metric-ton | 1980–2024 |
| soy-beans | Soybeans | usd/metric-ton | 1960–2024 |
| coffee | Coffee, Arabica | usd/kilogram | 1960–2024 |
| cocoa | Cocoa | usd/kilogram | 1960–2024 |
| sugar | Sugar, world | usd/kilogram | 1960–2024 |
| cotton | Cotton, A Index | usd/kilogram | 1960–2024 |
| copra | Coconut oil (proxy) | usd/metric-ton | 1960–2024 |

### Gaps (9 commodities not in Pink Sheet)

- **cement** — No World Bank series
- **sulphur** — No World Bank series
- **cotton-seed** — No World Bank series
- **tallow** — No World Bank series
- **jute** — No World Bank series
- **oats** — No World Bank series (FRED only)
- **rye** — No World Bank series (FRED only)
- **wool** — Series exists but discontinued/not in current Pink Sheet
- **hides** — Series exists but discontinued/not in current Pink Sheet

### Unit Notes

- Grains (wheat, corn, barley, rice, soy-beans) are in **usd/metric-ton** from the Pink Sheet, even though our commodities.json lists some as bushels. The Pink Sheet reports in metric tons.
- Coffee, cocoa, sugar, cotton are in **usd/kilogram** from the Pink Sheet, not per pound.
- Copra uses **coconut oil** as a proxy since copra itself isn't listed separately.

### Running the Script

```bash
npx tsx scripts/fetch-worldbank-prices.ts
```

Downloads to `scripts/tmp/`, writes to `src/data/prices/`.
