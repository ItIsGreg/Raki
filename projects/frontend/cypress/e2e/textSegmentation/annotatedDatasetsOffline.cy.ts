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

    // Configure LLM settings using the robust approach
    cy.get('[data-cy="burger-menu"]').should('be.visible').should('not.be.disabled').click({ force: true })
    cy.get('[data-cy="burger-menu-content"]').should('be.visible').should('exist').then($menu => {
      if ($menu.length) {
        cy.wrap($menu).find('[data-cy="menu-setup"]').should('be.visible').click({ force: true })
      }
    })
    cy.get('[data-cy="settings-dialog"]', { timeout: 10000 }).should('be.visible').should('exist')

    // Configure LLM Provider
    cy.get('[data-cy="llm-provider-trigger"]').click()
    cy.get('[data-cy="llm-provider-openai"]').click()
    cy.get('[data-cy="api-key-section"]').within(() => {
      cy.get('input').type('your-api-key-here')
      cy.get('[data-cy="api-key-set-button"]').click()
    })
    cy.get('[data-cy="model-section"]').within(() => {
      cy.get('[data-cy="model-input"]').type('gpt-4')
      cy.get('[data-cy="model-set-button"]').click()
    })
    cy.get('[data-cy="url-section"]').within(() => {
      cy.get('[data-cy="llm-url-input"]').type('https://api.openai.com/v1')
      cy.get('[data-cy="llm-url-set-button"]').click()
    })
    cy.get('[data-cy="batch-size-section"]').within(() => {
      cy.get('input').clear().type('5')
      cy.get('[data-cy="batch-size-set-button"]').click()
    })
    cy.get('[data-cy="max-tokens-section"]').scrollIntoView().should('be.visible')
    cy.get('[data-cy="max-tokens-checkbox"]').click({ force: true })
    cy.wait(300)
    cy.get('body').then($body => {
      if (!$body.find('[data-cy="max-tokens-input"]:visible').length) {
        cy.get('[data-cy="max-tokens-label"]').click({ force: true })
      }
    })
    cy.get('[data-cy="max-tokens-input"]', { timeout: 5000 }).should('be.visible').clear().type('2000')
    cy.get('[data-cy="max-tokens-set-button"]').click()
    cy.get('[data-cy="rerun-section"]').within(() => {
      cy.get('[data-cy="rerun-checkbox"]').click()
    })
    cy.get('[data-cy="settings-close-button"]').click()
    cy.get('[data-cy="settings-dialog"]').should('not.exist')

    // Create a profile first - switch to profiles tab
    cy.get('[data-cy="profiles-tab"]').click({ force: true })
    cy.get('[data-cy="add-profile-button"]').click()
    cy.get('[data-cy="entity-name-input"]').type('Test Segmentation Profile')
    cy.get('[data-cy="entity-description-input"]').type('Test Segmentation Profile Description')
    cy.get('[data-cy="entity-save-button"]').click()
    cy.get('[data-cy="profile-select-trigger"]').click()
    cy.get('[data-cy="profile-select-content"]').contains('Test Segmentation Profile').click()
    cy.get('[data-cy="new-datapoint-button"]').click()
    cy.get('[data-cy="datapoint-name-input"]').type('Test Segmentation Rule')
    cy.get('[data-cy="datapoint-explanation-input"]').type('Test Segmentation Rule Explanation')
    cy.get('[data-cy="synonym-input"]').type('Test Pattern')
    cy.get('[data-cy="add-synonym-button"]').click()
    cy.get('[data-cy="save-datapoint-button"]').first().click()

    // Switch to text upload tab to create dataset
    cy.get('[data-cy="text-upload-tab"]').click({ force: true })
    cy.get('[data-cy="add-dataset-button"]').click()
    cy.get('[data-cy="entity-name-input"]').type('Test Segmentation Dataset')
    cy.get('[data-cy="entity-description-input"]').type('This is a test segmentation dataset')
    cy.get('[data-cy="entity-save-button"]').click()
    cy.get('[data-cy="text-dataset-select-trigger"]').click()
    cy.get('[data-cy="text-dataset-select-content"]').contains('Test Segmentation Dataset').click()
    cy.get('[data-cy="upload-texts-btn"]').click()
    cy.get('[data-cy="file-input"]').attachFile({
      filePath: 'segmentation_texts/015.md',
      fileName: '015.md',
      mimeType: 'text/markdown'
    })
    cy.wait(1000)
    // Switch to annotation tab
    cy.get('[data-cy="annotation-tab"]').click({ force: true })
  })

  it('should create a new annotated dataset', () => {
    // Click add dataset button
    cy.get('[data-cy="add-dataset-button"]').click()
    cy.get('[data-cy="dataset-name-input"]').type('Test Annotated Segmentation Dataset')
    cy.get('[data-cy="dataset-description-input"]').type('This is a test annotated segmentation dataset')
    cy.get('[data-cy="dataset-select-trigger"]').click()
    cy.contains('Test Segmentation Dataset').click()
    cy.get('[data-cy="profile-select-trigger"]').click()
    cy.contains('Test Segmentation Profile').click()
    cy.get('[data-cy="save-dataset-button"]').click()
    // Verify the new annotated dataset appears in the list (skip content checks, just click the first one)
    cy.get('[data-cy="annotated-dataset-card"]').first().should('be.visible').click()
    // Start annotation process
    cy.get('[data-cy="start-annotation-button"]').scrollIntoView().should('be.visible').click()
    cy.wait(5000)
    // Check that the annotated text cards exist (use manual-annotated-text-card for unified UI)
    cy.get('[data-cy="manual-annotated-text-card"]', { timeout: 10000 })
      .should('exist')
      .should('have.length.at.least', 1);
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