describe('Delete Account Functionality', () => {
  beforeEach(() => {
    // Clear IndexedDB before each test
    indexedDB.deleteDatabase('myDatabase');
  });

  it('should successfully delete account through UI', () => {
    const timestamp = Date.now();
    const testEmail = `cypress-delete-test-${timestamp}@example.com`;
    const testPassword = 'testpassword123';

    // Step 1: Create a test user via API
    cy.request('POST', 'http://localhost:8000/auth/register', {
      email: testEmail,
      password: testPassword
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.email).to.eq(testEmail);
    });

    // Step 2: Visit the app and login
    cy.visit('http://localhost:3000');
    
    // Click sign in
    cy.get('button').contains('Sign in').click();
    
    // Fill login form
    cy.get('input[type="email"]').type(testEmail);
    cy.get('input[type="password"]').type(testPassword);
    cy.get('button').contains('Sign in').click();
    
    // Wait for login to complete
    cy.wait(1000);
    
    // Verify user is logged in
    cy.get('button').should('contain', testEmail.charAt(0).toUpperCase());

    // Step 3: Open user menu
    cy.get('button').contains(testEmail.charAt(0).toUpperCase()).click();
    
    // Step 4: Click delete account
    cy.get('[data-cy="delete-account-button"]').should('be.visible').click();
    
    // Step 5: Verify confirmation dialog appears
    cy.get('[data-cy="delete-account-dialog"]').should('be.visible');
    
    // Verify dialog content
    cy.get('[data-cy="delete-account-dialog"]').should('contain', 'Delete Account');
    cy.get('[data-cy="delete-account-dialog"]').should('contain', 'permanently delete your account');
    cy.get('[data-cy="delete-account-dialog"]').should('contain', 'All your workspaces');
    cy.get('[data-cy="delete-account-dialog"]').should('contain', 'All your profiles');
    cy.get('[data-cy="delete-account-dialog"]').should('contain', 'All your datasets');
    
    // Step 6: Test cancel first
    cy.get('[data-cy="delete-account-cancel"]').click();
    cy.get('[data-cy="delete-account-dialog"]').should('not.exist');
    
    // Verify user is still logged in
    cy.get('button').should('contain', testEmail.charAt(0).toUpperCase());
    
    // Step 7: Open menu again and proceed with deletion
    cy.get('button').contains(testEmail.charAt(0).toUpperCase()).click();
    cy.get('[data-cy="delete-account-button"]').click();
    
    // Step 8: Confirm deletion
    cy.get('[data-cy="delete-account-confirm"]').should('be.visible').click();
    
    // Wait for deletion to complete
    cy.wait(2000);
    
    // Step 9: Verify user is logged out
    cy.get('button').should('contain', 'Sign in');
    cy.get('button').should('contain', 'Sign up');
    
    // Step 10: Try to login again - should fail
    cy.get('button').contains('Sign in').click();
    cy.get('input[type="email"]').type(testEmail);
    cy.get('input[type="password"]').type(testPassword);
    cy.get('button').contains('Sign in').click();
    
    // Should still show login form (login failed)
    cy.wait(2000);
    cy.get('input[type="email"]').should('be.visible'); // Still on login form
    
    // Step 11: Verify account deletion via API
    cy.request({
      method: 'POST',
      url: 'http://localhost:8000/auth/login',
      body: {
        email: testEmail,
        password: testPassword
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401); // Should be unauthorized
    });
  });

  it('should handle delete account errors gracefully', () => {
    const timestamp = Date.now();
    const testEmail = `cypress-delete-error-test-${timestamp}@example.com`;
    const testPassword = 'testpassword123';

    // Create and login user
    cy.request('POST', 'http://localhost:8000/auth/register', {
      email: testEmail,
      password: testPassword
    });

    cy.visit('http://localhost:3000');
    cy.get('button').contains('Sign in').click();
    cy.get('input[type="email"]').type(testEmail);
    cy.get('input[type="password"]').type(testPassword);
    cy.get('button').contains('Sign in').click();
    cy.wait(1000);

    // Intercept the delete request to simulate an error
    cy.intercept('DELETE', '**/auth/me', {
      statusCode: 500,
      body: { detail: 'Internal server error' }
    }).as('deleteAccountError');

    // Open user menu and delete account
    cy.get('button').contains(testEmail.charAt(0).toUpperCase()).click();
    cy.get('[data-cy="delete-account-button"]').click();
    cy.get('[data-cy="delete-account-confirm"]').click();

    // Wait for the intercepted request
    cy.wait('@deleteAccountError');

    // Verify user is still logged in (deletion failed)
    cy.get('button').should('contain', testEmail.charAt(0).toUpperCase());

    // Cleanup: Actually delete the user via API
    cy.request({
      method: 'DELETE',
      url: `http://localhost:8000/auth/test-cleanup/${testEmail}`,
      headers: {
        'X-Test-Token': 'test-cleanup-secret-2024'
      }
    });
  });

  it('should show loading state during deletion', () => {
    const timestamp = Date.now();
    const testEmail = `cypress-delete-loading-test-${timestamp}@example.com`;
    const testPassword = 'testpassword123';

    // Create and login user
    cy.request('POST', 'http://localhost:8000/auth/register', {
      email: testEmail,
      password: testPassword
    });

    cy.visit('http://localhost:3000');
    cy.get('button').contains('Sign in').click();
    cy.get('input[type="email"]').type(testEmail);
    cy.get('input[type="password"]').type(testPassword);
    cy.get('button').contains('Sign in').click();
    cy.wait(1000);

    // Intercept the delete request with a delay
    cy.intercept('DELETE', '**/auth/me', (req) => {
      req.reply((res) => {
        // Add delay to see loading state
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(res.send({ statusCode: 200, body: { message: 'User deleted successfully' } }));
          }, 1000);
        });
      });
    }).as('deleteAccount');

    // Open user menu and delete account
    cy.get('button').contains(testEmail.charAt(0).toUpperCase()).click();
    cy.get('[data-cy="delete-account-button"]').click();
    cy.get('[data-cy="delete-account-confirm"]').click();

    // Verify loading state
    cy.get('[data-cy="delete-account-confirm"]').should('contain', 'Deleting...');
    cy.get('[data-cy="delete-account-confirm"]').should('be.disabled');

    // Wait for deletion to complete
    cy.wait('@deleteAccount');
    cy.wait(1000);

    // Verify user is logged out
    cy.get('button').should('contain', 'Sign in');
  });

  afterEach(() => {
    // Cleanup any remaining test users
    const timestamp = Date.now();
    // Clean up potential test users (this will fail silently if they don't exist)
    cy.request({
      method: 'DELETE',
      url: `http://localhost:8000/auth/test-cleanup/cypress-delete-test-${timestamp}@example.com`,
      headers: {
        'X-Test-Token': 'test-cleanup-secret-2024'
      },
      failOnStatusCode: false
    });
  });
}); 