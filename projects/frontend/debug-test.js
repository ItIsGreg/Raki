#!/usr/bin/env node

const BASE_URL = 'http://localhost:8000';

async function debugTest() {
  console.log('🔍 Debug Test - Comparing requests\n');

  // First login to get a token
  const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'debug@test.com',
      password: 'testpass123'
    }),
  });

  const loginData = await loginResponse.json();
  const token = loginData.access_token;
  console.log('🔑 Got token, length:', token.length);

  // Test the exact same request that works manually
  const profilePayload = {
    name: 'Debug Profile',
    description: 'Debug test',
    mode: 'datapoint_extraction'
  };

  console.log('\n📋 Testing profile creation...');
  console.log('Payload:', JSON.stringify(profilePayload, null, 2));
  console.log('Token (first 20 chars):', token.substring(0, 20) + '...');

  const response = await fetch(`${BASE_URL}/data/profiles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(profilePayload),
  });

  console.log('\n📊 Response details:');
  console.log('Status:', response.status);
  console.log('Headers:', Object.fromEntries(response.headers.entries()));

  const responseText = await response.text();
  console.log('Body length:', responseText.length);
  console.log('Body (first 200 chars):', responseText.substring(0, 200));

  if (response.ok) {
    console.log('\n✅ SUCCESS! Profile created');
    try {
      const data = JSON.parse(responseText);
      console.log('Profile ID:', data.id);
    } catch (e) {
      console.log('Could not parse response as JSON');
    }
  } else {
    console.log('\n❌ FAILED! Profile creation error');
    try {
      const errorData = JSON.parse(responseText);
      console.log('Error details:', JSON.stringify(errorData, null, 2));
    } catch (e) {
      console.log('Could not parse error as JSON');
    }
  }
}

debugTest().catch(console.error); 