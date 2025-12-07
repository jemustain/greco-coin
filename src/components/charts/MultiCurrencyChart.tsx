/**
 * MultiCurrencyChart - Multi-currency comparison chart using Recharts
 */

'use client'

import React, { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { MultiCurrencyDataPoint } from '@/lib/utils/chart'
import { formatCurrency, getCurrencySymbol } from '@/lib/utils/format'
import { Currency } from '@/lib/types/currency'

interface MultiCurrencyChartProps {
  data: MultiCurrencyDataPoint[]
  currencies: Currency[]
  selectedCurrencyIds: string[]
  colorMap: Map<string, string>
  hiddenCurrencies?: Set<string>
  onToggleCurrency?: (currencyId: string) => void
  showGrid?: boolean
  height?: number
}

/**
 * MultiCurrencyChart component with performance optimizations:
 * - React.memo for component-level memoization
 * - useMemo for expensive calculations
 * - Synchronized tooltips for all currencies
 * - Interactive legend with show/hide toggles
 */
const MultiCurrencyChart = React.memo(function MultiCurrencyChart({
  data,
  currencies,
  selectedCurrencyIds,
  colorMap,
  hiddenCurrencies = new Set(),
  onToggleCurrency,
  showGrid = true,
  height = 400,
}: MultiCurrencyChartProps) {
  // Get visible currencies (selected but not hidden)
  const visibleCurrencies = useMemo(() => {
    return selectedCurrencyIds.filter((id) => !hiddenCurrencies.has(id))
  }, [selectedCurrencyIds, hiddenCurrencies])

  // Get currency details
  const getCurrencyDetails = (currencyId: string): Currency | undefined => {
    return currencies.find((c) => c.id === currencyId)
  }

  if (data.length === 0 || visibleCurrencies.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200"
        style={{ height }}
      >
        <p className="text-gray-500">
          {visibleCurrencies.length === 0
            ? 'Select at least one currency to compare'
            : 'No data available for selected range'}
        </p>
      </div>
    )
  }

  // Custom synchronized tooltip
  interface TooltipProps {
    active?: boolean
    payload?: Array<{
      dataKey: string
      value: number
      color: string
      name: string
    }>
    label?: string
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (!active || !payload || payload.length === 0) return null

    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-sm">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => {
            const currency = getCurrencyDetails(entry.dataKey)
            const symbol = currency ? getCurrencySymbol(currency.id) : ''
            
            return (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-gray-700">{entry.name}:</span>
                </div>
                <span className="font-medium text-gray-900 ml-4">
                  {formatCurrency(entry.value, symbol)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Format X-axis values (show fewer labels on mobile)
  const formatXAxis = (value: string, index: number) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
    const isTablet = typeof window !== 'undefined' && window.innerWidth < 1024

    if (isMobile && index % 3 !== 0) return ''
    if (isTablet && index % 2 !== 0) return ''

    return value
  }

  // Custom legend with toggle functionality
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderLegend = (props: any) => {
    const { payload } = props
    
    if (!payload) return null
    
    return (
      <div className="flex flex-wrap gap-3 justify-center mt-4">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {payload.map((entry: any, index: number) => {
          const dataKey = String(entry.dataKey || '')
          const isHidden = hiddenCurrencies.has(dataKey)
          const currency = getCurrencyDetails(dataKey)
          
          return (
            <button
              key={index}
              onClick={() => onToggleCurrency?.(dataKey)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
                isHidden
                  ? 'bg-gray-100 border-gray-300 opacity-50'
                  : 'bg-white border-gray-300 hover:border-gray-400'
              }`}
              title={isHidden ? 'Click to show' : 'Click to hide'}
            >
              <div
                className={`w-4 h-0.5 rounded-full ${isHidden ? 'bg-gray-400' : ''}`}
                style={!isHidden ? { backgroundColor: entry.color } : {}}
              />
              <span className={`text-sm font-medium ${isHidden ? 'text-gray-500' : 'text-gray-700'}`}>
                {currency?.name || dataKey}
              </span>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
          
          <XAxis
            dataKey="formattedDate"
            stroke="#6b7280"
            style={{ fontSize: '0.75rem' }}
            tickFormatter={formatXAxis}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '0.75rem' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />

          {/* Render a Line for each visible currency */}
          {visibleCurrencies.map((currencyId) => {
            const currency = getCurrencyDetails(currencyId)
            const color = colorMap.get(currencyId) || '#6b7280'
            
            return (
              <Line
                key={currencyId}
                type="monotone"
                dataKey={currencyId}
                name={currency?.name || currencyId}
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
                animationDuration={300}
                connectNulls
              />
            )
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
})

export default MultiCurrencyChart
