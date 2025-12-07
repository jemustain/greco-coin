/**
 * DataTable Component - Display greco values in tabular format
 * Features: sorting, pagination, filtering, responsive design
 */

'use client'

import React, { useState, useMemo } from 'react'
import { GrecoValue } from '@/lib/types/greco'
import { Currency } from '@/lib/types/currency'
import { formatCurrency, formatDate } from '@/lib/utils/format'

interface DataTableProps {
  data: GrecoValue[]
  currencies: Currency[]
  loading?: boolean
}

type SortField = 'date' | 'currency' | 'value'
type SortDirection = 'asc' | 'desc'

export default function DataTable({ data, currencies, loading = false }: DataTableProps) {
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(50)
  const [filterCurrency, setFilterCurrency] = useState<string>('all')
  const [filterDateFrom, setFilterDateFrom] = useState<string>('')
  const [filterDateTo, setFilterDateTo] = useState<string>('')

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Currency filter
      if (filterCurrency !== 'all' && item.currencyId !== filterCurrency) {
        return false
      }

      // Date range filter
      if (filterDateFrom && item.date < filterDateFrom) {
        return false
      }
      if (filterDateTo && item.date > filterDateTo) {
        return false
      }

      return true
    })
  }, [data, filterCurrency, filterDateFrom, filterDateTo])

  // Sort data
  const sortedData = useMemo(() => {
    const sorted = [...filteredData]
    sorted.sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'date':
          comparison = a.date.localeCompare(b.date)
          break
        case 'currency':
          comparison = a.currencyId.localeCompare(b.currencyId)
          break
        case 'value':
          comparison = a.grecoValue - b.grecoValue
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return sorted
  }, [filteredData, sortField, sortDirection])

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    return sortedData.slice(startIndex, endIndex)
  }, [sortedData, currentPage, rowsPerPage])

  const totalPages = Math.ceil(sortedData.length / rowsPerPage)

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setCurrentPage(1) // Reset to first page
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  // Get currency name
  const getCurrencyName = (currencyId: string) => {
    const currency = currencies.find(c => c.id === currencyId)
    return currency ? currency.name : currencyId
  }

  if (loading) {
    return (
      <div className="w-full p-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Loading data...</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Currency Filter */}
          <div>
            <label htmlFor="filter-currency" className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              id="filter-currency"
              value={filterCurrency}
              onChange={(e) => {
                setFilterCurrency(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Currencies</option>
              {currencies.map(currency => (
                <option key={currency.id} value={currency.id}>
                  {currency.name} ({currency.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Date From Filter */}
          <div>
            <label htmlFor="filter-date-from" className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <input
              type="date"
              id="filter-date-from"
              value={filterDateFrom}
              onChange={(e) => {
                setFilterDateFrom(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Date To Filter */}
          <div>
            <label htmlFor="filter-date-to" className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <input
              type="date"
              id="filter-date-to"
              value={filterDateTo}
              onChange={(e) => {
                setFilterDateTo(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filter Summary */}
        <div className="text-sm text-gray-600">
          Showing {paginatedData.length} of {sortedData.length} results
          {filteredData.length !== data.length && ` (filtered from ${data.length} total)`}
        </div>
      </div>

      {/* Table - Desktop View */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Date</span>
                    {sortField === 'date' && (
                      <span className="text-blue-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('currency')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Currency</span>
                    {sortField === 'currency' && (
                      <span className="text-blue-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('value')}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Greco Value</span>
                    {sortField === 'value' && (
                      <span className="text-blue-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Quality
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((item, index) => (
                <tr key={`${item.currencyId}-${item.date}-${index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(item.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getCurrencyName(item.currencyId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono">
                    {formatCurrency(item.grecoValue, 4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      item.completeness >= 0.9 
                        ? 'bg-green-100 text-green-800'
                        : item.completeness >= 0.8
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {Math.round(item.completeness * 100)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Card View - Mobile */}
      <div className="md:hidden space-y-4">
        {paginatedData.map((item, index) => (
          <div key={`${item.currencyId}-${item.date}-${index}`} className="bg-white rounded-lg shadow p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium text-gray-900">{getCurrencyName(item.currencyId)}</div>
                <div className="text-sm text-gray-500">{formatDate(item.date)}</div>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                item.completeness >= 0.9 
                  ? 'bg-green-100 text-green-800'
                  : item.completeness >= 0.8
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {Math.round(item.completeness * 100)}%
              </span>
            </div>
            <div className="text-lg font-semibold text-gray-900 font-mono">
              {formatCurrency(item.grecoValue, 4)} Greco
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Rows per page */}
          <div className="flex items-center space-x-2">
            <label htmlFor="rows-per-page" className="text-sm text-gray-700">
              Rows per page:
            </label>
            <select
              id="rows-per-page"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={500}>500</option>
            </select>
          </div>

          {/* Page navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              First
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Last
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
