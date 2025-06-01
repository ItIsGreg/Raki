describe('Manual Annotation', () => {
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

    // Create numeric data point
    cy.get('[data-cy="new-datapoint-button"]')
      .should('be.visible')
      .click()

    cy.get('[data-cy="datapoint-name-input"]')
      .should('be.visible')
      .type('Age')

    cy.get('[data-cy="datapoint-explanation-input"]')
      .should('be.visible')
      .type('Patient age in years')

    cy.get('[data-cy="synonym-input"]')
      .should('be.visible')
      .type('years old')
    cy.get('[data-cy="add-synonym-button"]').click()
    
    // Verify synonym appears in badge
    cy.get('[data-cy="synonym-badge-0"]')
      .should('be.visible')
      .should('contain', 'years old')

    cy.get('[data-cy="datatype-trigger"]').click()
    cy.get('[data-cy="datatype-number"]').click()

    // Save the data point
    cy.get('[data-cy="save-datapoint-button"]')
      .first()
      .scrollIntoView()
      .should('exist')
      .click()

    // Create text data point
    cy.get('[data-cy="new-datapoint-button"]')
      .should('be.visible')
      .click()

    cy.get('[data-cy="datapoint-name-input"]')
      .should('be.visible')
      .type('Diagnosis')

    cy.get('[data-cy="datapoint-explanation-input"]')
      .should('be.visible')
      .type('Patient diagnosis')

    cy.get('[data-cy="synonym-input"]')
      .should('be.visible')
      .type('condition')
    cy.get('[data-cy="add-synonym-button"]').click()
    
    // Verify synonym appears in badge
    cy.get('[data-cy="synonym-badge-0"]')
      .should('be.visible')
      .should('contain', 'condition')

    cy.get('[data-cy="datatype-trigger"]').click()
    cy.get('[data-cy="datatype-text"]').click()

    // Save the data point
    cy.get('[data-cy="save-datapoint-button"]')
      .first()
      .scrollIntoView()
      .should('exist')
      .click()

    // Create valueset data point
    cy.get('[data-cy="new-datapoint-button"]')
      .should('be.visible')
      .click()

    cy.get('[data-cy="datapoint-name-input"]')
      .should('be.visible')
      .type('Gender')

    cy.get('[data-cy="datapoint-explanation-input"]')
      .should('be.visible')
      .type('Patient gender')

    cy.get('[data-cy="synonym-input"]')
      .should('be.visible')
      .type('sex')
    cy.get('[data-cy="add-synonym-button"]').click()
    
    // Verify synonym appears in badge
    cy.get('[data-cy="synonym-badge-0"]')
      .should('be.visible')
      .should('contain', 'sex')

    cy.get('[data-cy="datatype-trigger"]').click()
    cy.get('[data-cy="datatype-valueset"]').click()

    // Add valueset options
    cy.get('[data-cy="valueset-item-input"]')
      .scrollIntoView()
      .should('be.visible')
      .type('male')
    cy.get('[data-cy="add-valueset-item-button"]').click()
    
    cy.get('[data-cy="valueset-item-input"]')
      .should('be.visible')
      .type('female')
    cy.get('[data-cy="add-valueset-item-button"]').click()

    // Save the data point
    cy.get('[data-cy="save-datapoint-button"]')
      .first()
      .scrollIntoView()
      .should('exist')
      .click()

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

    // Navigate to annotation tab
    cy.get('[data-cy="annotation-tab"]')
      .should('be.visible')
      .click()

    // Create annotated dataset
    cy.get('[data-cy="add-dataset-button"]').click()
    cy.get('[data-cy="dataset-name-input"]')
      .should('be.visible')
      .type('Test Annotated Dataset')
    cy.get('[data-cy="dataset-description-input"]')
      .should('be.visible')
      .type('This is a test annotated dataset')
    cy.get('[data-cy="dataset-select-trigger"]')
      .should('be.visible')
      .click()
    cy.get('[data-cy="dataset-select-content"]')
      .should('be.visible')
      .contains('Test Dataset')
      .click()
    cy.get('[data-cy="profile-select-trigger"]')
      .should('be.visible')
      .click()
    cy.get('[data-cy="profile-select-content"]')
      .should('be.visible')
      .contains('Test Profile')
      .click()
    cy.get('[data-cy="save-dataset-button"]').click()
    
    // Verify the new annotated dataset appears in the list
    cy.get('[data-cy="annotated-dataset-card"]')
      .should('be.visible')
      .should('contain', 'This is a test annotated dataset')
      .should('contain', 'Test Profile')
      .should('contain', 'Test Dataset')
      .click()
      
    // Start annotation process
    cy.get('[data-cy="start-annotation-button"]')
      .scrollIntoView()
      .should('be.visible')
      .click({ force: true })
    
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

  it('be able to do a manual annotation', () => {
    let selectedText = '';
    // Click on the first annotated text
    cy.get('[data-cy="manual-annotated-text-card"]')
      .first()
      .click()
    
    // Verify that the text content is displayed in the annotation area
    cy.get('[data-cy="text-annotation-content"]')
      .should('not.be.empty')
      
    // Select a portion of text in a text slice
    cy.get('[data-cy="text-slice"]').first().then($slice => {
      // Wait for text to be fully loaded
      cy.wait(100)
      
      // Use browser's selection API to select text inside the text slice
      const sliceElement = $slice[0]
      const document = sliceElement.ownerDocument
      const window = document.defaultView
      
      // Create a text range specifically within this text slice
      const range = document.createRange()
      
      // Ensure we find a text node in the slice
      if (sliceElement.firstChild && sliceElement.firstChild.nodeType === 3) {
        const textNode = sliceElement.firstChild
        const textLength = textNode.textContent!.length
        
        // Select a portion in the middle of the text
        const startPos = Math.min(3, Math.floor(textLength / 4))
        const endPos = Math.min(startPos + 10, textLength - 1)
        
        range.setStart(textNode, startPos)
        range.setEnd(textNode, endPos)
        
        // Save the selected text
        selectedText = range.toString();
        
        // Apply the selection
        if (window) {
          const selection = window.getSelection()
          if (selection) {
            selection.removeAllRanges()
            selection.addRange(range)
            
            // Trigger the mouseup event directly on the text slice element
            // which is what the component listens for
            const mouseupEvent = new MouseEvent('mouseup', {
              bubbles: true,
              cancelable: true,
              view: window
            })
            sliceElement.dispatchEvent(mouseupEvent)
          }
        }
      }
    })
    
    // Wait for the selection to be processed
    cy.wait(200)
    
    // Verify that a datapoint badge appears after selection
    cy.get('[data-cy="datapoint-badge"]').should('be.visible')
    
    // Click on the datapoint badge that contains our selected text
    
    // Verify the datapoint card appears and wait for it to be fully rendered
    cy.get('[data-cy="text-datapoint-card"]').should('be.visible')
    cy.wait(200)
    
    // Select the profile point (Age) from the dropdown
    // Use first() to ensure we're only working with one element
    cy.get('[data-cy="text-datapoint-card"]').first().within(() => {
      cy.get('[data-cy="profile-point-select-trigger"]').should('be.visible').click({force: true})
    })
    
    // Wait for dropdown to appear and then select Age
    cy.wait(200)
    cy.get('[data-cy="profile-point-option"]').contains('Age').should('be.visible').click({force: true})
    
    // Wait for the selection to be processed
    cy.wait(200)
    
    // Enter a value for the age datapoint - also scoped within the card
    cy.get('[data-cy="text-datapoint-card"]').first().within(() => {
      cy.get('[data-cy="value-input"]').should('be.visible').clear().type('42')
      
      // Click the update button to save the value
      cy.get('[data-cy="update-value-btn"]').should('be.visible').click({force: true})
    })
    
    // Wait for the update to be processed
    cy.wait(200)
    
    // Verify the datapoint is now verified (green badge)
    cy.get('[data-cy="datapoint-badge"]').first().should('have.class', 'bg-green-800')
    
    // Close the tooltip by clicking on the badge again
    cy.get('[data-cy="datapoint-badge"]').first().click()
    
    // Verify the tooltip is closed
    cy.get('[data-cy="text-datapoint-card"]').should('not.exist')
  })
})

