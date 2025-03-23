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

    // Close settings
    cy.get('[data-cy="settings-close-button"]').click()
    cy.get('[data-cy="settings-dialog"]').should('not.exist')

    // Create a profile
    cy.get('[data-cy="profile-card"]').click()
    cy.get('[data-cy="add-profile-button"]').click()
    cy.get('[data-cy="entity-name-input"]').type('Test Profile')
    cy.get('[data-cy="entity-description-input"]').type('Test Profile Description')
    cy.get('[data-cy="entity-save-button"]').click()

    // Create numeric data point
    cy.get('[data-cy="profile-card"]').click()
    cy.get('[data-cy="new-datapoint-button"]').click()
    cy.get('[data-cy="datapoint-name-input"]').type('Age')
    cy.get('[data-cy="datapoint-explanation-input"]').type('Patient age in years')
    cy.get('[data-cy="synonym-input"]').type('years old')
    cy.get('[data-cy="add-synonym-button"]').click()
    cy.get('[data-cy="datatype-trigger"]').click()
    cy.get('[data-cy="datatype-number"]').click()
    cy.get('[data-cy="save-datapoint-button"]').first().click()

    // Create text data point
    cy.get('[data-cy="new-datapoint-button"]').click()
    cy.get('[data-cy="datapoint-name-input"]').type('Diagnosis')
    cy.get('[data-cy="datapoint-explanation-input"]').type('Patient diagnosis')
    cy.get('[data-cy="synonym-input"]').type('condition')
    cy.get('[data-cy="add-synonym-button"]').click()
    cy.get('[data-cy="datatype-trigger"]').click()
    cy.get('[data-cy="datatype-text"]').click()
    cy.get('[data-cy="save-datapoint-button"]').first().click()

    // Create valueset data point
    cy.get('[data-cy="new-datapoint-button"]').click()
    cy.get('[data-cy="datapoint-name-input"]').type('Gender')
    cy.get('[data-cy="datapoint-explanation-input"]').type('Patient gender')
    cy.get('[data-cy="synonym-input"]').type('sex')
    cy.get('[data-cy="add-synonym-button"]').click()
    cy.get('[data-cy="datatype-trigger"]').click()
    cy.get('[data-cy="datatype-valueset"]').click()
    // Add valueset options
    cy.get('[data-cy="valueset-item-input"]').type('male')
    cy.get('[data-cy="add-valueset-item-button"]').click()
    cy.get('[data-cy="valueset-item-input"]').type('female')
    cy.get('[data-cy="add-valueset-item-button"]').click()
    cy.get('[data-cy="save-datapoint-button"]').first().click()

    // Navigate to Datasets
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
    cy.wait(200)

    // Select columns and import
    cy.get('[data-cy="index-column-select"]').click()
    cy.get('[data-cy="index-column-option-Index"]').click()
    cy.get('[data-cy="text-column-select"]').click()
    cy.get('[data-cy="text-column-option-Text"]').click()
    cy.get('[data-cy="import-texts-btn"]').click()

    // Navigate to AI Annotation
    cy.get('[data-cy="nav-ai-annotation-button"]').click()

    // Create annotated dataset
    cy.get('[data-cy="ai-annotate-add-dataset-button"]').click()
    cy.get('[data-cy="dataset-name-input"]').type('Test Annotated Dataset')
    cy.get('[data-cy="dataset-description-input"]').type('This is a test annotated dataset')
    cy.get('[data-cy="dataset-select-trigger"]').click()
    cy.contains('Test Dataset').click()
    cy.get('[data-cy="profile-select-trigger"]').click()
    cy.contains('Test Profile').click()
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
    
    // Wait for annotation to begin processing
    cy.wait(500)
    
    // Check that the counts match between the two components
    cy.get('[data-cy="annotated-texts-count"]').then(($count) => {
      // Extract just the first number from "Annotated Texts: X / Y" with null check
      const matches = $count.text().match(/Annotated Texts: (\d+)/);
      const cardCount = matches ? parseInt(matches[1]) : 0;
      
      // Now count the actual text cards in the list
      cy.get('[data-cy="annotated-text-card"]').should('have.length', cardCount);
    });
    
    // Navigate to Manual Annotation
    cy.get('[data-cy="nav-manual-annotation-button"]').click()
  })

  it('be able to do a manual annotation', () => {
    let selectedText = '';

    // Click on the dataset card to select it
    cy.get('[data-cy="manual-annotated-dataset-card"]')
      .click()
    
    // Verify that clicking the dataset card shows annotated texts
    cy.get('[data-cy="manual-annotated-text-list-container"]')
      .find('[data-cy="manual-annotated-text-card"]')
      .should('be.visible')
    
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

