# Developer Quickstart Guide

**Feature**: Greco Historical Currency Tracker  
**Last Updated**: 2025-12-06  
**Estimated Setup Time**: 15-20 minutes

---

## Prerequisites

### Required Software

| Tool | Minimum Version | Purpose |
|------|----------------|---------|
| **Node.js** | 18.17.0+ | Runtime environment |
| **npm** | 9.0.0+ | Package manager |
| **Git** | 2.30.0+ | Version control |
| **VS Code** | 1.80.0+ | Recommended IDE |

### Optional Tools

- **SQLite CLI** (3.40.0+): For admin database inspection
- **PowerShell** (5.1+ or Core 7+): For admin scripts (Windows)
- **Vercel CLI** (32.0.0+): For deployment testing

---

## Getting Started

### 1. Clone the Repository

```powershell
git clone https://github.com/jemustain/greco-coin.git
cd greco-coin
```

### 2. Install Dependencies

```powershell
npm install
```

**Expected output**:
```
added 234 packages in 12s
```

**Key dependencies installed**:
- `next@14.2.0` - React framework
- `react@18.2.0` - UI library
- `recharts@2.10.0` - Charting
- `tailwindcss@3.4.0` - Styling
- `typescript@5.3.0` - Type safety
- `vitest@1.0.0` - Testing

### 3. Verify Installation

```powershell
npm run check
```

This runs:
- TypeScript compilation check
- Linting
- Unit tests
- Build validation

**Expected output**:
```
✓ TypeScript: No errors
✓ ESLint: 0 problems
✓ Vitest: 42 tests passed
✓ Build: Completed successfully
```

### 4. Start Development Server

```powershell
npm run dev
```

**Server starts at**: http://localhost:3000

**Expected terminal output**:
```
  ▲ Next.js 14.2.0
  - Local:        http://localhost:3000
  - Environment:  development

 ✓ Ready in 1.8s
```

**Open browser to**:
- Homepage: http://localhost:3000
- Greco Tracker: http://localhost:3000/tracker
- Raw Data: http://localhost:3000/data

---

## Project Structure

```
greco-coin/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Homepage
│   │   ├── tracker/            # Main tracker page
│   │   │   └── page.tsx
│   │   ├── data/               # Raw data display page
│   │   │   └── page.tsx
│   │   ├── about/              # Educational content
│   │   │   └── page.tsx
│   │   └── api/                # API routes
│   │       └── export/
│   │           └── route.ts    # CSV export endpoint
│   │
│   ├── components/             # React components
│   │   ├── charts/
│   │   │   ├── GrecoChart.tsx
│   │   │   └── ComparisonChart.tsx
│   │   ├── filters/
│   │   │   ├── DateRangeFilter.tsx
│   │   │   ├── CurrencyFilter.tsx
│   │   │   └── GranularityFilter.tsx
│   │   ├── data-table/
│   │   │   ├── DataTable.tsx
│   │   │   └── PivotTable.tsx
│   │   └── ui/                 # Reusable UI components
│   │       ├── Button.tsx
│   │       └── Select.tsx
│   │
│   ├── lib/                    # Core business logic
│   │   ├── data/
│   │   │   ├── loader.ts       # Load JSON data files
│   │   │   ├── greco-calculator.ts  # Greco unit calculation
│   │   │   └── converter.ts    # Unit conversions
│   │   ├── types/
│   │   │   ├── commodity.ts    # Type definitions
│   │   │   ├── currency.ts
│   │   │   └── greco.ts
│   │   ├── validation/
│   │   │   └── schemas.ts      # Zod validation schemas
│   │   └── utils/
│   │       ├── date.ts         # Date formatting
│   │       └── chart.ts        # Chart data transformations
│   │
│   ├── data/                   # Static data files (JSON)
│   │   ├── commodities.json    # 32 commodities
│   │   ├── currencies.json     # 9 currencies
│   │   ├── basket-weights.json # Weighting schemes
│   │   ├── units.json          # Unit conversions
│   │   ├── data-sources.json   # Source citations
│   │   ├── greco-values.json   # Pre-calculated Greco values
│   │   ├── exchange-rates.json # Currency exchange rates
│   │   └── prices/             # Commodity prices
│   │       ├── gold.json
│   │       ├── wheat.json
│   │       └── ... (30 more)
│   │
│   └── scripts/                # Admin & data management
│       ├── calculate-greco.ts  # Regenerate Greco values
│       ├── validate-data.ts    # Data integrity checks
│       ├── import-prices.ts    # Import new price data
│       └── db/                 # SQLite admin database
│           ├── schema.sql
│           └── admin.db
│
├── tests/                      # Test suites
│   ├── unit/                   # Unit tests (Vitest)
│   │   ├── greco-calculator.test.ts
│   │   └── converter.test.ts
│   ├── components/             # Component tests (React Testing Library)
│   │   ├── GrecoChart.test.tsx
│   │   └── DataTable.test.tsx
│   └── e2e/                    # End-to-end tests (Playwright)
│       ├── tracker.spec.ts
│       └── export.spec.ts
│
├── public/                     # Static assets
│   └── favicon.ico
│
├── specs/                      # Specifications (this directory)
│   └── 001-greco-tracker/
│       ├── spec.md
│       ├── plan.md
│       └── ...
│
├── .specify/                   # Spec Kit framework
│   ├── memory/
│   │   └── constitution.md
│   └── scripts/
│
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript config
├── tailwind.config.ts          # Tailwind CSS config
├── next.config.js              # Next.js config
├── vitest.config.ts            # Vitest test config
├── playwright.config.ts        # Playwright E2E config
└── README.md                   # Project overview
```

