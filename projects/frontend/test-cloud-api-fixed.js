#!/usr/bin/env node

/**
 * Fixed Cloud API Test Script - Using the working fetch pattern
 */

const BASE_URL = 'http://localhost:8000';

async function runTests() {
  console.log('🚀 Starting Fixed Cloud API Tests\n');

  try {
    const timestamp = Date.now();
    const user1Email = `test1-${timestamp}@example.com`;
    const user2Email = `test2-${timestamp}@example.com`;

    // Test 1: User Registration
    console.log('📝 Test 1: User Registration');
    
    const register1Response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user1Email,
        password: 'testpassword123'
      }),
    });
    
    if (!register1Response.ok) {
      throw new Error(`User 1 registration failed: ${register1Response.status}`);
    }
    
    const register2Response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user2Email,
        password: 'testpassword123'
      }),
    });
    
    if (!register2Response.ok) {
      throw new Error(`User 2 registration failed: ${register2Response.status}`);
    }
    
    console.log('✅ User registration works\n');

    // Test 2: User Login
    console.log('🔐 Test 2: User Login');
    
    const login1Response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user1Email,
        password: 'testpassword123'
      }),
    });
    
    if (!login1Response.ok) {
      throw new Error(`User 1 login failed: ${login1Response.status}`);
    }
    
    const login1Data = await login1Response.json();
    const user1Token = login1Data.access_token;
    
    const login2Response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user2Email,
        password: 'testpassword123'
      }),
    });
    
    if (!login2Response.ok) {
      throw new Error(`User 2 login failed: ${login2Response.status}`);
    }
    
    const login2Data = await login2Response.json();
    const user2Token = login2Data.access_token;
    
    console.log('✅ User login works\n');

    // Test 3: Create Profile (User 1)
    console.log('👤 Test 3: Create Profile');
    
    const profileResponse = await fetch(`${BASE_URL}/data/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user1Token}`,
      },
      body: JSON.stringify({
        name: 'Test Profile',
        description: 'API test profile',
        mode: 'datapoint_extraction'
      }),
    });
    
    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.log('❌ Profile creation error:', errorText);
      throw new Error(`Profile creation failed: ${profileResponse.status}`);
    }
    
    const profileData = await profileResponse.json();
    console.log(`✅ Profile created with ID: ${profileData.id}\n`);

    // Test 4: Get Profiles (User 1)
    console.log('📋 Test 4: Get User Profiles');
    
    const getProfilesResponse = await fetch(`${BASE_URL}/data/profiles`, {
      headers: {
        'Authorization': `Bearer ${user1Token}`,
      },
    });
    
    if (!getProfilesResponse.ok) {
      throw new Error(`Get profiles failed: ${getProfilesResponse.status}`);
    }
    
    const profilesData = await getProfilesResponse.json();
    if (profilesData.length >= 1) {
      console.log(`✅ Found ${profilesData.length} profiles for user 1`);
    } else {
      throw new Error('Expected at least 1 profile');
    }
    console.log();

    // Test 5: User Isolation
    console.log('🔒 Test 5: User Isolation');
    
    const user2ProfilesResponse = await fetch(`${BASE_URL}/data/profiles`, {
      headers: {
        'Authorization': `Bearer ${user2Token}`,
      },
    });
    
    if (!user2ProfilesResponse.ok) {
      throw new Error(`User 2 get profiles failed: ${user2ProfilesResponse.status}`);
    }
    
    const user2ProfilesData = await user2ProfilesResponse.json();
    if (user2ProfilesData.length === 0) {
      console.log('✅ User isolation works - User 2 sees no profiles');
    } else {
      throw new Error('User isolation failed - User 2 can see other profiles');
    }
    console.log();

    // Test 6: Create Dataset
    console.log('📁 Test 6: Create Dataset');
    
    const datasetResponse = await fetch(`${BASE_URL}/data/datasets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user1Token}`,
      },
      body: JSON.stringify({
        name: 'Test Dataset',
        description: 'API test dataset',
        mode: 'datapoint_extraction'
      }),
    });
    
    if (!datasetResponse.ok) {
      const errorText = await datasetResponse.text();
      console.log('❌ Dataset creation error:', errorText);
      throw new Error(`Dataset creation failed: ${datasetResponse.status}`);
    }
    
    const datasetData = await datasetResponse.json();
    console.log(`✅ Dataset created with ID: ${datasetData.id}\n`);

    // Test 7: Authorization Tests
    console.log('🚫 Test 7: Unauthorized Access');
    
    const unauthorizedResponse = await fetch(`${BASE_URL}/data/profiles`);
    if (unauthorizedResponse.status === 401 || unauthorizedResponse.status === 403) {
      console.log('✅ Unauthorized access properly blocked');
    } else {
      throw new Error(`Expected 401/403, got ${unauthorizedResponse.status}`);
    }
    console.log();

    // Test 8: Invalid Token
    console.log('🔑 Test 8: Invalid Token');
    
    const invalidTokenResponse = await fetch(`${BASE_URL}/data/profiles`, {
      headers: {
        'Authorization': 'Bearer invalid-token-123',
      },
    });
    
    if (invalidTokenResponse.status === 401 || invalidTokenResponse.status === 403) {
      console.log('✅ Invalid token properly rejected');
    } else {
      throw new Error(`Expected 401/403, got ${invalidTokenResponse.status}`);
    }
    console.log();

    console.log('🎉 All tests passed! Cloud API is working correctly.\n');

  } catch (error) {
    console.log(`\n💥 Test failed: ${error.message}\n`);
    process.exit(1);
  }
}

runTests(); 