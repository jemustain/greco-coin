/**
 * T024: Update commodities.json with new metadata fields
 * 
 * Adds: primarySource, fredSeriesId, updatePriority fields
 * from our commodity-mapping.ts configuration
 */

import * as fs from 'fs';
import * as path from 'path';
import { COMMODITY_MAPPINGS } from '../src/lib/api/config/commodity-mapping';

interface OldCommodity {
  id: string;
  name: string;
  category: string;
  unit: string;
  symbol: string;
  description: string;
  inceptionDate: string;
  metadata?: Record<string, any>;
}

interface NewCommodity extends OldCommodity {
  primarySource?: string;
  fredSeriesId?: string;
  worldBankIndicator?: string;
  updatePriority?: string;
}

async function updateCommoditiesJson() {
  console.log('📝 Updating commodities.json with API metadata...\n');
  
  const commoditiesPath = path.join(__dirname, '../src/data/commodities.json');
  const rawData = fs.readFileSync(commoditiesPath, 'utf-8');
  const commodities: OldCommodity[] = JSON.parse(rawData);
  
  console.log(`📦 Found ${commodities.length} commodities\n`);
  
  const updated: NewCommodity[] = commodities.map(commodity => {
    const mapping = COMMODITY_MAPPINGS[commodity.id];
    
    if (!mapping) {
      console.log(`⚠️  ${commodity.id}: No mapping found, skipping API fields`);
      return commodity;
    }
    
    // Extract from mapping structure
    const primarySource = mapping.primarySource;
    const fredSeriesId = mapping.fredSeriesId;
    const worldBankIndicator = mapping.worldBankIndicatorId;
    
    const updatePriority = (() => {
      switch (mapping.updatePriority) {
        case 'P1-daily': return 'high';
        case 'P2-weekly': return 'high';
        case 'P3-monthly': return 'medium';
        case 'P4-quarterly': return 'low';
        default: return 'low';
      }
    })();
    
    console.log(`✅ ${commodity.id}: ${primarySource} (${updatePriority})`);
    
    const updated: NewCommodity = {
      ...commodity,
      primarySource,
      updatePriority
    };
    
    if (fredSeriesId) {
      updated.fredSeriesId = fredSeriesId;
    }
    if (worldBankIndicator) {
      updated.worldBankIndicator = worldBankIndicator;
    }
    
    return updated;
  });
  
  // Write updated file
  fs.writeFileSync(commoditiesPath, JSON.stringify(updated, null, 2));
  
  console.log(`\n✨ Updated commodities.json successfully!`);
  console.log(`   📄 File: ${commoditiesPath}`);
  console.log(`   📦 ${updated.length} commodities updated`);
}

updateCommoditiesJson().catch(console.error);
