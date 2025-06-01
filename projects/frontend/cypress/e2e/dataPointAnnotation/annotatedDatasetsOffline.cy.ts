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
    cy.visit('http://localhost:3000/dataPointExtraction')

    // Configure LLM settings first
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

    // Create a profile first
    cy.get('[data-cy="profiles-tab"]')
      .should('be.visible')
      .click()
    
    // Add a small wait to ensure tab switch completes
    cy.wait(500)
    
    cy.get('[data-cy="add-profile-button"]')
      .should('be.visible')
      .click()
    
    cy.get('[data-cy="entity-name-input"]')
      .should('be.visible')
      .type('Test Profile')
    
    cy.get('[data-cy="entity-description-input"]')
      .should('be.visible')
      .type('Test Profile Description')
    
    cy.get('[data-cy="entity-save-button"]').click()
    
    // Wait for the profile to be created and verify it appears in the select
    cy.get('[data-cy="profile-select-trigger"]')
      .should('be.visible')
      .click()
    
    cy.get('[data-cy="profile-select-content"]')
      .should('be.visible')
      .contains('Test Profile')
      .click()
      
    // Verify the profile is selected
    cy.get('[data-cy="profile-select-trigger"]')
      .should('contain', 'Test Profile')

    // Create a data point
    cy.get('[data-cy="new-datapoint-button"]')
      .should('be.visible')
      .click()

    // Fill out the data point form
    cy.get('[data-cy="datapoint-name-input"]')
      .should('be.visible')
      .type('Test Data Point')

    cy.get('[data-cy="datapoint-explanation-input"]')
      .should('be.visible')
      .type('Test Data Point Explanation')

    // Add a synonym
    cy.get('[data-cy="synonym-input"]')
      .should('be.visible')
      .type('Test Synonym')
    cy.get('[data-cy="add-synonym-button"]').click()
    
    // Verify synonym appears in badge
    cy.get('[data-cy="synonym-badge-0"]')
      .should('be.visible')
      .should('contain', 'Test Synonym')

    // Select datatype
    cy.get('[data-cy="datatype-trigger"]').click()
    cy.get('[data-cy="datatype-text"]').click()

    // Save the data point (using first() and scrollIntoView to handle visibility)
    cy.get('[data-cy="save-datapoint-button"]')
      .first()
      .scrollIntoView()
      .should('exist')
      .click()

    // Verify the data point appears in the list
    cy.get('[data-cy="datapoints-container"]')
      .should('be.visible')
      .find('[data-cy="datapoint-card"]')
      .should('contain', 'Test Data Point')
      .click()

    // Verify all the content after clicking
    cy.get('[data-cy="datapoint-name-input"]')
      .should('have.value', 'Test Data Point')

    cy.get('[data-cy="datapoint-explanation-input"]')
      .should('have.value', 'Test Data Point Explanation')

    cy.get('[data-cy="synonym-badge-0"]')
      .should('contain', 'Test Synonym')

    cy.get('[data-cy="datatype-trigger"]')
      .should('contain', 'Text')

    // Navigate to text upload tab
    cy.get('[data-cy="text-upload-tab"]')
      .should('be.visible')
      .click()

    // Create a dataset
    cy.get('[data-cy="add-dataset-button"]').click()
    cy.get('[data-cy="entity-name-input"]')
      .should('be.visible')
      .type('Test Dataset')
    cy.get('[data-cy="entity-description-input"]')
      .should('be.visible')
      .type('This is a test dataset')
    cy.get('[data-cy="entity-save-button"]').click()

    // Verify the new dataset appears in the select component
    cy.get('[data-cy="text-dataset-select-trigger"]').click()
    cy.get('[data-cy="text-dataset-select-content"]')
      .should('be.visible')
      .should('contain', 'Test Dataset')

    // Upload test text to dataset
    cy.get('[data-cy="upload-texts-btn"]')
      .should('be.visible')
      .click({ force: true })
    
    cy.get('[data-cy="upload-dropdown-content"]')
      .should('be.visible')
      .within(() => {
        cy.get('[data-cy="upload-files-option"]')
          .should('be.visible')
          .click({ force: true })
      })

    cy.get('[data-cy="file-input"]').attachFile({
      filePath: 'test_texts/txts/0.txt',
      fileName: '0.txt',
      mimeType: 'text/plain'
    })

    // Wait for text to load
    cy.wait(1000)

    // Verify the text appears in the list
    cy.get('[data-cy="text-card"]')
      .should('be.visible')
      .should('contain', '0.txt')
      .click({ force: true })

    // Verify the text is displayed in the TextAnnotation component's display mode
    cy.get('[data-cy="text-display-container"]').should('be.visible')
    cy.get('[data-cy="text-display-title"]').should('contain', 'Text Display')
    cy.get('[data-cy="text-display-content"]').should('not.be.empty')

  
  })

  it.only('should create a new annotated dataset', () => {
      // Navigate to annotation tab
      cy.get('[data-cy="annotation-tab"]')
      .should('be.visible')
      .click()

    // Click add dataset button
    cy.get('[data-cy="add-dataset-button"]').click()

    // Fill out the form
    cy.get('[data-cy="dataset-name-input"]')
      .should('be.visible')
      .type('Test Annotated Dataset')

    cy.get('[data-cy="dataset-description-input"]')
      .should('be.visible')
      .type('This is a test annotated dataset')

    // Select the dataset from dropdown
    cy.get('[data-cy="dataset-select-trigger"]')
      .should('be.visible')
      .click()

    cy.get('[data-cy="dataset-select-content"]')
      .should('be.visible')
      .contains('Test Dataset')
      .click()

    // Select the profile from dropdown
    cy.get('[data-cy="profile-select-trigger"]')
      .should('be.visible')
      .click()

    cy.get('[data-cy="profile-select-content"]')
      .should('be.visible')
      .contains('Test Profile')
      .click()

    // Save the annotated dataset
    cy.get('[data-cy="save-dataset-button"]').click()

    // Verify the new annotated dataset appears in the list
    cy.get('[data-cy="annotated-dataset-card"]')
      .should('be.visible')
      .should('contain', 'This is a test annotated dataset')
      .should('contain', 'Test Profile')
      .should('contain', 'Test Dataset')
      
    // Start annotation process
    cy.get('[data-cy="start-annotation-button"]').scrollIntoView().should('be.visible').click({force: true})

    // Wait for annotation to begin processing and complete
    cy.wait(2000) // Increased wait time to allow for processing

    // Check that the annotated text cards exist
    cy.get('[data-cy="manual-annotated-text-card"]')
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