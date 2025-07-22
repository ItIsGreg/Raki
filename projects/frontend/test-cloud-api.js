#!/usr/bin/env node

/**
 * Cloud API End-to-End Test Script
 * 
 * This script tests the backend API endpoints to verify:
 * - User authentication
 * - Profile CRUD operations
 * - Dataset CRUD operations
 * - User isolation and security
 * 
 * Usage: node test-cloud-api.js
 */

const BASE_URL = 'http://localhost:8000';

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  console.log(`🔄 ${options.method || 'GET'} ${endpoint}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.log(`❌ HTTP ${response.status}:`, JSON.stringify(data, null, 2));
      throw new Error(`HTTP ${response.status}: ${data.detail || JSON.stringify(data)}`);
    }

    console.log(`✅ Success: ${response.status}`);
    return data;
  } catch (error) {
    if (error.name === 'SyntaxError') {
      console.log(`❌ JSON Parse Error: ${error.message}`);
      throw new Error(`Failed to parse JSON response: ${error.message}`);
    }
    console.log(`❌ Error: ${error.message}`);
    throw error;
  }
}

// Test suite
async function runTests() {
  console.log('🚀 Starting Cloud API Tests\n');
  
  let testUser1Token = null;
  let testUser2Token = null;
  let testProfileId = null;
  let testDatasetId = null;

  try {
    // Test 1: User Registration
    console.log('📝 Test 1: User Registration');
    const timestamp = Date.now();
    const user1Email = `test1-${timestamp}@example.com`;
    const user2Email = `test2-${timestamp}@example.com`;
    
    await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: user1Email,
        password: 'testpassword123'
      }),
    });
    
    await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: user2Email,
        password: 'testpassword123'
      }),
    });
    console.log('✅ User registration works\n');

    // Test 2: User Login
    console.log('🔐 Test 2: User Login');
    const loginResponse1 = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: user1Email,
        password: 'testpassword123'
      }),
    });
    testUser1Token = loginResponse1.access_token;

    // Add a small delay to avoid potential race conditions
    await new Promise(resolve => setTimeout(resolve, 100));

    const loginResponse2 = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: user2Email,
        password: 'testpassword123'
      }),
    });
    testUser2Token = loginResponse2.access_token;
    console.log('✅ User login works\n');

    // Test 3: Create Profile (User 1)
    console.log('👤 Test 3: Create Profile');
    
    // Debug: Let's check if the token is valid first
    const userCheck = await apiCall('/auth/me', {
      headers: {
        'Authorization': `Bearer ${testUser1Token}`,
      },
    });
    console.log('🔍 Token valid for user:', userCheck.email);
    
    const profileResponse = await apiCall('/data/profiles', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testUser1Token}`,
      },
      body: JSON.stringify({
        name: 'Test Profile',
        description: 'API test profile',
        mode: 'datapoint_extraction'
      }),
    });
    testProfileId = profileResponse.id;
    console.log(`✅ Profile created with ID: ${testProfileId}\n`);

    // Test 4: Get Profiles (User 1)
    console.log('📋 Test 4: Get User Profiles');
    const profilesResponse = await apiCall('/data/profiles', {
      headers: {
        'Authorization': `Bearer ${testUser1Token}`,
      },
    });
    
    if (profilesResponse.length >= 1) {
      console.log(`✅ Found ${profilesResponse.length} profiles for user 1`);
    } else {
      throw new Error('Expected at least 1 profile');
    }
    console.log();

    // Test 5: User Isolation - User 2 shouldn't see User 1's profiles
    console.log('🔒 Test 5: User Isolation');
    const user2ProfilesResponse = await apiCall('/data/profiles', {
      headers: {
        'Authorization': `Bearer ${testUser2Token}`,
      },
    });
    
    if (user2ProfilesResponse.length === 0) {
      console.log('✅ User isolation works - User 2 sees no profiles');
    } else {
      throw new Error('User isolation failed - User 2 can see other profiles');
    }
    console.log();

    // Test 6: Create Dataset
    console.log('📁 Test 6: Create Dataset');
    const datasetResponse = await apiCall('/data/datasets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testUser1Token}`,
      },
      body: JSON.stringify({
        name: 'Test Dataset',
        description: 'API test dataset',
        mode: 'datapoint_extraction'
      }),
    });
    testDatasetId = datasetResponse.id;
    console.log(`✅ Dataset created with ID: ${testDatasetId}\n`);

    // Test 7: Get Datasets
    console.log('📂 Test 7: Get User Datasets');
    const datasetsResponse = await apiCall('/data/datasets', {
      headers: {
        'Authorization': `Bearer ${testUser1Token}`,
      },
    });
    
    if (datasetsResponse.length >= 1) {
      console.log(`✅ Found ${datasetsResponse.length} datasets for user 1`);
    } else {
      throw new Error('Expected at least 1 dataset');
    }
    console.log();

    // Test 8: Unauthorized Access
    console.log('🚫 Test 8: Unauthorized Access');
    try {
      await apiCall('/data/profiles');
      throw new Error('Should have failed without auth token');
    } catch (error) {
      if (error.message.includes('401') || error.message.includes('Could not validate credentials')) {
        console.log('✅ Unauthorized access properly blocked');
      } else {
        throw error;
      }
    }
    console.log();

    // Test 9: Invalid Token
    console.log('🔑 Test 9: Invalid Token');
    try {
      await apiCall('/data/profiles', {
        headers: {
          'Authorization': 'Bearer invalid-token-123',
        },
      });
      throw new Error('Should have failed with invalid token');
    } catch (error) {
      if (error.message.includes('401') || error.message.includes('Could not validate credentials')) {
        console.log('✅ Invalid token properly rejected');
      } else {
        throw error;
      }
    }
    console.log();

    // Test 10: Get User Info
    console.log('ℹ️  Test 10: Get User Info');
    const userInfoResponse = await apiCall('/auth/me', {
      headers: {
        'Authorization': `Bearer ${testUser1Token}`,
      },
    });
    
    if (userInfoResponse.email === user1Email) {
      console.log('✅ User info endpoint works correctly');
    } else {
      throw new Error('User info mismatch');
    }
    console.log();

    // Test 11: Profile Points
    console.log('🎯 Test 11: Profile Points');
    const profilePointResponse = await apiCall('/data/profile-points', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testUser1Token}`,
      },
      body: JSON.stringify({
        profile_id: testProfileId,
        name: 'Test Point',
        explanation: 'A test profile point',
        synonyms: ['test', 'sample'],
        datatype: 'string',
        order: 1
      }),
    });
    
    if (profilePointResponse.id) {
      console.log(`✅ Profile point created with ID: ${profilePointResponse.id}`);
    } else {
      throw new Error('Failed to create profile point');
    }
    console.log();

    console.log('🎉 All tests passed! Cloud API is working correctly.\n');

  } catch (error) {
    console.log(`\n💥 Test failed: ${error.message}\n`);
    process.exit(1);
  }
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  console.log('❌ This script requires Node.js 18+ for fetch support');
  console.log('💡 Alternative: Run "npm install node-fetch" and uncomment the import below\n');
  // const fetch = require('node-fetch');
  process.exit(1);
}

// Run the tests
runTests(); 