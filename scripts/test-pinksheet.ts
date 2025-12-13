/**
 * Test World Bank Pink Sheet Commodity Data
 * According to their actual API docs, commodity data is in a different format
 */

import axios from 'axios';

async function testPinkSheet() {
  console.log('Testing World Bank Pink Sheet commodity data...\n');
  
  // The Pink Sheet data might be in a different API endpoint
  // Let's try the actual documented approach
  
  const tests = [
    {
      name: 'Copper - World (monthly)',
      url: 'https://api.worldbank.org/v2/en/indicator/PCOPPUSDM',
      params: { downloadformat: 'csv' }
    },
    {
      name: 'Try without country code',
      url: 'https://api.worldbank.org/v2/sources/2/indicators/PCOPPUSDM/data',
      params: { format: 'json', date: '2023M01:2024M12' }
    },
    {
      name: 'Try Pink Sheet CSV',
      url: 'https://thedocs.worldbank.org/en/doc/5d903e848db1d1b83e0ec8f744e55570-0350012021/related/CMO-Historical-Data-Monthly.xlsx',
      params: {}
    }
  ];
  
  for (const test of tests) {
    console.log(`\nTesting: ${test.name}`);
    console.log(`URL: ${test.url}`);
    try {
      const response = await axios.get(test.url, {
        params: test.params,
        maxRedirects: 5,
        validateStatus: () => true, // Accept any status
      });
      
      console.log(`  Status: ${response.status}`);
      console.log(`  Content-Type: ${response.headers['content-type']}`);
      
      if (response.status === 200) {
        const dataStr = typeof response.data === 'string' 
          ? response.data.substring(0, 500) 
          : JSON.stringify(response.data).substring(0, 500);
        console.log(`  Data preview: ${dataStr}...`);
      }
    } catch (error: any) {
      console.log(`  Error: ${error.message}`);
    }
  }
  
  console.log('\n\nConclusion: World Bank commodity price API may require Excel/CSV download');
  console.log('or use a different API structure than documented in research.');
  console.log('\nRecommendation: Focus on FRED API and manually verify series IDs');
}

testPinkSheet();