---

## Development Workflow

### Running Tests

**Unit tests** (Vitest):
```powershell
npm run test:unit
```

**Component tests** (React Testing Library):
```powershell
npm run test:components
```

**E2E tests** (Playwright):
```powershell
npm run test:e2e
```

**All tests**:
```powershell
npm test
```

**Watch mode** (re-run on file changes):
```powershell
npm run test:watch
```

### Linting & Formatting

**Run ESLint**:
```powershell
npm run lint
```

**Fix auto-fixable issues**:
```powershell
npm run lint:fix
```

**Format with Prettier** (if configured):
```powershell
npm run format
```

### Building for Production

**Create production build**:
```powershell
npm run build
```

**Test production build locally**:
```powershell
npm run start
```

**Analyze bundle size**:
```powershell
npm run analyze
```

---

## Data Management

### Understanding the Data Files

**Static reference data** (rarely changes):
- `commodities.json` - 32 commodities with metadata
- `currencies.json` - 9 currencies/assets
- `units.json` - Unit conversion factors
- `basket-weights.json` - Commodity weights for Greco calculation
- `data-sources.json` - Citations for all data

**Historical price data** (~37K records):
- `prices/*.json` - 32 files, one per commodity
- `exchange-rates.json` - Currency exchange rates
- `greco-values.json` - Pre-calculated Greco unit values

### Admin Scripts

All scripts are in `src/scripts/` and use TypeScript + Node.js.

#### 1. Calculate Greco Values

Regenerates `greco-values.json` from commodity prices and basket weights.

```powershell
npx tsx src/scripts/calculate-greco.ts
```

**Options**:
```powershell
# Recalculate for specific date range
npx tsx src/scripts/calculate-greco.ts --start 1950-01-01 --end 2025-01-01

# Recalculate for specific currency
npx tsx src/scripts/calculate-greco.ts --currency USD

# Verbose output
npx tsx src/scripts/calculate-greco.ts --verbose
```

**Expected output**:
```
✓ Loaded 32 commodities
✓ Loaded basket weights v1.0.0
✓ Calculated 900 Greco values (1950-2025, monthly)
✓ Written to data/greco-values.json
⚠ Warning: 12 data points had <90% completeness
```

#### 2. Validate Data Integrity

Checks all data files for errors.

```powershell
npx tsx src/scripts/validate-data.ts
```

**Checks performed**:
- Schema validation (Zod schemas)
- Date range validation
- Price reasonableness checks
- Completeness calculations
- Cross-reference validation (sourceIds exist, etc.)

**Expected output**:
```
✓ commodities.json: Valid (32 commodities)
✓ currencies.json: Valid (9 currencies)
✓ prices/gold.json: Valid (1500 price points)
...
⚠ prices/jute.json: Missing data 1920-1930 (10 years)
✗ prices/wheat.json: Outlier detected at 1975-06-01 ($45.67/bu, 3.2σ)
```

#### 3. Import New Price Data

Adds new price data from CSV or API.

```powershell
# Import from CSV
npx tsx src/scripts/import-prices.ts --source ./new-data.csv --commodity gold

# Import from API (future enhancement)
npx tsx src/scripts/import-prices.ts --api world-bank --commodity wheat --year 2024
```

**CSV format**:
```csv
Date,PriceUSD,Granularity,SourceId
2024-01-01,2043.50,monthly,lbma-gold-prices
2024-02-01,2055.75,monthly,lbma-gold-prices
```

---

## Database Access (Admin)

An SQLite database (`src/scripts/db/admin.db`) is used for admin workflows.

### Connect to Database

```powershell
sqlite3 src/scripts/db/admin.db
```

### Common Queries

