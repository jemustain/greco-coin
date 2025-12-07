/**
 * ExportButton Component - Trigger CSV export with options
 * Handles export requests to the API endpoint
 */

'use client'

import React, { useState } from 'react'
import { GrecoValue } from '@/lib/types/greco'

interface ExportButtonProps {
  data: GrecoValue[]
  disabled?: boolean
  filename?: string
}

export default function ExportButton({ 
  data, 
  disabled = false,
  filename = 'greco-data'
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [includeHeaders, setIncludeHeaders] = useState(true)

  const handleExport = async () => {
    if (data.length === 0) {
      alert('No data to export')
      return
    }

    setIsExporting(true)

    try {
      // Call export API
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data,
          options: {
            includeMetadata,
            includeHeaders,
            filename: `${filename}-${new Date().toISOString().split('T')[0]}.csv`
          }
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Export failed')
      }

      // Get the CSV data
      const blob = await response.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      setShowOptions(false)
    } catch (error) {
      console.error('Export error:', error)
      alert(error instanceof Error ? error.message : 'Failed to export data')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="relative">
      {/* Export Button */}
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={disabled || isExporting}
        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isExporting ? (
          <>
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export CSV</span>
          </>
        )}
      </button>

      {/* Options Modal */}
      {showOptions && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowOptions(false)}
          ></div>

          {/* Modal */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-full max-w-md p-6 space-y-6">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-gray-900">Export Options</h3>
              <button
                onClick={() => setShowOptions(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Include Headers Checkbox */}
              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeHeaders}
                  onChange={(e) => setIncludeHeaders(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Include Column Headers</div>
                  <div className="text-xs text-gray-500">
                    Add header row with column names
                  </div>
                </div>
              </label>

              {/* Include Metadata Checkbox */}
              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeMetadata}
                  onChange={(e) => setIncludeMetadata(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Include Metadata</div>
                  <div className="text-xs text-gray-500">
                    Add export date, data completeness, and source information
                  </div>
                </div>
              </label>

              {/* Data Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-700 space-y-1">
                  <div className="flex justify-between">
                    <span>Total Rows:</span>
                    <span className="font-semibold">{data.length.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Size:</span>
                    <span className="font-semibold">
                      {(data.length * 100 / 1024).toFixed(2)} KB
                    </span>
                  </div>
                </div>
              </div>

              {/* Warning for large exports */}
              {data.length > 10000 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Large export detected. This may take a few moments to process.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowOptions(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Export
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
