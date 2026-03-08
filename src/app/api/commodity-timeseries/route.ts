/**
 * API Route: Commodity Time Series
 * 
 * Returns price data for selected commodities within a date range.
 */

import { NextRequest, NextResponse } from 'next/server';
import { loadPrices, loadCommodities } from '@/lib/data/loader';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const commoditiesParam = searchParams.get('commodities');
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const interval = (searchParams.get('interval') || 'monthly') as 'monthly' | 'quarterly' | 'annual';
    
    if (!commoditiesParam) {
      return NextResponse.json(
        { error: 'Missing required parameter: commodities (comma-separated IDs)' },
        { status: 400 }
      );
    }
    
    const commodityIds = commoditiesParam.split(',').map(s => s.trim()).filter(Boolean);
    
    if (commodityIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one commodity ID is required' },
        { status: 400 }
      );
    }
    
    if (commodityIds.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 commodities per request' },
        { status: 400 }
      );
    }
    
    // Validate commodity IDs
    const allCommodities = await loadCommodities();
    const validIds = new Set(allCommodities.map(c => c.id));
    const invalidIds = commodityIds.filter(id => !validIds.has(id));
    
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: `Invalid commodity IDs: ${invalidIds.join(', ')}` },
        { status: 400 }
      );
    }
    
    const startDate = startDateStr ? new Date(startDateStr) : null;
    const endDate = endDateStr ? new Date(endDateStr) : null;
    
    // Load prices for each requested commodity
    const result: Record<string, Array<{ date: string; price: number; unit: string; quality: string }>> = {};
    
    for (const commodityId of commodityIds) {
      const prices = await loadPrices(commodityId);
      
      let filtered = prices;
      
      // Filter by date range
      if (startDate) {
        filtered = filtered.filter(p => p.date >= startDate);
      }
      if (endDate) {
        filtered = filtered.filter(p => p.date <= endDate);
      }
      
      // Sort chronologically
      filtered.sort((a, b) => a.date.getTime() - b.date.getTime());
      
      // Apply interval sampling
      if (interval === 'quarterly') {
        const sampled: typeof filtered = [];
        let lastQuarter = -1;
        for (const p of filtered) {
          const quarter = Math.floor(p.date.getMonth() / 3);
          const year = p.date.getFullYear();
          const key = year * 4 + quarter;
          if (key !== lastQuarter) {
            sampled.push(p);
            lastQuarter = key;
          }
        }
        filtered = sampled;
      } else if (interval === 'annual') {
        const sampled: typeof filtered = [];
        let lastYear = -1;
        for (const p of filtered) {
          const year = p.date.getFullYear();
          if (year !== lastYear) {
            sampled.push(p);
            lastYear = year;
          }
        }
        filtered = sampled;
      }
      
      result[commodityId] = filtered.map(p => ({
        date: p.date.toISOString().split('T')[0],
        price: p.priceUSD,
        unit: p.unit,
        quality: p.qualityIndicator || 'unknown',
      }));
    }
    
    // Include commodity metadata
    const metadata = commodityIds.map(id => {
      const commodity = allCommodities.find(c => c.id === id);
      return {
        id,
        name: commodity?.name || id,
        category: commodity?.category || 'Unknown',
        unit: commodity?.unit || '',
      };
    });
    
    return NextResponse.json({
      commodities: result,
      metadata,
      startDate: startDateStr,
      endDate: endDateStr,
      interval,
    });
    
  } catch (error) {
    console.error('Error loading commodity time series:', error);
    return NextResponse.json(
      { error: 'Failed to load commodity time series', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
