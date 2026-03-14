/**
 * Homepage - Greco unit time-series visualization with normalized view
 * and commodity price trend overlay
 */

'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
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
} from 'recharts'
import ChartControls from '@/components/charts/ChartControls'
import TimeSeriesChart from '@/components/charts/TimeSeriesChart'
import CommoditySelector from '@/components/charts/CommoditySelector'
import Loading from '@/components/ui/Loading'
import { loadCommodities } from '@/lib/data/loader'
import { convertToTimeSeriesData, sampleDataForPerformance, assignColors } from '@/lib/utils/chart'
import { normalizeToBaseline, normalizePricesToBaseline, getAvailableYears, downsampleTimeSeries } from '@/lib/utils/normalize'
import { Treemap } from 'recharts'
import { presetRanges } from '@/lib/utils/date'
import { formatDate } from '@/lib/utils/date'
import { TimeSeriesDataPoint } from '@/lib/utils/chart'

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
  '#dc2626', // Red
  '#16a34a', // Green
  '#ca8a04', // Yellow
  '#7c3aed', // Purple
  '#0891b2', // Cyan
]

export default function HomePage() {
  const [startDate, setStartDate] = useState(presetRanges.modern.start)
  const [endDate, setEndDate] = useState(presetRanges.modern.end)
  const [chartData, setChartData] = useState<TimeSeriesDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [baselineYear, setBaselineYear] = useState(1990)

  // Commodity state
  const [allCommodities, setAllCommodities] = useState<CommodityInfo[]>([])
  const [selectedCommodities, setSelectedCommodities] = useState<string[]>([])
  const [commodityChartData, setCommodityChartData] = useState<CommodityChartPoint[]>([])
  const [commodityLoading, setCommodityLoading] = useState(false)
  const [commodityMetadata, setCommodityMetadata] = useState<Record<string, { name: string }>>({})

  // Production chart state
  const [selectedProductionCommodities, setSelectedProductionCommodities] = useState<string[]>([])
  const [productionChartData, setProductionChartData] = useState<ProductionChartPoint[]>([])
  const [productionLoading, setProductionLoading] = useState(false)
  const [productionMetadata, setProductionMetadata] = useState<Record<string, { name: string; unit: string }>>({})

  // Market value (price × quantity) state
  const [marketValueData, setMarketValueData] = useState<Array<{ id: string; name: string; value: number }>>([])
  const [marketValueLoading, setMarketValueLoading] = useState(false)
  const [marketValueYear, setMarketValueYear] = useState(2023)
  
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
        setLoading(false)
      })
      .catch((err) => {
        setError('Failed to load data: ' + err.message)
        setLoading(false)
      })
  }, [])

  // Load chart data when dates change
  useEffect(() => {
    setLoading(true)
    setError(null)

    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]
    const url = `/api/greco-timeseries?startDate=${startDateStr}&endDate=${endDateStr}&currency=USD&interval=monthly&baselineYear=${baselineYear}`

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        return res.json()
      })
      .then((data) => {
        const grecoValues = data.values.map((gv: { date: string; [key: string]: unknown }) => ({
          ...gv,
          date: new Date(gv.date),
        }))
        const timeSeriesData = convertToTimeSeriesData(grecoValues)
        const sampledData = sampleDataForPerformance(timeSeriesData, 500)
        setChartData(sampledData)
        setLoading(false)
      })
      .catch((err) => {
        setError('Failed to calculate Greco values: ' + err.message)
        setLoading(false)
      })
  }, [startDate, endDate, baselineYear])

  // Normalize Greco data
  const normalizedChartData = useMemo(
    () => normalizeToBaseline(chartData, baselineYear),
    [chartData, baselineYear]
  )

  // Available years for baseline selector
  const availableYears = useMemo(
    () => getAvailableYears(chartData),
    [chartData]
  )

  // Downsample normalized data based on date range
  const downsampledChartData = useMemo(
    () => downsampleTimeSeries(normalizedChartData, startDate, endDate),
    [normalizedChartData, startDate, endDate]
  )


  // Load commodity data when selection changes
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
        // Build metadata map
        const metaMap: Record<string, { name: string }> = {}
        if (data.metadata) {
          for (const m of data.metadata) {
            metaMap[m.id] = { name: m.name }
          }
        }
        setCommodityMetadata(metaMap)

        // Merge and normalize all commodity price series
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

        // Build merged chart data
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
        // Build metadata map
        const metaMap: Record<string, { name: string; unit: string }> = {}
        if (data.metadata) {
          for (const m of data.metadata) {
            metaMap[m.id] = { name: m.name, unit: m.unit }
          }
        }
        setProductionMetadata(metaMap)

        // Normalize to baseline year
        const allYears = new Set<number>()
        const normalizedSeries: Record<string, Map<number, number>> = {}

        for (const [commodityId, points] of Object.entries(data.commodities)) {
          const prodArray = points as Array<{ year: number; production: number }>
          // Find 1990 value for baseline
          const baseline1990 = prodArray.find(p => p.year === baselineYear)
          let baselineVal = baseline1990?.production
          if (!baselineVal) {
            // Closest year fallback
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

  // Load market value data (price × quantity) for all commodities
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
        // Sort by value descending
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

  // Format normalized Y-axis
  const formatNormalizedYAxis = (value: number) => {
    return value.toFixed(1)
  }

  return (
    <div className="container-page">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Greco Historical Currency Tracker
          </h1>
          <p className="text-lg text-gray-600">
            Visualize how the Greco Coin — backed by a basket of 33 commodities — behaves
            over time against the US dollar.
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

        {/* Normalized Greco Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Greco Value — Normalized to {baselineYear}
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Value relative to baseline year ({baselineYear} = 1.0). Values above 1.0 mean
            the basket costs more in USD; below 1.0 means it costs less.
          </p>

          {loading && (
            <div className="flex items-center justify-center" style={{ height: 400 }}>
              <Loading size="lg" text="Loading chart data..." />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-red-800 font-medium">Error Loading Data</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && downsampledChartData.length > 0 && (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={downsampledChartData}
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
                    formatter={(value: number) => [value.toFixed(3), `Greco ($USD)`]}
                    labelFormatter={(label) => label}
                  />
                  <Legend wrapperStyle={{ fontSize: '0.875rem' }} iconType="line" />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name={`Greco Value ($USD)`}
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                    animationDuration={300}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Commodity Selector */}
        <CommoditySelector
          commodities={allCommodities}
          selectedCommodities={selectedCommodities}
          onSelectionChange={setSelectedCommodities}
          maxSelections={5}
        />

        {/* Commodity Price Trends Chart */}
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

        {/* Explanation sections */}
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

        {/* Market Value Treemap (Price × Quantity) */}
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

            // Custom content renderer for treemap cells
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
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={fill}
                    stroke="#fff"
                    strokeWidth={2}
                    rx={3}
                  />
                  {showLabel && (
                    <text
                      x={x + width / 2}
                      y={y + height / 2 + (showPct ? -6 : 0)}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#fff"
                      fontSize={width < 70 ? 10 : 12}
                      fontWeight="600"
                    >
                      {name}
                    </text>
                  )}
                  {showPct && (
                    <text
                      x={x + width / 2}
                      y={y + height / 2 + 10}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="rgba(255,255,255,0.85)"
                      fontSize={width < 70 ? 9 : 11}
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

                {/* Weight summary */}
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

        {/* Explanation sections */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What is the Greco Unit?
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                The Greco unit represents the purchasing power of a basket of 33 essential
                commodities, as proposed by economist Thomas H. Greco Jr. in &quot;The End
                of Money and the Future of Civilization&quot; (2009). Unlike traditional
                currency indices, the Greco provides a tangible measure of value tied to
                real, physical commodities rather than abstract monetary metrics.
              </p>
              <p className="text-sm text-gray-600">
                By tracking how much currency is needed to purchase this standardized basket
                over time, we can measure the real purchasing power of different currencies
                and assets, independent of monetary policy, inflation targeting, or central
                bank manipulation.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How to Interpret the Normalized Chart
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    <strong>Baseline (1.0):</strong> The dashed line at 1.0 represents the
                    value in your selected baseline year. All other values are ratios
                    relative to that year.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    <strong>Above 1.0:</strong> The basket costs more than it did in the
                    baseline year — your currency has lost purchasing power.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    <strong>Below 1.0:</strong> The basket costs less than it did in the
                    baseline year — your currency has gained purchasing power.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    <strong>Commodity Overlay:</strong> Select individual commodities below
                    to see how their prices moved relative to the same baseline. This helps
                    identify which commodities are driving overall basket changes.
                  </span>
                </li>
              </ul>
            </div>


          </div>
        </div>

        {/* Commodities Info */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            33 Commodities in the Greco Basket
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              'Gold', 'Silver', 'Iron', 'Copper', 'Aluminum', 'Tin',
              'Lead', 'Zinc', 'Nickel', 'Platinum', 'Petroleum', 'Cement',
              'Rubber', 'Sulphur', 'Rice', 'Wheat', 'Corn', 'Barley',
              'Oats', 'Rye', 'Peanuts', 'Soy Beans', 'Coffee', 'Cocoa',
              'Sugar', 'Cotton Seed', 'Cotton', 'Wool', 'Jute', 'Hides',
              'Copra', 'Tallow',
            ].map((commodity) => (
              <div
                key={commodity}
                className="text-sm text-gray-700 px-3 py-2 bg-white rounded border border-gray-200"
              >
                {commodity}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
