const API_BASE = 'http://localhost:8000';

async function testDeleteAccountUI() {
  console.log('🧪 Testing Delete Account UI Flow');
  
  const timestamp = Date.now();
  const testEmail = `ui-test-user-${timestamp}@example.com`;
  const testPassword = 'testpassword123';
  
  try {
    // 1. Create a test user
    console.log('\n1. Creating test user for UI testing...');
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    
    if (!registerResponse.ok) {
      const error = await registerResponse.json();
      console.error('Failed to create user:', error);
      return;
    }
    
    console.log('✅ Test user created:', testEmail);
    console.log('\n📋 Manual Test Instructions:');
    console.log('1. Go to http://localhost:3000');
    console.log('2. Sign in with these credentials:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    console.log('3. Click on the user menu (avatar) in the top right');
    console.log('4. Click "Delete Account"');
    console.log('5. Verify the confirmation dialog appears with detailed warning');
    console.log('6. Click "Delete Account" to confirm');
    console.log('7. Verify you are logged out and redirected');
    console.log('8. Try logging in again - should fail (account deleted)');
    
    console.log('\n⏳ User will auto-cleanup in 5 minutes if not deleted manually...');
    
    // Auto-cleanup after 5 minutes as a safety net
    setTimeout(async () => {
      try {
        const cleanupResponse = await fetch(`${API_BASE}/auth/test-cleanup/${testEmail}`, {
          method: 'DELETE',
          headers: {
            'X-Test-Token': 'test-cleanup-secret-2024'
          }
        });
        
        if (cleanupResponse.ok) {
          console.log('🧹 Auto-cleanup: Test user removed after 5 minutes');
        }
      } catch (error) {
        console.log('Auto-cleanup failed (user may have been deleted manually)');
      }
    }, 5 * 60 * 1000); // 5 minutes
    
  } catch (error) {
    console.error('Test setup failed:', error);
  }
}

// Run the test
testDeleteAccountUI(); 