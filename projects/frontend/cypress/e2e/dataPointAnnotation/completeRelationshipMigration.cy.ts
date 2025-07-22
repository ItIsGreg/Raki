describe('Complete Relationship Migration Test', () => {
  const testEmail = `migration-test-${Date.now()}@example.com`;
  const testPassword = 'testpassword123';
  
  beforeEach(() => {
    // Clear IndexedDB and localStorage before each test
    indexedDB.deleteDatabase('myDatabase');
    cy.window().then((win) => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    });
    // Set viewport to ensure proper visibility
    cy.viewport(1280, 720);
  });

  it('should migrate complete data relationships from IndexedDB to cloud', () => {
    // Step 1: Start by creating test data through the cloud test page
    cy.visit('http://localhost:3000/cloud-test');
    cy.wait(3000);
    
    // Verify we're in local mode initially
    cy.contains('Not signed in - Using local storage').should('be.visible');
    
    // Step 2: Create some local test data
    cy.contains('button', 'Create Local Profile').click();
    cy.wait(2000);
    cy.contains('Test Profile').should('be.visible');
    
    // Create additional local data through the integration tests
    cy.contains('Run Tests').click();
    cy.wait(5000); // Wait for tests to create some data
    
    // Step 3: Verify local data exists
    cy.contains('button', 'Reload Profiles').click();
    cy.wait(2000);
    cy.contains('Test Profile').should('be.visible');

    // Step 4: Authenticate using working pattern
    cy.contains('button', 'Sign up').click();
    cy.wait(2000);
    
    // Fill registration form using working selectors
    cy.get('input[type="email"]').first().type(testEmail);
    cy.get('input[type="password"]').first().type(testPassword);
    
    // Handle second password field if it exists
    cy.get('input[type="password"]').then(($passwords) => {
      if ($passwords.length > 1) {
        cy.get('input[type="password"]').last().type(testPassword);
      }
    });
    
    cy.get('button[type="submit"]').click();

    // Step 5: Wait for authentication and verify cloud mode
    cy.contains('Signed in - Using cloud storage', { timeout: 15000 }).should('be.visible');
    cy.contains('Your Profiles (Cloud)', { timeout: 10000 }).should('be.visible');

    // Step 6: Trigger migration
    cy.contains('button', 'Move to Cloud').click();
    
    // Wait for migration to complete
    cy.contains('successfully moved to the cloud', { timeout: 45000 }).should('be.visible');

    // Step 7: Verify migrated data in cloud
    cy.contains('button', 'Reload Profiles').click();
    cy.wait(3000);
    
    // Verify profile exists in cloud
    cy.contains('Test Profile', { timeout: 15000 }).should('be.visible');
    
    // Verify profile count
    cy.get('[data-cy="profile-card"]', { timeout: 10000 }).should('have.length.at.least', 1);

    // Step 8: Validate data through API calls
    cy.window().then(async (win) => {
      const token = win.localStorage.getItem('auth_token');
      expect(token).to.not.be.null;

      // Test API endpoints directly
      const apiBase = 'http://localhost:8000';
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Verify profiles in cloud
      const profilesResponse = await fetch(`${apiBase}/data/profiles`, { headers });
      const profiles = await profilesResponse.json();
      expect(profiles).to.have.length.at.least(1);
      
      const migratedProfile = profiles.find((p: any) => p.name === 'Test Profile');
      expect(migratedProfile).to.exist;
      expect(migratedProfile.mode).to.equal('datapoint_extraction');

      // Verify we can create new cloud data
      const newProfileResponse = await fetch(`${apiBase}/data/profiles`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: 'Cloud Created Profile',
          description: 'Created after migration',
          mode: 'datapoint_extraction'
        })
      });
      expect(newProfileResponse.ok).to.be.true;

      console.log('✅ Migration and cloud operations verified successfully!');
    });

    // Step 9: Create a new cloud profile to verify cloud functionality
    cy.contains('button', 'Create Cloud Profile').click();
    cy.wait(2000);
    
    // Should now have at least 2 profiles
    cy.get('[data-cy="profile-card"]', { timeout: 5000 }).should('have.length.at.least', 2);
  });

  it('should handle migration with no local data gracefully', () => {
    // Test edge case: migration when no local data exists
    cy.visit('http://localhost:3000/cloud-test');
    cy.wait(3000);
    
    // Authenticate without creating any local data first
    cy.contains('button', 'Sign up').click();
    cy.wait(2000);
    
    const emptyEmail = `empty-migration-${Date.now()}@example.com`;
    cy.get('input[type="email"]').first().type(emptyEmail);
    cy.get('input[type="password"]').first().type(testPassword);
    
    cy.get('input[type="password"]').then(($passwords) => {
      if ($passwords.length > 1) {
        cy.get('input[type="password"]').last().type(testPassword);
      }
    });
    
    cy.get('button[type="submit"]').click();

    cy.contains('Signed in - Using cloud storage', { timeout: 15000 }).should('be.visible');

    // Migration should still work even with no data
    cy.contains('button', 'Move to Cloud').click();
    cy.contains('successfully moved to the cloud', { timeout: 20000 }).should('be.visible');

    // Verify we can create new cloud data
    cy.contains('button', 'Create Cloud Profile').click();
    cy.wait(2000);
    cy.get('[data-cy="profile-card"]', { timeout: 5000 }).should('have.length.at.least', 1);
  });

  it('should preserve data integrity during migration failure recovery', () => {
    // This test verifies that if migration fails partway through,
    // the local data remains intact and can be re-attempted
    
    cy.visit('http://localhost:3000/cloud-test');
    cy.wait(3000);
    
    // Create minimal local data
    cy.contains('button', 'Create Local Profile').click();
    cy.wait(2000);
    cy.contains('Test Profile', { timeout: 5000 }).should('be.visible');

    // Authenticate
    cy.contains('button', 'Sign up').click();
    cy.wait(2000);
    
    const recoveryEmail = `recovery-test-${Date.now()}@example.com`;
    cy.get('input[type="email"]').first().type(recoveryEmail);
    cy.get('input[type="password"]').first().type(testPassword);
    
    cy.get('input[type="password"]').then(($passwords) => {
      if ($passwords.length > 1) {
        cy.get('input[type="password"]').last().type(testPassword);
      }
    });
    
    cy.get('button[type="submit"]').click();

    cy.contains('Signed in - Using cloud storage', { timeout: 15000 }).should('be.visible');

    // Intercept migration requests to simulate partial failure
    cy.intercept('POST', '**/data/annotated-datasets', { forceNetworkError: true }).as('failedMigration');

    // Attempt migration (should fail on annotated datasets)
    cy.contains('button', 'Move to Cloud').click();
    
    // Should show error but not crash
    cy.contains('Migration failed', { timeout: 15000 }).should('be.visible');
    
    // Local data should still be intact - verify by going back to local mode
    cy.window().then((win) => {
      win.localStorage.removeItem('auth_token');
      win.sessionStorage.clear();
    });
    cy.reload();
    cy.wait(3000);
    
    // Should be back in local mode and data should still exist
    cy.contains('Not signed in - Using local storage').should('be.visible');
    cy.contains('Test Profile').should('be.visible');
  });

  it('should verify complex relationships through full datapoint extraction workflow', () => {
    // This test creates real complex data in the main app and then migrates it
    const profileName = `Migration Profile ${Date.now()}`;
    const datasetName = `Migration Dataset ${Date.now()}`;
    
    // Step 1: Create complex data in the main datapoint extraction app
    cy.visit('http://localhost:3000/dataPointExtraction');
    cy.wait(3000);
    
    // Create a profile with datapoints
    cy.get('[data-cy="profiles-tab"]').click();
    cy.wait(1000);
    cy.get('[data-cy="add-profile-button"]').click();
    
    cy.get('[data-cy="entity-name-input"]').clear().type(profileName);
    cy.get('[data-cy="entity-description-input"]').clear().type('Complex profile for migration test');
    cy.get('[data-cy="entity-save-button"]').click();
    cy.wait(2000);
    
    // Select the profile and add datapoints
    cy.get('[data-cy="profile-select-trigger"]').click();
    cy.wait(500);
    cy.contains(profileName).click();
    cy.wait(1000);
    
    // Add a datapoint
    cy.get('[data-cy="new-datapoint-button"]').click();
    cy.wait(500);
    
    cy.get('[data-cy="datapoint-name-input"]').clear().type('Patient Name');
    cy.get('[data-cy="datapoint-explanation-input"]').clear().type('Full name of the patient');
    cy.get('[data-cy="synonym-input"]').type('name{enter}');
    cy.wait(200);
    cy.get('[data-cy="datatype-trigger"]').click();
    cy.get('[data-cy="datatype-text"]').click();
    cy.get('[data-cy="save-datapoint-button"]').first().click();
    cy.wait(2000);
    
    // Create a dataset
    cy.get('[data-cy="text-upload-tab"]').click();
    cy.wait(1000);
    cy.get('[data-cy="add-dataset-button"]').click();
    
    cy.get('[data-cy="entity-name-input"]').clear().type(datasetName);
    cy.get('[data-cy="entity-description-input"]').clear().type('Complex dataset for migration test');
    cy.get('[data-cy="entity-save-button"]').click();
    cy.wait(2000);
    
    // Add texts to dataset
    cy.get('[data-cy="text-dataset-select-trigger"]').click();
    cy.wait(500);
    cy.contains(datasetName).click();
    cy.wait(1000);
    
    cy.get('[data-cy="single-text-input"]').clear().type('Patient John Doe is 45 years old.');
    cy.get('[data-cy="filename-input"]').clear().type('test_record.txt');
    cy.get('[data-cy="add-text-button"]').click();
    cy.wait(2000);
    
    // Step 2: Navigate to cloud test and perform migration
    cy.visit('http://localhost:3000/cloud-test');
    cy.wait(3000);
    
    // Verify local data exists
    cy.contains('Not signed in - Using local storage').should('be.visible');
    cy.contains('button', 'Reload Profiles').click();
    cy.wait(2000);
    cy.contains(profileName).should('be.visible');
    
    // Authenticate and migrate
    cy.contains('button', 'Sign up').click();
    cy.wait(2000);
    
    const complexEmail = `complex-migration-${Date.now()}@example.com`;
    cy.get('input[type="email"]').first().type(complexEmail);
    cy.get('input[type="password"]').first().type(testPassword);
    
    cy.get('input[type="password"]').then(($passwords) => {
      if ($passwords.length > 1) {
        cy.get('input[type="password"]').last().type(testPassword);
      }
    });
    
    cy.get('button[type="submit"]').click();
    
    cy.contains('Signed in - Using cloud storage', { timeout: 15000 }).should('be.visible');
    
    cy.contains('button', 'Move to Cloud').click();
    cy.contains('successfully moved to the cloud', { timeout: 45000 }).should('be.visible');
    
    // Step 3: Verify migrated data works in main app
    cy.visit('http://localhost:3000/dataPointExtraction');
    cy.wait(3000);
    
    // Check profile exists and has datapoints
    cy.get('[data-cy="profiles-tab"]').click();
    cy.wait(1000);
    cy.get('[data-cy="profile-select-trigger"]').click();
    cy.contains(profileName).should('be.visible');
    cy.contains(profileName).click();
    cy.wait(1000);
    
    // Verify datapoint exists
    cy.get('[data-cy="datapoints-container"]').should('contain', 'Patient Name');
    
    // Check dataset exists and has texts
    cy.get('[data-cy="text-upload-tab"]').click();
    cy.wait(1000);
    cy.get('[data-cy="text-dataset-select-trigger"]').click();
    cy.contains(datasetName).should('be.visible');
    cy.contains(datasetName).click();
    cy.wait(1000);
    
    // Verify text exists
    cy.get('[data-cy="text-list"]').should('contain', 'test_record.txt');
  });
}); 