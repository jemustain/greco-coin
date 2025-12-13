/**
 * Test script for cache revalidation endpoint
 */

async function testRevalidation() {
  console.log('🧪 Testing Cache Revalidation Endpoint\n');
  
  const baseUrl = process.env.REVALIDATION_URL || 'http://localhost:3000/api/revalidate';
  const secret = process.env.REVALIDATION_SECRET || 'dev-secret-change-in-production';
  
  // Test 1: Invalid secret
  console.log('Test 1: Invalid Secret');
  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: 'wrong-secret', tags: ['test'] }),
    });
    
    if (response.status === 401) {
      console.log('   ✅ Correctly rejected invalid secret\n');
    } else {
      console.log(`   ❌ Unexpected status: ${response.status}\n`);
    }
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }
  
  // Test 2: Revalidate by tags
  console.log('Test 2: Revalidate by Tags');
  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        secret, 
        tags: ['commodity-prices', 'homepage', 'commodity-gold'] 
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Successfully revalidated');
      console.log(`   📊 Tags: ${data.tags.join(', ')}`);
      console.log(`   📅 Timestamp: ${data.timestamp}\n`);
    } else {
      console.log(`   ❌ Failed: ${response.status} ${response.statusText}\n`);
    }
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }
  
  // Test 3: Revalidate by path
  console.log('Test 3: Revalidate by Path');
  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, path: '/' }),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Successfully revalidated');
      console.log(`   📁 Path: ${data.path}`);
      console.log(`   📅 Timestamp: ${data.timestamp}\n`);
    } else {
      console.log(`   ❌ Failed: ${response.status} ${response.statusText}\n`);
    }
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }
  
  // Test 4: Missing parameters
  console.log('Test 4: Missing Parameters (should fail)');
  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret }),
    });
    
    if (response.status === 400) {
      console.log('   ✅ Correctly rejected missing parameters\n');
    } else {
      console.log(`   ❌ Unexpected status: ${response.status}\n`);
    }
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }
  
  console.log('✨ Tests complete!\n');
}

testRevalidation().catch(console.error);
