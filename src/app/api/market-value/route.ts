/**
 * API route: /api/market-value
 * Returns price × production (market value) per commodity per year.
 * Query params:
 *   startYear (default 1970)
 *   endYear (default current year)
 *   commodities (comma-separated, default all)
 */

import { NextRequest, NextResponse } from 'next/server'
import { loadPrices, loadCommodities } from '@/lib/data/loader'
import { CommodityPricePoint } from '@/lib/types/commodity'
import { computeMarketValue } from '@/lib/utils/unit-conversion'
import fs from 'fs'
import path from 'path'

interface ProductionPoint {
  year: number
  production: number
  unit: string
  source: string
  quality: string
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const startYear = parseInt(searchParams.get('startYear') || '1970')
  const endYear = parseInt(searchParams.get('endYear') || String(new Date().getFullYear()))
  const commodityFilter = searchParams.get('commodities')?.split(',').filter(Boolean)

  try {
    const allCommodities = await loadCommodities()
    const ids = commodityFilter || allCommodities.map((c) => c.id)

    const result: Record<string, Array<{ year: number; marketValueMillionUSD: number }>> = {}

    for (const id of ids) {
      // Load prices
      let prices: CommodityPricePoint[]
      try {
        prices = (await loadPrices(id)) as CommodityPricePoint[]
      } catch {
        continue
      }

      // Load production
      const prodPath = path.join(process.cwd(), 'src', 'data', 'production', `${id}.json`)
      if (!fs.existsSync(prodPath)) continue
      const production: ProductionPoint[] = JSON.parse(fs.readFileSync(prodPath, 'utf-8'))

      // Build year-indexed maps
      const priceByYear = new Map<number, { price: number; unit: string }>()
      for (const p of prices) {
        const year = new Date(p.date).getFullYear()
        // Use last price entry for each year
        priceByYear.set(year, {
          price: 'priceUSD' in p ? (p as { priceUSD: number }).priceUSD : (p as { price: number }).price,
          unit: p.unit,
        })
      }

      const prodByYear = new Map<number, ProductionPoint>()
      for (const p of production) {
        prodByYear.set(p.year, p)
      }

      const series: Array<{ year: number; marketValueMillionUSD: number }> = []
      for (let year = startYear; year <= endYear; year++) {
        const priceEntry = priceByYear.get(year)
        const prodEntry = prodByYear.get(year)
        if (priceEntry && prodEntry) {
          const mv = computeMarketValue(
            priceEntry.price,
            prodEntry.production,
            id,
            priceEntry.unit,
            prodEntry.unit
          )
          series.push({ year, marketValueMillionUSD: Math.round(mv * 100) / 100 })
        }
      }

      if (series.length > 0) {
        result[id] = series
      }
    }

    return NextResponse.json({ commodities: result })
  } catch (error) {
    console.error('Market value API error:', error)
    return NextResponse.json(
      { error: 'Failed to compute market values' },
      { status: 500 }
    )
  }
}