**List all commodities**:
```sql
SELECT id, name, category FROM commodities ORDER BY category, name;
```

**Find price gaps**:
```sql
SELECT commodity_id, 
       MIN(date) as first_price, 
       MAX(date) as last_price,
       COUNT(*) as num_prices
FROM commodity_price_points
GROUP BY commodity_id;
```

**Check data sources**:
```sql
SELECT s.name, s.type, COUNT(p.id) as num_prices
FROM data_sources s
LEFT JOIN commodity_price_points p ON p.source_id = s.id
GROUP BY s.id
ORDER BY num_prices DESC;
```

### Reset Database

```powershell
# Drop all tables
sqlite3 src/scripts/db/admin.db < src/scripts/db/reset.sql

# Recreate from schema
sqlite3 src/scripts/db/admin.db < src/scripts/db/schema.sql

# Import JSON data
npx tsx src/scripts/db/json-to-sqlite.ts
```

---

## Component Development Guide

### Creating a New Chart Component

1. **Create component file**: `src/components/charts/MyChart.tsx`

```typescript
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { GrecoValuePoint } from '@/lib/types/greco';

interface MyChartProps {
  data: GrecoValuePoint[];
  currency: string;
}

export function MyChart({ data, currency }: MyChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

2. **Add tests**: `tests/components/MyChart.test.tsx`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyChart } from '@/components/charts/MyChart';

describe('MyChart', () => {
  it('renders chart with data', () => {
    const mockData = [
      { date: '2020-01-01', currency: 'USD', value: 1000 },
      { date: '2021-01-01', currency: 'USD', value: 1100 }
    ];
    
    render(<MyChart data={mockData} currency="USD" />);
    // Add assertions
  });
});
```

3. **Use in page**: `src/app/tracker/page.tsx`

```typescript
import { MyChart } from '@/components/charts/MyChart';

export default function TrackerPage() {
  // Load data...
  return <MyChart data={grecoValues} currency="USD" />;
}
```

---

## API Development

### Adding a New API Endpoint

1. **Create route file**: `src/app/api/my-endpoint/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const RequestSchema = z.object({
  param: z.string()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = RequestSchema.parse(body);
    
    // Business logic...
    const result = { data: 'example' };
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
```

2. **Add tests**: `tests/unit/api/my-endpoint.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/my-endpoint/route';

describe('POST /api/my-endpoint', () => {
  it('returns data on valid request', async () => {
    const request = new Request('http://localhost:3000/api/my-endpoint', {
      method: 'POST',
      body: JSON.stringify({ param: 'value' })
    });
    
    const response = await POST(request);
    expect(response.status).toBe(200);
  });
});
```

---

## Deployment

### Vercel (Recommended)

**Initial setup**:
```powershell
npm install -g vercel
vercel login
vercel link
```

**Deploy preview**:
```powershell
vercel
```

**Deploy production**:
```powershell
vercel --prod
```

**Environment variables** (set in Vercel dashboard):
- `NODE_ENV=production`
- `NEXT_PUBLIC_API_URL` (if using external API)

---

## Troubleshooting

### Common Issues

#### Issue: "Module not found" errors

**Cause**: Missing dependencies or incorrect TypeScript paths

**Solution**:
```powershell
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Issue: Slow chart rendering

**Cause**: Too many data points (>10,000)

**Solution**: Implement data sampling in `lib/utils/chart.ts`:
```typescript
export function sampleData(data: any[], maxPoints: number = 5000) {
  if (data.length <= maxPoints) return data;
  const step = Math.ceil(data.length / maxPoints);
  return data.filter((_, i) => i % step === 0);
}
```

#### Issue: Test timeouts

**Cause**: Async operations not awaited properly

**Solution**: Check test setup in `vitest.config.ts`:
```typescript
export default defineConfig({
  test: {
    testTimeout: 10000, // Increase timeout
  }
});
```

#### Issue: Data validation errors

**Cause**: JSON data files don't match schema

**Solution**:
```powershell
npx tsx src/scripts/validate-data.ts --verbose
```

---

## Next Steps

1. **Read the spec**: `specs/001-greco-tracker/spec.md`
2. **Review constitution**: `.specify/memory/constitution.md`
3. **Explore data files**: `src/data/*.json`
4. **Run tests**: `npm test`
5. **Start implementing**: See `specs/001-greco-tracker/tasks.md` (after generation)

---

## Getting Help

- **Documentation**: See `specs/001-greco-tracker/` directory
- **GitHub Issues**: https://github.com/jemustain/greco-coin/issues
- **Constitution**: `.specify/memory/constitution.md` for principles

---

**Quickstart Version**: 1.0.0  
**Last Updated**: 2025-12-06  
**Ready to Code!** 🚀
