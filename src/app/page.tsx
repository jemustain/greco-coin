/**
 * Homepage - Greco unit time-series visualization
 */

'use client'

import { useState, useEffect } from 'react'
import ChartControls from '@/components/charts/ChartControls'
import TimeSeriesChart from '@/components/charts/TimeSeriesChart'
import Loading from '@/components/ui/Loading'
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

          {!loading && !error && (
            <>
              <TimeSeriesChart
                data={chartData}
                currency={selectedCurrency}
                height={400}
              />
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
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
                    How to Interpret This Chart
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        <strong>Y-Axis (Greco Value):</strong> Shows how much of the selected 
                        currency is required to purchase the entire basket of 32 commodities at 
                        any point in time. Higher values mean you need more currency units to buy 
                        the same basket (lower purchasing power).
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        <strong>Upward Trends:</strong> Indicate decreasing purchasing power 
                        (currency depreciation). The currency buys less of the commodity basket 
                        over time.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        <strong>Downward Trends:</strong> Indicate increasing purchasing power 
                        (currency appreciation). The same amount of currency buys more commodities.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        <strong>Completeness:</strong> Shows the percentage of the 32 commodities 
                        with available price data. Values ≥80% meet our quality threshold. Lower 
                        completeness may indicate data gaps or emerging commodities/currencies.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        <strong>Quality Indicator:</strong> Reflects the reliability of the 
                        underlying price data (High, Medium, Low, Missing). Hover over data points 
                        to see quality ratings and which commodities contributed to each calculation.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">
                    💡 Pro Tip
                  </h3>
                  <p className="text-sm text-blue-800">
                    Compare multiple currencies side-by-side to understand relative purchasing 
                    power shifts. For example, comparing USD vs Gold shows how the dollar&apos;s 
                    purchasing power changed relative to precious metals over the 20th century. 
                    Multi-currency comparison feature coming soon!
                  </p>
                </div>
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
