/**
 * CommoditySelector - Multi-select commodity picker grouped by category
 */

'use client'

import React from 'react'

interface CommodityInfo {
  id: string
  name: string
  category: string
}

interface CommoditySelectorProps {
  commodities: CommodityInfo[]
  selectedCommodities: string[]
  onSelectionChange: (commodityIds: string[]) => void
  maxSelections?: number
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

export default function CommoditySelector({
  commodities,
  selectedCommodities,
  onSelectionChange,
  maxSelections = 5,
}: CommoditySelectorProps) {
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
    } else if (selectedCommodities.length < maxSelections) {
      onSelectionChange([...selectedCommodities, id])
    }
  }

  const handleClearAll = () => onSelectionChange([])

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Commodity Price Trends
          </h3>
          <p className="text-sm text-gray-500">
            Select up to {maxSelections} commodities to compare ({selectedCommodities.length}/{maxSelections})
          </p>
        </div>
        {selectedCommodities.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-3">
        {sortedCategories.map((category) => (
          <div key={category}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              {category}
            </p>
            <div className="flex flex-wrap gap-2">
              {grouped[category].map((commodity) => {
                const isSelected = selectedCommodities.includes(commodity.id)
                const isDisabled =
                  !isSelected && selectedCommodities.length >= maxSelections

                return (
                  <button
                    key={commodity.id}
                    onClick={() => handleToggle(commodity.id)}
                    disabled={isDisabled}
                    className={`
                      text-sm px-3 py-1.5 rounded-full border transition-colors
                      ${
                        isSelected
                          ? 'bg-blue-100 border-blue-400 text-blue-800 font-medium'
                          : isDisabled
                          ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
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
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-3">
        ⚠️ = estimated data (no verified source yet)
      </p>
    </div>
  )
}
