# Greco Coin - Historical Currency Tracker

> Historical economic data visualization tracking purchasing power trends of a standardized basket of 32 commodities (the Greco unit) across 9 currencies/assets from 1900 to present.

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

---

## 📖 About the Greco Unit

The **Greco** is a monetary unit concept proposed by Thomas H. Greco Jr., representing the value of a fixed basket of 32 essential commodities. Unlike fiat currencies that can be inflated, the Greco provides a stable measure of purchasing power grounded in real economic value.

This tracker visualizes how various currencies (USD, EUR, GBP, etc.) have performed against this commodity-backed standard over the past 125 years, revealing long-term inflation and monetary policy impacts.

---

## ✨ Features

### 📊 Interactive Visualizations
- **Time Series Charts**: Historical Greco values with data quality indicators
- **Multi-Currency Comparison**: Side-by-side analysis of up to 9 currencies
- **Responsive Design**: Optimized for desktop, tablet, and mobile

### 📈 Data Access
- **Filterable Tables**: Sort, filter, and paginate historical data
- **Pivot Views**: Group by year or currency for different perspectives
- **CSV Export**: Download data with customizable options

### 📚 Educational Content
- **Methodology**: Detailed explanation of 32 commodities and calculation
- **Data Sources**: Complete bibliography with quality indicators
- **Historical Context**: Tom Greco's vision and commodity-backed value theory

### ⚡ Performance & Accessibility
- **Data Sampling**: Handles >10K data points efficiently
- **Keyboard Navigation**: Full keyboard support with focus indicators
- **Screen Reader Compatible**: ARIA labels and semantic HTML
- **Loading Skeletons**: Better perceived performance

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20.x or later
- **npm** 10.x or later

### Installation

```bash
# Clone the repository
git clone https://github.com/jemustain/greco-coin.git
cd greco-coin

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

---

## 📂 Project Structure

```
greco-coin/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── page.tsx           # Homepage with time series chart
│   │   ├── compare/           # Multi-currency comparison
│   │   ├── data/              # Data access and export
│   │   ├── about/             # Educational content
│   │   └── api/               # API routes (CSV export)
│   ├── components/
│   │   ├── charts/            # Chart components (Recharts)
│   │   ├── data/              # Data table, pivot, export
│   │   ├── layout/            # Header, footer, navigation
│   │   └── common/            # Loading skeletons, shared UI
│   ├── lib/
│   │   ├── data/              # Data loading utilities
│   │   ├── types/             # TypeScript type definitions
│   │   └── utils/             # Formatting, charting, performance
│   └── data/                  # Static data files (JSON)
├── scripts/                   # Admin scripts (validation, calculation)
├── tests/                     # E2E tests (Playwright)
├── docs/                      # Documentation
└── specs/                     # Project specifications
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 14.2](https://nextjs.org/) (App Router, SSR)
- **Language**: [TypeScript 5.3](https://www.typescriptlang.org/)
- **UI**: React 18, Tailwind CSS 3
- **Charts**: [Recharts 2.10](https://recharts.org/)

### Data & API
- **Validation**: [Zod 3.22](https://zod.dev/)
- **Date Handling**: [date-fns 3.0](https://date-fns.org/)
- **Export**: Server-side CSV generation with rate limiting

### Development
- **Testing**: [Playwright](https://playwright.dev/) (E2E), Vitest (Unit)
- **Linting**: ESLint, TypeScript strict mode
- **CI/CD**: GitHub Actions + Vercel

---

## 📊 Data Management

### Admin Scripts

Located in `scripts/` directory:

```bash
# Validate all data files
npm run script:validate

# Recalculate Greco values from commodity prices
npm run script:calculate

# Import new commodity price data from CSV
npm run script:import -- <csv-file> <commodity-id>
```

See [scripts/README.md](./scripts/README.md) for detailed documentation.

### Data Files

- `src/data/basket-weights.json` - Commodity weights (1/32 each)
- `src/data/greco-values.json` - Calculated Greco values
- `src/data/prices/*.json` - Commodity price histories

---

## 🧪 Testing

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run tests in UI mode
npm run test:e2e -- --ui

# Run specific test file
npm run test:e2e -- tests/e2e/user-story-1.spec.ts
```

Test coverage:
- ✅ User Story 1: Homepage interactive charts
- ✅ User Story 2: Multi-currency comparison
- ✅ User Story 3: Data access and CSV export
- ✅ User Story 4: Educational content pages

### Unit Tests (Vitest)

```bash
# Run unit tests
npm test

# Run with coverage
npm test -- --coverage
```

---

## 🌐 Deployment

### Vercel (Recommended)

1. **Push to GitHub**: `git push origin main`
2. **Connect to Vercel**: Import project at [vercel.com](https://vercel.com)
3. **Configure**:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. **Deploy**: Automatic on push to main

### Manual Deployment

```bash
# Build production version
npm run build

# Test locally
npm start

# Deploy to your hosting provider
# (copy .next, public, package.json, package-lock.json)
```

---

## 📖 Documentation

- [Quickstart Guide](./docs/quickstart.md)
- [Architecture Overview](./docs/architecture.md)
- [Admin Scripts](./scripts/README.md)
- [Lighthouse Baseline](./docs/lighthouse-baseline.md)
- [Project Specifications](./specs/001-greco-tracker/)

---

## 🤝 Contributing

Contributions welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Workflow

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev

# 3. Make changes and test
npm run lint        # Check code style
npm run test        # Run unit tests
npm run test:e2e    # Run E2E tests

# 4. Build and verify
npm run build
npm start

# 5. Commit and push
git add .
git commit -m "feat: your feature"
git push
```

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Thomas H. Greco Jr.** - Creator of the Greco unit concept
- **Data Sources**:
  - USGS Mineral Commodity Summaries (metals and minerals)
  - World Bank Commodity Price Data (agricultural products)
  - IMF Primary Commodity Prices (energy and materials)
- **Community**: Thanks to all contributors and users

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/jemustain/greco-coin/issues)
- **Discussions**: [GitHub Discussions](https://github.com/jemustain/greco-coin/discussions)
- **Email**: support@greco-coin.example.com

---

## 🗺️ Roadmap

- [ ] Real-time data updates via API integration
- [ ] Additional currencies (JPY, CHF, AUD)
- [ ] Historical inflation calculator
- [ ] Portfolio tracking features
- [ ] Mobile native apps (React Native)
- [ ] Multi-language support

---

**Built with ❤️ using Next.js and TypeScript**