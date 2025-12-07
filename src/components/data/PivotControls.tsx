/**
 * PivotControls Component - Controls for pivoting table data
 * Allows switching between different data views
 */

'use client'

import React from 'react'

export type PivotMode = 'none' | 'by-year' | 'by-currency'
export type ViewMode = 'table' | 'pivot'

interface PivotControlsProps {
  viewMode: ViewMode
  pivotMode: PivotMode
  onViewModeChange: (mode: ViewMode) => void
  onPivotModeChange: (mode: PivotMode) => void
  disabled?: boolean
}

export default function PivotControls({
  viewMode,
  pivotMode,
  onViewModeChange,
  onPivotModeChange,
  disabled = false
}: PivotControlsProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">View Options</h3>
      
      <div className="space-y-4">
        {/* View Mode Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Mode
          </label>
          <div className="flex space-x-2">
            <button
              onClick={() => onViewModeChange('table')}
              disabled={disabled}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Standard Table
            </button>
            <button
              onClick={() => onViewModeChange('pivot')}
              disabled={disabled}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                viewMode === 'pivot'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Pivot Table
            </button>
          </div>
        </div>

        {/* Pivot Mode Selection (only shown when in pivot view) */}
        {viewMode === 'pivot' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pivot By
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="pivot-mode"
                  value="by-year"
                  checked={pivotMode === 'by-year'}
                  onChange={() => onPivotModeChange('by-year')}
                  disabled={disabled}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Pivot by Year</div>
                  <div className="text-xs text-gray-500">
                    Show all currencies as columns for each year
                  </div>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="pivot-mode"
                  value="by-currency"
                  checked={pivotMode === 'by-currency'}
                  onChange={() => onPivotModeChange('by-currency')}
                  disabled={disabled}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Pivot by Currency</div>
                  <div className="text-xs text-gray-500">
                    Show all years as columns for each currency
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                {viewMode === 'table' ? (
                  'Standard table view shows data in rows with sorting and filtering options.'
                ) : pivotMode === 'by-year' ? (
                  'Pivot by year shows each year in a row with currencies as columns, making it easy to compare currency values for a specific time period.'
                ) : (
                  'Pivot by currency shows each currency in a row with years as columns, making it easy to see how a currency\'s value changed over time.'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
