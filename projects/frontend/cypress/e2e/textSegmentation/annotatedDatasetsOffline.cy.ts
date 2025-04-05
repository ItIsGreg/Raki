describe('Text Segmentation Annotated Datasets', () => {
  // Handle ResizeObserver errors for AG Grid
  Cypress.on('uncaught:exception', (err) => {
    if (err.message.includes('ResizeObserver') || 
        err.message.includes('ResizeObserver loop completed with undelivered notifications')) {
      return false
    }
    return true
  })

  beforeEach(() => {
    // Clear IndexedDB before each test
    indexedDB.deleteDatabase('myDatabase')
    
    // Start from the homepage
    cy.visit('http://localhost:3000/textSegmentation')

    // Configure LLM settings first
    cy.get('[data-cy="setup-card"]').click()
    cy.get('[data-cy="settings-dialog"]').should('be.visible')

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

    // Create a profile first
    cy.get('[data-cy="profiles-card"]').click()
    cy.get('[data-cy="add-profile-button"]').click()
    cy.get('[data-cy="entity-name-input"]').type('Test Segmentation Profile')
    cy.get('[data-cy="entity-description-input"]').type('Test Segmentation Profile Description')
    cy.get('[data-cy="entity-save-button"]').click()

    // Create a segmentation rule
    cy.get('[data-cy="profile-card"]').click()
    cy.get('[data-cy="new-datapoint-button"]').click()
    cy.get('[data-cy="datapoint-name-input"]').type('Test Segmentation Rule')
    cy.get('[data-cy="datapoint-explanation-input"]').type('Test Segmentation Rule Explanation')
    cy.get('[data-cy="synonym-input"]').type('Test Pattern')
    cy.get('[data-cy="add-synonym-button"]').click()
    cy.get('[data-cy="save-datapoint-button"]').first().click()

    // Navigate to Datasets using navbar
    cy.get('[data-cy="nav-datasets-button"]').click()

    // Create a dataset
    cy.get('[data-cy="add-dataset-button"]').click()
    cy.get('[data-cy="entity-name-input"]').type('Test Segmentation Dataset')
    cy.get('[data-cy="entity-description-input"]').type('This is a test segmentation dataset')
    cy.get('[data-cy="entity-save-button"]').click()

    // Upload test text to dataset
    cy.get('[data-cy="dataset-card"]').click()
    cy.get('[data-cy="upload-texts-btn"]').click()
    cy.get('[data-cy="file-input"]').attachFile({
      filePath: 'segmentation_texts/015.md',
      fileName: '015.md',
      mimeType: 'text/markdown'
    })

    // Wait for text to load
    cy.wait(1000)

    // Navigate to AI Annotation using navbar
    cy.get('[data-cy="nav-ai-annotation-button"]').click()
  })

  it('should create a new annotated dataset', () => {
    // Click add dataset button
    cy.get('[data-cy="ai-annotate-add-dataset-button"]').click()

    // Fill out the form
    cy.get('[data-cy="dataset-name-input"]').type('Test Annotated Segmentation Dataset')
    cy.get('[data-cy="dataset-description-input"]').type('This is a test annotated segmentation dataset')
    
    // Select the dataset from dropdown using the trigger
    cy.get('[data-cy="dataset-select-trigger"]').click()
    cy.contains('Test Segmentation Dataset').click()
    
    // Select the profile from dropdown using the trigger
    cy.get('[data-cy="profile-select-trigger"]').click()
    cy.contains('Test Segmentation Profile').click()
    
    // Save the annotated dataset
    cy.get('[data-cy="save-dataset-button"]').click()

    // Verify the new annotated dataset appears in the list
    cy.get('[data-cy="annotated-dataset-card"]')
      .should('be.visible')
      .should('contain', 'Test Annotated Segmentation Dataset')
      .should('contain', 'This is a test annotated segmentation dataset')
      .should('contain', 'Test Segmentation Profile')
      .should('contain', 'Test Segmentation Dataset')
      .click()
      
    // Start annotation process
    cy.get('[data-cy="start-annotation-button"]').should('be.visible').click()
    
    // Wait for annotation to begin processing and complete
    cy.wait(2000) // Increased wait time to allow for processing
    
    // Check that the annotated text cards exist
    cy.get('[data-cy="annotated-text-card"]')
      .should('exist')
      .should('have.length.at.least', 1);
    
    // Log the verification result
    cy.log('Verified: Annotated text cards are present');
    
    // Optional: Check the count in the UI if it exists
    cy.get('body').then($body => {
      if ($body.find('[data-cy="annotated-texts-count"]').length) {
        cy.get('[data-cy="annotated-texts-count"]').then(($count) => {
          const countText = $count.text();
          cy.log(`UI shows count: ${countText}`);
        });
      }
    });
  })
}) 