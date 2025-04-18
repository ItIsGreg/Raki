// Helper function to run the test suite with a specific provider
export const runTestSuiteWithProvider = (providerType: 'OpenAI' | 'Custom') => {
  describe(`Text Segmentation Annotated Dataset Creation (${providerType})`, () => {
    beforeEach(() => {
      // Clear IndexedDB (Dexie) before each test
      indexedDB.deleteDatabase('myDatabase')
      
      // Start from the homepage
      cy.visit('http://localhost:3000/textSegmentation')

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
      cy.get('[data-cy="profiles-card"]').click()
      
      // Create a new profile
      const profileName = `Test Segmentation Profile (${providerType})`
      const profileDescription = `Profile for testing segmentation functionality with ${providerType}`
      
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

      // Upload segmentation rules from fixture
      cy.get('[data-cy="upload-datapoints-button"]').click()
      cy.get('[data-cy="upload-datapoints-input"]')
        .selectFile('cypress/fixtures/upload_test/uploadSegmentationProfilePoints.json', { force: true })
      
      // Verify the segmentation rules are loaded
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
        .type(`Test Segmentation Dataset (${providerType})`)
      cy.get('[data-cy="entity-description-input"]')
        .should('be.visible')
        .type(`This is a test dataset for ${providerType}`)
      cy.get('[data-cy="entity-save-button"]').click()

      // Click on the dataset to make it active
      cy.get('[data-cy="dataset-card"]').click()
      
      // Upload text files
      cy.get('[data-cy="upload-texts-btn"]').click()
      cy.get('[data-cy="file-input"]').attachFile([
        {
          filePath: 'segmentation_texts/015.md',
          fileName: '015.md',
          mimeType: 'text/markdown'
        },
        {
          filePath: 'segmentation_texts/024.md',
          fileName: '024.md',
          mimeType: 'text/markdown'
        }
      ])

      // Wait for texts to load
      cy.wait(1000)
      
      // Verify texts were imported
      cy.get('[data-cy="text-card"]')
        .should('exist')
        .should('have.length.gt', 0)

      // Navigate to AI Annotation using navbar
      cy.get('[data-cy="nav-ai-annotation-button"]').click()
      cy.url().should('include', '/aiAnnotation')
    })

    it(`should create and start annotating a dataset (${providerType})`, () => {
      // Click add dataset button
      cy.get('[data-cy="ai-annotate-add-dataset-button"]').click()

      // Fill out the form
      cy.get('[data-cy="dataset-name-input"]').type(`Test Annotated Segmentation Dataset (${providerType})`)
      cy.get('[data-cy="dataset-description-input"]').type(`This is a test annotated dataset for ${providerType}`)
      
      // Select the dataset from dropdown
      cy.get('[data-cy="dataset-select-trigger"]').click()
      cy.contains(`Test Segmentation Dataset (${providerType})`).click()
      
      // Select the profile from dropdown
      cy.get('[data-cy="profile-select-trigger"]').click()
      cy.contains(`Test Segmentation Profile (${providerType})`).click()
      
      // Save the annotated dataset
      cy.get('[data-cy="save-dataset-button"]').click()

      // Verify the new annotated dataset appears in the list
      cy.get('[data-cy="annotated-dataset-card"]')
        .should('be.visible')
        .should('contain', `Test Annotated Segmentation Dataset (${providerType})`)
        .should('contain', `This is a test annotated dataset for ${providerType}`)
        .should('contain', `Test Segmentation Profile (${providerType})`)
        .should('contain', `Test Segmentation Dataset (${providerType})`)
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
}

// Run the test suite with both providers
runTestSuiteWithProvider("OpenAI");
runTestSuiteWithProvider("Custom"); 