describe('Annotated Datasets', () => {
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
    cy.visit('http://localhost:3000')

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
    cy.get('[data-cy="profile-card"]').click()
    cy.get('[data-cy="add-profile-button"]').click()
    cy.get('[data-cy="entity-name-input"]').type('Test Profile')
    cy.get('[data-cy="entity-description-input"]').type('Test Profile Description')
    cy.get('[data-cy="entity-save-button"]').click()

    // Create a data point
    cy.get('[data-cy="profile-card"]').click()
    cy.get('[data-cy="new-datapoint-button"]').click()
    cy.get('[data-cy="datapoint-name-input"]').type('Test Data Point')
    cy.get('[data-cy="datapoint-explanation-input"]').type('Test Data Point Explanation')
    cy.get('[data-cy="synonym-input"]').type('Test Synonym')
    cy.get('[data-cy="add-synonym-button"]').click()
    cy.get('[data-cy="datatype-trigger"]').click()
    cy.get('[data-cy="datatype-text"]').click()
    cy.get('[data-cy="save-datapoint-button"]').first().click()

    // Navigate to Datasets using navbar
    cy.get('[data-cy="nav-datasets-button"]').click()

    // Create a dataset
    cy.get('[data-cy="add-dataset-button"]').click()
    cy.get('[data-cy="entity-name-input"]').type('Test Dataset')
    cy.get('[data-cy="entity-description-input"]').type('This is a test dataset')
    cy.get('[data-cy="entity-save-button"]').click()

    // Upload test table to dataset
    cy.get('[data-cy="dataset-card"]').click()
    cy.get('[data-cy="upload-table-btn"]').click()
    cy.get('[data-cy="table-file-input"]').attachFile({
      filePath: 'test_texts/claude-echos.xlsx',
      fileName: 'claude-echos.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    // Wait for table to load
    cy.wait(1000)

    // Select columns and import
    cy.get('[data-cy="index-column-select"]').click()
    cy.get('[data-cy="index-column-option-Index"]').click()
    cy.get('[data-cy="text-column-select"]').click()
    cy.get('[data-cy="text-column-option-Text"]').click()
    cy.get('[data-cy="import-texts-btn"]').click()

    // Navigate to AI Annotation using navbar
    cy.get('[data-cy="nav-ai-annotation-button"]').click()
  })

  it('should create a new annotated dataset', () => {
    // Click add dataset button
    cy.get('[data-cy="ai-annotate-add-dataset-button"]').click()

    // Fill out the form
    cy.get('[data-cy="dataset-name-input"]').type('Test Annotated Dataset')
    cy.get('[data-cy="dataset-description-input"]').type('This is a test annotated dataset')
    
    // Select the dataset from dropdown using the trigger
    cy.get('[data-cy="dataset-select-trigger"]').click()
    cy.contains('Test Dataset').click()
    
    // Select the profile from dropdown using the trigger
    cy.get('[data-cy="profile-select-trigger"]').click()
    cy.contains('Test Profile').click()
    
    // Save the annotated dataset
    cy.get('[data-cy="save-dataset-button"]').click()

    // Verify the new annotated dataset appears in the list
    cy.get('[data-cy="annotated-dataset-card"]')
      .should('be.visible')
      .should('contain', 'Test Annotated Dataset')
      .should('contain', 'This is a test annotated dataset')
      .should('contain', 'Test Profile')
      .should('contain', 'Test Dataset')
      .click()
      
    // Start annotation process
    cy.get('[data-cy="start-annotation-button"]').should('be.visible').click()
    
    // Wait for annotation to begin processing (shorter wait time)
    cy.wait(500)
    
    // Check that the counts match between the two components
    cy.get('[data-cy="annotated-texts-count"]').then(($count) => {
      // Extract just the first number from "Annotated Texts: X / Y" with null check
      const matches = $count.text().match(/Annotated Texts: (\d+)/);
      const cardCount = matches ? parseInt(matches[1]) : 0;
      
      // Now count the actual text cards in the list
      cy.get('[data-cy="annotated-text-card"]').should('have.length', cardCount);
      
      // Log the verification result
      cy.log(`Verified: Card shows ${cardCount} annotated texts, list displays ${cardCount} text cards`);
    });
  })
})