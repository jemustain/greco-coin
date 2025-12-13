/**
 * API Route: Greco Time Series
 * 
 * Provides Greco values for a date range, using the optimized calculator.
 * This API route runs server-side where fs module is available.
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculateGrecoTimeSeriesOptimized } from '@/lib/data/calculator-optimized';

export const dynamic = 'force-dynamic'; // Ensure fresh data
export const runtime = 'nodejs'; // Required for fs module

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const currency = searchParams.get('currency') || 'USD';
    const interval = (searchParams.get('interval') || 'monthly') as 'monthly' | 'quarterly' | 'annual';
    
    if (!startDateStr || !endDateStr) {
      return NextResponse.json(
        { error: 'Missing required parameters: startDate and endDate' },
        { status: 400 }
      );
    }
    
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use ISO 8601 format (YYYY-MM-DD)' },
        { status: 400 }
      );
    }
    
    // Calculate Greco time series
    const grecoValues = await calculateGrecoTimeSeriesOptimized(
      startDate,
      endDate,
      currency,
      interval
    );
    
    return NextResponse.json({
      startDate: startDateStr,
      endDate: endDateStr,
      currency,
      interval,
      values: grecoValues,
      count: grecoValues.length,
    });
    
  } catch (error) {
    console.error('Error calculating Greco time series:', error);
    return NextResponse.json(
      { error: 'Failed to calculate Greco time series', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
