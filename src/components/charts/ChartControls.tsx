/**
 * ChartControls - Currency selector and date range inputs
 */

'use client'

import React from 'react'
import Select from '../ui/Select'
import Button from '../ui/Button'
import { presetRanges } from '@/lib/utils/date'

interface ChartControlsProps {
  currencies: Array<{ id: string; name: string; symbol: string }>
  selectedCurrency: string
  onCurrencyChange: (currencyId: string) => void
  startDate: Date
  endDate: Date
  onDateRangeChange: (start: Date, end: Date) => void
}

export default function ChartControls({
  currencies,
  selectedCurrency,
  onCurrencyChange,
  startDate,
  endDate,
  onDateRangeChange,
}: ChartControlsProps) {
  const handlePresetClick = (presetKey: keyof typeof presetRanges) => {
    const preset = presetRanges[presetKey]
    onDateRangeChange(preset.start, preset.end)
  }

  const formatDateInput = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Currency Selector */}
        <div>
          <Select
            label="Currency / Asset"
            id="currency-select"
            value={selectedCurrency}
            onChange={(e) => onCurrencyChange(e.target.value)}
            options={currencies.map((c) => ({
              value: c.id,
              label: `${c.name} (${c.symbol})`,
            }))}
          />
        </div>

        {/* Start Date */}
        <div>
          <label
            htmlFor="start-date"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Start Date
          </label>
          <input
            type="date"
            id="start-date"
            value={formatDateInput(startDate)}
            onChange={(e) => {
              const newStart = new Date(e.target.value)
              if (!isNaN(newStart.getTime())) {
                onDateRangeChange(newStart, endDate)
              }
            }}
            min="1900-01-01"
            max={formatDateInput(endDate)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-greco-primary focus:border-transparent"
          />
        </div>

        {/* End Date */}
        <div>
          <label
            htmlFor="end-date"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            End Date
          </label>
          <input
            type="date"
            id="end-date"
            value={formatDateInput(endDate)}
            onChange={(e) => {
              const newEnd = new Date(e.target.value)
              if (!isNaN(newEnd.getTime())) {
                onDateRangeChange(startDate, newEnd)
              }
            }}
            min={formatDateInput(startDate)}
            max={formatDateInput(new Date())}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-greco-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Preset Ranges */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Quick Ranges:</p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePresetClick('all')}
          >
            Full History
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePresetClick('modern')}
          >
            1950+
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePresetClick('recent')}
          >
            2000+
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePresetClick('lastDecade')}
          >
            Last Decade
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePresetClick('lastYear')}
          >
            Last Year
          </Button>
        </div>
      </div>
    </div>
  )
}
