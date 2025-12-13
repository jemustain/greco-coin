/**
 * Compare Page - Multi-currency comparison interface
 * Allows side-by-side visualization of up to 9 currencies
 */

'use client'

import React, { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import MultiCurrencyChart from '@/components/charts/MultiCurrencyChart'
import ChartControls from '@/components/charts/ChartControls'
import ComparisonInsights from '@/components/insights/ComparisonInsights'
import ErrorBoundary from '@/components/errors/ErrorBoundary'
import Loading from '@/components/ui/Loading'
import { loadCurrencies } from '@/lib/data/loader-optimized'
import { calculateGrecoTimeSeriesOptimized as calculateGrecoTimeSeries } from '@/lib/data/calculator-optimized'
import { mergeTimeSeriesData, assignColors } from '@/lib/utils/chart'
import { GrecoValue } from '@/lib/types/greco'
import { Currency } from '@/lib/types/currency'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

function ComparePageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([])
  const [hiddenCurrencies, setHiddenCurrencies] = useState<Set<string>>(new Set())
  const [startDate, setStartDate] = useState(() => new Date(2000, 0, 1))
  const [endDate, setEndDate] = useState(() => new Date())
  const [currencyDataMap, setCurrencyDataMap] = useState<Map<string, GrecoValue[]>>(new Map())
  const [loading, setLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load currencies on mount
  React.useEffect(() => {
    loadCurrencies().then(setCurrencies)
  }, [])

  // Initialize from URL params
  useEffect(() => {
    if (currencies.length === 0 || isInitialized) return

    const currenciesParam = searchParams.get('currencies')
    const startParam = searchParams.get('start')
    const endParam = searchParams.get('end')

    if (currenciesParam) {
      const currencyIds = currenciesParam.split(',').filter((id) => 
        currencies.some((c) => c.id === id)
      )
      if (currencyIds.length > 0) {
        setSelectedCurrencies(currencyIds)
      }
    }

    if (startParam) {
      const date = new Date(startParam)
      if (!isNaN(date.getTime())) {
        setStartDate(date)
      }
    }

    if (endParam) {
      const date = new Date(endParam)
      if (!isNaN(date.getTime())) {
        setEndDate(date)
      }
    }

    setIsInitialized(true)
  }, [currencies, searchParams, isInitialized])

  // Update URL when state changes
  useEffect(() => {
    if (!isInitialized) return

    const params = new URLSearchParams()
    
    if (selectedCurrencies.length > 0) {
      params.set('currencies', selectedCurrencies.join(','))
    }
    
    params.set('start', startDate.toISOString().split('T')[0])
    params.set('end', endDate.toISOString().split('T')[0])

    const newUrl = params.toString() ? `?${params.toString()}` : '/compare'
    router.replace(newUrl, { scroll: false })
  }, [selectedCurrencies, startDate, endDate, isInitialized, router])

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

  // Export to CSV handler
  const handleExportCSV = () => {
    if (chartData.length === 0) return

    // Create CSV headers
    const headers = ['Date', ...selectedCurrencies.map((id) => {
      const currency = currencies.find((c) => c.id === id)
      return currency?.name || id
    })]

    // Create CSV rows
    const rows = chartData.map((point) => {
      const row = [point.formattedDate]
      selectedCurrencies.forEach((id) => {
        const value = (point as Record<string, unknown>)[id]
        row.push(value !== null && value !== undefined ? value.toString() : '')
      })
      return row
    })

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(','))
    ].join('\n')

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `greco-comparison-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <main className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          Currency Comparison
        </h1>
        <p className="text-base sm:text-lg text-gray-600">
          Compare up to 9 currencies side-by-side to analyze relative purchasing power
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 sm:mb-8">
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
          <ErrorBoundary
            fallback={
              <div className="bg-red-50 rounded-lg p-8 border border-red-200 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-red-600 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Chart Error
                </h3>
                <p className="text-red-800 mb-4">
                  Unable to display the comparison chart. Please try selecting different currencies or adjusting the date range.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reload Page
                </button>
              </div>
            }
          >
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Greco Value Comparison
                </h2>
                {!loading && chartData.length > 0 && (
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-greco-primary text-white rounded-lg hover:bg-greco-primary/90 transition-colors text-sm font-medium w-full sm:w-auto"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Export CSV
                  </button>
                )}
              </div>
              {loading ? (
                <div className="flex items-center justify-center" style={{ height: 400 }}>
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
                  height={400}
                />
              )}
            </div>
          </ErrorBoundary>

          {/* Insights Panel */}
          {!loading && (
            <ErrorBoundary
              fallback={
                <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                  <p className="text-yellow-800 text-sm">
                    Unable to calculate comparison insights. The chart is still available above.
                  </p>
                </div>
              }
            >
              <div className="mt-8">
                <ComparisonInsights
                  currencyDataMap={currencyDataMap}
                  currencies={currencies}
                  selectedCurrencyIds={selectedCurrencies}
                />
              </div>
            </ErrorBoundary>
          )}
        </>
      ) : (
        <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 sm:p-12 text-center">
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

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
        <div className="flex items-center justify-center min-h-screen">
          <Loading size="lg" text="Loading comparison page..." />
        </div>
      </div>
    }>
      <ComparePageContent />
    </Suspense>
  )
}
