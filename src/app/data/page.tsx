/**
 * Data Page - Access commodity price and production data
 * Features: date range selection, interval control, commodity selection, CSV export
 */

'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import CommoditySelector from '@/components/charts/CommoditySelector'
import Loading from '@/components/ui/Loading'
import { loadCommodities } from '@/lib/data/loader'

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
  // User-controllable date range and interval
  const [startYear, setStartYear] = useState(1960)
  const [endYear, setEndYear] = useState(new Date().getFullYear())
  const [interval, setInterval] = useState<Interval>('annual')

  // Commodity data state
  const [allCommodities, setAllCommodities] = useState<CommodityInfo[]>([])
  const [selectedCommodities, setSelectedCommodities] = useState<string[]>(['gold', 'silver', 'petroleum', 'wheat', 'copper'])
  const [commodityData, setCommodityData] = useState<Record<string, CommodityDataPoint[]>>({})
  const [commodityLoading, setCommodityLoading] = useState(false)
  const [commodityError, setCommodityError] = useState<string | null>(null)

  // Production data state
  const [productionData, setProductionData] = useState<Record<string, ProductionDataPoint[]>>({})
  const [productionLoading, setProductionLoading] = useState(false)
  const [productionError, setProductionError] = useState<string | null>(null)

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
      .then((data: Record<string, CommodityDataPoint[]> & { commodities?: Record<string, CommodityDataPoint[]> }) => setCommodityData(data.commodities || data))
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
      .then((data: Record<string, ProductionDataPoint[]> & { commodities?: Record<string, ProductionDataPoint[]> }) => setProductionData(data.commodities || data))
      .catch(err => setProductionError(err.message))
      .finally(() => setProductionLoading(false))
  }, [selectedCommodities, startYear, endYear, interval])

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
            View, filter, and export commodity price and production data
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Records</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">
              {commodityLoading ? '...' : flatCommodityRows.length.toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Date Range</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">
              {startYear} - {endYear}
            </div>
          </div>
        </div>

        {/* Commodity Price Data Section */}
        <div>
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
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto max-h-96">
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
                {/* Mobile card view */}
                <div className="md:hidden max-h-96 overflow-y-auto divide-y divide-gray-100">
                  {flatCommodityRows.slice(0, 200).map((row, i) => (
                    <div key={i} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-gray-900">{row.commodity}</span>
                        <span className="text-sm font-mono text-gray-900">${row.price.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span className="font-mono">{row.date}</span>
                        <span>{row.unit}</span>
                      </div>
                    </div>
                  ))}
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
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto max-h-96">
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
              {/* Mobile card view */}
              <div className="md:hidden max-h-96 overflow-y-auto divide-y divide-gray-100">
                {flatProductionRows.slice(0, 200).map((row, i) => (
                  <div key={i} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium text-gray-900">{row.commodity}</span>
                      <span className="text-sm font-mono text-gray-900">{row.production.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span className="font-mono">{row.year}</span>
                      <span>{row.unit}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{row.source}</div>
                  </div>
                ))}
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
              <h4 className="font-semibold mb-2">Commodities</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Select up to 10 commodities to compare</li>
                <li>View price and production data side by side</li>
                <li>Export each dataset as CSV</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
