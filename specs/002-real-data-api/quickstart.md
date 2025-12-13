# Quickstart Guide: Real Commodity Data APIs & Performance Optimization

**Feature**: 002-real-data-api  
**Audience**: Administrators, Developers  
**Date**: 2025-12-07

## Overview

This guide covers:
- **Admin Setup**: Configure API keys, cron jobs, and monitoring
- **Developer Guide**: Local development, data fetching, and testing
- **Operations**: Monitoring data freshness, handling alerts, manual updates

---

## Admin Setup

### Prerequisites

- Access to Vercel dashboard (for cron jobs and environment variables)
- FRED API key (free, required for 15 commodities)
- GitHub repository access (for code deployment)

### Step 1: Obtain FRED API Key

1. Visit https://fred.stlouisfed.org/
2. Click "My Account" → "API Keys"
3. Click "Request API Key"
4. Fill out form (name: "Greco Coin", description: "Commodity price data")
5. Copy your API key (format: `abcd1234efgh5678ijkl9012mnop3456`)

**⚠️ Important**: Keep this key secure. Do not commit to git.

### Step 2: Configure Environment Variables

**In Vercel Dashboard**:

1. Navigate to Project Settings → Environment Variables
2. Add the following environment variables:

**Required:**
```bash
# FRED API Key (required for 15 commodities)
# Get from: https://fred.stlouisfed.org/docs/api/api_key.html
FRED_API_KEY=your_fred_api_key_here
```

**Optional:**
```bash
# World Bank API base URL (defaults to https://api.worldbank.org/v2)
WORLD_BANK_BASE_URL=https://api.worldbank.org/v2

# USGS cache directory for bulk downloads (defaults to /tmp/usgs-data)
USGS_CACHE_DIR=/tmp/usgs-data
```

3. **Apply to Environments**: Select "Production", "Preview", and "Development"
4. Click "Save"

**For Local Development**:

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your FRED_API_KEY:
   ```bash
   # Add to .env.local
   FRED_API_KEY=your_fred_api_key_here
   ```

3. Test configuration:
   ```bash
   npm run test:api-connection
   ```
   
   Expected output:
   ```
   ✅ All 2 API connections successful!
   🎉 You are ready to fetch commodity data.
   ```

# Optional: Enable debug logging
DEBUG_API_ADAPTERS=false
```

**For Local Development** (`.env.local`):

Create `.env.local` in project root:

```bash
FRED_API_KEY=your_fred_api_key_here
WORLD_BANK_BASE_URL=https://api.worldbank.org/v2
DEBUG_API_ADAPTERS=true
```

Add to `.gitignore` if not already present:
```
.env.local
```

### Step 3: Configure Vercel Cron Jobs

**In `vercel.json`** (add to root of project):

```json
{
  "crons": [
    {
      "path": "/api/cron/fetch-high-priority",
      "schedule": "0 6 * * *"
    },
    {
      "path": "/api/cron/fetch-medium-weekly",
      "schedule": "0 7 * * 1"
    },
    {
      "path": "/api/cron/fetch-agricultural",
      "schedule": "0 9 1 * *"
    },
    {
      "path": "/api/cron/fetch-low-priority",
      "schedule": "0 10 1 1,4,7,10 *"
    }
  ]
}
```

**Cron Schedule Explanation**:
- **High Priority** (Gold, Silver, Platinum, Petroleum): Daily at 6 AM UTC
- **Medium Weekly** (Industrial metals): Mondays at 7 AM UTC
- **Agricultural** (Wheat, Corn, etc.): 1st of month at 9 AM UTC
- **Low Priority** (Specialty commodities): Quarterly at 10 AM UTC

**Deploy to enable**:
```bash
git add vercel.json
git commit -m "chore: configure cron jobs for data updates"
git push
```

Vercel will automatically detect and enable cron jobs.

### Step 4: Verify Setup

**Check Environment Variables**:
```bash
# In Vercel dashboard
Settings → Environment Variables → Verify FRED_API_KEY is set
```

**Test API Connection**:
```bash
# Run test script locally
npm run test:api-connection

# Expected output:
# ✓ FRED API: Connected (series: GOLDAMGBD228NLBM)
# ✓ World Bank API: Connected (indicator: PGOLD)
# ✓ All adapters operational
```

**Check Cron Job Status**:
- Vercel Dashboard → Deployments → Cron Jobs tab
- Verify all 4 cron jobs are listed and enabled

### Step 5: Initial Data Migration

**Run one-time migration script** (converts existing JSON to sharded format):

```bash
# Locally (recommended for first run)
npm run script:migrate-to-shards

