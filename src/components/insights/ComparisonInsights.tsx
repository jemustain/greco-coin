/**
 * ComparisonInsights - Display relative performance metrics between currencies
 */

'use client'

import React from 'react'
import { GrecoValue } from '@/lib/types/greco'
import { Currency } from '@/lib/types/currency'
import { formatCurrency, getCurrencySymbol } from '@/lib/utils/format'

interface ComparisonInsightsProps {
  currencyDataMap: Map<string, GrecoValue[]>
  currencies: Currency[]
  selectedCurrencyIds: string[]
}

export default function ComparisonInsights({
  currencyDataMap,
  currencies,
  selectedCurrencyIds,
}: ComparisonInsightsProps) {
  // Calculate metrics for each currency
  const metrics = React.useMemo(() => {
    const results: Array<{
      currencyId: string
      currencyName: string
      symbol: string
      startValue: number | null
      endValue: number | null
      change: number | null
      changePercent: number | null
    }> = []

    selectedCurrencyIds.forEach((currencyId) => {
      const currency = currencies.find((c) => c.id === currencyId)
      const data = currencyDataMap.get(currencyId) || []

      if (data.length === 0) {
        results.push({
          currencyId,
          currencyName: currency?.name || currencyId,
          symbol: getCurrencySymbol(currencyId),
          startValue: null,
          endValue: null,
          change: null,
          changePercent: null,
        })
        return
      }

      const startValue = data[0].value
      const endValue = data[data.length - 1].value
      const change = endValue - startValue
      const changePercent = ((endValue - startValue) / startValue) * 100

      results.push({
        currencyId,
        currencyName: currency?.name || currencyId,
        symbol: getCurrencySymbol(currencyId),
        startValue,
        endValue,
        change,
        changePercent,
      })
    })

    return results
  }, [currencyDataMap, currencies, selectedCurrencyIds])

  // Find best and worst performers
  const sortedByPerformance = React.useMemo(() => {
    return [...metrics]
      .filter((m) => m.changePercent !== null)
      .sort((a, b) => (b.changePercent || 0) - (a.changePercent || 0))
  }, [metrics])

  const bestPerformer = sortedByPerformance[0]
  const worstPerformer = sortedByPerformance[sortedByPerformance.length - 1]

  // Calculate spread (range of values at end date)
  const spread = React.useMemo(() => {
    const endValues = metrics
      .filter((m) => m.endValue !== null)
      .map((m) => m.endValue as number)

    if (endValues.length === 0) return null

    const max = Math.max(...endValues)
    const min = Math.min(...endValues)
    const spreadPercent = ((max - min) / min) * 100

    return { min, max, spreadPercent }
  }, [metrics])

  if (selectedCurrencyIds.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Comparison Insights
      </h2>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Best Performer */}
        {bestPerformer && (
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-5 h-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <h3 className="text-sm font-semibold text-green-900">
                Best Performer
              </h3>
            </div>
            <p className="text-lg font-bold text-green-900">
              {bestPerformer.currencyName}
            </p>
            <p className="text-sm text-green-700 mt-1">
              {bestPerformer.changePercent !== null &&
                (bestPerformer.changePercent >= 0 ? '+' : '')}
              {bestPerformer.changePercent?.toFixed(2)}%
            </p>
          </div>
        )}

        {/* Worst Performer */}
        {worstPerformer && (
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-5 h-5 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <h3 className="text-sm font-semibold text-red-900">
                Worst Performer
              </h3>
            </div>
            <p className="text-lg font-bold text-red-900">
              {worstPerformer.currencyName}
            </p>
            <p className="text-sm text-red-700 mt-1">
              {worstPerformer.changePercent !== null &&
                (worstPerformer.changePercent >= 0 ? '+' : '')}
              {worstPerformer.changePercent?.toFixed(2)}%
            </p>
          </div>
        )}

        {/* Spread */}
        {spread && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                />
              </svg>
              <h3 className="text-sm font-semibold text-blue-900">
                Value Spread
              </h3>
            </div>
            <p className="text-lg font-bold text-blue-900">
              {spread.spreadPercent.toFixed(1)}%
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Range at end date
            </p>
          </div>
        )}
      </div>

      {/* Detailed Metrics Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Currency
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start Value
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                End Value
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Change
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                % Change
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {metrics.map((metric) => (
              <tr key={metric.currencyId} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {metric.currencyName}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600">
                  {metric.startValue !== null
                    ? formatCurrency(metric.startValue, metric.symbol)
                    : '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600">
                  {metric.endValue !== null
                    ? formatCurrency(metric.endValue, metric.symbol)
                    : '-'}
                </td>
                <td
                  className={`px-4 py-3 whitespace-nowrap text-sm text-right font-medium ${
                    metric.change !== null
                      ? metric.change >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                      : 'text-gray-400'
                  }`}
                >
                  {metric.change !== null
                    ? (metric.change >= 0 ? '+' : '') +
                      formatCurrency(metric.change, metric.symbol)
                    : '-'}
                </td>
                <td
                  className={`px-4 py-3 whitespace-nowrap text-sm text-right font-medium ${
                    metric.changePercent !== null
                      ? metric.changePercent >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                      : 'text-gray-400'
                  }`}
                >
                  {metric.changePercent !== null
                    ? (metric.changePercent >= 0 ? '+' : '') +
                      metric.changePercent.toFixed(2) +
                      '%'
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
