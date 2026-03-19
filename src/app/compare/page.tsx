/**
 * Commodities Page - Commodity price trends, production volumes, and market value treemap
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  Treemap,
} from 'recharts'
import ChartControls from '@/components/charts/ChartControls'
import CommoditySelector from '@/components/charts/CommoditySelector'
import Loading from '@/components/ui/Loading'
import { loadCommodities } from '@/lib/data/loader'
import { normalizePricesToBaseline, getAvailableYears, downsampleTimeSeries } from '@/lib/utils/normalize'
import { presetRanges, formatDate } from '@/lib/utils/date'

interface CommodityInfo {
  id: string
  name: string
  category: string
  unit: string
}

interface CommodityChartPoint {
  date: string
  formattedDate: string
  [key: string]: string | number | undefined
}

interface ProductionChartPoint {
  year: number
  [key: string]: string | number | undefined
}

const COMMODITY_COLORS = [
  '#dc2626', '#16a34a', '#ca8a04', '#7c3aed', '#0891b2',
]

export default function CommoditiesPage() {
  const [startDate, setStartDate] = useState(presetRanges.modern.start)
  const [endDate, setEndDate] = useState(presetRanges.modern.end)
  const [baselineYear, setBaselineYear] = useState(1990)

  // All commodities
  const [allCommodities, setAllCommodities] = useState<CommodityInfo[]>([])
  const [loadingCommodities, setLoadingCommodities] = useState(true)

  // Commodity price state
  const [selectedCommodities, setSelectedCommodities] = useState<string[]>(['gold', 'silver', 'petroleum', 'wheat', 'copper'])
  const [commodityChartData, setCommodityChartData] = useState<CommodityChartPoint[]>([])
  const [commodityLoading, setCommodityLoading] = useState(false)
  const [commodityMetadata, setCommodityMetadata] = useState<Record<string, { name: string }>>({})

  // Production chart state
  const [selectedProductionCommodities, setSelectedProductionCommodities] = useState<string[]>([])
  const [productionChartData, setProductionChartData] = useState<ProductionChartPoint[]>([])
  const [productionLoading, setProductionLoading] = useState(false)
  const [productionMetadata, setProductionMetadata] = useState<Record<string, { name: string; unit: string }>>({})

  // Market value state
  const [marketValueData, setMarketValueData] = useState<Array<{ id: string; name: string; value: number }>>([])
  const [marketValueLoading, setMarketValueLoading] = useState(false)
  const [marketValueYear, setMarketValueYear] = useState(2023)

  // Available years (derive from a simple range since we don't have the greco chart data here)
  const availableYears = useMemo(() => {
    const years: number[] = []
    const startY = startDate.getFullYear()
    const endY = endDate.getFullYear()
    for (let y = startY; y <= endY; y++) years.push(y)
    return years
  }, [startDate, endDate])

  // Load commodities on mount
  useEffect(() => {
    loadCommodities()
      .then((commodityData) => {
        setAllCommodities(
          commodityData.map((c) => ({
            id: c.id,
            name: c.name,
            category: c.category,
            unit: c.unit,
          }))
        )
        setLoadingCommodities(false)
      })
      .catch(() => setLoadingCommodities(false))
  }, [])

  // Load commodity price data when selection changes
  useEffect(() => {
    if (selectedCommodities.length === 0) {
      setCommodityChartData([])
      return
    }

    setCommodityLoading(true)
    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]
    const url = `/api/commodity-timeseries?commodities=${selectedCommodities.join(',')}&startDate=${startDateStr}&endDate=${endDateStr}&interval=monthly`

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => {
        const metaMap: Record<string, { name: string }> = {}
        if (data.metadata) {
          for (const m of data.metadata) {
            metaMap[m.id] = { name: m.name }
          }
        }
        setCommodityMetadata(metaMap)

        const allDates = new Set<string>()
        const normalizedSeries: Record<string, Map<string, number>> = {}

        for (const [commodityId, prices] of Object.entries(data.commodities)) {
          const priceArray = prices as Array<{ date: string; price: number }>
          const normalized = normalizePricesToBaseline(priceArray, baselineYear)
          normalizedSeries[commodityId] = new Map()
          for (const p of normalized) {
            allDates.add(p.date)
            normalizedSeries[commodityId].set(p.date, p.normalizedPrice)
          }
        }

        const sortedDates = Array.from(allDates).sort()
        const merged: CommodityChartPoint[] = sortedDates.map((date) => {
          const point: CommodityChartPoint = {
            date,
            formattedDate: formatDate(new Date(date), 'MMM yyyy'),
          }
          for (const commodityId of selectedCommodities) {
            point[commodityId] = normalizedSeries[commodityId]?.get(date) ?? undefined
          }
          return point
        })

        setCommodityChartData(merged)
        setCommodityLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load commodity data:', err)
        setCommodityLoading(false)
      })
  }, [selectedCommodities, startDate, endDate, baselineYear])

  // Downsample commodity chart data
  const downsampledCommodityData = useMemo(
    () => downsampleTimeSeries(commodityChartData, startDate, endDate),
    [commodityChartData, startDate, endDate]
  )

  // Load production data when selection changes
  useEffect(() => {
    if (selectedProductionCommodities.length === 0) {
      setProductionChartData([])
      return
    }

    setProductionLoading(true)
    const url = `/api/production-timeseries?commodities=${selectedProductionCommodities.join(',')}&startYear=1970&endYear=2023`

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => {
        const metaMap: Record<string, { name: string; unit: string }> = {}
        if (data.metadata) {
          for (const m of data.metadata) {
            metaMap[m.id] = { name: m.name, unit: m.unit }
          }
        }
        setProductionMetadata(metaMap)

        const allYears = new Set<number>()
        const normalizedSeries: Record<string, Map<number, number>> = {}

        for (const [commodityId, points] of Object.entries(data.commodities)) {
          const prodArray = points as Array<{ year: number; production: number }>
          const baseline1990 = prodArray.find(p => p.year === baselineYear)
          let baselineVal = baseline1990?.production
          if (!baselineVal) {
            const sorted = [...prodArray].sort((a, b) => Math.abs(a.year - baselineYear) - Math.abs(b.year - baselineYear))
            baselineVal = sorted[0]?.production || 1
          }

          normalizedSeries[commodityId] = new Map()
          for (const p of prodArray) {
            allYears.add(p.year)
            normalizedSeries[commodityId].set(p.year, p.production / baselineVal)
          }
        }

        const sortedYears = Array.from(allYears).sort((a, b) => a - b)
        const merged: ProductionChartPoint[] = sortedYears.map((year) => {
          const point: ProductionChartPoint = { year }
          for (const commodityId of selectedProductionCommodities) {
            point[commodityId] = normalizedSeries[commodityId]?.get(year) ?? undefined
          }
          return point
        })

        setProductionChartData(merged)
        setProductionLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load production data:', err)
        setProductionLoading(false)
      })
  }, [selectedProductionCommodities, baselineYear])

  // Load market value data
  useEffect(() => {
    setMarketValueLoading(true)
    fetch(`/api/market-value?startYear=${marketValueYear}&endYear=${marketValueYear}`)
      .then(res => res.json())
      .then(data => {
        const entries: Array<{ id: string; name: string; value: number }> = []
        for (const [id, series] of Object.entries(data.commodities || {})) {
          const points = series as Array<{ year: number; marketValueMillionUSD: number }>
          const point = points.find(p => p.year === marketValueYear)
          if (point) {
            const commodity = allCommodities.find(c => c.id === id)
            entries.push({
              id,
              name: commodity?.name || id,
              value: point.marketValueMillionUSD,
            })
          }
        }
        entries.sort((a, b) => b.value - a.value)
        setMarketValueData(entries)
        setMarketValueLoading(false)
      })
      .catch(err => {
        console.error('Failed to load market value data:', err)
        setMarketValueLoading(false)
      })
  }, [marketValueYear, allCommodities])

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start)
    setEndDate(end)
  }

  const formatNormalizedYAxis = (value: number) => value.toFixed(1)

  if (loadingCommodities) {
    return (
      <div className="container-page">
        <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[50vh]">
          <Loading size="lg" text="Loading commodities..." />
        </div>
      </div>
    )
  }

  return (
    <div className="container-page">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Commodity Explorer
          </h1>
          <p className="text-lg text-gray-600">
            Explore individual commodity price trends, production volumes, and market value
            weights within the Greco basket.
          </p>
        </div>

        {/* Controls */}
        <ChartControls
          startDate={startDate}
          endDate={endDate}
          onDateRangeChange={handleDateRangeChange}
        />

        {/* Baseline Year Selector */}
        {availableYears.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center gap-3">
            <label htmlFor="baseline-year" className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Baseline Year (= 1.0)
            </label>
            <select
              id="baseline-year"
              value={baselineYear}
              onChange={(e) => setBaselineYear(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-greco-primary focus:border-transparent text-sm"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        )}

        {/* Commodity Price Trends */}
        <CommoditySelector
          commodities={allCommodities}
          selectedCommodities={selectedCommodities}
          onSelectionChange={setSelectedCommodities}
          maxSelections={5}
        />

        {selectedCommodities.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Commodity Price Trends — Normalized to {baselineYear}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Individual commodity prices normalized so {baselineYear} = 1.0. Compare how
              different commodities have moved relative to the baseline.
            </p>

            {commodityLoading && (
              <div className="flex items-center justify-center" style={{ height: 350 }}>
                <Loading size="lg" text="Loading commodity data..." />
              </div>
            )}

            {!commodityLoading && downsampledCommodityData.length > 0 && (
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart
                    data={downsampledCommodityData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="formattedDate"
                      stroke="#6b7280"
                      style={{ fontSize: '0.75rem' }}
                    />
                    <YAxis
                      stroke="#6b7280"
                      style={{ fontSize: '0.75rem' }}
                      tickFormatter={formatNormalizedYAxis}
                      label={{
                        value: 'Value relative to baseline (1.0)',
                        angle: -90,
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fontSize: '0.75rem', fill: '#6b7280' },
                      }}
                    />
                    <ReferenceLine
                      y={1.0}
                      stroke="#9ca3af"
                      strokeDasharray="6 4"
                      strokeWidth={1.5}
                      label={{
                        value: `${baselineYear} baseline`,
                        position: 'right',
                        fontSize: 11,
                        fill: '#6b7280',
                      }}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        value?.toFixed(3) ?? '—',
                        commodityMetadata[name]?.name || name,
                      ]}
                      labelFormatter={(label) => label}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '0.875rem' }}
                      iconType="line"
                      formatter={(value: string) =>
                        commodityMetadata[value]?.name || value
                      }
                    />
                    {selectedCommodities.map((id, i) => (
                      <Line
                        key={id}
                        type="monotone"
                        dataKey={id}
                        name={id}
                        stroke={COMMODITY_COLORS[i % COMMODITY_COLORS.length]}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 5 }}
                        animationDuration={300}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {!commodityLoading && downsampledCommodityData.length === 0 && (
              <div className="flex items-center justify-center h-40 text-gray-500">
                No price data available for selected commodities in this date range.
              </div>
            )}
          </div>
        )}

        {/* World Production Volume */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            World Production Volume
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Annual production volumes for selected commodities. All values normalized to {baselineYear} = 1.0 for comparison across different units.
          </p>

          <CommoditySelector
            commodities={allCommodities}
            selectedCommodities={selectedProductionCommodities}
            onSelectionChange={setSelectedProductionCommodities}
            maxSelections={5}
          />

          {selectedProductionCommodities.length > 0 && (
            <>
              {productionLoading && (
                <div className="flex items-center justify-center mt-4" style={{ height: 350 }}>
                  <Loading size="lg" text="Loading production data..." />
                </div>
              )}

              {!productionLoading && productionChartData.length > 0 && (
                <div className="chart-container mt-4">
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart
                      data={productionChartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="year"
                        stroke="#6b7280"
                        style={{ fontSize: '0.75rem' }}
                      />
                      <YAxis
                        stroke="#6b7280"
                        style={{ fontSize: '0.75rem' }}
                        tickFormatter={formatNormalizedYAxis}
                        label={{
                          value: `Production relative to ${baselineYear} (1.0)`,
                          angle: -90,
                          position: 'insideLeft',
                          style: { textAnchor: 'middle', fontSize: '0.75rem', fill: '#6b7280' },
                        }}
                      />
                      <ReferenceLine
                        y={1.0}
                        stroke="#9ca3af"
                        strokeDasharray="6 4"
                        strokeWidth={1.5}
                        label={{
                          value: `${baselineYear} baseline`,
                          position: 'right',
                          fontSize: 11,
                          fill: '#6b7280',
                        }}
                      />
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          value?.toFixed(3) ?? '—',
                          productionMetadata[name]?.name || name,
                        ]}
                        labelFormatter={(label) => `${label}`}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: '0.875rem' }}
                        iconType="line"
                        formatter={(value: string) =>
                          productionMetadata[value]?.name || value
                        }
                      />
                      {selectedProductionCommodities.map((id, i) => (
                        <Line
                          key={id}
                          type="monotone"
                          dataKey={id}
                          name={id}
                          stroke={COMMODITY_COLORS[i % COMMODITY_COLORS.length]}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 5 }}
                          animationDuration={300}
                          connectNulls
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {!productionLoading && productionChartData.length === 0 && (
                <div className="flex items-center justify-center h-40 text-gray-500">
                  No production data available for selected commodities.
                </div>
              )}
            </>
          )}
        </div>

        {/* Market Value Treemap */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Commodity Market Values (Price × Production)
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Share of total basket value — area represents each commodity&apos;s production-based weight.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="mv-year" className="text-sm font-medium text-gray-700">Year:</label>
              <select
                id="mv-year"
                value={marketValueYear}
                onChange={(e) => setMarketValueYear(Number(e.target.value))}
                className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-greco-primary focus:border-transparent text-sm"
              >
                {Array.from({ length: 54 }, (_, i) => 2023 - i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {marketValueLoading && (
            <div className="flex items-center justify-center h-40">
              <Loading />
            </div>
          )}

          {!marketValueLoading && marketValueData.length > 0 && (() => {
            const total = marketValueData.reduce((sum, d) => sum + d.value, 0)

            const TREEMAP_COLORS = [
              '#dc2626', '#16a34a', '#2563eb', '#ca8a04', '#7c3aed',
              '#0891b2', '#db2777', '#ea580c', '#4f46e5', '#059669',
              '#d97706', '#7c2d12', '#4338ca', '#0d9488', '#be123c',
              '#65a30d', '#0284c7', '#a21caf', '#c2410c', '#1d4ed8',
              '#15803d', '#b91c1c', '#6d28d9', '#0e7490', '#9f1239',
              '#4d7c0f', '#0369a1', '#86198f', '#9a3412', '#1e40af',
              '#166534', '#991b1b', '#7e22ce',
            ]

            const treemapData = marketValueData.map((d, i) => ({
              name: d.name,
              size: d.value,
              pct: ((d.value / total) * 100),
              fill: TREEMAP_COLORS[i % TREEMAP_COLORS.length],
            }))

            const CustomTreemapContent = (props: {
              x: number; y: number; width: number; height: number;
              name: string; pct: number; fill: string;
            }) => {
              const { x, y, width, height, name, pct, fill } = props
              if (width < 2 || height < 2) return null

              const showLabel = width > 40 && height > 24
              const showPct = width > 50 && height > 38

              return (
                <g>
                  <rect
                    x={x} y={y} width={width} height={height}
                    fill={fill} stroke="#fff" strokeWidth={2} rx={3}
                  />
                  {showLabel && (
                    <text
                      x={x + width / 2} y={y + height / 2 + (showPct ? -6 : 0)}
                      textAnchor="middle" dominantBaseline="central"
                      fill="#fff" fontSize={width < 70 ? 10 : 12} fontWeight="600"
                    >
                      {name}
                    </text>
                  )}
                  {showPct && (
                    <text
                      x={x + width / 2} y={y + height / 2 + 10}
                      textAnchor="middle" dominantBaseline="central"
                      fill="rgba(255,255,255,0.85)" fontSize={width < 70 ? 9 : 11}
                    >
                      {pct.toFixed(1)}%
                    </text>
                  )}
                </g>
              )
            }

            return (
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={500}>
                  <Treemap
                    data={treemapData}
                    dataKey="size"
                    aspectRatio={4 / 3}
                    stroke="#fff"
                    content={<CustomTreemapContent x={0} y={0} width={0} height={0} name="" pct={0} fill="" />}
                  >
                    <Tooltip
                      formatter={(value: number) => {
                        const pct = ((value / total) * 100).toFixed(2)
                        const formatted = value >= 1_000_000 ? `$${(value / 1_000_000).toFixed(2)}T` : value >= 1_000 ? `$${(value / 1_000).toFixed(1)}B` : `$${value.toFixed(0)}M`
                        return [`${formatted} (${pct}%)`, 'Market Value']
                      }}
                    />
                  </Treemap>
                </ResponsiveContainer>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-700">
                  <p className="font-medium mb-2">Production-based weight insights ({marketValueYear}):</p>
                  <ul className="space-y-1">
                    <li>• Top 5: {marketValueData.slice(0, 5).map(d => `${d.name} (${((d.value / total) * 100).toFixed(1)}%)`).join(', ')}</li>
                    <li>• Total basket market value: <strong>${total >= 1_000_000 ? `${(total / 1_000_000).toFixed(1)} trillion` : `${(total / 1_000).toFixed(1)} billion`}</strong></li>
                    <li>• Current basket uses equal weighting (1/33 = 3.0% each). Area shows what production-based weights would be.</li>
                  </ul>
                </div>
              </div>
            )
          })()}

          {!marketValueLoading && marketValueData.length === 0 && (
            <div className="flex items-center justify-center h-40 text-gray-500">
              No market value data available for {marketValueYear}.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
