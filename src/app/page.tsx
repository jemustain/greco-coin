/**
 * Homepage - Greco unit time-series visualization
 */

'use client'

import { useState, useEffect } from 'react'
import ChartControls from '@/components/charts/ChartControls'
import TimeSeriesChart from '@/components/charts/TimeSeriesChart'
import { loadCurrencies } from '@/lib/data/loader'
import { calculateGrecoTimeSeries } from '@/lib/data/calculator'
import { convertToTimeSeriesData, sampleDataForPerformance } from '@/lib/utils/chart'
import { presetRanges } from '@/lib/utils/date'
import { Currency } from '@/lib/types/currency'
import { TimeSeriesDataPoint } from '@/lib/utils/chart'

export default function HomePage() {
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [selectedCurrency, setSelectedCurrency] = useState('USD')
  const [startDate, setStartDate] = useState(presetRanges.modern.start)
  const [endDate, setEndDate] = useState(presetRanges.modern.end)
  const [chartData, setChartData] = useState<TimeSeriesDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load currencies on mount
  useEffect(() => {
    loadCurrencies()
      .then((data) => {
        setCurrencies(data)
        setLoading(false)
      })
      .catch((err) => {
        setError('Failed to load currencies: ' + err.message)
        setLoading(false)
      })
  }, [])

  // Load chart data when currency or dates change
  useEffect(() => {
    if (!selectedCurrency) return

    setLoading(true)
    setError(null)

    calculateGrecoTimeSeries(startDate, endDate, selectedCurrency, 'monthly')
      .then((grecoValues) => {
        const timeSeriesData = convertToTimeSeriesData(grecoValues)
        const sampledData = sampleDataForPerformance(timeSeriesData, 500)
        setChartData(sampledData)
        setLoading(false)
      })
      .catch((err) => {
        setError('Failed to calculate Greco values: ' + err.message)
        setLoading(false)
      })
  }, [selectedCurrency, startDate, endDate])

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start)
    setEndDate(end)
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
            Visualize purchasing power trends of a standardized basket of 32 commodities
            across 9 currencies from 1900 to present.
          </p>
        </div>

        {/* Controls */}
        <ChartControls
          currencies={currencies}
          selectedCurrency={selectedCurrency}
          onCurrencyChange={setSelectedCurrency}
          startDate={startDate}
          endDate={endDate}
          onDateRangeChange={handleDateRangeChange}
        />

        {/* Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          {loading && (
            <div className="flex items-center justify-center" style={{ height: 400 }}>
              <div className="spinner"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              <TimeSeriesChart
                data={chartData}
                currency={selectedCurrency}
                height={400}
              />
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  What is the Greco Unit?
                </h3>
                <p className="text-sm text-gray-600">
                  The Greco unit represents the purchasing power of a basket of 32 essential
                  commodities, as proposed by Tom Greco in &quot;The End of Money and the
                  Future of Civilization&quot; (2009). By tracking how much currency is
                  needed to purchase this standardized basket over time, we can measure the
                  real purchasing power of different currencies and assets, independent of
                  monetary policy.
                </p>
              </div>
            </>
          )}
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
