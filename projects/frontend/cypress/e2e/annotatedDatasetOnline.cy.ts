describe('Annotated Dataset Creation', () => {
  beforeEach(() => {
    // Clear IndexedDB (Dexie) before each test
    indexedDB.deleteDatabase('myDatabase')
    
    // Start from the homepage
    cy.visit('http://localhost:3000/dataPointExtraction')

    // Configure LLM settings
    cy.get('[data-cy="setup-card"]').click()
    cy.get('[data-cy="settings-dialog"]').should('be.visible')

    // Set Custom Provider as provider
    cy.get('[data-cy="llm-provider-trigger"]').click()
    cy.get('[data-cy="llm-provider-custom"]').click()

    // Configure API key from env
    cy.get('[data-cy="api-key-section"]').within(() => {
      cy.get('input').type(Cypress.env('LLM_API_KEY'))
      cy.get('[data-cy="api-key-set-button"]').click()
    })

    // Set model from env
    cy.get('[data-cy="model-section"]').within(() => {
      cy.get('[data-cy="model-input"]').type(Cypress.env('LLM_API_MODEL'))
      cy.get('[data-cy="model-set-button"]').click()
    })

    // Set API URL from env
    cy.get('[data-cy="url-section"]').within(() => {
      cy.get('[data-cy="llm-url-input"]').type(Cypress.env('LLM_API_ENDPOINT'))
      cy.get('[data-cy="llm-url-set-button"]').click()
    })

    // Close settings
    cy.get('[data-cy="settings-close-button"]').click()
    cy.get('[data-cy="settings-dialog"]').should('not.exist')

    // Navigate to profiles page
    cy.get('[data-cy="profile-card"]').click()
    
    // Create a new profile
    const profileName = 'Test Annotation Profile'
    const profileDescription = 'Profile for testing annotation functionality'
    
    cy.get('[data-cy="add-profile-button"]').click()
    cy.get('[data-cy="entity-name-input"]')
      .should('be.visible')
      .type(profileName)
    cy.get('[data-cy="entity-description-input"]')
      .should('be.visible')
      .type(profileDescription)

      // Save the profile
      cy.get('[data-cy="entity-save-button"]').click()
      
      // Select the created profile
      cy.get('[data-cy="profile-card"]').click()

    // Upload profile points from fixture
    cy.get('[data-cy="upload-datapoints-button"]').click()
    cy.get('[data-cy="upload-datapoints-input"]')
      .selectFile('cypress/fixtures/upload_test/uploadProfilePoints.json', { force: true })
    
    // Handle success alert
    cy.on('window:alert', (text) => {
      expect(text).to.equal('Data Points uploading successfull!')
    })

    // Verify the data points are loaded
    cy.get('[data-cy="datapoints-container"]')
      .should('be.visible')
      .find('[data-cy="datapoint-card"]')
      .should('exist')

    // Navigate to datasets page using navbar
    cy.get('[data-cy="nav-datasets-button"]').click()
    cy.url().should('include', '/datasets')
    
    // Create a new dataset
    cy.get('[data-cy="add-dataset-button"]').click()
    cy.get('[data-cy="entity-name-input"]')
      .should('be.visible')
      .type('Test Dataset')
    cy.get('[data-cy="entity-description-input"]')
      .should('be.visible')
      .type('This is a test dataset')
    cy.get('[data-cy="entity-save-button"]').click()

    // Click on the dataset to make it active
    cy.get('[data-cy="dataset-card"]').click()
    
    // Upload Excel file
    cy.get('[data-cy="upload-table-btn"]').click()
    cy.get('[data-cy="table-file-input"]').attachFile({
      filePath: 'test_texts/claude-echos_reduced.xlsx',
      fileName: 'claude-echos_reduced.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    cy.wait(200)
    // Verify table is displayed
    cy.get('[data-cy="table-grid"]').should('be.visible')

    // Select index and text columns
    cy.get('[data-cy="index-column-select"]').click()
    cy.get('[data-cy="index-column-option-Index"]').click()

    cy.get('[data-cy="text-column-select"]').click()
    cy.get('[data-cy="text-column-option-Text"]').click()

    // Import texts
    cy.get('[data-cy="import-texts-btn"]').click()

    // Verify texts were imported
    cy.get('[data-cy="text-card"]')
      .should('exist')
      .should('have.length.gt', 0)

    // Navigate to AI Annotation using navbar
    cy.get('[data-cy="nav-ai-annotation-button"]').click()
    cy.url().should('include', '/aiAnnotation')
  })

  it('should create and start annotating a dataset', () => {
    // Click add dataset button
    cy.get('[data-cy="ai-annotate-add-dataset-button"]').click()

    // Fill out the form
    cy.get('[data-cy="dataset-name-input"]').type('Test Annotated Dataset')
    cy.get('[data-cy="dataset-description-input"]').type('This is a test annotated dataset')
    
    // Select the dataset from dropdown
    cy.get('[data-cy="dataset-select-trigger"]').click()
    cy.contains('Test Dataset').click()
    
    // Select the profile from dropdown
    cy.get('[data-cy="profile-select-trigger"]').click()
    cy.contains('Test Annotation Profile').click()
    
    // Save the annotated dataset
    cy.get('[data-cy="save-dataset-button"]').click()

    // Verify the new annotated dataset appears in the list
    cy.get('[data-cy="annotated-dataset-card"]')
      .should('be.visible')
      .should('contain', 'Test Annotated Dataset')
      .should('contain', 'This is a test annotated dataset')
      .should('contain', 'Test Annotation Profile')
      .should('contain', 'Test Dataset')
      .click()
      
    // Start annotation process
    cy.get('[data-cy="start-annotation-button"]')
      .should('be.visible')
      .click()

    // After starting annotation, wait for and verify successful annotation
    cy.get('[data-cy="annotated-text-card"]', { timeout: 20000 })  // Increased timeout for LLM response
      .should('exist')
      .then(($cards) => {
        // Check if at least one card has been successfully annotated (not red/faulty)
        let successFound = false;
        cy.wrap($cards).each(($card) => {
          // Check for text that is not red (not faulty)
          if (!$card.find('[data-cy="text-filename"].text-red-500').length) {
            successFound = true;
            return false; // Break the each loop
          }
        }).then(() => {
          expect(successFound).to.be.true;
          cy.log('Successfully verified at least one text was annotated without faults');
        });
      });

    // Check that the counts match between the two components
    cy.get('[data-cy="annotated-texts-container"]', { timeout: 20000 })
      .find('[data-cy="annotated-text-card"]')
      .should('have.length.gt', 0)
      .then(($cards) => {
        cy.log(`Found ${$cards.length} annotated texts`);
      });
  })
})