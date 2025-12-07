/**
 * Unit converter - Convert between different units of measure
 */

import { loadUnits } from './loader'

/**
 * Convert any unit to metric tons
 * @param value - Quantity in source unit
 * @param sourceUnitId - Source unit ID (e.g., "troy-ounce", "bushel")
 * @param commodityId - Commodity ID (needed for bushel conversions)
 * @returns Value in metric tons
 */
export async function convertToMetricTon(
  value: number,
  sourceUnitId: string,
  commodityId?: string
): Promise<number> {
  const units = await loadUnits()
  const unit = units.find((u) => u.id === sourceUnitId)

  if (!unit) {
    throw new Error(`Unknown unit: ${sourceUnitId}`)
  }

  if (unit.id === 'metric-ton') {
    return value // Already in metric tons
  }

  if (unit.baseConversion?.toMetricTon) {
    return value * unit.baseConversion.toMetricTon
  }

  // Special case: bushels require commodity-specific conversion
  if (unit.id === 'bushel' && commodityId) {
    return convertBushelToMetricTon(value, commodityId)
  }

  throw new Error(`Cannot convert ${sourceUnitId} to metric tons without additional context`)
}

/**
 * Convert bushels to metric tons (commodity-specific)
 * @param bushels - Quantity in bushels
 * @param commodityId - Commodity ID
 * @returns Value in metric tons
 */
function convertBushelToMetricTon(bushels: number, commodityId: string): number {
  // Bushel weights in pounds per bushel
  const bushelWeights: Record<string, number> = {
    wheat: 60,
    corn: 56,
    barley: 48,
    oats: 32,
    rye: 56,
    'soy-beans': 60,
  }

  const weightPerBushel = bushelWeights[commodityId]
  if (!weightPerBushel) {
    throw new Error(`No bushel conversion available for ${commodityId}`)
  }

  // Convert: bushels → pounds → metric tons
  const pounds = bushels * weightPerBushel
  const metricTons = pounds * 0.00045359237

  return metricTons
}

/**
 * Format value with appropriate unit symbol
 * @param value - Numeric value
 * @param unitId - Unit ID
 * @returns Formatted string
 */
export async function formatWithUnit(value: number, unitId: string): Promise<string> {
  const units = await loadUnits()
  const unit = units.find((u) => u.id === unitId)

  if (!unit) {
    return `${value} (unknown unit)`
  }

  return `${value.toFixed(2)} ${unit.symbol}`
}
