/**
 * Data Page - Access raw Greco historical currency data
 * Features: date range selection, interval control, sorting, pagination, pivot views, CSV export
 * Also: commodity price data and production data export
 */

'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import DataTable from '@/components/data/DataTable'
import PivotControls, { PivotMode, ViewMode } from '@/components/data/PivotControls'
import ExportButton from '@/components/data/ExportButton'
import CommoditySelector from '@/components/charts/CommoditySelector'
import Loading from '@/components/ui/Loading'
import { loadCurrencies, loadCommodities } from '@/lib/data/loader'
import { GrecoValue } from '@/lib/types/greco'
import { Currency } from '@/lib/types/currency'
import { formatCurrency } from '@/lib/utils/format'

type Interval = 'monthly' | 'quarterly' | 'annual'

interface CommodityDataPoint {
  date: string
  price: number
  unit: string
  quality: string
}

interface CommodityInfo {
  id: string
  name: string
  category: string
}

interface ProductionDataPoint {
  year: number
  production: number
  unit: string
  source: string
  quality: string
}

function downloadCsv(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

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

  // Commodity data state
  const [allCommodities, setAllCommodities] = useState<CommodityInfo[]>([])
  const [selectedCommodities, setSelectedCommodities] = useState<string[]>([])
  const [commodityData, setCommodityData] = useState<Record<string, CommodityDataPoint[]>>({})
  const [commodityLoading, setCommodityLoading] = useState(false)
  const [commodityError, setCommodityError] = useState<string | null>(null)

  // Production data state
  const [productionData, setProductionData] = useState<Record<string, ProductionDataPoint[]>>({})
  const [productionLoading, setProductionLoading] = useState(false)
  const [productionError, setProductionError] = useState<string | null>(null)

  // Load currencies once
  useEffect(() => {
    loadCurrencies().then(all => {
      setCurrencies(all.filter(c => c.id === 'USD'))
    })
  }, [])

  // Load commodity list once
  useEffect(() => {
    loadCommodities()
      .then((data) => {
        setAllCommodities(
          data.map((c) => ({
            id: c.id,
            name: c.name,
            category: c.category,
          }))
        )
      })
      .catch(() => {})
  }, [])

  // Fetch commodity price data when selection changes
  useEffect(() => {
    if (selectedCommodities.length === 0) {
      setCommodityData({})
      setProductionData({})
      return
    }
    const ids = selectedCommodities.join(',')

    // Fetch price data
    setCommodityLoading(true)
    setCommodityError(null)
    fetch(`/api/commodity-timeseries?commodities=${ids}&startDate=${startYear}-01-01&endDate=${endYear}-12-31&interval=${interval}`)
      .then(res => {
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        return res.json()
      })
      .then((data: Record<string, CommodityDataPoint[]>) => setCommodityData(data))
      .catch(err => setCommodityError(err.message))
      .finally(() => setCommodityLoading(false))

    // Fetch production data
    setProductionLoading(true)
    setProductionError(null)
    fetch(`/api/production-timeseries?commodities=${ids}&startYear=${startYear}&endYear=${endYear}`)
      .then(res => {
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        return res.json()
      })
      .then((data: Record<string, ProductionDataPoint[]>) => setProductionData(data))
      .catch(err => setProductionError(err.message))
      .finally(() => setProductionLoading(false))
  }, [selectedCommodities, startYear, endYear, interval])

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

  // Flatten commodity data for table display
  const flatCommodityRows = useMemo(() => {
    const rows: { date: string; commodity: string; price: number; unit: string }[] = []
    const nameMap = new Map(allCommodities.map(c => [c.id, c.name]))
    for (const [id, points] of Object.entries(commodityData)) {
      for (const p of points) {
        rows.push({ date: p.date, commodity: nameMap.get(id) || id, price: p.price, unit: p.unit })
      }
    }
    rows.sort((a, b) => a.date.localeCompare(b.date) || a.commodity.localeCompare(b.commodity))
    return rows
  }, [commodityData, allCommodities])

  // Flatten production data for table display
  const flatProductionRows = useMemo(() => {
    const rows: { year: number; commodity: string; production: number; unit: string; source: string }[] = []
    const nameMap = new Map(allCommodities.map(c => [c.id, c.name]))
    for (const [id, points] of Object.entries(productionData)) {
      for (const p of points) {
        rows.push({ year: p.year, commodity: nameMap.get(id) || id, production: p.production, unit: p.unit, source: p.source })
      }
    }
    rows.sort((a, b) => a.year - b.year || a.commodity.localeCompare(b.commodity))
    return rows
  }, [productionData, allCommodities])

  const handleExportCommodityCsv = useCallback(() => {
    const header = 'Date,Commodity,Price (USD),Unit'
    const csvRows = flatCommodityRows.map(r => `${r.date},"${r.commodity}",${r.price},${r.unit}`)
    downloadCsv('commodity-prices.csv', [header, ...csvRows].join('\n'))
  }, [flatCommodityRows])

  const handleExportProductionCsv = useCallback(() => {
    const header = 'Year,Commodity,Production,Unit,Source'
    const csvRows = flatProductionRows.map(r => `${r.year},"${r.commodity}",${r.production},${r.unit},"${r.source}"`)
    downloadCsv('production-data.csv', [header, ...csvRows].join('\n'))
  }, [flatProductionRows])

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

        {/* Commodity Price Data Section */}
        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Commodity Price Data</h2>
          <p className="text-gray-600 mb-6">
            Select commodities to view and export their historical price data.
          </p>

          <CommoditySelector
            commodities={allCommodities}
            selectedCommodities={selectedCommodities}
            onSelectionChange={setSelectedCommodities}
            maxSelections={10}
          />

          {commodityLoading && <div className="mt-4"><Loading /></div>}
          {commodityError && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{commodityError}</p>
            </div>
          )}

          {!commodityLoading && selectedCommodities.length > 0 && Object.keys(commodityData).length > 0 && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Price Data ({flatCommodityRows.length.toLocaleString()} records)
                </h3>
                <button
                  onClick={handleExportCommodityCsv}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  📥 Export CSV
                </button>
              </div>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commodity</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price (USD)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {flatCommodityRows.slice(0, 200).map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-6 py-2 text-sm text-gray-900 font-mono">{row.date}</td>
                          <td className="px-6 py-2 text-sm text-gray-900">{row.commodity}</td>
                          <td className="px-6 py-2 text-sm text-gray-900 text-right font-mono">{row.price.toFixed(4)}</td>
                          <td className="px-6 py-2 text-sm text-gray-500">{row.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {flatCommodityRows.length > 200 && (
                  <div className="bg-gray-50 border-t border-gray-200 px-6 py-2 text-xs text-gray-500 text-center">
                    Showing first 200 of {flatCommodityRows.length.toLocaleString()} rows. Export CSV for full data.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Production Data Section */}
        {!productionLoading && selectedCommodities.length > 0 && Object.keys(productionData).length > 0 && (
          <div className="border-t border-gray-200 pt-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Production Data</h2>
                <p className="text-gray-600 text-sm">
                  Annual world production volumes ({flatProductionRows.length.toLocaleString()} records)
                </p>
              </div>
              <button
                onClick={handleExportProductionCsv}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                📥 Export CSV
              </button>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto max-h-96">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commodity</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Production</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {flatProductionRows.slice(0, 200).map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-2 text-sm text-gray-900 font-mono">{row.year}</td>
                        <td className="px-6 py-2 text-sm text-gray-900">{row.commodity}</td>
                        <td className="px-6 py-2 text-sm text-gray-900 text-right font-mono">{row.production.toLocaleString()}</td>
                        <td className="px-6 py-2 text-sm text-gray-500">{row.unit}</td>
                        <td className="px-6 py-2 text-sm text-gray-500">{row.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {flatProductionRows.length > 200 && (
                <div className="bg-gray-50 border-t border-gray-200 px-6 py-2 text-xs text-gray-500 text-center">
                  Showing first 200 of {flatProductionRows.length.toLocaleString()} rows. Export CSV for full data.
                </div>
              )}
            </div>
          </div>
        )}

        {productionLoading && selectedCommodities.length > 0 && (
          <div className="mt-4"><Loading /></div>
        )}
        {productionError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{productionError}</p>
          </div>
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
