/**
 * API Route: Production Time Series
 *
 * Returns annual world production volume data for selected commodities.
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { loadCommodities } from '@/lib/data/loader';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface ProductionPoint {
  year: number;
  production: number;
  unit: string;
  source: string;
  quality: string;
}

// Static imports for all 33 production files
import goldProd from '@/data/production/gold.json';
import silverProd from '@/data/production/silver.json';
import ironProd from '@/data/production/iron.json';
import copperProd from '@/data/production/copper.json';
import aluminumProd from '@/data/production/aluminum.json';
import tinProd from '@/data/production/tin.json';
import leadProd from '@/data/production/lead.json';
import zincProd from '@/data/production/zinc.json';
import nickelProd from '@/data/production/nickel.json';
import platinumProd from '@/data/production/platinum.json';
import petroleumProd from '@/data/production/petroleum.json';
import naturalGasProd from '@/data/production/natural-gas.json';
import cementProd from '@/data/production/cement.json';
import rubberProd from '@/data/production/rubber.json';
import sulphurProd from '@/data/production/sulphur.json';
import riceProd from '@/data/production/rice.json';
import wheatProd from '@/data/production/wheat.json';
import cornProd from '@/data/production/corn.json';
import barleyProd from '@/data/production/barley.json';
import oatsProd from '@/data/production/oats.json';
import ryeProd from '@/data/production/rye.json';
import peanutsProd from '@/data/production/peanuts.json';
import soyBeansProd from '@/data/production/soy-beans.json';
import coffeeProd from '@/data/production/coffee.json';
import cocoaProd from '@/data/production/cocoa.json';
import sugarProd from '@/data/production/sugar.json';
import cottonProd from '@/data/production/cotton.json';
import cottonSeedProd from '@/data/production/cotton-seed.json';
import woolProd from '@/data/production/wool.json';
import juteProd from '@/data/production/jute.json';
import hidesProd from '@/data/production/hides.json';
import copraProd from '@/data/production/copra.json';
import tallowProd from '@/data/production/tallow.json';

const productionDataMap: Record<string, ProductionPoint[]> = {
  gold: goldProd as ProductionPoint[],
  silver: silverProd as ProductionPoint[],
  iron: ironProd as ProductionPoint[],
  copper: copperProd as ProductionPoint[],
  aluminum: aluminumProd as ProductionPoint[],
  tin: tinProd as ProductionPoint[],
  lead: leadProd as ProductionPoint[],
  zinc: zincProd as ProductionPoint[],
  nickel: nickelProd as ProductionPoint[],
  platinum: platinumProd as ProductionPoint[],
  petroleum: petroleumProd as ProductionPoint[],
  'natural-gas': naturalGasProd as ProductionPoint[],
  cement: cementProd as ProductionPoint[],
  rubber: rubberProd as ProductionPoint[],
  sulphur: sulphurProd as ProductionPoint[],
  rice: riceProd as ProductionPoint[],
  wheat: wheatProd as ProductionPoint[],
  corn: cornProd as ProductionPoint[],
  barley: barleyProd as ProductionPoint[],
  oats: oatsProd as ProductionPoint[],
  rye: ryeProd as ProductionPoint[],
  peanuts: peanutsProd as ProductionPoint[],
  'soy-beans': soyBeansProd as ProductionPoint[],
  coffee: coffeeProd as ProductionPoint[],
  cocoa: cocoaProd as ProductionPoint[],
  sugar: sugarProd as ProductionPoint[],
  cotton: cottonProd as ProductionPoint[],
  'cotton-seed': cottonSeedProd as ProductionPoint[],
  wool: woolProd as ProductionPoint[],
  jute: juteProd as ProductionPoint[],
  hides: hidesProd as ProductionPoint[],
  copra: copraProd as ProductionPoint[],
  tallow: tallowProd as ProductionPoint[],
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const commoditiesParam = searchParams.get('commodities');
    const startYear = parseInt(searchParams.get('startYear') || '1970', 10);
    const endYear = parseInt(searchParams.get('endYear') || '2023', 10);

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

    // No limit on number of commodities per request

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

    const result: Record<string, ProductionPoint[]> = {};
    const metadata: Array<{ id: string; name: string; unit: string; yearRange: [number, number] }> = [];

    for (const id of commodityIds) {
      const data = productionDataMap[id];
      if (!data || data.length === 0) {
        result[id] = [];
        continue;
      }

      const filtered = data
        .filter(p => p.year >= startYear && p.year <= endYear)
        .sort((a, b) => a.year - b.year);

      result[id] = filtered;

      const commodity = allCommodities.find(c => c.id === id);
      if (filtered.length > 0) {
        metadata.push({
          id,
          name: commodity?.name || id,
          unit: filtered[0].unit,
          yearRange: [filtered[0].year, filtered[filtered.length - 1].year],
        });
      }
    }

    return NextResponse.json({
      commodities: result,
      metadata,
    });
  } catch (error) {
    console.error('Production timeseries error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
