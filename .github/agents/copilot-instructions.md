# greco-coin Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-12-06

## Active Technologies
- TypeScript 5.3+ (Next.js 14.2.33, Node.js 18+) + Next.js, React 18, axios (API calls), zod (validation), recharts (existing), better-sqlite3 (data storage - TBD based on research) (002-real-data-api)
- Currently JSON files (4000+ records × 32 commodities = 128K+ records). **Decision needed**: Migrate to SQLite for indexed queries or optimize JSON with sharding/indexing. (002-real-data-api)

- TypeScript 5.3+ / JavaScript (ES2022) + Next.js 14 (App Router), React 18, Recharts/Chart.js (visualization), Tailwind CSS (styling) (001-greco-tracker)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test; npm run lint

## Code Style

TypeScript 5.3+ / JavaScript (ES2022): Follow standard conventions

## Recent Changes
- 002-real-data-api: Added TypeScript 5.3+ (Next.js 14.2.33, Node.js 18+) + Next.js, React 18, axios (API calls), zod (validation), recharts (existing), better-sqlite3 (data storage - TBD based on research)

- 001-greco-tracker: Added TypeScript 5.3+ / JavaScript (ES2022) + Next.js 14 (App Router), React 18, Recharts/Chart.js (visualization), Tailwind CSS (styling)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
