#!/usr/bin/env node

/**
 * Test script for the analytics endpoint
 * Run this after setting up the database and starting the dev server
 */

const BASE_URL = 'http://localhost:3000'

async function testAnalyticsEndpoint() {
  console.log('🧪 Testing Analytics Endpoint...\n')

  try {
    // Test 1: Unauthenticated request (should fail)
    console.log('1. Testing unauthenticated request...')
    const unauthResponse = await fetch(`${BASE_URL}/api/analytics/summary`)
    console.log(`   Status: ${unauthResponse.status} (expected: 401)`)
    console.log(`   Result: ${unauthResponse.status === 401 ? '✅ PASS' : '❌ FAIL'}\n`)

    // Test 2: Test with invalid auth (you'll need to set up a test user first)
    console.log('2. Testing with invalid auth...')
    console.log('   Note: This requires setting up a test user in the database')
    console.log('   You can manually test this through the admin interface\n')

    // Test 3: Check if the endpoint is accessible
    console.log('3. Checking endpoint accessibility...')
    const optionsResponse = await fetch(`${BASE_URL}/api/analytics/summary`, {
      method: 'OPTIONS'
    })
    console.log(`   Status: ${optionsResponse.status}`)
    console.log(`   Result: ${optionsResponse.status < 500 ? '✅ PASS' : '❌ FAIL'}\n`)

    console.log('📋 Manual Testing Steps:')
    console.log('1. Start your dev server: npm run dev')
    console.log('2. Navigate to /admin and log in')
    console.log('3. Click "View Analytics" button')
    console.log('4. Test both site-wide and listing-specific views')
    console.log('5. Verify role-based access control works correctly\n')

    console.log('🔧 Database Setup Required:')
    console.log('- Run scripts/add-role-column.sql in Supabase')
    console.log('- Run scripts/create-user-events-table.sql if needed')
    console.log('- Update internal team roles to "internal_admin"')
    console.log('- Ensure user_events table has some test data')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('\n💡 Make sure your dev server is running on port 3000')
  }
}

// Run the test
testAnalyticsEndpoint() 