/**
 * Loading Skeleton Components
 * Provides visual feedback during data loading
 */

import React from 'react'

/**
 * Chart Loading Skeleton
 */
export function ChartSkeleton({ height = 400 }: { height?: number }) {
  return (
    <div 
      className="animate-pulse bg-gray-200 rounded-lg" 
      style={{ height: `${height}px` }}
      role="status"
      aria-label="Loading chart"
    >
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading chart...</div>
      </div>
    </div>
  )
}

/**
 * Table Loading Skeleton
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden" role="status" aria-label="Loading table">
      <div className="animate-pulse">
        {/* Header */}
        <div className="bg-gray-100 p-4 border-b border-gray-200">
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
        
        {/* Rows */}
        {[...Array(rows)].map((_, rowIndex) => (
          <div key={rowIndex} className="p-4 border-b border-gray-100">
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, colIndex) => (
                <div key={colIndex} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Card Loading Skeleton
 */
export function CardSkeleton() {
  return (
    <div 
      className="bg-white rounded-lg shadow p-6 animate-pulse" 
      role="status"
      aria-label="Loading card"
    >
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-8 bg-gray-300 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  )
}

/**
 * Stats Grid Loading Skeleton
 */
export function StatsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
