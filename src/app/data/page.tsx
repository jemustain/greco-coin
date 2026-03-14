/**
 * Data Page - Access raw Greco historical currency data
 * Features: date range selection, interval control, sorting, pagination, pivot views, CSV export
 */

'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import DataTable from '@/components/data/DataTable'
import PivotControls, { PivotMode, ViewMode } from '@/components/data/PivotControls'
import ExportButton from '@/components/data/ExportButton'
import Loading from '@/components/ui/Loading'
import { loadCurrencies } from '@/lib/data/loader'
import { GrecoValue } from '@/lib/types/greco'
import { Currency } from '@/lib/types/currency'
import { formatCurrency } from '@/lib/utils/format'

type Interval = 'monthly' | 'quarterly' | 'annual'

export default function DataPage() {
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [grecoData, setGrecoData] = useState<GrecoValue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [pivotMode, setPivotMode] = useState<PivotMode>('by-year')

  // User-controllable date range and interval
  const [startYear, setStartYear] = useState(1960)
  const [endYear, setEndYear] = useState(new Date().getFullYear())
  const [interval, setInterval] = useState<Interval>('annual')

  // Load currencies once
  useEffect(() => {
    loadCurrencies().then(all => {
      setCurrencies(all.filter(c => c.id === 'USD'))
    })
  }, [])

  // Fetch data when range/interval changes
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(
        `/api/greco-timeseries?startDate=${startYear}-01-01&endDate=${endYear}-12-31&currency=USD&interval=${interval}`
      )
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const data = await res.json()

      const grecoValues: GrecoValue[] = (data.values || []).map(
        (point: { date: string; value: number; completeness?: number }) => ({
          date: new Date(point.date),
          currencyId: 'USD',
          value: point.value,
          completeness: point.completeness ?? 1,
        })
      )

      setGrecoData(grecoValues)
    } catch (err) {
      console.error('Failed to load data:', err)
      setError('Failed to load data. Please try again later.')
    } finally {
      setLoading(false)
    }
  }, [startYear, endYear, interval])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Get unique years for pivot
  const years = useMemo(() => {
    const yearSet = new Set<number>()
    grecoData.forEach((gv) => {
      yearSet.add(gv.date.getFullYear())
    })
    return Array.from(yearSet).sort((a, b) => a - b)
  }, [grecoData])

  // Prepare pivot data
  const pivotData = useMemo(() => {
    if (viewMode !== 'pivot') return null

    if (pivotMode === 'by-year') {
      const byYear = new Map<number, Record<string, unknown>>()
      grecoData.forEach((gv) => {
        const year = gv.date.getFullYear()
        if (!byYear.has(year)) {
          byYear.set(year, { year })
        }
        byYear.get(year)![gv.currencyId] = gv.value
      })
      return Array.from(byYear.values()).sort(
        (a, b) => (a.year as number) - (b.year as number)
      )
    } else {
      const byCurrency = new Map<string, Record<string, unknown>>()
      grecoData.forEach((gv) => {
        if (!byCurrency.has(gv.currencyId)) {
          byCurrency.set(gv.currencyId, { currency: gv.currencyId })
        }
        byCurrency.get(gv.currencyId)![gv.date.getFullYear().toString()] = gv.value
      })
      return Array.from(byCurrency.values())
    }
  }, [viewMode, pivotMode, grecoData])

  // Get currency name by ID
  const getCurrencyName = (currencyId: string) => {
    const currency = currencies.find((c) => c.id === currencyId)
    return currency ? currency.name : currencyId
  }

  // Available years for dropdowns
  const yearOptions = useMemo(() => {
    const opts = []
    for (let y = 1960; y <= new Date().getFullYear(); y++) {
      opts.push(y)
    }
    return opts
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Historical Data Access</h1>
          <p className="mt-2 text-lg text-gray-600">
            View, filter, pivot, and export Greco historical data (USD)
          </p>
        </div>

        {/* Data Range Controls */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Range</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="start-year" className="block text-sm font-medium text-gray-700 mb-1">
                Start Year
              </label>
              <select
                id="start-year"
                value={startYear}
                onChange={(e) => setStartYear(Number(e.target.value))}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y} disabled={y > endYear}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="end-year" className="block text-sm font-medium text-gray-700 mb-1">
                End Year
              </label>
              <select
                id="end-year"
                value={endYear}
                onChange={(e) => setEndYear(Number(e.target.value))}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y} disabled={y < startYear}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="interval" className="block text-sm font-medium text-gray-700 mb-1">
                Interval
              </label>
              <select
                id="interval"
                value={interval}
                onChange={(e) => setInterval(e.target.value as Interval)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="annual">Annual</option>
                <option value="quarterly">Quarterly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Records</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">
              {loading ? '...' : grecoData.length.toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Currency</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">
              USD
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Date Range</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">
              {years.length > 0 ? `${years[0]} - ${years[years.length - 1]}` : 'N/A'}
            </div>
          </div>
        </div>

        {loading ? (
          <Loading />
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-700">{error}</p>
          </div>
        ) : (
          <>
            {/* Controls Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PivotControls
                  viewMode={viewMode}
                  pivotMode={pivotMode}
                  onViewModeChange={setViewMode}
                  onPivotModeChange={setPivotMode}
                />
              </div>
              <div className="flex items-end">
                <div className="w-full bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Data</h3>
                  <ExportButton data={grecoData} filename="greco-historical-data" />
                </div>
              </div>
            </div>

            {/* Data Display */}
            {viewMode === 'table' ? (
              <DataTable data={grecoData} currencies={currencies} />
            ) : (
              <PivotTable
                data={pivotData || []}
                mode={pivotMode}
                currencies={currencies}
                years={years}
                getCurrencyName={getCurrencyName}
              />
            )}
          </>
        )}

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Using This Page</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
            <div>
              <h4 className="font-semibold mb-2">Data Controls</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Select start/end year to define the range</li>
                <li>Choose interval: annual, quarterly, or monthly</li>
                <li>Export downloads all data in the selected range</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Views</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Table view with sorting and pagination</li>
                <li>Pivot by year for annual summaries</li>
                <li>Export in either view format</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Pivot Table Component
 */
interface PivotTableProps {
  data: Record<string, unknown>[]
  mode: PivotMode
  currencies: Currency[]
  years: number[]
  getCurrencyName: (id: string) => string
}

function PivotTable({ data, mode, currencies, years, getCurrencyName }: PivotTableProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-500">No data available for pivot view</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="sticky left-0 z-10 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                {mode === 'by-year' ? 'Year' : 'Currency'}
              </th>
              {mode === 'by-year'
                ? currencies.map((currency) => (
                    <th
                      key={currency.id}
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {currency.symbol}
                    </th>
                  ))
                : years.map((year) => (
                    <th
                      key={year}
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {year}
                    </th>
                  ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="sticky left-0 z-10 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                  {mode === 'by-year'
                    ? String(row.year)
                    : getCurrencyName(row.currency as string)}
                </td>
                {mode === 'by-year'
                  ? currencies.map((currency) => (
                      <td
                        key={currency.id}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono"
                      >
                        {row[currency.id] !== null && row[currency.id] !== undefined
                          ? formatCurrency(row[currency.id] as number)
                          : '—'}
                      </td>
                    ))
                  : years.map((year) => (
                      <td
                        key={year}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono"
                      >
                        {row[year.toString()] !== null && row[year.toString()] !== undefined
                          ? formatCurrency(row[year.toString()] as number)
                          : '—'}
                      </td>
                    ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 text-xs text-gray-500 text-center">
        ← Scroll horizontally to view all columns →
      </div>
    </div>
  )
}
