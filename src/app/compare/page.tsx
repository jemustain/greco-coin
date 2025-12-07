/**
 * Compare Page - Multi-currency comparison interface
 * Allows side-by-side visualization of up to 9 currencies
 */

'use client'

import React, { useState, useMemo } from 'react'
import MultiCurrencyChart from '@/components/charts/MultiCurrencyChart'
import ChartControls from '@/components/charts/ChartControls'
import ComparisonInsights from '@/components/insights/ComparisonInsights'
import Loading from '@/components/ui/Loading'
import { loadCurrencies, loadCommodities } from '@/lib/data/loader'
import { calculateGrecoTimeSeries } from '@/lib/data/calculator'
import { mergeTimeSeriesData, assignColors } from '@/lib/utils/chart'
import { GrecoValue } from '@/lib/types/greco'
import { Currency } from '@/lib/types/currency'
import { Commodity } from '@/lib/types/commodity'

export default function ComparePage() {
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([])
  const [hiddenCurrencies, setHiddenCurrencies] = useState<Set<string>>(new Set())
  const [startDate, setStartDate] = useState(() => new Date(2000, 0, 1))
  const [endDate, setEndDate] = useState(() => new Date())
  const [currencyDataMap, setCurrencyDataMap] = useState<Map<string, GrecoValue[]>>(new Map())
  const [loading, setLoading] = useState(false)

  // Load currencies on mount
  React.useEffect(() => {
    loadCurrencies().then(setCurrencies)
  }, [])

  // Calculate Greco values when selections change
  React.useEffect(() => {
    if (selectedCurrencies.length === 0) {
      setCurrencyDataMap(new Map())
      return
    }

    setLoading(true)

    Promise.all(
      selectedCurrencies.map(async (currencyId) => {
        const grecoValues = await calculateGrecoTimeSeries(
          startDate,
          endDate,
          currencyId,
          'monthly'
        )
        return [currencyId, grecoValues] as [string, GrecoValue[]]
      })
    ).then((results) => {
      const dataMap = new Map(results)
      setCurrencyDataMap(dataMap)
      setLoading(false)
    })
  }, [selectedCurrencies, startDate, endDate])

  // Merge all currency data into unified timeline
  const chartData = useMemo(() => {
    return mergeTimeSeriesData(currencyDataMap)
  }, [currencyDataMap])

  // Assign colors to each currency
  const colorMap = useMemo(() => {
    return assignColors(selectedCurrencies)
  }, [selectedCurrencies])

  // Toggle currency visibility in legend
  const handleToggleCurrency = (currencyId: string) => {
    setHiddenCurrencies((prev) => {
      const next = new Set(prev)
      if (next.has(currencyId)) {
        next.delete(currencyId)
      } else {
        next.add(currencyId)
      }
      return next
    })
  }

  // Date range change handler
  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start)
    setEndDate(end)
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Currency Comparison
        </h1>
        <p className="text-lg text-gray-600">
          Compare up to 9 currencies side-by-side to analyze relative purchasing power
        </p>
      </div>

      {/* Controls */}
      <div className="mb-8">
        <ChartControls
          currencies={currencies}
          selectedCurrencies={selectedCurrencies}
          onCurrenciesChange={setSelectedCurrencies}
          maxSelections={9}
          startDate={startDate}
          endDate={endDate}
          onDateRangeChange={handleDateRangeChange}
        />
      </div>

      {/* Chart */}
      {selectedCurrencies.length > 0 ? (
        <>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Greco Value Comparison
            </h2>
            {loading ? (
              <div className="flex items-center justify-center" style={{ height: 500 }}>
                <Loading size="lg" text={`Loading data for ${selectedCurrencies.length} ${selectedCurrencies.length === 1 ? 'currency' : 'currencies'}...`} />
              </div>
            ) : (
              <MultiCurrencyChart
                data={chartData}
                currencies={currencies}
                selectedCurrencyIds={selectedCurrencies}
                colorMap={colorMap}
                hiddenCurrencies={hiddenCurrencies}
                onToggleCurrency={handleToggleCurrency}
                showGrid={true}
                height={500}
              />
            )}
          </div>

          {/* Insights Panel */}
          {!loading && (
            <div className="mt-8">
              <ComparisonInsights
                currencyDataMap={currencyDataMap}
                currencies={currencies}
                selectedCurrencyIds={selectedCurrencies}
              />
            </div>
          )}
        </>
      ) : (
        <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Currencies Selected
          </h3>
          <p className="text-gray-600">
            Select one or more currencies above to start comparing their Greco values
          </p>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          About Multi-Currency Comparison
        </h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li className="flex items-start">
            <svg
              className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              <strong>Select up to 9 currencies</strong> from the checkboxes above to compare their
              purchasing power over time
            </span>
          </li>
          <li className="flex items-start">
            <svg
              className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              <strong>Click legend items</strong> to show/hide individual currencies without
              removing them from your selection
            </span>
          </li>
          <li className="flex items-start">
            <svg
              className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              <strong>Hover over the chart</strong> to see synchronized values for all currencies at
              any point in time
            </span>
          </li>
          <li className="flex items-start">
            <svg
              className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              <strong>Adjust date ranges</strong> to focus on specific historical periods or compare
              long-term trends
            </span>
          </li>
        </ul>
      </div>
    </main>
  )
}
