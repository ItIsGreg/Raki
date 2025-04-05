describe('Text Segmentation Datasets page', () => {
  // Handle ResizeObserver errors, which are common with AG Grid
  Cypress.on('uncaught:exception', (err) => {
    if (err.message.includes('ResizeObserver') || 
        err.message.includes('ResizeObserver loop completed with undelivered notifications')) {
      // Returning false prevents Cypress from failing the test
      return false
    }
    // We still want to fail on other errors
    return true
  })

  beforeEach(() => {
    // Clear IndexedDB (Dexie) before each test
    indexedDB.deleteDatabase('myDatabase')
    // Start from the homepage
    cy.visit('http://localhost:3000/textSegmentation')
  })

  it('should navigate to datasets page', () => {
    // Check if datasets card exists and is visible
    cy.get('[data-cy="datasets-card"]')
      .should('be.visible')
      .should('contain', 'Datasets')
      
    // Click on the datasets card
    cy.get('[data-cy="datasets-card"]').click()
    
    // Verify the datasets page components are present
    cy.get('[data-cy="datasets-page"]').should('be.visible')
  })

  it('should create a new dataset', () => {
    // Navigate to datasets page
    cy.get('[data-cy="datasets-card"]').click()

    // Click the add dataset button
    cy.get('[data-cy="add-dataset-button"]').click()

    // Fill in the dataset form
    cy.get('[data-cy="entity-name-input"]')
      .should('be.visible')
      .type('Text Segmentation Dataset')
    
    cy.get('[data-cy="entity-description-input"]')
      .should('be.visible')
      .type('This is a test dataset for text segmentation')

    // Save the dataset
    cy.get('[data-cy="entity-save-button"]').click()

    // Verify the new dataset appears in the list
    cy.get('[data-cy="dataset-card"]')
      .should('be.visible')
      .should('contain', 'Text Segmentation Dataset')
      .should('contain', 'This is a test dataset for text segmentation')
  })

  it('should cancel dataset creation', () => {
    // Navigate to datasets page
    cy.get('[data-cy="datasets-card"]').click()

    // Click the add dataset button
    cy.get('[data-cy="add-dataset-button"]').click()

    // Fill in the dataset form
    cy.get('[data-cy="entity-name-input"]').type('Cancelled Dataset')
    cy.get('[data-cy="entity-description-input"]').type('This should not be saved')

    // Cancel the creation
    cy.get('[data-cy="entity-cancel-button"]').click()

    // Verify the form is no longer visible
    cy.get('[data-cy="entity-name-input"]').should('not.exist')
  })

  context('Text Uploads', () => {
    beforeEach(() => {
      // Navigate to datasets page and create a test dataset
      cy.get('[data-cy="datasets-card"]').click()
      cy.get('[data-cy="add-dataset-button"]').click()
      cy.get('[data-cy="entity-name-input"]').type('Text Segmentation Test Dataset')
      cy.get('[data-cy="entity-description-input"]').type('This is a test dataset for text segmentation')
      cy.get('[data-cy="entity-save-button"]').click()
    })

    it('should add a single text through the UI', () => {
      // Click on the dataset to make it active
      cy.get('[data-cy="dataset-card"]').click()

      // Open single text input dialog
      cy.get('[data-cy="single-text-btn"]').click()

      // Fill in the text details
      cy.get('[data-cy="single-text-filename-input"]').type('Sample Text')
      cy.get('[data-cy="single-text-content-input"]').type('This is a sample text content for segmentation testing.')

      // Save the text
      cy.get('[data-cy="add-single-text-btn"]').click()

      // Verify the text appears in the list
      cy.get('[data-cy="text-card"]')
        .should('be.visible')
        .should('contain', 'Sample Text')
    })

    it('should upload a text file and display its content', () => {
      // Click on the dataset to make it active
      cy.get('[data-cy="dataset-card"]').click()

      // Read the test file content first to compare later
      cy.readFile('cypress/fixtures/segmentation_texts/015.md').then((expectedContent) => {
        // Upload a text file from the fixtures directory
        cy.get('[data-cy="upload-texts-btn"]').click()
        cy.get('[data-cy="file-input"]').attachFile({
          filePath: 'segmentation_texts/015.md',
          fileName: '015.md',
          mimeType: 'text/markdown'
        })

        // Verify the uploaded file appears in the list
        cy.get('[data-cy="text-card"]')
          .should('be.visible')
          .should('contain', '015.md')
          .click()

        // Verify the file content is displayed correctly
        cy.get('[data-cy="text-display-filename"]').should('contain', '015.md')
        cy.get('[data-cy="text-display-content"]').should('contain', expectedContent)
      })
    })

    it('should upload multiple text files and display their content', () => {
      // Click on the dataset to make it active
      cy.get('[data-cy="dataset-card"]').click()

      // Read the test file content first to compare later
      cy.readFile('cypress/fixtures/segmentation_texts/015.md').then((expectedContent) => {
        // Upload multiple files from the fixtures directory
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

        // Verify both files appear in the list
        cy.get('[data-cy="text-card"]').should('have.length', 2)
        
        // Check first file content
        cy.get('[data-cy="text-card"]').first().should('contain', '015.md').click()
        cy.get('[data-cy="text-display-filename"]').should('contain', '015.md')
        cy.get('[data-cy="text-display-content"]').should('contain', expectedContent)
        
        // Check second file content
        cy.get('[data-cy="text-card"]').eq(1).should('contain', '024.md').click()
        cy.get('[data-cy="text-display-filename"]').should('contain', '024.md')
        cy.get('[data-cy="text-display-content"]').should('not.be.empty')
      })
    })

    it('should delete a text', () => {
      // Click on the dataset to make it active
      cy.get('[data-cy="dataset-card"]').click()
      
      // First add a text
      cy.get('[data-cy="single-text-btn"]').click()
      cy.get('[data-cy="single-text-filename-input"]').type('Text to Delete')
      cy.get('[data-cy="single-text-content-input"]').type('This text will be deleted')
      cy.get('[data-cy="add-single-text-btn"]').click()

      // Verify text exists
      cy.get('[data-cy="text-card"]')
        .should('contain', 'Text to Delete')

      // Delete the text
      cy.get('[data-cy="delete-text-btn"]').click()

      // Verify text is removed
      cy.get('[data-cy="text-card"]')
        .should('not.exist')
    })
  })
})
