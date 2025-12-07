/**
 * TimeSeriesChart - Line chart visualization using Recharts
 */

'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceArea,
} from 'recharts'
import { TimeSeriesDataPoint, handleDataGaps } from '@/lib/utils/chart'
import { formatCurrency, getCurrencySymbol } from '@/lib/utils/format'
import { loadCommodities } from '@/lib/data/loader'
import { Commodity } from '@/lib/types/commodity'

interface TimeSeriesChartProps {
  data: TimeSeriesDataPoint[]
  currency: string
  showGrid?: boolean
  height?: number
}

export default function TimeSeriesChart({
  data,
  currency,
  showGrid = true,
  height = 400,
}: TimeSeriesChartProps) {
  const [commodities, setCommodities] = useState<Commodity[]>([])
  const [expandedTooltip, setExpandedTooltip] = useState<boolean>(false)

  useEffect(() => {
    // Load commodity data for tooltip
    loadCommodities().then(setCommodities).catch(console.error)
  }, [])

  // Detect data gaps (memoized for performance)
  const dataGaps = useMemo(() => handleDataGaps(data), [data])

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200"
        style={{ height }}
      >
        <p className="text-gray-500">No data available for selected range</p>
      </div>
    )
  }

  const currencySymbol = getCurrencySymbol(currency)

  // Helper to group commodities by category
  const groupCommoditiesByCategory = (
    commodityIds: string[]
  ): Record<string, string[]> => {
    const grouped: Record<string, string[]> = {}
    
    for (const id of commodityIds) {
      const commodity = commodities.find((c) => c.id === id)
      if (commodity) {
        const category = commodity.category
        if (!grouped[category]) {
          grouped[category] = []
        }
        grouped[category].push(commodity.name)
      }
    }
    
    return grouped
  }

  // Custom tooltip
  interface TooltipProps {
    active?: boolean
    payload?: Array<{
      payload: TimeSeriesDataPoint
    }>
  }

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (!active || !payload || !payload[0]) return null

    const data = payload[0].payload as TimeSeriesDataPoint
    const contributingCommodities = data.contributingCommodities || []
    const groupedCommodities = groupCommoditiesByCategory(contributingCommodities)
    const categories = Object.keys(groupedCommodities).sort()

    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-sm">
        <p className="font-semibold text-gray-900 mb-2">{data.formattedDate}</p>
        <p className="text-sm text-gray-700 mb-1">
          <span className="font-medium">Greco Value:</span>{' '}
          {formatCurrency(data.value, currencySymbol)}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Completeness:</span> {data.completeness.toFixed(1)}%
        </p>
        <p className="text-sm text-gray-600 mb-2">
          <span className="font-medium">Quality:</span>{' '}
          <span
            className={`
              ${data.quality === 'high' ? 'text-green-600' : ''}
              ${data.quality === 'medium' ? 'text-yellow-600' : ''}
              ${data.quality === 'low' ? 'text-orange-600' : ''}
              ${data.quality === 'missing' ? 'text-red-600' : ''}
            `}
          >
            {data.quality.charAt(0).toUpperCase() + data.quality.slice(1)}
          </span>
        </p>
        
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-gray-700">
              Basket Composition ({contributingCommodities.length}/32 commodities)
            </p>
            <button
              className="text-xs text-blue-600 hover:text-blue-800"
              onClick={() => setExpandedTooltip(!expandedTooltip)}
            >
              {expandedTooltip ? 'Hide' : 'Show'}
            </button>
          </div>
          
          {expandedTooltip && (
            <div className="mt-2 max-h-48 overflow-y-auto text-xs">
              {categories.map((category) => (
                <div key={category} className="mb-2">
                  <p className="font-semibold text-gray-700">{category}</p>
                  <p className="text-gray-600 ml-2">
                    {groupedCommodities[category].join(', ')}
                  </p>
                </div>
              ))}
              
              {contributingCommodities.length < 32 && (
                <p className="text-orange-600 mt-2">
                  {32 - contributingCommodities.length} commodities missing data
                </p>
              )}
            </div>
          )}
          
          {!expandedTooltip && (
            <p className="text-xs text-gray-500 mt-1">
              Click &quot;Show&quot; to see commodity breakdown by category
            </p>
          )}
        </div>
      </div>
    )
  }

  // Format Y-axis values
  const formatYAxis = (value: number) => {
    return formatCurrency(value, currencySymbol, 0)
  }

  // Format X-axis values (show fewer labels on mobile)
  const formatXAxis = (value: string, index: number) => {
    // Show every 3rd label on small screens, every 2nd on medium, all on large
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
    const isTablet = typeof window !== 'undefined' && window.innerWidth < 1024

    if (isMobile && index % 3 !== 0) return ''
    if (isTablet && index % 2 !== 0) return ''

    return value
  }

  return (
    <>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
          
          {/* Data gap annotations */}
          {dataGaps.map((gap, index) => {
            // Find the data point indices for the gap boundaries
            const startIndex = data.findIndex(
              (d) => d.dateObj.getTime() >= gap.start.getTime()
            )
            const endIndex = data.findIndex(
              (d) => d.dateObj.getTime() >= gap.end.getTime()
            )

            if (startIndex === -1 || endIndex === -1) return null

            return (
              <ReferenceArea
                key={`gap-${index}`}
                x1={data[startIndex].formattedDate}
                x2={data[endIndex].formattedDate}
                fill="#fef3c7"
                fillOpacity={0.3}
                stroke="#f59e0b"
                strokeOpacity={0.5}
                strokeDasharray="3 3"
                label={{
                  value: `${gap.durationMonths}mo gap`,
                  position: 'top',
                  fontSize: 10,
                  fill: '#92400e',
                }}
              />
            )
          })}

          <XAxis
            dataKey="formattedDate"
            stroke="#6b7280"
            style={{ fontSize: '0.75rem' }}
            tickFormatter={formatXAxis}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '0.75rem' }}
            tickFormatter={formatYAxis}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '0.875rem' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="value"
            name={`Greco Value (${currency})`}
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
            animationDuration={300}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Gap warning below chart */}
      {dataGaps.length > 0 && (
        <div className="mt-2 flex items-start text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
          <svg
            className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="font-semibold">Data Gaps Detected</p>
            <p className="mt-1">
              This chart contains {dataGaps.length} gap{dataGaps.length > 1 ? 's' : ''} 
              where data is missing for more than 3 months. Highlighted areas show periods 
              with incomplete data.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
