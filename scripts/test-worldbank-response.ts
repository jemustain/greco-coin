/**
 * Quick test to see what World Bank API actually returns
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import axios from 'axios';

async function testWorldBank() {
  try {
    console.log('Discovering World Bank data sources...\n');
    
    // First, list all sources to find commodity data
    const sourcesResponse = await axios.get(
      'https://api.worldbank.org/v2/source',
      {
        params: {
          format: 'json',
          per_page: 100,
        },
      }
    );
    
    if (Array.isArray(sourcesResponse.data) && sourcesResponse.data.length === 2) {
      const [meta, sources] = sourcesResponse.data;
      console.log('Available data sources:\n');
      for (const source of sources) {
        if (source.name.toLowerCase().includes('commodity') || 
            source.name.toLowerCase().includes('price') ||
            source.name.toLowerCase().includes('pink')) {
          console.log(`  ID ${source.id}: ${source.name}`);
        }
      }
    }
    
    console.log('\n\nNow testing with Source 2 (Global Economic Monitor)...\n');
    
    // Try source 2 which is often commodity prices
    const response = await axios.get(
      'https://api.worldbank.org/v2/indicator',
      {
        params: {
          format: 'json',
          per_page: 500,
          source: 2, // Try different source
        },
      }
    );
    
    if (Array.isArray(response.data) && response.data.length === 2) {
      const [metadata, indicators] = response.data;
      console.log(`Found ${indicators.length} commodity indicators\n`);
      
      // Filter for metal commodities
      const metals = indicators.filter((ind: any) => 
        ind.name.toLowerCase().includes('copper') ||
        ind.name.toLowerCase().includes('gold') ||
        ind.name.toLowerCase().includes('silver') ||
        ind.name.toLowerCase().includes('aluminum') ||
        ind.name.toLowerCase().includes('nickel') ||
        ind.name.toLowerCase().includes('platinum')
      );
      
      console.log('Metal commodity indicators:');
      for (const ind of metals) {
        console.log(`  ${ind.id}: ${ind.name}`);
      }
      
      // If no metals found, show all indicators starting with 'C', 'G', 'S', 'A', 'N', 'P'
      if (metals.length === 0) {
        console.log('\nShowing all indicators (first 50):');
        for (let i = 0; i < Math.min(50, indicators.length); i++) {
          const ind = indicators[i];
          console.log(`  ${ind.id}: ${ind.name}`);
        }
      }
      
      // Test direct commodity indicators based on CMO pattern
      console.log('\n\nTesting direct commodity indicator patterns...\n');
      
      const testIndicators = [
        'PCOPPUSDM', // Copper, $/mt
        'PCOPP', // Copper alternative
        'CM.MKT.TRAD.CD', // Commodities
      ];
      
      for (const indicatorId of testIndicators) {
        console.log(`Testing: ${indicatorId}`);
        try {
          const testResp = await axios.get(
            `https://api.worldbank.org/v2/country/WLD/indicator/${indicatorId}`,
            {
              params: { format: 'json', date: '2023:2024', per_page: 5 },
            }
          );
          
          if (Array.isArray(testResp.data) && testResp.data.length === 2 && !testResp.data[0].message) {
            const [meta, data] = testResp.data;
            console.log(`  ✓ SUCCESS! Got ${data.length} data points`);
            console.log(`    Sample:`, JSON.stringify(data[0], null, 2));
            break;
          }
        } catch (e: any) {
          console.log(`  ✗ Failed: ${e.response?.data?.[0]?.message?.[0]?.value || e.message}`);
        }
      }
      
      // Now test with metals if found
      const copperIndicator = metals.find((m: any) => m.name.toLowerCase().includes('copper'));
      
      if (false && copperIndicator) {
        console.log(`Using indicator: ${copperIndicator.id} - ${copperIndicator.name}\n`);
        
        const dataResponse = await axios.get(
          `https://api.worldbank.org/v2/country/WLD/indicator/${copperIndicator.id}`,
          {
            params: {
              format: 'json',
              date: '2023:2024',
              per_page: 50,
            },
          }
        );
        
        if (Array.isArray(dataResponse.data) && dataResponse.data.length === 2) {
          const [dataMeta, dataPoints] = dataResponse.data;
          console.log(`Success! Fetched ${dataPoints.length} data points`);
          console.log('Sample data points:', JSON.stringify(dataPoints.slice(0, 3), null, 2));
        }
      }
    } else {
      console.log('Status:', response.status);
      console.log('Data type:', typeof response.data);
      console.log('Data length:', response.data?.length);
      console.log('Full response:', JSON.stringify(response.data, null, 2));
    }
  } catch (error: any) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testWorldBank();
