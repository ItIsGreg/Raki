describe('Text Segmentation Datasets (Unified UI)', () => {
  // Handle ResizeObserver errors, which are common with AG Grid
  Cypress.on('uncaught:exception', (err) => {
    if (err.message.includes('ResizeObserver') || 
        err.message.includes('ResizeObserver loop completed with undelivered notifications')) {
      return false
    }
    return true
  })

  beforeEach(() => {
    indexedDB.deleteDatabase('myDatabase')
    cy.visit('http://localhost:3000/textSegmentation')
    // Always switch to the text upload tab for dataset/text management
    cy.get('[data-cy="text-upload-tab"]').click()
  })

  it('should create a new dataset', () => {
    cy.get('[data-cy="add-dataset-button"]').click()
    cy.get('[data-cy="entity-name-input"]').should('be.visible').type('Text Segmentation Dataset')
    cy.get('[data-cy="entity-description-input"]').should('be.visible').type('This is a test dataset for text segmentation')
    cy.get('[data-cy="entity-save-button"]').click()
    // Verify the new dataset appears in the select dropdown
    cy.get('[data-cy="text-dataset-select-trigger"]').should('contain', 'Text Segmentation Dataset')
  })

  it('should cancel dataset creation', () => {
    cy.get('[data-cy="add-dataset-button"]').click()
    cy.get('[data-cy="entity-name-input"]').type('Cancelled Dataset')
    cy.get('[data-cy="entity-description-input"]').type('This should not be saved')
    cy.get('[data-cy="entity-cancel-button"]').click()
    cy.get('[data-cy="entity-name-input"]').should('not.exist')
  })

  context('Text Uploads', () => {
    beforeEach(() => {
      // Create a test dataset in the text upload tab
      cy.get('[data-cy="add-dataset-button"]').click()
      cy.get('[data-cy="entity-name-input"]').type('Text Segmentation Test Dataset')
      cy.get('[data-cy="entity-description-input"]').type('This is a test dataset for text segmentation')
      cy.get('[data-cy="entity-save-button"]').click()
      // Select the dataset (should be auto-selected, but ensure it)
      cy.get('[data-cy="text-dataset-select-trigger"]').should('contain', 'Text Segmentation Test Dataset')
    })

    it('should add a single text through the UI', () => {
      // Open single text input dialog through dropdown
      cy.get('[data-cy="upload-texts-btn"]').click()
      cy.get('[data-cy="single-text-option"]').click()
      // Wait for the modal to be fully open and dropdown to close
      cy.get('[data-cy="single-text-filename-input"]').should('be.visible')
      // Small wait to ensure modal is fully rendered
      cy.wait(500)
      cy.get('[data-cy="single-text-filename-input"]').type('Sample Text')
      cy.get('[data-cy="single-text-content-input"]').type('This is a sample text content for segmentation testing.', { force: true })
      cy.get('[data-cy="add-single-text-btn"]').click()
      cy.get('[data-cy="text-card"]').should('be.visible').should('contain', 'Sample Text')
    })

    it('should upload a text file and display its content', () => {
      cy.readFile('cypress/fixtures/segmentation_texts/015.md').then((expectedContent) => {
        cy.get('[data-cy="upload-texts-btn"]').click()
        cy.get('[data-cy="file-input"]').attachFile({
          filePath: 'segmentation_texts/015.md',
          fileName: '015.md',
          mimeType: 'text/markdown'
        })
        cy.get('[data-cy="text-card"]').should('be.visible').should('contain', '015.md').click({ force: true })
        // Check text display area for content
        cy.get('[data-cy="text-display"]').first().should('contain', 'Text Display')
        cy.get('[data-cy="text-display"]').first().within(() => {
          cy.get('.whitespace-pre-wrap').should('contain', expectedContent)
        })
      })
    })

    it('should upload multiple text files and display their content', () => {
      cy.readFile('cypress/fixtures/segmentation_texts/015.md').then((expectedContent) => {
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
        cy.get('[data-cy="text-card"]').should('have.length', 2)
        cy.get('[data-cy="text-card"]').first().should('contain', '015.md').click({ force: true })
        cy.get('[data-cy="text-display"]').first().within(() => {
          cy.get('.whitespace-pre-wrap').should('contain', expectedContent)
        })
        cy.get('[data-cy="text-card"]').eq(1).should('contain', '024.md').click({ force: true })
        cy.get('[data-cy="text-display"]').first().within(() => {
          cy.get('.whitespace-pre-wrap').should('not.be.empty')
        })
      })
    })

    it('should delete a text', () => {
      // Add a text through dropdown
      cy.get('[data-cy="upload-texts-btn"]').click()
      cy.get('[data-cy="single-text-option"]').click()
      // Wait for the modal to be fully open and dropdown to close
      cy.get('[data-cy="single-text-filename-input"]').should('be.visible')
      // Small wait to ensure modal is fully rendered
      cy.wait(500)
      cy.get('[data-cy="single-text-filename-input"]').type('Text to Delete')
      cy.get('[data-cy="single-text-content-input"]').type('This text will be deleted', { force: true })
      cy.get('[data-cy="add-single-text-btn"]').click()
      cy.get('[data-cy="text-card"]').should('contain', 'Text to Delete')
      cy.get('[data-cy="delete-text-btn"]').click()
      cy.get('[data-cy="text-card"]').should('not.exist')
    })
  })
})
