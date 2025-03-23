// Helper function to run the test suite with a specific provider
function runTestSuiteWithProvider(providerType) {
  describe(`Profile Chat Feature (${providerType})`, () => {
    beforeEach(() => {
      // Clear IndexedDB (Dexie) before each test
      indexedDB.deleteDatabase('myDatabase')
      
      // Start from the homepage
      cy.visit('http://localhost:3000')

      // Configure LLM settings
      cy.get('[data-cy="setup-card"]').click()
      cy.get('[data-cy="settings-dialog"]').should('be.visible')

      if (providerType === 'OpenAI') {
        // Set OpenAI as provider
        cy.get('[data-cy="llm-provider-trigger"]').click()
        cy.get('[data-cy="llm-provider-openai"]').click()
        
        // Configure OpenAI API key from env
        cy.get('[data-cy="api-key-section"]').within(() => {
          cy.get('input').type(Cypress.env('OPENAI_API_KEY'))
          cy.get('[data-cy="api-key-set-button"]').click()
        })
        
        // Set OpenAI model from env
        cy.get('[data-cy="model-section"]').within(() => {
          cy.get('[data-cy="model-input"]').type(Cypress.env('OPENAI_API_MODEL'))
          cy.get('[data-cy="model-set-button"]').click()
        })
      } else {
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
      }

      // Close settings
      cy.get('[data-cy="settings-close-button"]').click()
      cy.get('[data-cy="settings-dialog"]').should('not.exist')

      // Navigate to profiles page
      cy.get('[data-cy="profile-card"]').click()
      cy.url().should('include', '/profiles')

      // Create a new profile
      const profileName = `Test Chat Profile (${providerType})`
      const profileDescription = `Profile for testing chat functionality with ${providerType}`
      
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
    })
    
    it(`should open the profile chat and handle messages (${providerType})`, () => {
      // Click on the chat button
      cy.get('[data-cy="profile-chat-button"]').click()
      
      // Verify chat dialog is visible
      cy.get('[data-cy="profile-chat-dialog"]').should('be.visible')
      
      // Verify chat container exists
      cy.get('[data-cy="chat-messages-container"]').should('be.visible')
      
      // Type and send a message
      const testMessage = 'Hello, this is a test message'
      cy.get('[data-cy="message-input"]')
        .should('be.visible')
        .type(testMessage)
      cy.get('[data-cy="send-button"]').click()
      
      // Verify user message appears in chat
      cy.get('[data-cy="user-message"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-cy="message-content"]').should('contain', testMessage)
        })
      
      // Wait for and verify AI response
      cy.get('[data-cy="assistant-message"]', { timeout: 10000 })
        .should('be.visible')
        .within(() => {
          cy.get('[data-cy="message-content"]')
            .should('exist')
            .and('not.be.empty')
            .and('have.length.gt', 0)
        })
    })

    it(`should create profile points through chat interaction (${providerType})`, () => {
      // Click on the chat button
      cy.get('[data-cy="profile-chat-button"]').click()
      
      // Verify chat dialog is visible
      cy.get('[data-cy="profile-chat-dialog"]').should('be.visible')
      
      // Type and send a message requesting profile points creation
      const requestMessage = 'Please create 3 profile points for echocardiography examination'
      cy.get('[data-cy="message-input"]')
        .should('be.visible')
        .type(requestMessage)
      cy.get('[data-cy="send-button"]').click()
      
      // Verify user message appears
      cy.get('[data-cy="user-message"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-cy="message-content"]').should('contain', requestMessage)
        })
      
      // Wait for and verify AI response
      cy.get('[data-cy="assistant-message"]', { timeout: 10000 })
        .should('be.visible')
        .within(() => {
          cy.get('[data-cy="message-content"]')
            .should('exist')
            .and('not.be.empty')
            .and('have.length.gt', 0)
        })

      // Verify Adopt All buttons show correct count
      cy.get('[data-cy="assistant-message"]')
        .within(() => {
          cy.get('[data-cy="adopt-all-button-top"]', { timeout: 20000 })
            .should('be.visible')
            .and('contain', 'Adopt All (3)')
          
        })
    })

    it(`should adopt all profile points when clicking adopt all button (${providerType})`, () => {
      // Click on the chat button
      cy.get('[data-cy="profile-chat-button"]').click()
      
      // Verify chat dialog is visible
      cy.get('[data-cy="profile-chat-dialog"]').should('be.visible')
      
      // Type and send a message requesting profile points creation
      const requestMessage = 'Please create 3 profile points for echocardiography examination'
      cy.get('[data-cy="message-input"]')
        .should('be.visible')
        .type(requestMessage)
      cy.get('[data-cy="send-button"]').click()
      
      // Wait for and verify AI response with profile points
      cy.get('[data-cy="assistant-message"]')
        .should('be.visible')
        .within(() => {
          
          // Click the Adopt All button
          cy.get('[data-cy="adopt-all-button-top"]', { timeout: 20000 })
            .should('be.visible')
            .and('contain', 'Adopt All (3)')
            .click()
        })

      // Chat dialog should close after adoption
      cy.get('[data-cy="profile-chat-dialog"]').should('not.exist')

      // Verify the profile points are visible in the profile view
      cy.get('[data-cy="datapoints-container"]').should('be.visible')
      cy.get('[data-cy="datapoint-card"]')
        .should('have.length', 3)
        .each(($point) => {
          // Verify each point has basic content
          cy.wrap($point).within(() => {
            cy.get('.truncate').should('not.be.empty')
          })
        })
    })
  })
}

// Run the test suite with both providers
runTestSuiteWithProvider("OpenAI");
runTestSuiteWithProvider("Custom");
