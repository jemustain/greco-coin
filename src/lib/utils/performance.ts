/**
 * Performance optimization utilities
 * Handles data sampling, virtualization, and other performance enhancements
 */

/**
 * Sample data points for charts when dataset is too large
 * Uses Largest-Triangle-Three-Buckets (LTTB) algorithm for better visual fidelity
 * 
 * @param data - Array of data points with x and y values
 * @param threshold - Target number of points (default: 1000)
 * @returns Sampled data array
 */
export function sampleChartData<T extends { date: Date | string; value: number }>(
  data: T[],
  threshold = 1000
): T[] {
  if (data.length <= threshold) {
    return data
  }

  const sampled: T[] = []
  const bucketSize = (data.length - 2) / (threshold - 2)

  // Always include first point
  sampled.push(data[0])

  for (let i = 0; i < threshold - 2; i++) {
    const avgRangeStart = Math.floor((i + 0) * bucketSize) + 1
    const avgRangeEnd = Math.floor((i + 1) * bucketSize) + 1
    const avgRangeLength = avgRangeEnd - avgRangeStart

    let avgX = 0
    let avgY = 0

    // Calculate average point in bucket
    for (let j = avgRangeStart; j < avgRangeEnd; j++) {
      const point = data[j]
      const x = typeof point.date === 'string' ? new Date(point.date).getTime() : point.date.getTime()
      avgX += x
      avgY += point.value
    }
    avgX /= avgRangeLength
    avgY /= avgRangeLength

    // Find point in bucket closest to average
    let minDist = Infinity
    let selectedPoint = data[avgRangeStart]

    for (let j = avgRangeStart; j < avgRangeEnd; j++) {
      const point = data[j]
      const x = typeof point.date === 'string' ? new Date(point.date).getTime() : point.date.getTime()
      const dist = Math.pow(x - avgX, 2) + Math.pow(point.value - avgY, 2)
      
      if (dist < minDist) {
        minDist = dist
        selectedPoint = point
      }
    }

    sampled.push(selectedPoint)
  }

  // Always include last point
  sampled.push(data[data.length - 1])

  return sampled
}

/**
 * Debounce function for reducing event handler calls
 * 
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function for limiting event handler calls
 * 
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Calculate if data should be sampled for performance
 * 
 * @param dataLength - Number of data points
 * @param threshold - Threshold for sampling (default: 10000)
 * @returns Whether to sample the data
 */
export function shouldSampleData(dataLength: number, threshold = 10000): boolean {
  return dataLength > threshold
}

/**
 * Format large numbers for performance stats
 * 
 * @param value - Numeric value
 * @returns Formatted string
 */
export function formatPerformanceMetric(value: number): string {
  if (value < 1000) {
    return `${value.toFixed(0)}ms`
  }
  return `${(value / 1000).toFixed(2)}s`
}
