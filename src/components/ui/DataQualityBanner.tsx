/**
 * Data Quality Banner
 * 
 * Displays information about data sources and quality across the site.
 */

'use client'

import { useState } from 'react'

export default function DataQualityBanner() {
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) return null

  return (
    <div className="bg-blue-50 border-b border-blue-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-semibold text-blue-900">Data Quality Notice</h3>
            </div>
            <p className="text-sm text-blue-800">
              <span className="font-medium">Real Data (2020-2023, 2025):</span> Actual commodity prices from USGS (United States Geological Survey). 
              <span className="ml-2 font-medium">Sample Data (2024):</span> Placeholder values while FRED API data is unavailable. 
              <span className="ml-2 font-medium">Historical (1900-2019):</span> Estimated/interpolated prices based on historical records.
            </p>
          </div>
          <button
            onClick={() => setIsDismissed(true)}
            className="flex-shrink-0 text-blue-600 hover:text-blue-800 transition-colors"
            aria-label="Dismiss banner"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
