/**
 * ChartControls - Currency selector and date range inputs
 */

'use client'

import React, { useMemo, useEffect } from 'react'
import Select from '../ui/Select'
import Button from '../ui/Button'
import { presetRanges } from '@/lib/utils/date'
import { Currency } from '@/lib/types/currency'

interface ChartControlsProps {
  currencies: Currency[]
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
  // Get the selected currency's inception date
  const selectedCurrencyData = useMemo(
    () => currencies.find((c) => c.id === selectedCurrency),
    [currencies, selectedCurrency]
  )

  const currencyInceptionDate = useMemo(() => {
    if (!selectedCurrencyData?.inceptionDate) return new Date('1900-01-01')
    return new Date(selectedCurrencyData.inceptionDate)
  }, [selectedCurrencyData])

  // Validate and adjust date range if it's before currency inception
  const validateDateRange = (start: Date, end: Date) => {
    let validStart = start
    
    // If start date is before currency inception, adjust it
    if (validStart < currencyInceptionDate) {
      validStart = currencyInceptionDate
    }
    
    onDateRangeChange(validStart, end)
  }

  // Auto-adjust date range when currency changes
  useEffect(() => {
    if (startDate < currencyInceptionDate) {
      validateDateRange(startDate, endDate)
    }
  }, [selectedCurrency, currencyInceptionDate]) // eslint-disable-line react-hooks/exhaustive-deps
  const handlePresetClick = (presetKey: keyof typeof presetRanges) => {
    const preset = presetRanges[presetKey]
    validateDateRange(preset.start, preset.end)
  }

  const formatDateInput = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }

  // Show warning if current date range is before currency inception
  const showInceptionWarning = startDate < currencyInceptionDate

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
      {/* Inception date warning */}
      {showInceptionWarning && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start">
          <svg
            className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5"
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
            <p className="text-sm font-semibold text-amber-900">
              Date Range Before Currency Inception
            </p>
            <p className="text-sm text-amber-800 mt-1">
              {selectedCurrencyData?.name} was introduced on{' '}
              {formatDateInput(currencyInceptionDate)}. Data before this date is not 
              available. The start date will be adjusted automatically.
            </p>
          </div>
        </div>
      )}

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
                validateDateRange(newStart, endDate)
              }
            }}
            min={formatDateInput(currencyInceptionDate)}
            max={formatDateInput(endDate)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-greco-primary focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Earliest: {formatDateInput(currencyInceptionDate)}
          </p>
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
                validateDateRange(startDate, newEnd)
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
