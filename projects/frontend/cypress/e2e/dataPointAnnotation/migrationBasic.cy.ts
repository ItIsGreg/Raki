describe('Basic Migration Test', () => {
  const testEmail = `test-basic-${Date.now()}@example.com`;
  const testPassword = 'testpassword123';
  
  beforeEach(() => {
    // Clear IndexedDB and localStorage before each test
    indexedDB.deleteDatabase('myDatabase');
    cy.window().then((win) => {
      win.localStorage.clear();
    });
    // Set viewport to ensure proper visibility
    cy.viewport(1280, 720);
  });

  it('should demonstrate the complete local-to-cloud workflow', () => {
    // Step 1: Visit cloud test page
    cy.visit('http://localhost:3000/cloud-test');
    
    // Step 2: Verify we start in local mode
    cy.contains('Not signed in - Using local storage').should('exist');
    
    // Step 3: Create a local profile
    cy.get('button').contains('Create Local Profile').should('exist').click({ force: true });
    
    // Step 4: Verify the profile was created and appears in the list
    cy.contains('Your Profiles (Local)', { timeout: 5000 }).should('exist');
    cy.contains('Test Profile').should('exist');
    
    // Step 5: Register a new account
    cy.get('button').contains('Sign up').click({ force: true });
    
    // Fill in registration form
    cy.get('input[type="email"]').type(testEmail);
    cy.get('input[type="password"]').first().type(testPassword);
    cy.get('input[type="password"]').last().type(testPassword);
    
    // Submit registration
    cy.get('button[type="submit"]').click({ force: true });
    
    // Step 6: Wait for authentication to complete
    cy.contains('Signed in - Using cloud storage', { timeout: 10000 }).should('exist');
    
    // Step 7: Verify storage mode changed
    cy.contains('Your Profiles (Cloud)').should('exist');
    
    // Step 8: Perform migration
    cy.get('button').contains('Move to Cloud').click({ force: true });
    
    // Step 9: Wait for migration success
    cy.contains('successfully moved to the cloud', { timeout: 15000 }).should('exist');
    
    // Step 10: Verify migrated data is visible
    cy.get('button').contains('Reload Profiles').click({ force: true });
    cy.contains('Test Profile', { timeout: 5000 }).should('exist');
    
    // Step 11: Create a new profile to verify it goes to cloud
    cy.get('button').contains('Create Cloud Profile').click({ force: true });
    
    // Should now have at least 2 profiles
    cy.get('[data-cy="profile-card"]', { timeout: 5000 }).should('have.length.at.least', 2);
  });

  it('should run the automated tests successfully', () => {
    cy.visit('http://localhost:3000/cloud-test');
    
    // Run tests in unauthenticated state
    cy.contains('Run Tests').click();
    
    // Wait for tests to complete - look for success indicators
    cy.contains('Authentication Detection', { timeout: 10000 }).should('be.visible');
    
    // Should see multiple passed tests
    cy.get('.text-green-600', { timeout: 15000 }).should('have.length.at.least', 4);
  });

  it('should prevent migration when not authenticated', () => {
    cy.visit('http://localhost:3000/cloud-test');
    
    // Should show message about signing in to migrate
    cy.contains('Sign in to move your data to the cloud').should('exist');
    
    // Move to Cloud button should not be visible when not authenticated
    cy.get('button').contains('Move to Cloud').should('not.exist');
  });
}); 