# Expected output:
# ✓ Read 32 existing commodity files
# ✓ Created 128 shard files (4 periods × 32 commodities)
# ✓ Generated date-range-index.json
# ✓ Validated all shards
# ✓ Migration complete in 2.3s
```

**Commit migrated data**:
```bash
git add src/data/prices/
git add src/data/indexes/
git commit -m "data: migrate to sharded JSON format"
git push
```

---

## Developer Guide

### Local Development Setup

**1. Install dependencies**:
```bash
npm install
```

**2. Configure environment**:
```bash
cp .env.example .env.local
# Edit .env.local with your FRED API key
```

**3. Start development server**:
```bash
npm run dev
```

**4. Access pages**:
- Homepage: http://localhost:3000
- Commodity page: http://localhost:3000/data/gold
- Admin dashboard: http://localhost:3000/admin/staleness

### Running Data Fetch Scripts

**Fetch data for a single commodity**:
```bash
npm run fetch-data -- --commodity=gold
```

**Fetch data for a date range**:
```bash
npm run fetch-data -- --commodity=silver --start=2020-01-01 --end=2025-12-31
```

**Fetch all high-priority commodities**:
```bash
npm run fetch-data -- --priority=high
```

**Force update (ignore cache)**:
```bash
npm run fetch-data -- --commodity=copper --force
```

**Dry run (preview without writing)**:
```bash
npm run fetch-data -- --commodity=platinum --dry-run
```

### Script Options

```bash
npm run fetch-data -- [options]

Options:
  --commodity=<id>        Fetch single commodity (e.g., gold, silver)
  --priority=<level>      Fetch all commodities of priority (high, medium, low)
  --start=<date>          Start date (ISO 8601: 2020-01-01)
  --end=<date>            End date (ISO 8601: 2025-12-31)
  --force                 Ignore cache, force API call
  --dry-run               Preview without writing data
  --verbose               Enable debug logging
  --adapter=<name>        Force specific adapter (FRED, WorldBank, USGS, Manual)
```

### Testing

**Run all tests**:
```bash
npm run test
```

**Run specific test suites**:
```bash
# API adapter tests
npm run test:adapters

# Data shard tests
npm run test:shards

# Cache tests
npm run test:cache

# E2E tests (requires dev server running)
npm run test:e2e
```

**Run tests with coverage**:
```bash
npm run test:coverage
```

### Validating Data Quality

**Check data quality summary**:
```bash
npm run script:quality-check

# Expected output:
# Gold: 100% high quality (0% interpolated)
# Silver: 98% high quality (2% interpolated)
# Petroleum: 95% high quality (5% interpolated)
# ...
# Overall: 97% high quality
```

**Check for missing data**:
```bash
npm run script:find-gaps

# Expected output:
# Gold: No gaps
# Silver: 2 gaps (1945-01 to 1945-02, 1987-03)
# Petroleum: 5 gaps (1900-01 to 1950-12, ... )
```

### Debugging

**Enable debug logging**:
```bash
# In .env.local
DEBUG_API_ADAPTERS=true
DEBUG_CACHE=true
DEBUG_DATA_SERVICE=true
```

**View logs**:
```bash
# Development
npm run dev
# Logs appear in terminal

# Production (Vercel)
vercel logs --follow
```

**Common Issues**:

| Issue | Solution |
|-------|----------|
| `APIError: Rate limit exceeded` | Wait 60 seconds, FRED has rate limits |
| `AuthenticationError: Invalid API key` | Check FRED_API_KEY in .env.local |
| `FileNotFoundError: Shard not found` | Run `npm run script:migrate-to-shards` |
| `ValidationError: Invalid date format` | Dates must be ISO 8601 (YYYY-MM-DD) |

---

## Operations

### Monitoring Data Freshness

**Admin Dashboard**:

Visit https://greco-coin.vercel.app/admin/staleness

**Dashboard shows**:
- ✅ **Fresh** (green): Data is up-to-date
- ⚠️ **Warning** (yellow): Data approaching staleness threshold
- 🚨 **Critical** (red): Data exceeds staleness threshold

**Example**:
```
Critical (Needs Immediate Update)
  - Petroleum: 15 days stale (last updated: 2024-12-28)
    [Update Now] button

Warning (Update Soon)
  - Corn: 42 days stale (last updated: 2024-11-30)
  - Wheat: 45 days stale (last updated: 2024-11-27)

Fresh (22 commodities)
  - Gold: 1 day stale (last updated: 2025-01-13)
  - Silver: 1 day stale (last updated: 2025-01-13)
  ...
```

### Manual Data Updates

**From Admin Dashboard**:
1. Click "Update Now" button next to commodity
2. Wait for update to complete (usually <10 seconds)
3. Refresh page to verify

**From CLI**:
```bash
npm run fetch-data -- --commodity=petroleum --force
```

**From API** (requires auth token):
```bash
curl -X POST https://greco-coin.vercel.app/api/admin/fetch \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"commodity": "petroleum"}'
```

### Handling Alerts

**Email Alerts** (if configured):

When a commodity reaches **critical** staleness:
1. Email sent to admin (subject: "🚨 Critical: Petroleum data 15 days stale")
2. Includes commodity, staleness duration, and update link
3. Click "Update Now" in email to trigger fetch

**Slack Alerts** (optional, future enhancement):

Configure webhook in environment variables:
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Cache Invalidation

**Automatic invalidation** (after data update):
- Caches are automatically invalidated when data is updated
- No manual action required

**Manual invalidation** (if needed):

```bash
# Invalidate specific commodity
curl -X POST https://greco-coin.vercel.app/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"secret": "$REVALIDATE_SECRET", "tag": "commodity-gold"}'

