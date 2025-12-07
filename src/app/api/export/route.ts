/**
 * CSV Export API Route
 * POST /api/export
 * 
 * Handles CSV export requests with validation, streaming, and rate limiting
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { GrecoValue } from '@/lib/types/greco'

// Validation schema
const ExportRequestSchema = z.object({
  data: z.array(z.object({
    currencyId: z.string(),
    date: z.union([z.string(), z.date()]),
    grecoValue: z.number(),
    completeness: z.number(),
    qualityIndicator: z.string().optional(),
    contributingCommodities: z.array(z.string()).optional(),
  })),
  options: z.object({
    includeMetadata: z.boolean().default(true),
    includeHeaders: z.boolean().default(true),
    filename: z.string().optional(),
  }).optional(),
})

// Constants
const MAX_ROWS = 1_000_000
const MAX_SIZE_BYTES = 100 * 1024 * 1024 // 100MB
const RATE_LIMIT_PER_HOUR = 10

// In-memory rate limiting (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

/**
 * Check rate limit for an IP address
 */
function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const hourMs = 60 * 60 * 1000

  const existing = rateLimitMap.get(ip)

  // Reset if hour has passed
  if (!existing || now > existing.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + hourMs })
    return { allowed: true, remaining: RATE_LIMIT_PER_HOUR - 1 }
  }

  // Check if limit exceeded
  if (existing.count >= RATE_LIMIT_PER_HOUR) {
    return { allowed: false, remaining: 0 }
  }

  // Increment count
  existing.count += 1
  return { allowed: true, remaining: RATE_LIMIT_PER_HOUR - existing.count }
}

/**
 * Convert Greco values to CSV format
 */
function convertToCSV(
  data: Array<{
    currencyId: string
    date: string | Date
    grecoValue: number
    completeness: number
    qualityIndicator?: string
    contributingCommodities?: string[]
  }>,
  options: {
    includeMetadata: boolean
    includeHeaders: boolean
  }
): string {
  const lines: string[] = []

  // Add metadata header
  if (options.includeMetadata) {
    lines.push('# Greco Historical Currency Data Export')
    lines.push(`# Generated: ${new Date().toISOString()}`)
    lines.push(`# Total Rows: ${data.length}`)
    lines.push(`# Source: Greco Coin Tracker`)
    lines.push('#')
  }

  // Add column headers
  if (options.includeHeaders) {
    lines.push('Date,Currency,Greco Value,Completeness,Quality Indicator,Contributing Commodities')
  }

  // Add data rows
  data.forEach((row) => {
    const date = typeof row.date === 'string' ? row.date : row.date.toISOString().split('T')[0]
    const completeness = (row.completeness * 100).toFixed(2) + '%'
    const quality = row.qualityIndicator || 'N/A'
    const commodities = row.contributingCommodities?.join(';') || 'N/A'

    // Escape values that contain commas or quotes
    const escapedCurrency = escapeCSVValue(row.currencyId)
    const escapedQuality = escapeCSVValue(quality)
    const escapedCommodities = escapeCSVValue(commodities)

    lines.push(
      `${date},${escapedCurrency},${row.grecoValue},${completeness},${escapedQuality},${escapedCommodities}`
    )
  })

  return lines.join('\n')
}

/**
 * Escape CSV values containing special characters
 */
function escapeCSVValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/**
 * POST handler for CSV export
 */
export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'

    // Check rate limit
    const rateLimit = checkRateLimit(ip)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `You have exceeded the export limit of ${RATE_LIMIT_PER_HOUR} exports per hour. Please try again later.`,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT_PER_HOUR.toString(),
            'X-RateLimit-Remaining': '0',
          },
        }
      )
    }

    // Parse request body
    const body = await request.json()

    // Validate request
    const validationResult = ExportRequestSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Invalid request format',
          details: validationResult.error.errors,
        },
        { status: 400 }
      )
    }

    const { data, options } = validationResult.data

    // Check row limit
    if (data.length > MAX_ROWS) {
      return NextResponse.json(
        {
          error: 'Payload too large',
          message: `Export exceeds maximum row limit of ${MAX_ROWS.toLocaleString()} rows`,
        },
        { status: 413 }
      )
    }

    // Generate CSV
    const csv = convertToCSV(data, {
      includeMetadata: options?.includeMetadata ?? true,
      includeHeaders: options?.includeHeaders ?? true,
    })

    // Check size limit
    const sizeBytes = new Blob([csv]).size
    if (sizeBytes > MAX_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: 'Payload too large',
          message: `Export exceeds maximum size limit of ${MAX_SIZE_BYTES / 1024 / 1024}MB`,
        },
        { status: 413 }
      )
    }

    // Return CSV with appropriate headers
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${options?.filename || 'greco-export.csv'}"`,
        'X-RateLimit-Limit': RATE_LIMIT_PER_HOUR.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      },
    })
  } catch (error) {
    console.error('Export API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred during export',
      },
      { status: 500 }
    )
  }
}

/**
 * GET handler - return API documentation
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/export',
    method: 'POST',
    description: 'Export Greco historical currency data to CSV format',
    rateLimit: `${RATE_LIMIT_PER_HOUR} exports per hour per IP`,
    limits: {
      maxRows: MAX_ROWS,
      maxSizeBytes: MAX_SIZE_BYTES,
    },
    requestBody: {
      data: 'Array of Greco values',
      options: {
        includeMetadata: 'boolean (optional, default: true)',
        includeHeaders: 'boolean (optional, default: true)',
        filename: 'string (optional)',
      },
    },
    example: {
      data: [
        {
          currencyId: 'USD',
          date: '2023-01-01',
          grecoValue: 1.5,
          completeness: 0.95,
          qualityIndicator: 'high',
          contributingCommodities: ['gold', 'silver', 'wheat'],
        },
      ],
      options: {
        includeMetadata: true,
        includeHeaders: true,
        filename: 'greco-export.csv',
      },
    },
  })
}
