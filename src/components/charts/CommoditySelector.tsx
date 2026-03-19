/**
 * CommoditySelector - Multi-select commodity picker grouped by category
 * Features: collapsible categories on mobile, popular quick-picks, responsive design
 */

'use client'

import React, { useState, useEffect } from 'react'

interface CommodityInfo {
  id: string
  name: string
  category: string
}

interface CommoditySelectorProps {
  commodities: CommodityInfo[]
  selectedCommodities: string[]
  onSelectionChange: (commodityIds: string[]) => void
}

const ESTIMATED_COMMODITY_IDS = new Set([
  'sulphur', 'cotton-seed', 'jute',
])

const CATEGORY_ORDER = [
  'Metals',
  'Energy',
  'Agricultural',
  'Fibers',
  'Animal Products',
  'Other',
]

const POPULAR_COMMODITIES = ['gold', 'silver', 'copper', 'petroleum', 'wheat']

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

export default function CommoditySelector({
  commodities,
  selectedCommodities,
  onSelectionChange,
}: CommoditySelectorProps) {
  const isMobile = useIsMobile()
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  // Group by category
  const grouped = commodities.reduce<Record<string, CommodityInfo[]>>((acc, c) => {
    const cat = c.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(c)
    return acc
  }, {})

  const sortedCategories = Object.keys(grouped).sort(
    (a, b) =>
      (CATEGORY_ORDER.indexOf(a) === -1 ? 99 : CATEGORY_ORDER.indexOf(a)) -
      (CATEGORY_ORDER.indexOf(b) === -1 ? 99 : CATEGORY_ORDER.indexOf(b))
  )

  const handleToggle = (id: string) => {
    if (selectedCommodities.includes(id)) {
      onSelectionChange(selectedCommodities.filter((c) => c !== id))
    } else {
      onSelectionChange([...selectedCommodities, id])
    }
  }

  const handleClearAll = () => onSelectionChange([])
  const handleSelectAll = () => onSelectionChange(commodities.map(c => c.id))
  const allSelected = commodities.length > 0 && selectedCommodities.length === commodities.length

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  // Popular commodities that exist in the data
  const popularItems = commodities.filter(c => POPULAR_COMMODITIES.includes(c.id))

  const renderChip = (commodity: CommodityInfo) => {
    const isSelected = selectedCommodities.includes(commodity.id)

    return (
      <button
        key={commodity.id}
        onClick={() => handleToggle(commodity.id)}
        className={`
          text-sm px-3 py-1.5 rounded-full border transition-colors
          ${
            isSelected
              ? 'bg-blue-100 border-blue-400 text-blue-800 font-medium'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
          }
        `}
      >
        {commodity.name}
        {ESTIMATED_COMMODITY_IDS.has(commodity.id) && (
          <span className="ml-1 text-amber-600" title="Estimated data">⚠️</span>
        )}
      </button>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Commodity Price Trends
          </h3>
          <p className="text-sm text-gray-500">
            {selectedCommodities.length} of {commodities.length} commodities selected
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() => allSelected ? handleClearAll() : handleSelectAll()}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Select All
          </label>
          {selectedCommodities.length > 0 && !allSelected && (
            <button
              onClick={handleClearAll}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Popular Quick Picks */}
      {popularItems.length > 0 && (
        <div className="mb-4 pb-3 border-b border-gray-100">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">
            ⭐ Popular
          </p>
          <div className="flex flex-wrap gap-2">
            {popularItems.map(renderChip)}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {sortedCategories.map((category) => {
          const items = grouped[category]
          const selectedInCategory = items.filter(c => selectedCommodities.includes(c.id)).length
          const isExpanded = !isMobile || expandedCategories.has(category)

          return (
            <div key={category}>
              <button
                type="button"
                onClick={() => isMobile && toggleCategory(category)}
                className={`flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 ${
                  isMobile ? 'cursor-pointer hover:text-gray-700 w-full' : 'cursor-default'
                }`}
              >
                {isMobile && (
                  <span className="text-gray-400 text-[10px]">
                    {isExpanded ? '▼' : '▶'}
                  </span>
                )}
                {category}
                <span className="text-gray-400 font-normal normal-case">
                  ({items.length}{selectedInCategory > 0 ? `, ${selectedInCategory} selected` : ''})
                </span>
              </button>
              {isExpanded && (
                <div className="flex flex-wrap gap-2">
                  {items.map(renderChip)}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <p className="text-xs text-gray-500 mt-3">
        ⚠️ = estimated data (no verified source yet)
      </p>
    </div>
  )
}
