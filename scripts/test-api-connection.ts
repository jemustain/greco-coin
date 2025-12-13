/**
 * Test API Connection Script
 * 
 * T009: Verify FRED and World Bank APIs respond successfully with sample data
 * 
 * Usage: npm run test:api-connection
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local (Next.js convention)
config({ path: resolve(process.cwd(), '.env.local') });

import axios from 'axios';
import { API_CONFIG, validateApiConfig } from '../src/lib/config/api-config';
import { fredResponseSchema, worldBankResponseSchema } from '../src/lib/validation/price-schema';

interface TestResult {
  api: string;
  success: boolean;
  message: string;
  details?: any;
}

async function testFredApi(): Promise<TestResult> {
  const { apiKey } = API_CONFIG.fred;
  
  if (!apiKey) {
    return {
      api: 'FRED',
      success: false,
      message: 'FRED_API_KEY not configured in environment',
    };
  }

  try {
    // Test with Federal Funds Rate (DFF) - a reliable series for testing
    const response = await axios.get(
      `${API_CONFIG.fred.baseUrl}/series/observations`,
      {
        params: {
          series_id: 'DFF',
          api_key: apiKey,
          file_type: 'json',
          limit: 10,
          sort_order: 'desc',
        },
        timeout: API_CONFIG.fred.timeout,
      }
    );

    // Validate response with zod schema
    const validatedData = fredResponseSchema.parse(response.data);
    
    const observationCount = validatedData.observations.length;
    const latestDate = validatedData.observations[0]?.date || 'N/A';
    const latestValue = validatedData.observations[0]?.value || 'N/A';

    return {
      api: 'FRED',
      success: true,
      message: `Successfully connected to FRED API`,
      details: {
        observationCount,
        latestDate,
        latestValue: latestValue !== '.' ? `${latestValue}%` : 'N/A',
        seriesId: 'DFF',
        note: 'API key is valid. Commodity series will be tested during Phase 4 implementation.',
      },
    };
  } catch (error: any) {
    return {
      api: 'FRED',
      success: false,
      message: `Failed to fetch from FRED API: ${error.message}`,
      details: error.response?.data || error.message,
    };
  }
}

async function testWorldBankApi(): Promise<TestResult> {
  try {
    // Test with a simple health check - get indicator list
    const response = await axios.get(
      `${API_CONFIG.worldBank.baseUrl}/indicators`,
      {
        params: {
          format: 'json',
          per_page: 1,
        },
        timeout: API_CONFIG.worldBank.timeout,
      }
    );

    // World Bank returns array with [metadata, data]
    if (!Array.isArray(response.data) || response.data.length < 2) {
      return {
        api: 'World Bank',
        success: false,
        message: 'Unexpected response format from World Bank API',
        details: response.data,
      };
    }

    const [metadata, indicators] = response.data;
    
    if (!indicators || indicators.length === 0) {
      return {
        api: 'World Bank',
        success: false,
        message: 'No indicators returned from World Bank API',
      };
    }
    
    return {
      api: 'World Bank',
      success: true,
      message: `Successfully connected to World Bank API`,
      details: {
        totalIndicators: metadata.total,
        totalPages: metadata.pages,
        apiVersion: 'v2',
      },
    };
  } catch (error: any) {
    return {
      api: 'World Bank',
      success: false,
      message: `Failed to fetch from World Bank API: ${error.message}`,
      details: error.response?.data || error.message,
    };
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('API Connection Test');
  console.log('='.repeat(60));
  console.log();

  // Validate configuration
  console.log('📋 Validating API configuration...');
  const configValidation = validateApiConfig();
  
  if (!configValidation.valid) {
    console.log('⚠️  Configuration warnings:');
    configValidation.errors.forEach(error => console.log(`   - ${error}`));
    console.log();
    console.log('💡 Fix: Add your FRED_API_KEY to .env.local');
    console.log('   World Bank API will still be tested (no key required)');
    console.log();
  } else {
    console.log('✅ Configuration valid');
    console.log();
  }

  // Test APIs
  const results: TestResult[] = [];

  console.log('🔍 Testing FRED API...');
  const fredResult = await testFredApi();
  results.push(fredResult);
  
  if (fredResult.success) {
    console.log(`✅ ${fredResult.message}`);
    console.log(`   Latest: ${fredResult.details.latestValue} on ${fredResult.details.latestDate}`);
  } else {
    console.log(`❌ ${fredResult.message}`);
    if (fredResult.details) {
      console.log(`   Details: ${JSON.stringify(fredResult.details, null, 2)}`);
    }
  }
  console.log();

  console.log('🔍 Testing World Bank API...');
  const wbResult = await testWorldBankApi();
  results.push(wbResult);
  
  if (wbResult.success) {
    console.log(`✅ ${wbResult.message}`);
    console.log(`   Latest: ${wbResult.details.latestValue} on ${wbResult.details.latestDate}`);
  } else {
    console.log(`❌ ${wbResult.message}`);
    if (wbResult.details) {
      console.log(`   Details: ${JSON.stringify(wbResult.details, null, 2)}`);
    }
  }
  console.log();

  // Summary
  console.log('='.repeat(60));
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  if (successCount === totalCount) {
    console.log(`✅ All ${totalCount} API connections successful!`);
    console.log('🎉 You are ready to fetch commodity data.');
    process.exit(0);
  } else if (successCount > 0) {
    console.log(`⚠️  ${successCount}/${totalCount} API connections successful`);
    console.log();
    console.log('✅ Partial success: You can fetch data from working APIs');
    console.log('💡 To enable all APIs, configure missing credentials');
    process.exit(0);
  } else {
    console.log(`❌ ${successCount}/${totalCount} API connections successful`);
    console.log('❌ Fix the failing connections before proceeding.');
    process.exit(1);
  }
}

// Run the test
main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
