describe('Delete Account Functionality', () => {
  beforeEach(() => {
    // Clear IndexedDB before each test
    indexedDB.deleteDatabase('myDatabase');
  });

  it('should successfully delete account through UI', () => {
    const timestamp = Date.now();
    const testEmail = `cypress-delete-test-${timestamp}@example.com`;
    const testPassword = 'testpassword123';

    // Step 1: Visit the app and register (which should auto-login)
    cy.visit('http://localhost:3000');
    
    // Click sign up
    cy.get('button').contains('Sign up').click();
    
    // Fill registration form
    cy.get('#email').type(testEmail);
    cy.get('#password').type(testPassword);
    cy.get('#confirmPassword').type(testPassword);
    cy.get('button').contains('Create account').click();
    
    // Wait for registration and auto-login to complete
    
    // Step 2: Verify user is logged in after registration
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
    
    // Step 6: Confirm deletion
    cy.get('[data-cy="delete-account-confirm"]').should('be.visible').click();
    
    // Step 7: Verify user is logged out
    cy.get('button').should('contain', 'Sign in');
    cy.get('button').should('contain', 'Sign up');
    
    // Step 8: Try to login again - should fail
    cy.get('button').contains('Sign in').click();
    
    // Wait for login modal to open
    cy.wait(1000);
    
    cy.get('#email').type(testEmail);
    cy.get('#password').type(testPassword);
    cy.get('[data-cy="login-button"]').click({ force: true });
    
    // Should still show login form (login failed)


    cy.wait(1000);
    cy.get('body').should('contain.text', 'Invalid email or password. Please try again.');
    // Step 9: Verify account deletion via API
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
}); 