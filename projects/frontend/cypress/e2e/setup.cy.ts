describe('Setup user journey', () => {
  beforeEach(() => {
    // Clear IndexedDB (Dexie) before each test
    indexedDB.deleteDatabase('myDatabase')
    
    // Start from the homepage before each test
    cy.visit('http://localhost:3000')
  })

  it('should configure LLM settings', () => {
    // Open settings dialog
    cy.get('[data-cy="setup-card"]').click()
    cy.get('[data-cy="settings-dialog"]').should('be.visible')

    // Configure LLM Provider using data-cy attributes
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

    // Set Max Tokens - with a more robust approach for reliability
    cy.get('[data-cy="max-tokens-section"]')
      .scrollIntoView()
      .should('be.visible')
    
    // Try clicking the checkbox with force and retry
    cy.get('[data-cy="max-tokens-checkbox"]')
      .click({ force: true })
    
    // Add deliberate wait for any UI updates
    cy.wait(300)
    
    // Check if the input is visible, if not try clicking the label
    cy.get('body').then($body => {
      if (!$body.find('[data-cy="max-tokens-input"]:visible').length) {
        cy.get('[data-cy="max-tokens-label"]')
          .click({ force: true })
      }
    })
    
    // Now interact with the input field, with retry capabilities
    cy.get('[data-cy="max-tokens-input"]', { timeout: 5000 })
      .should('be.visible')
      .clear()
      .type('2000')
    
    cy.get('[data-cy="max-tokens-set-button"]')
      .click()

    // Toggle Auto-rerun with data-cy attribute
    cy.get('[data-cy="rerun-section"]').within(() => {
      cy.get('[data-cy="rerun-checkbox"]').click()
    })

    // Close settings
    cy.get('[data-cy="settings-close-button"]').click()
    cy.get('[data-cy="settings-dialog"]').should('not.exist')

    // Reopen settings to verify persistence
    cy.get('[data-cy="setup-card"]').click()
    cy.get('[data-cy="settings-dialog"]').should('be.visible')

    // Verify LLM Provider
    cy.get('[data-cy="llm-provider-trigger"]')
      .scrollIntoView()
      .should('be.visible')
      .should('contain', 'OpenAI')

    // Verify Model Name
    cy.get('[data-cy="model-input"]')
      .scrollIntoView()
      .should('be.visible')
      .should('have.attr', 'placeholder', 'gpt-4')

    // Verify URL
    cy.get('[data-cy="llm-url-input"]')
      .scrollIntoView()
      .should('be.visible')
      .should('have.attr', 'placeholder', 'https://api.openai.com/v1')

    // Verify API Key (should show masked version)
    cy.get('[data-cy="api-key-input"]')
      .scrollIntoView()
      .should('be.visible')
      .should('have.attr', 'placeholder', 'you...ere')

    // Verify Batch Size
    cy.get('[data-cy="batch-size-input"]')
      .scrollIntoView()
      .should('be.visible')
      .should('have.attr', 'placeholder', '5')

    // Verify Max Tokens
    cy.get('[data-cy="max-tokens-checkbox"]')
      .scrollIntoView()
      .should('be.visible')
      .should('have.attr', 'data-state', 'checked')
    
    cy.get('[data-cy="max-tokens-input"]')
      .scrollIntoView()
      .should('be.visible')
      .should('have.attr', 'placeholder', '2000')

    // Close settings again
    cy.get('[data-cy="settings-close-button"]')
      .scrollIntoView()
      .should('be.visible')
      .click()
    
    cy.get('[data-cy="settings-dialog"]').should('not.exist')
  })
})