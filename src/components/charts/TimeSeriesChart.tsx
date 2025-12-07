/**
 * TimeSeriesChart - Line chart visualization using Recharts
 */

'use client'

import React from 'react'
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
import { TimeSeriesDataPoint } from '@/lib/utils/chart'
import { formatCurrency, getCurrencySymbol } from '@/lib/utils/format'

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

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null

    const data = payload[0].payload as TimeSeriesDataPoint

    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900 mb-2">{data.formattedDate}</p>
        <p className="text-sm text-gray-700">
          <span className="font-medium">Greco Value:</span>{' '}
          {formatCurrency(data.value, currencySymbol)}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Completeness:</span> {data.completeness.toFixed(1)}%
        </p>
        <p className="text-sm text-gray-600">
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
          <p className="text-xs text-gray-500">32 commodities basket</p>
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
  )
}
