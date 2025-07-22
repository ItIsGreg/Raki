describe('Local to Cloud Migration', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'testpassword123';
  
  beforeEach(() => {
    // Clear IndexedDB and localStorage before each test
    indexedDB.deleteDatabase('myDatabase');
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  afterEach(() => {
    // Clean up: logout if authenticated
    cy.window().then((win) => {
      if (win.localStorage.getItem('auth_token')) {
        win.localStorage.removeItem('auth_token');
      }
    });
  });

  it('should create local data, authenticate, and migrate to cloud', () => {
    // Step 1: Start on cloud test page
    cy.visit('http://localhost:3000/cloud-test');
    
    // Verify initial state - not authenticated
    cy.contains('Not signed in - Using local storage').should('be.visible');
    cy.get('[data-cy="storage-status"]').should('contain', 'Local Storage');

    // Step 2: Create local profile
    cy.contains('Create Local Profile').click();
    
    // Wait for profile creation and verify it appears
    cy.contains('Test Profile', { timeout: 5000 }).should('be.visible');
    cy.contains('Your Profiles (Local)').should('be.visible');

    // Step 3: Authenticate - Click Sign up
    cy.contains('Sign up').click();
    
    // Fill registration form
    cy.get('input[id="email"]').type(testEmail);
    cy.get('input[id="password"]').type(testPassword);
    cy.get('input[id="confirmPassword"]').type(testPassword);
    cy.contains('button', 'Create account').click();

    // Wait for authentication to complete
    cy.contains('Signed in - Using cloud storage', { timeout: 10000 }).should('be.visible');
    cy.get('[data-cy="storage-status"]').should('contain', 'Cloud Storage');

    // Step 4: Verify storage mode changed
    cy.contains('Your Profiles (Cloud)').should('be.visible');
    
    // Step 5: Trigger migration
    cy.contains('Move to Cloud').click();
    
    // Wait for migration to complete
    cy.contains('Your data has been successfully moved to the cloud', { timeout: 15000 })
      .should('be.visible');

    // Step 6: Verify migrated data appears in cloud profiles
    cy.contains('Reload Profiles').click();
    cy.contains('Test Profile', { timeout: 5000 }).should('be.visible');
    
    // Step 7: Create new profile to verify it goes to cloud
    cy.contains('Create Cloud Profile').click();
    cy.contains('Test Profile', { timeout: 5000 }).should('have.length.at.least', 2);
  });

  it('should handle migration when no local data exists', () => {
    // Start on cloud test page
    cy.visit('http://localhost:3000/cloud-test');

    // Authenticate first
    cy.contains('Sign up').click();
    cy.get('input[id="email"]').type(testEmail);
    cy.get('input[id="password"]').type(testPassword);
    cy.get('input[id="confirmPassword"]').type(testPassword);
    cy.contains('button', 'Create account').click();

    // Wait for authentication
    cy.contains('Signed in - Using cloud storage', { timeout: 10000 }).should('be.visible');

    // Try migration with no local data
    cy.contains('Move to Cloud').click();
    
    // Should complete successfully even with no data
    cy.contains('Your data has been successfully moved to the cloud', { timeout: 15000 })
      .should('be.visible');
  });

  it('should prevent migration when not authenticated', () => {
    cy.visit('http://localhost:3000/cloud-test');
    
    // Verify migration prompt when not authenticated
    cy.contains('Sign in to move your data to the cloud').should('be.visible');
    
    // Should not show migration button
    cy.contains('Move to Cloud').should('not.exist');
  });

  it('should maintain local data isolation before migration', () => {
    // Create local data
    cy.visit('http://localhost:3000/cloud-test');
    cy.contains('Create Local Profile').click();
    cy.contains('Test Profile', { timeout: 5000 }).should('be.visible');

    // Open new tab/window to simulate different session
    cy.window().then((win) => {
      // Clear the current data to simulate different browser session
      win.localStorage.clear();
      indexedDB.deleteDatabase('myDatabase');
    });

    // Refresh page - local data should be gone (simulating new session)
    cy.reload();
    cy.contains('No profiles found').should('be.visible');
  });

  it('should run automated integration tests successfully', () => {
    cy.visit('http://localhost:3000/cloud-test');
    
    // Run integration tests when not authenticated
    cy.contains('Run Tests').click();
    
    // Wait for tests to complete and verify results
    cy.contains('Authentication Detection', { timeout: 10000 }).should('be.visible');
    cy.contains('✅', { timeout: 15000 }).should('have.length.at.least', 5);
    
    // Authenticate and run tests again
    cy.contains('Sign up').click();
    cy.get('input[id="email"]').type(testEmail);
    cy.get('input[id="password"]').type(testPassword);
    cy.get('input[id="confirmPassword"]').type(testPassword);
    cy.contains('button', 'Create account').click();

    // Wait for authentication and run tests again
    cy.contains('Signed in - Using cloud storage', { timeout: 10000 }).should('be.visible');
    cy.contains('Run Tests').click();
    
    // Verify cloud tests pass
    cy.contains('✅', { timeout: 15000 }).should('have.length.at.least', 6);
  });

  it('should handle authentication errors gracefully', () => {
    cy.visit('http://localhost:3000/cloud-test');
    
    // Try to register with invalid data
    cy.contains('Sign up').click();
    cy.get('input[id="email"]').type('invalid-email');
    cy.get('input[id="password"]').type('123'); // Too short
    cy.get('input[id="confirmPassword"]').type('456'); // Doesn't match
    cy.contains('button', 'Create account').click();

    // Should show validation error
    cy.contains('Password must be at least 6 characters').should('be.visible');
    
    // Fix password length but keep mismatch
    cy.get('input[id="password"]').clear().type('password123');
    cy.contains('button', 'Create account').click();
    cy.contains('Passwords do not match').should('be.visible');
  });

  it('should work with the main datapoint extraction workflow', () => {
    // Step 1: Create data in main app while unauthenticated
    cy.visit('http://localhost:3000/dataPointExtraction');
    
    // Create a profile in the main app
    cy.get('[data-cy="profiles-tab"]').click();
    cy.get('[data-cy="add-profile-button"]').click();
    cy.get('[data-cy="entity-name-input"]').type('Main App Profile');
    cy.get('[data-cy="entity-description-input"]').type('Created in main app');
    cy.get('[data-cy="entity-save-button"]').click();
    
    // Verify profile was created
    cy.get('[data-cy="profile-select-trigger"]').click();
    cy.contains('Main App Profile').should('be.visible');
    cy.get('[data-cy="profile-select-trigger"]').click(); // Close dropdown

    // Step 2: Go to cloud test page and authenticate
    cy.visit('http://localhost:3000/cloud-test');
    cy.contains('Sign up').click();
    cy.get('input[id="email"]').type(testEmail);
    cy.get('input[id="password"]').type(testPassword);
    cy.get('input[id="confirmPassword"]').type(testPassword);
    cy.contains('button', 'Create account').click();

    // Wait for authentication
    cy.contains('Signed in - Using cloud storage', { timeout: 10000 }).should('be.visible');

    // Step 3: Migrate data
    cy.contains('Move to Cloud').click();
    cy.contains('Your data has been successfully moved to the cloud', { timeout: 15000 })
      .should('be.visible');

    // Step 4: Go back to main app and verify data is accessible
    cy.visit('http://localhost:3000/dataPointExtraction');
    cy.get('[data-cy="profiles-tab"]').click();
    
    // Profile should be available in cloud now
    cy.get('[data-cy="profile-select-trigger"]').click();
    cy.contains('Main App Profile', { timeout: 5000 }).should('be.visible');
  });

  it('should maintain data consistency during migration', () => {
    cy.visit('http://localhost:3000/cloud-test');
    
    // Create multiple profiles with different properties
    cy.contains('Create Local Profile').click();
    cy.wait(1000); // Wait for first profile
    
    cy.contains('Create Local Profile').click();
    cy.wait(1000); // Wait for second profile
    
    // Verify multiple profiles exist
    cy.get('[data-cy="profile-card"]').should('have.length.at.least', 2);
    
    // Get profile details before migration
    let profileDetails: string[] = [];
    cy.get('[data-cy="profile-card"]').each(($el) => {
      profileDetails.push($el.text());
    }).then(() => {
      // Now authenticate and migrate
      cy.contains('Sign up').click();
      cy.get('input[id="email"]').type(testEmail);
      cy.get('input[id="password"]').type(testPassword);
      cy.get('input[id="confirmPassword"]').type(testPassword);
      cy.contains('button', 'Create account').click();

      cy.contains('Signed in - Using cloud storage', { timeout: 10000 }).should('be.visible');
      
      // Migrate
      cy.contains('Move to Cloud').click();
      cy.contains('Your data has been successfully moved to the cloud', { timeout: 15000 })
        .should('be.visible');

      // Verify same profiles exist after migration
      cy.contains('Reload Profiles').click();
      cy.get('[data-cy="profile-card"]', { timeout: 5000 }).should('have.length.at.least', 2);
      
      // Verify profile content is preserved
      profileDetails.forEach((detail) => {
        const profileName = detail.split('\n')[0]; // Extract name
        if (profileName.includes('Test Profile')) {
          cy.contains(profileName).should('be.visible');
        }
      });
    });
  });

  it('should handle network errors during migration', () => {
    cy.visit('http://localhost:3000/cloud-test');
    
    // Create local data
    cy.contains('Create Local Profile').click();
    cy.contains('Test Profile', { timeout: 5000 }).should('be.visible');

    // Authenticate
    cy.contains('Sign up').click();
    cy.get('input[id="email"]').type(testEmail);
    cy.get('input[id="password"]').type(testPassword);
    cy.get('input[id="confirmPassword"]').type(testPassword);
    cy.contains('button', 'Create account').click();

    cy.contains('Signed in - Using cloud storage', { timeout: 10000 }).should('be.visible');

    // Intercept migration request to simulate network error
    cy.intercept('POST', '/data/profiles', { forceNetworkError: true }).as('migrationError');
    
    // Try migration
    cy.contains('Move to Cloud').click();
    
    // Should show error state
    cy.contains('Migration failed', { timeout: 10000 }).should('be.visible');
  });
}); 