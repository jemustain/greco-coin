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
    const url = `/api/greco-timeseries?startDate=${startDateStr}&endDate=${endDateStr}&currency=USD&interval=monthly`

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
  }, [startDate, endDate])

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
            Visualize how the Greco Coin — backed by a basket of 32 commodities — behaves
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

        {/* Explanation sections */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What is the Greco Unit?
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                The Greco unit represents the purchasing power of a basket of 32 essential
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
            32 Commodities in the Greco Basket
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
