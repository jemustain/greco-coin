/**
 * ChartControls - Currency selector and date range inputs
 * Supports both single-select (dropdown) and multi-select (checkbox) modes
 */

'use client'

import React, { useMemo, useEffect } from 'react'
import Select from '../ui/Select'
import Button from '../ui/Button'
import { presetRanges } from '@/lib/utils/date'
import { Currency } from '@/lib/types/currency'

interface ChartControlsProps {
  currencies: Currency[]
  // Single-select mode (for main charts)
  selectedCurrency?: string
  onCurrencyChange?: (currencyId: string) => void
  // Multi-select mode (for comparison charts)
  selectedCurrencies?: string[]
  onCurrenciesChange?: (currencyIds: string[]) => void
  maxSelections?: number
  // Common props
  startDate: Date
  endDate: Date
  onDateRangeChange: (start: Date, end: Date) => void
}

export default function ChartControls({
  currencies,
  selectedCurrency,
  onCurrencyChange,
  selectedCurrencies = [],
  onCurrenciesChange,
  maxSelections = 9,
  startDate,
  endDate,
  onDateRangeChange,
}: ChartControlsProps) {
  // Determine which mode we're in
  const isMultiSelect = selectedCurrencies.length > 0 || onCurrenciesChange !== undefined
  
  // Get the earliest inception date from selected currencies
  const earliestInceptionDate = useMemo(() => {
    const activeCurrencies = isMultiSelect
      ? currencies.filter((c) => selectedCurrencies.includes(c.id))
      : currencies.filter((c) => c.id === selectedCurrency)

    if (activeCurrencies.length === 0) return new Date('1900-01-01')

    const dates = activeCurrencies
      .map((c) => (c.inceptionDate ? new Date(c.inceptionDate) : new Date('1900-01-01')))
      .filter((d) => !isNaN(d.getTime()))

    return dates.length > 0 ? new Date(Math.min(...dates.map((d) => d.getTime()))) : new Date('1900-01-01')
  }, [currencies, selectedCurrency, selectedCurrencies, isMultiSelect])

  // Validate and adjust date range if it's before currency inception
  const validateDateRange = (start: Date, end: Date) => {
    let validStart = start
    
    // If start date is before earliest currency inception, adjust it
    if (validStart < earliestInceptionDate) {
      validStart = earliestInceptionDate
    }
    
    onDateRangeChange(validStart, end)
  }

  // Auto-adjust date range when currency changes
  useEffect(() => {
    if (startDate < earliestInceptionDate) {
      validateDateRange(startDate, endDate)
    }
  }, [selectedCurrency, selectedCurrencies, earliestInceptionDate]) // eslint-disable-line react-hooks/exhaustive-deps
  const handlePresetClick = (presetKey: keyof typeof presetRanges) => {
    const preset = presetRanges[presetKey]
    validateDateRange(preset.start, preset.end)
  }

  const formatDateInput = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }

  // Show warning if current date range is before currency inception
  const showInceptionWarning = startDate < earliestInceptionDate

  // Handler for multi-select checkbox
  const handleCurrencyToggle = (currencyId: string) => {
    if (!onCurrenciesChange) return

    const newSelection = selectedCurrencies.includes(currencyId)
      ? selectedCurrencies.filter((id) => id !== currencyId)
      : [...selectedCurrencies, currencyId]

    // Enforce max selection limit
    if (newSelection.length <= maxSelections) {
      onCurrenciesChange(newSelection)
    }
  }

  // Select All handler
  const handleSelectAll = () => {
    if (!onCurrenciesChange) return
    const allIds = currencies.slice(0, maxSelections).map((c) => c.id)
    onCurrenciesChange(allIds)
  }

  // Clear All handler
  const handleClearAll = () => {
    if (!onCurrenciesChange) return
    onCurrenciesChange([])
  }

  // Get inception date info for warning message
  const getInceptionInfo = () => {
    if (!isMultiSelect && selectedCurrency) {
      const currency = currencies.find((c) => c.id === selectedCurrency)
      return currency?.name || 'The selected currency'
    }
    return 'One or more selected currencies'
  }

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
              {getInceptionInfo()} was introduced on{' '}
              {formatDateInput(earliestInceptionDate)}. Data before this date is not 
              available. The start date will be adjusted automatically.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Currency Selector - Single Select Mode */}
        {!isMultiSelect && (
          <div>
            <Select
              label="Currency / Asset"
              id="currency-select"
              value={selectedCurrency || ''}
              onChange={(e) => onCurrencyChange?.(e.target.value)}
              options={currencies.map((c) => ({
                value: c.id,
                label: `${c.name} (${c.symbol})`,
              }))}
            />
          </div>
        )}

        {/* Currency Selector - Multi Select Mode */}
        {isMultiSelect && (
          <div className="md:col-span-3">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Currencies to Compare ({selectedCurrencies.length}/{maxSelections})
              </label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSelectAll}
                  disabled={selectedCurrencies.length === maxSelections}
                >
                  Select All
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleClearAll}
                  disabled={selectedCurrencies.length === 0}
                >
                  Clear All
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              {currencies.map((currency) => {
                const isSelected = selectedCurrencies.includes(currency.id)
                const isDisabled = !isSelected && selectedCurrencies.length >= maxSelections

                return (
                  <label
                    key={currency.id}
                    className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                      isDisabled
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-white hover:shadow-sm'
                    } ${isSelected ? 'bg-white shadow-sm' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleCurrencyToggle(currency.id)}
                      disabled={isDisabled}
                      className="w-4 h-4 text-greco-primary focus:ring-greco-primary border-gray-300 rounded cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {currency.name} ({currency.symbol})
                    </span>
                  </label>
                )
              })}
            </div>
            {selectedCurrencies.length >= maxSelections && (
              <p className="text-sm text-gray-500 mt-2">
                Maximum {maxSelections} currencies selected. Uncheck a currency to select another.
              </p>
            )}
          </div>
        )}

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
            min={formatDateInput(earliestInceptionDate)}
            max={formatDateInput(endDate)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-greco-primary focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Earliest: {formatDateInput(earliestInceptionDate)}
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
