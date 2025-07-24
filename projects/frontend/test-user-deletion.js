const API_BASE = 'http://localhost:8000';

async function testUserDeletion() {
  console.log('🚀 Testing User Deletion Endpoints');
  
  const timestamp = Date.now();
  const testEmail = `cypress-test-user-${timestamp}@example.com`;
  
  try {
    // 1. Create a test user
    console.log('\n1. Creating test user...');
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'testpassword123'
      })
    });
    
    if (!registerResponse.ok) {
      const error = await registerResponse.json();
      console.error('Failed to create user:', error);
      return;
    }
    
    const user = await registerResponse.json();
    console.log('✅ Test user created:', user.email);
    
    // 2. Login to get token
    console.log('\n2. Logging in...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'testpassword123'
      })
    });
    
    if (!loginResponse.ok) {
      const error = await loginResponse.json();
      console.error('Failed to login:', error);
      return;
    }
    
    const { access_token } = await loginResponse.json();
    console.log('✅ Logged in successfully');
    
    // 3. Create some test data (workspace, profile, etc.)
    console.log('\n3. Creating test workspace...');
    const workspaceResponse = await fetch(`${API_BASE}/data/workspaces`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      },
      body: JSON.stringify({
        name: 'Test Workspace',
        description: 'Test workspace for deletion',
        storage_type: 'cloud'
      })
    });
    
    if (workspaceResponse.ok) {
      const workspace = await workspaceResponse.json();
      console.log('✅ Test workspace created:', workspace.name);
    } else {
      console.log('⚠️ Workspace creation failed (may not be implemented yet)');
    }
    
    // 4. Test self-deletion endpoint
    console.log('\n4. Testing self-deletion endpoint...');
    const deleteResponse = await fetch(`${API_BASE}/auth/me`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    
    if (!deleteResponse.ok) {
      const error = await deleteResponse.json();
      console.error('Self-deletion failed:', error);
      return;
    }
    
    const deleteResult = await deleteResponse.json();
    console.log('✅ Self-deletion successful:', deleteResult.message);
    
    // 5. Verify user is deleted (should fail to get user info)
    console.log('\n5. Verifying user is deleted...');
    const verifyResponse = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    
    if (verifyResponse.status === 401 || verifyResponse.status === 404) {
      console.log('✅ User successfully deleted (token no longer valid)');
    } else {
      console.log('⚠️ User may still exist');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

async function testCleanupEndpoint() {
  console.log('\n\n🧹 Testing Cleanup Endpoint');
  
  const timestamp = Date.now();
  const testEmail = `cypress-demo-user-${timestamp}@test.com`;
  
  try {
    // 1. Create another test user (for cleanup endpoint test)
    console.log('\n1. Creating another test user...');
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'testpassword123'
      })
    });
    
    if (!registerResponse.ok) {
      const error = await registerResponse.json();
      console.error('Failed to create user:', error);
      return;
    }
    
    const user = await registerResponse.json();
    console.log('✅ Test user created:', user.email);
    
    // 2. Test cleanup endpoint
    console.log('\n2. Testing cleanup endpoint...');
    const cleanupResponse = await fetch(`${API_BASE}/auth/test-cleanup/${testEmail}`, {
      method: 'DELETE',
      headers: {
        'X-Test-Token': 'test-cleanup-secret-2024'
      }
    });
    
    if (!cleanupResponse.ok) {
      const error = await cleanupResponse.json();
      console.error('Cleanup failed:', error);
      return;
    }
    
    const cleanupResult = await cleanupResponse.json();
    console.log('✅ Cleanup successful:', cleanupResult.message);
    
    // 3. Test safety measures
    console.log('\n3. Testing safety measures...');
    
    // Test with invalid email pattern
    const safetyResponse = await fetch(`${API_BASE}/auth/test-cleanup/regular-user@gmail.com`, {
      method: 'DELETE',
      headers: {
        'X-Test-Token': 'test-cleanup-secret-2024'
      }
    });
    
    if (safetyResponse.status === 403) {
      console.log('✅ Safety check passed: non-test email rejected');
    } else {
      console.log('⚠️ Safety check failed: non-test email was allowed');
    }
    
    // Test with invalid token
    const tokenResponse = await fetch(`${API_BASE}/auth/test-cleanup/cypress-another-test@test.com`, {
      method: 'DELETE',
      headers: {
        'X-Test-Token': 'wrong-token'
      }
    });
    
    if (tokenResponse.status === 403) {
      console.log('✅ Safety check passed: wrong token rejected');
    } else {
      console.log('⚠️ Safety check failed: wrong token was allowed');
    }
    
  } catch (error) {
    console.error('Cleanup test failed:', error);
  }
}

// Run tests
console.log('Make sure the backend is running on http://localhost:8000');
console.log('Starting tests in 2 seconds...\n');

setTimeout(async () => {
  await testUserDeletion();
  await testCleanupEndpoint();
  console.log('\n🎉 All tests completed!');
}, 2000); 