#!/usr/bin/env node

const BASE_URL = 'http://localhost:8000';

async function testAPI() {
  console.log('🚀 Simple API Test\n');

  try {
    // Test 1: Register a new user
    const userEmail = `test-${Date.now()}@example.com`;
    console.log('📝 Registering user:', userEmail);
    
    const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userEmail,
        password: 'testpass123'
      }),
    });
    
    if (!registerResponse.ok) {
      throw new Error(`Registration failed: ${registerResponse.status}`);
    }
    
    const registerData = await registerResponse.json();
    console.log('✅ User registered:', registerData.id);

    // Test 2: Login
    console.log('\n🔐 Logging in...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userEmail,
        password: 'testpass123'
      }),
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.access_token;
    console.log('✅ Login successful, token received');

    // Test 3: Create Profile
    console.log('\n👤 Creating profile...');
    const profilePayload = {
      name: 'Test Profile',
      description: 'API test profile',
      mode: 'datapoint_extraction'
    };
    
    console.log('📋 Profile payload:', JSON.stringify(profilePayload, null, 2));
    
    const profileResponse = await fetch(`${BASE_URL}/data/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profilePayload),
    });
    
    console.log('📊 Profile response status:', profileResponse.status);
    
    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.log('❌ Profile error response:', errorText);
      throw new Error(`Profile creation failed: ${profileResponse.status}`);
    }
    
    const profileData = await profileResponse.json();
    console.log('✅ Profile created:', profileData.id);
    console.log('📋 Profile data:', JSON.stringify(profileData, null, 2));

    console.log('\n🎉 All tests passed!');

  } catch (error) {
    console.log('\n💥 Test failed:', error.message);
    process.exit(1);
  }
}

testAPI(); 