# Invalidate all commodity prices
curl -X POST https://greco-coin.vercel.app/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"secret": "$REVALIDATE_SECRET", "tag": "commodity-prices"}'

# Invalidate homepage
curl -X POST https://greco-coin.vercel.app/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"secret": "$REVALIDATE_SECRET", "path": "/"}'
```

**Set `REVALIDATE_SECRET` in Vercel**:
```bash
# In Vercel Dashboard → Environment Variables
REVALIDATE_SECRET=your_random_secret_here
```

### Performance Monitoring

**Vercel Analytics**:
1. Enable in Vercel Dashboard → Analytics
2. View metrics:
   - Page load times
   - Cache hit rates
   - API response times

**Expected Metrics**:
- Homepage load: <2s (target achieved ✅)
- Commodity page load: <1s
- API query response: <100ms (cached), <200ms (uncached)
- Cache hit rate: >85%

**Lighthouse Audit**:
```bash
# Run locally
npm run lighthouse

# Expected scores:
# Performance: 95+
# Accessibility: 95+
# Best Practices: 95+
# SEO: 95+
```

---

## Troubleshooting

### Issue: Cron Job Not Running

**Symptoms**: Data not updating automatically

**Solutions**:
1. Check Vercel Dashboard → Cron Jobs → Verify enabled
2. Check logs: `vercel logs --follow`
3. Verify `vercel.json` is committed and deployed
4. Test cron endpoint manually:
   ```bash
   curl https://greco-coin.vercel.app/api/cron/fetch-high-priority
   ```

### Issue: API Rate Limit

**Symptoms**: `RateLimitError: Rate limit exceeded for FRED`

**Solutions**:
1. FRED rate limit: 120 requests/minute
2. Wait 60 seconds before retrying
3. Check if multiple processes are fetching simultaneously
4. Consider implementing exponential backoff

### Issue: Missing Data

**Symptoms**: Commodity shows "Data Unavailable"

**Solutions**:
1. Check if commodity is supported by any adapter:
   ```bash
   npm run script:check-coverage -- --commodity=jute
   ```
2. If not supported, consider manual data entry:
   ```bash
   npm run script:import-manual -- --commodity=jute --file=data/manual/jute.csv
   ```
3. Check staleness dashboard for alerts

### Issue: Slow Page Load

**Symptoms**: Homepage takes >5 seconds to load

**Solutions**:
1. Check if caching is enabled (should be cached after first load)
2. Run performance audit:
   ```bash
   npm run lighthouse
   ```
3. Check Vercel logs for slow API calls
4. Verify sharded data structure is in place:
   ```bash
   ls src/data/prices/gold/
   # Should show: 1900-1949.json, 1950-1999.json, 2000-2019.json, 2020-2025.json
   ```

---

## FAQ

**Q: How often is data updated?**  
A: Depends on commodity priority:
- High priority (gold, silver, platinum, petroleum): Daily
- Medium priority (industrial metals, major grains): Weekly/Bi-weekly
- Low priority (specialty commodities): Quarterly

**Q: Can I force an update for a specific commodity?**  
A: Yes, from Admin Dashboard click "Update Now" or use CLI:
```bash
npm run fetch-data -- --commodity=gold --force
```

**Q: What if a commodity doesn't have an API source?**  
A: 8 commodities (cotton-seed, jute, tallow, cement, sulphur, oats, rye, hides) require manual data entry. Use import script:
```bash
npm run script:import-manual -- --commodity=jute --file=data/manual/jute.csv
```

**Q: How do I add a new commodity?**  
A: 
1. Add to `src/data/commodities.json`
2. Add API mapping in adapter config
3. Run initial fetch:
   ```bash
   npm run fetch-data -- --commodity=new-commodity --start=1900-01-01
   ```
4. Regenerate index:
   ```bash
   npm run script:regenerate-index
   ```

**Q: How do I rollback to previous data?**  
A: Data is versioned in git:
```bash
# View history
git log -- src/data/prices/gold/

# Rollback specific file
git checkout HEAD~1 -- src/data/prices/gold/2020-2025.json

# Commit rollback
git commit -m "data: rollback gold 2020-2025 to previous version"
git push
```

**Q: What's the storage cost?**  
A: Current storage: ~3 MB (all commodities, 125 years). Vercel has no storage limits for git-committed files. Cost: $0.

---

## Additional Resources

- **API Documentation**: `/specs/002-real-data-api/data-model.md`
- **Research Findings**: `/specs/002-real-data-api/research.md`
- **Contract Interfaces**: `/specs/002-real-data-api/contracts/`
- **FRED API Docs**: https://fred.stlouisfed.org/docs/api/fred/
- **World Bank API Docs**: https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation
- **Vercel Cron Jobs**: https://vercel.com/docs/cron-jobs

---

## Support

**For issues or questions**:
1. Check this quickstart guide
2. Review troubleshooting section
3. Check project GitHub issues
4. Create new issue with:
   - Error message
   - Steps to reproduce
   - Environment (local vs production)
   - Relevant logs
