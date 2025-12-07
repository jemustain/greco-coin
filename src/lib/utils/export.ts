/**
 * Export utilities for generating CSV files
 */

/**
 * Generate CSV from array of objects
 * @param data - Array of data objects
 * @param headers - Column headers (optional, inferred from first row)
 * @returns CSV string
 */
export function generateCSV(
  data: Array<Record<string, unknown>>,
  headers?: string[]
): string {
  if (data.length === 0) {
    return ''
  }

  // Infer headers from first row if not provided
  const columnHeaders = headers || Object.keys(data[0])

  // Create CSV rows
  const rows = data.map((row) =>
    columnHeaders.map((header) => {
      const value = row[header]
      
      // Handle different value types
      if (value === null || value === undefined) {
        return ''
      }
      if (value instanceof Date) {
        return value.toISOString().split('T')[0]
      }
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return String(value)
    }).join(',')
  )

  // Combine header and rows
  const csv = [columnHeaders.join(','), ...rows].join('\n')

  return csv
}

/**
 * Stream large dataset to CSV (for API use)
 * @param data - Array of data objects
 * @param onChunk - Callback for each CSV chunk
 * @param chunkSize - Number of rows per chunk (default: 1000)
 */
export async function streamLargeDataset(
  data: Array<Record<string, unknown>>,
  onChunk: (chunk: string) => void,
  chunkSize = 1000
): Promise<void> {
  if (data.length === 0) {
    return
  }

  const headers = Object.keys(data[0])
  
  // Send header first
  onChunk(headers.join(',') + '\n')

  // Stream data in chunks
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize)
    const csvChunk = generateCSV(chunk, headers)
    const rows = csvChunk.split('\n').slice(1) // Remove header from chunk
    onChunk(rows.join('\n') + '\n')
  }
}

/**
 * Trigger browser download of CSV file
 * @param csv - CSV string
 * @param filename - Download filename (default: 'export.csv')
 */
export function downloadCSV(csv: string, filename = 'export.csv'): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Calculate estimated CSV file size
 * @param data - Array of data objects
 * @returns Size in bytes
 */
export function estimateCSVSize(data: Array<Record<string, unknown>>): number {
  if (data.length === 0) return 0

  // Estimate based on sample
  const sample = generateCSV(data.slice(0, Math.min(100, data.length)))
  const avgRowSize = sample.length / Math.min(100, data.length)

  return Math.round(avgRowSize * data.length)
}
