/**
 * Data Page - Access raw Greco historical currency data
 * Features: filtering, sorting, pagination, pivot views, CSV export
 */

'use client'

import React, { useState, useEffect, useMemo } from 'react'
import DataTable from '@/components/data/DataTable'
import PivotControls, { PivotMode, ViewMode } from '@/components/data/PivotControls'
import ExportButton from '@/components/data/ExportButton'
import Loading from '@/components/ui/Loading'
import { loadCurrencies } from '@/lib/data/loader'
import { calculateGrecoTimeSeries } from '@/lib/data/calculator'
import { pivotByYear, pivotByCurrency } from '@/lib/utils/chart'
import { GrecoValue } from '@/lib/types/greco'
import { Currency } from '@/lib/types/currency'
import { formatCurrency } from '@/lib/utils/format'

export default function DataPage() {
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [grecoData, setGrecoData] = useState<GrecoValue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [pivotMode, setPivotMode] = useState<PivotMode>('by-year')

  // Load data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        const currenciesData = await loadCurrencies()
        setCurrencies(currenciesData)

        // Calculate Greco values for all currencies
        const allGrecoData: GrecoValue[] = []
        
        // Define date range for data loading
        const startDate = new Date('1900-01-01')
        const endDate = new Date()
        
        for (const currency of currenciesData) {
          try {
            const currencyGrecoData = await calculateGrecoTimeSeries(
              startDate,
              endDate,
              currency.id,
              'annual' // Use annual data for better performance
            )
            allGrecoData.push(...currencyGrecoData)
          } catch (err) {
            console.warn(`Failed to load data for ${currency.id}:`, err)
          }
        }

        setGrecoData(allGrecoData)
      } catch (err) {
        console.error('Failed to load data:', err)
        setError('Failed to load currency data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Get unique years for pivot
  const years = useMemo(() => {
    const yearSet = new Set<number>()
    grecoData.forEach((gv) => {
      yearSet.add(gv.date.getFullYear())
    })
    return Array.from(yearSet).sort((a, b) => a - b)
  }, [grecoData])

  // Get currency IDs
  const currencyIds = useMemo(() => {
    return currencies.map((c) => c.id)
  }, [currencies])

  // Prepare pivot data
  const pivotData = useMemo(() => {
    if (viewMode !== 'pivot') return null

    if (pivotMode === 'by-year') {
      return pivotByYear(grecoData, currencyIds)
    } else {
      return pivotByCurrency(grecoData, years)
    }
  }, [viewMode, pivotMode, grecoData, currencyIds, years])

  // Get currency name by ID
  const getCurrencyName = (currencyId: string) => {
    const currency = currencies.find((c) => c.id === currencyId)
    return currency ? currency.name : currencyId
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Loading />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Data</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Historical Data Access</h1>
          <p className="mt-2 text-lg text-gray-600">
            View, filter, pivot, and export Greco historical currency data
          </p>
        </div>

        {/* Data Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Records</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">
              {grecoData.length.toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Currencies</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">
              {currencies.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Date Range</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">
              {years.length > 0 ? `${years[0]} - ${years[years.length - 1]}` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Controls Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pivot Controls */}
          <div className="lg:col-span-2">
            <PivotControls
              viewMode={viewMode}
              pivotMode={pivotMode}
              onViewModeChange={setViewMode}
              onPivotModeChange={setPivotMode}
            />
          </div>

          {/* Export Button */}
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

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Using This Page</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
            <div>
              <h4 className="font-semibold mb-2">Standard Table View</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Filter by currency and date range</li>
                <li>Sort by clicking column headers</li>
                <li>Paginate through large datasets</li>
                <li>Responsive card view on mobile</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Pivot Table View</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Pivot by year to compare currencies</li>
                <li>Pivot by currency to see trends over time</li>
                <li>Horizontal scrolling for many columns</li>
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

      {/* Scroll Hint */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 text-xs text-gray-500 text-center">
        ← Scroll horizontally to view all columns →
      </div>
    </div>
  )
}
