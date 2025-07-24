describe('Workspace Local Advanced Test', () => {
  beforeEach(() => {
    // Clear everything before each test
    indexedDB.deleteDatabase('myDatabase');
    cy.window().then((win) => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    });
    cy.viewport(1280, 720);
  });

  it('should create data in new workspace and verify isolation from default workspace', () => {
    cy.visit('http://localhost:3000/dataPointExtraction');
    cy.wait(1500);

    // Configure LLM settings first - this is required for annotation to work
    cy.get('[data-cy="burger-menu"]')
      .should('be.visible')
      .should('not.be.disabled')
      .click({ force: true })
    
    // Wait for menu content to be visible and click setup
    cy.get('[data-cy="burger-menu-content"]')
      .should('be.visible')
      .should('exist')
      .then($menu => {
        if ($menu.length) {
          cy.wrap($menu)
            .find('[data-cy="menu-setup"]')
            .should('be.visible')
            .click({ force: true })
        }
      })

    // Wait for settings dialog to appear with a longer timeout
    cy.get('[data-cy="settings-dialog"]', { timeout: 10000 })
      .should('be.visible')
      .should('exist')

    // Configure LLM Provider
    cy.get('[data-cy="llm-provider-trigger"]').click()
    cy.get('[data-cy="llm-provider-openai"]').click()

    // Set API Key
    cy.get('[data-cy="api-key-section"]').within(() => {
      cy.get('input').type('your-api-key-here')
      cy.get('[data-cy="api-key-set-button"]').click()
    })

    // Set Model
    cy.get('[data-cy="model-section"]').within(() => {
      cy.get('[data-cy="model-input"]').type('gpt-4')
      cy.get('[data-cy="model-set-button"]').click()
    })

    // Set LLM URL
    cy.get('[data-cy="url-section"]').within(() => {
      cy.get('[data-cy="llm-url-input"]').type('https://api.openai.com/v1')
      cy.get('[data-cy="llm-url-set-button"]').click()
    })

    // Set Batch Size
    cy.get('[data-cy="batch-size-section"]').within(() => {
      cy.get('input').clear().type('5')
      cy.get('[data-cy="batch-size-set-button"]').click()
    })

    // Set Max Tokens
    cy.get('[data-cy="max-tokens-section"]')
      .scrollIntoView()
      .should('be.visible')
    
    cy.get('[data-cy="max-tokens-checkbox"]')
      .click({ force: true })
    
    cy.wait(300)
    
    cy.get('body').then($body => {
      if (!$body.find('[data-cy="max-tokens-input"]:visible').length) {
        cy.get('[data-cy="max-tokens-label"]')
          .click({ force: true })
      }
    })
    
    cy.get('[data-cy="max-tokens-input"]', { timeout: 5000 })
      .should('be.visible')
      .clear()
      .type('2000')
    
    cy.get('[data-cy="max-tokens-set-button"]')
      .click()

    // Toggle Auto-rerun
    cy.get('[data-cy="rerun-section"]').within(() => {
      cy.get('[data-cy="rerun-checkbox"]').click()
    })

    // Close settings
    cy.get('[data-cy="settings-close-button"]').click()
    cy.get('[data-cy="settings-dialog"]').should('not.exist')
    
    // Step 1: Create a new workspace
    cy.get('[data-cy="workspace-selector"]').click({ force: true });
    cy.wait(500);
    
    cy.get('[data-cy="create-workspace-button"]').click({ force: true });
    cy.wait(500);
    
    cy.get('[data-cy="workspace-name-input"]').type('Test Data Workspace');
    cy.get('[data-cy="workspace-description-input"]').type('Workspace for testing data isolation');
    
    cy.get('[data-cy="create-workspace-submit"]').click({ force: true });
    cy.wait(1000);
    
    // Verify we're in the new workspace
    cy.get('[data-cy="workspace-selector"]').should('contain.text', 'Test Data Workspace');
    
    // Step 2: Create a profile with profile points
    cy.get('[data-cy="annotation-tabs"]').should('be.visible');
    cy.get('[data-cy="profiles-tab"]').click({ force: true });
    cy.wait(500);
    
    // Create new profile
    cy.get('[data-cy="add-profile-button"]').click({ force: true });
    cy.wait(500);
    
    cy.get('[data-cy="entity-name-input"]').type('Test Profile');
    cy.get('[data-cy="entity-description-input"]').type('Profile for workspace testing');
    cy.get('[data-cy="entity-save-button"]').click({ force: true });
    cy.wait(1000);
    
    // Select the created profile
    cy.get('[data-cy="profile-select-trigger"]').click({ force: true });
    cy.get('[data-cy="profile-select-content"]').contains('Test Profile').click({ force: true });
    cy.wait(500);
    
    // Add a profile point
    cy.get('[data-cy="new-datapoint-button"]').click({ force: true });
    cy.wait(500);
    
    cy.get('[data-cy="datapoint-name-input"]').type('Test Field');
    cy.get('[data-cy="datapoint-explanation-input"]').type('A test field for workspace testing');
    cy.get('[data-cy="datatype-trigger"]').click({ force: true });
    cy.get('[data-cy="datatype-text"]').click({ force: true });
    cy.get('[data-cy="save-datapoint-button"]').first().click({ force: true });
    cy.wait(1000);
    
    // Verify profile point was created
    cy.get('[data-cy="datapoints-container"]').should('contain.text', 'Test Field');
    
    // Step 3: Create a dataset with a text
    cy.get('[data-cy="text-upload-tab"]').click({ force: true });
    cy.wait(500);
    
    // Create new dataset
    cy.get('[data-cy="add-dataset-button"]').click({ force: true });
    cy.wait(500);
    
    cy.get('[data-cy="entity-name-input"]').type('Test Dataset');
    cy.get('[data-cy="entity-description-input"]').type('Dataset for workspace testing');
    cy.get('[data-cy="entity-save-button"]').click({ force: true });
    cy.wait(1000);
    
    // Verify dataset was created and select it
    cy.get('[data-cy="text-dataset-select-trigger"]').click({ force: true });
    cy.get('[data-cy="text-dataset-select-content"]').contains('Test Dataset').click({ force: true });
    cy.wait(500);
    
    // Add a text to the dataset using the dropdown
    cy.get('[data-cy="upload-texts-btn"]').click({ force: true });
    cy.wait(500);
    
    cy.get('[data-cy="upload-dropdown-content"]').within(() => {
      cy.get('[data-cy="single-text-option"]').click({ force: true });
    });
    cy.wait(500);
    
    cy.get('[data-cy="single-text-filename-input"]').type('test-document.txt');
    cy.get('[data-cy="single-text-content-input"]').type('This is a test document for workspace isolation testing. It contains some sample text that we can annotate.');
    cy.get('[data-cy="add-single-text-btn"]').click({ force: true });
    cy.wait(1000);
    
    // Verify text was created
    cy.get('[data-cy="text-card"]').should('contain.text', 'test-document.txt');
    
    // Step 4: Create an annotated dataset
    cy.get('[data-cy="annotation-tab"]').click({ force: true });
    cy.wait(500);
    
    cy.get('[data-cy="add-dataset-button"]').click({ force: true });
    cy.wait(500);
    
    cy.get('[data-cy="dataset-name-input"]').type('Test Annotated Dataset');
    cy.get('[data-cy="dataset-description-input"]').type('Annotated dataset for workspace testing');
    
    // Select the dataset we created
    cy.get('[data-cy="dataset-select-trigger"]').click({ force: true });
    cy.get('[data-cy="dataset-select-content"]').contains('Test Dataset').click({ force: true });
    
    // Select the profile we created
    cy.get('[data-cy="profile-select-trigger"]').click({ force: true });
    cy.get('[data-cy="profile-select-content"]').contains('Test Profile').click({ force: true });
    
    cy.get('[data-cy="save-dataset-button"]').click({ force: true });
    cy.wait(1000);
    
    // Verify annotated dataset was created and is active
    cy.get('[data-cy="annotation-dataset-select-trigger"]').should('contain.text', 'Test Annotated Dataset');
    
    // Start the annotation process - this is the critical step!
    cy.get('[data-cy="start-annotation-button"]').scrollIntoView().should('be.visible').click({ force: true });
    
    // Wait for annotation texts to be processed and appear
    cy.wait(2000);
    
    // Step 5: Verify manual annotation interface is available
    cy.get('[data-cy="manual-annotated-text-card"]', { timeout: 10000 })
      .should('exist')
      .should('have.length.at.least', 1);
    
    // Click on the first annotated text to open annotation interface
    cy.get('[data-cy="manual-annotated-text-card"]').first().click({ force: true });
    cy.wait(1000);
    
    // Verify the annotation interface is displayed
    cy.get('[data-cy="text-annotation-content"]').should('be.visible');
    
    // Verify text slices are present (this is the core annotation component)
    cy.get('[data-cy="text-slice"]').should('exist').should('have.length.at.least', 1);
    
    // Step 6: Switch back to default workspace and verify data isolation
    cy.get('[data-cy="workspace-selector"]').click({ force: true });
    cy.wait(500);
    
    // Switch to the default workspace (My Local Workspace)
    cy.get('[data-cy*="workspace-option-"]').contains('My Local Workspace').click({ force: true });
    cy.wait(1000);
    
    // Verify we're in the default workspace
    cy.get('[data-cy="workspace-selector"]').should('contain.text', 'My Local Workspace');
    
    // Step 7: Verify profiles don't exist in default workspace
    cy.get('[data-cy="profiles-tab"]').click({ force: true });
    cy.wait(500);
    
    cy.get('[data-cy="profile-select-trigger"]').click({ force: true });
    cy.wait(300);
    
    // Should not contain our test profile
    cy.get('body').should('not.contain.text', 'Test Profile');
    
    // Close the dropdown
    cy.get('body').click({ force: true });
    
    // Step 8: Verify datasets don't exist in default workspace
    cy.get('[data-cy="text-upload-tab"]').click({ force: true });
    cy.wait(500);
    
    cy.get('[data-cy="text-dataset-select-trigger"]').click({ force: true });
    cy.wait(300);
    
    // Should not contain our test dataset
    cy.get('body').should('not.contain.text', 'Test Dataset');
    
    // Close the dropdown
    cy.get('body').click({ force: true });
    
    // Step 9: Verify annotated datasets don't exist in default workspace
    cy.get('[data-cy="annotation-tab"]').click({ force: true });
    cy.wait(500);
    
    cy.get('[data-cy="annotation-dataset-select-trigger"]').click({ force: true });
    cy.wait(300);
    
    // Should not contain our test annotated dataset
    cy.get('body').should('not.contain.text', 'Test Annotated Dataset');
    
    // Close the dropdown
    cy.get('body').click({ force: true });
    
    // Step 10: Switch back to test workspace and verify data still exists
    cy.get('[data-cy="workspace-selector"]').click({ force: true });
    cy.wait(500);
    
    cy.get('[data-cy*="workspace-option-"]').contains('Test Data Workspace').click({ force: true });
    cy.wait(1000);
    
    // Verify we're back in the test workspace
    cy.get('[data-cy="workspace-selector"]').should('contain.text', 'Test Data Workspace');
    
    // Verify our data still exists
    cy.get('[data-cy="profiles-tab"]').click({ force: true });
    cy.wait(500);
    cy.get('[data-cy="profile-select-trigger"]').should('contain.text', 'Test Profile');
    
    cy.get('[data-cy="text-upload-tab"]').click({ force: true });
    cy.wait(500);
    cy.get('[data-cy="text-dataset-select-trigger"]').should('contain.text', 'Test Dataset');
    
    cy.get('[data-cy="annotation-tab"]').click({ force: true });
    cy.wait(500);
    cy.get('[data-cy="annotation-dataset-select-trigger"]').should('contain.text', 'Test Annotated Dataset');
    
    // Verify the annotation interface still exists
    cy.get('[data-cy="manual-annotated-text-card"]', { timeout: 10000 })
      .should('exist')
      .first()
      .click({ force: true });
    cy.wait(500);
    cy.get('[data-cy="text-annotation-content"]').should('be.visible');
    cy.get('[data-cy="text-slice"]').should('exist');
  });
}); 