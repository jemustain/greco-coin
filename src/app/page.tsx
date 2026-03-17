/**
 * Homepage - Greco unit time-series visualization with normalized view
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
} from 'recharts'
import ChartControls from '@/components/charts/ChartControls'
import Loading from '@/components/ui/Loading'
import { convertToTimeSeriesData, sampleDataForPerformance } from '@/lib/utils/chart'
import { normalizeToBaseline, getAvailableYears, downsampleTimeSeries } from '@/lib/utils/normalize'
import { presetRanges } from '@/lib/utils/date'
import { TimeSeriesDataPoint } from '@/lib/utils/chart'

export default function HomePage() {
  const [startDate, setStartDate] = useState(presetRanges.modern.start)
  const [endDate, setEndDate] = useState(presetRanges.modern.end)
  const [chartData, setChartData] = useState<TimeSeriesDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [baselineYear, setBaselineYear] = useState(1990)

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
      </div>
    </div>
  )
}
