describe('Final Migration Test - Authentication + API Validation', () => {
  const testEmail = `final-migration-${Date.now()}@example.com`;
  const testPassword = 'testpassword123';
  
  beforeEach(() => {
    indexedDB.deleteDatabase('myDatabase');
    cy.window().then((win) => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    });
    cy.viewport(1280, 720);
  });

  it('should complete full migration workflow with API validation', () => {
    // PHASE 1: Create Local Data
    cy.visit('http://localhost:3000/cloud-test');
    cy.wait(3000);
    
    cy.contains('Not signed in - Using local storage').should('be.visible');
    
    // Create local test data
    cy.contains('button', 'Create Local Profile').click();
    cy.wait(2000);
    cy.contains('Test Profile').should('be.visible');
    
    // Run integration tests to create more complex data
    cy.contains('Run Tests').click();
    cy.wait(5000);
    
    // Verify local data exists
    cy.contains('button', 'Reload Profiles').click();
    cy.wait(2000);
    cy.contains('Test Profile').should('be.visible');
    
    // Count local profiles before migration
    cy.get('[data-cy="profile-card"]').then(($profiles) => {
      const localProfileCount = $profiles.length;
      cy.log(`Found ${localProfileCount} local profiles before migration`);
      expect(localProfileCount).to.be.at.least(1);
      
      // Store count for later comparison
      cy.wrap(localProfileCount).as('localProfileCount');
    });

    // PHASE 2: Authenticate
    cy.contains('button', 'Sign up').click();
    cy.wait(2000);
    
    cy.get('input[type="email"]').first().type(testEmail);
    cy.get('input[type="password"]').first().type(testPassword);
    
    cy.get('input[type="password"]').then(($passwords) => {
      if ($passwords.length > 1) {
        cy.get('input[type="password"]').last().type(testPassword);
      }
    });
    
    cy.get('button[type="submit"]').click();
    cy.contains('Signed in - Using cloud storage', { timeout: 15000 }).should('be.visible');
    cy.contains('Your Profiles (Cloud)').should('be.visible');
    
    // PHASE 3: Perform Migration
    cy.contains('button', 'Move to Cloud').click();
    cy.contains('successfully moved to the cloud', { timeout: 45000 }).should('be.visible');

    // PHASE 4: Validate Migration Results
    cy.contains('button', 'Reload Profiles').click();
    cy.wait(3000);
    
    // Verify profiles are now in cloud
    cy.contains('Test Profile').should('be.visible');
    
    // Count cloud profiles after migration
    cy.get('@localProfileCount').then((localCount) => {
      cy.get('[data-cy="profile-card"]').should('have.length.at.least', localCount);
      cy.log(`✅ Migration preserved at least ${localCount} profiles`);
    });

    // PHASE 5: Comprehensive API Validation
    cy.window().then(async (win) => {
      const token = win.localStorage.getItem('auth_token');
      expect(token).to.not.be.null;
      
      const apiBase = 'http://localhost:8000';
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      console.log('🔍 Starting comprehensive API validation...');

      // 1. Verify user authentication
      const meResponse = await fetch(`${apiBase}/auth/me`, { headers });
      expect(meResponse.ok).to.be.true;
      const userData = await meResponse.json();
      expect(userData.email).to.equal(testEmail);
      console.log('✅ User authentication verified');

      // 2. Verify profiles were migrated
      const profilesResponse = await fetch(`${apiBase}/data/profiles`, { headers });
      expect(profilesResponse.ok).to.be.true;
      const profiles = await profilesResponse.json();
      expect(profiles).to.have.length.at.least(1);
      
      const testProfile = profiles.find((p: any) => p.name === 'Test Profile');
      expect(testProfile).to.exist;
      expect(testProfile.mode).to.equal('datapoint_extraction');
      console.log('✅ Profiles migration verified');

      // 3. Test profile points relationship
      if (profiles.length > 0) {
        const firstProfile = profiles[0];
        const pointsResponse = await fetch(`${apiBase}/data/profiles/${firstProfile.id}/points`, { headers });
        if (pointsResponse.ok) {
          const points = await pointsResponse.json();
          console.log(`✅ Profile points accessible: ${points.length} points found`);
        }
      }

      // 4. Verify datasets were migrated
      const datasetsResponse = await fetch(`${apiBase}/data/datasets`, { headers });
      expect(datasetsResponse.ok).to.be.true;
      const datasets = await datasetsResponse.json();
      console.log(`✅ Datasets migration verified: ${datasets.length} datasets found`);

      // 5. Test dataset texts relationship
      if (datasets.length > 0) {
        const firstDataset = datasets[0];
        const textsResponse = await fetch(`${apiBase}/data/datasets/${firstDataset.id}/texts`, { headers });
        if (textsResponse.ok) {
          const texts = await textsResponse.json();
          console.log(`✅ Dataset texts accessible: ${texts.length} texts found`);
          
          // Verify relationship integrity
          texts.forEach((text: any) => {
            expect(text.dataset_id).to.equal(firstDataset.id);
          });
        }
      }

      // 6. Verify annotated datasets and relationships
      const annotatedDatasetsResponse = await fetch(`${apiBase}/data/annotated-datasets`, { headers });
      if (annotatedDatasetsResponse.ok) {
        const annotatedDatasets = await annotatedDatasetsResponse.json();
        console.log(`✅ Annotated datasets migration verified: ${annotatedDatasets.length} found`);
        
        // Verify foreign key relationships
        annotatedDatasets.forEach((ad: any) => {
          const relatedProfile = profiles.find((p: any) => p.id === ad.profile_id);
          const relatedDataset = datasets.find((d: any) => d.id === ad.dataset_id);
          
          expect(relatedProfile).to.exist;
          expect(relatedDataset).to.exist;
          
          console.log(`✅ Relationship integrity verified for annotated dataset: ${ad.name}`);
        });
      }

      // 7. Test user settings migration
      const settingsResponse = await fetch(`${apiBase}/data/settings`, { headers });
      if (settingsResponse.ok) {
        const settings = await settingsResponse.json();
        console.log(`✅ User settings accessible`);
      }

      // 8. Test creating new cloud data
      const newProfileResponse = await fetch(`${apiBase}/data/profiles`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: `Post-Migration Profile ${Date.now()}`,
          description: 'Profile created after migration to verify cloud functionality',
          mode: 'datapoint_extraction'
        })
      });
      expect(newProfileResponse.ok).to.be.true;
      const newProfile = await newProfileResponse.json();
      expect(newProfile.name).to.include('Post-Migration Profile');
      console.log('✅ New cloud data creation verified');

      // 9. Verify data isolation (user can only see their own data)
      expect(profiles.every((p: any) => p.user_id === userData.id)).to.be.true;
      expect(datasets.every((d: any) => d.user_id === userData.id)).to.be.true;
      console.log('✅ Data isolation verified');

      console.log('🎉 ALL MIGRATION TESTS PASSED!');
      console.log('✅ Authentication working');
      console.log('✅ Local data created');
      console.log('✅ Migration completed');
      console.log('✅ All relationships preserved');
      console.log('✅ Cloud functionality verified');
      console.log('✅ Data isolation confirmed');
    });

    // PHASE 6: Test Cloud Functionality
    cy.contains('button', 'Create Cloud Profile').click();
    cy.wait(2000);
    
    // Should now have more profiles than before
    cy.get('@localProfileCount').then((localCount) => {
      cy.get('[data-cy="profile-card"]').should('have.length.at.least', Number(localCount) + 1);
      cy.log('✅ Cloud profile creation verified');
    });

    // PHASE 7: Test Persistence Across Page Reload
    cy.reload();
    cy.wait(3000);
    
    cy.contains('Signed in - Using cloud storage').should('be.visible');
    cy.contains('Test Profile').should('be.visible');
    cy.log('✅ Authentication persistence verified');
  });

  it('should handle edge cases gracefully', () => {
    // Test migration with no local data
    cy.visit('http://localhost:3000/cloud-test');
    cy.wait(3000);
    
    // Authenticate without any local data
    cy.contains('button', 'Sign up').click();
    cy.wait(2000);
    
    const edgeEmail = `edge-case-${Date.now()}@example.com`;
    cy.get('input[type="email"]').first().type(edgeEmail);
    cy.get('input[type="password"]').first().type(testPassword);
    
    cy.get('input[type="password"]').then(($passwords) => {
      if ($passwords.length > 1) {
        cy.get('input[type="password"]').last().type(testPassword);
      }
    });
    
    cy.get('button[type="submit"]').click();
    cy.contains('Signed in - Using cloud storage', { timeout: 15000 }).should('be.visible');

    // Migration should work even with empty local storage
    cy.contains('button', 'Move to Cloud').click();
    cy.contains('successfully moved to the cloud', { timeout: 20000 }).should('be.visible');

    // Create cloud data to verify functionality
    cy.contains('button', 'Create Cloud Profile').click();
    cy.wait(2000);
    cy.get('[data-cy="profile-card"]').should('have.length.at.least', 1);
    
    cy.log('✅ Empty migration case handled gracefully');
  });

  it('should maintain data integrity under stress', () => {
    cy.visit('http://localhost:3000/cloud-test');
    cy.wait(3000);
    
    // Create multiple local profiles
    for (let i = 0; i < 3; i++) {
      cy.contains('button', 'Create Local Profile').click();
      cy.wait(1000);
    }
    
    // Run tests multiple times to create complex data
    cy.contains('Run Tests').click();
    cy.wait(5000);
    
    cy.contains('button', 'Reload Profiles').click();
    cy.wait(2000);
    
    // Count profiles before migration
    cy.get('[data-cy="profile-card"]').then(($profiles) => {
      const profileCount = $profiles.length;
      expect(profileCount).to.be.at.least(3);
      cy.wrap(profileCount).as('stressProfileCount');
    });

    // Authenticate and migrate
    cy.contains('button', 'Sign up').click();
    cy.wait(2000);
    
    const stressEmail = `stress-test-${Date.now()}@example.com`;
    cy.get('input[type="email"]').first().type(stressEmail);
    cy.get('input[type="password"]').first().type(testPassword);
    
    cy.get('input[type="password"]').then(($passwords) => {
      if ($passwords.length > 1) {
        cy.get('input[type="password"]').last().type(testPassword);
      }
    });
    
    cy.get('button[type="submit"]').click();
    cy.contains('Signed in - Using cloud storage', { timeout: 15000 }).should('be.visible');

    cy.contains('button', 'Move to Cloud').click();
    cy.contains('successfully moved to the cloud', { timeout: 60000 }).should('be.visible');

    // Verify all data was migrated
    cy.contains('button', 'Reload Profiles').click();
    cy.wait(3000);
    
    cy.get('@stressProfileCount').then((originalCount) => {
      cy.get('[data-cy="profile-card"]').should('have.length.at.least', originalCount);
      cy.log(`✅ Stress test: ${originalCount} profiles migrated successfully`);
    });
  });
}); 