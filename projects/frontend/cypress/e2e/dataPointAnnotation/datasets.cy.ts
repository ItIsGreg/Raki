describe('Datasets page', () => {
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
    cy.visit('http://localhost:3000/dataPointExtraction')
    // Click the text upload tab
    cy.get('[data-cy="text-upload-tab"]').click()
  })


  it('should create a new dataset', () => {
    // Click the New Text Set button
    cy.get('[data-cy="add-dataset-button"]').click()

    // Fill in the dataset form
    cy.get('[data-cy="entity-name-input"]')
      .should('be.visible')
      .type('Test Dataset')
    
    cy.get('[data-cy="entity-description-input"]')
      .should('be.visible')
      .type('This is a test dataset')

    // Save the dataset
    cy.get('[data-cy="entity-save-button"]').click()

    // Verify the new dataset appears in the select component
    cy.get('[data-cy="text-dataset-select-trigger"]').click()
    cy.get('[data-cy="text-dataset-select-content"]')
      .should('be.visible')
      .should('contain', 'Test Dataset')
  })

  it('should cancel dataset creation', () => {

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
      cy.get('[data-cy="add-dataset-button"]').click()
      cy.get('[data-cy="entity-name-input"]').type('Test Dataset')
      cy.get('[data-cy="entity-description-input"]').type('This is a test dataset')
      cy.get('[data-cy="entity-save-button"]').click()
    })

    it('should add a single text through the UI', () => {
      // Open single text input dialog through the dropdown
      cy.get('[data-cy="upload-texts-btn"]')
        .should('be.visible')
        .click({ force: true })
      
      // Wait for dropdown to be visible and click the option
      cy.get('[data-cy="upload-dropdown-content"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-cy="single-text-option"]')
            .should('be.visible')
            .click({ force: true })
        })

      // Fill in the text details
      cy.get('[data-cy="single-text-filename-input"]')
        .should('be.visible')
        .wait(500)
        .type('Sample Text')
      cy.get('[data-cy="single-text-content-input"]')
        .should('be.visible')
        .type('This is a sample text content.')

      // Save the text
      cy.get('[data-cy="add-single-text-btn"]').click()

      // Verify the text appears in the list using CompactCard
      cy.get('[data-cy="text-card"]')
        .should('be.visible')
        .should('contain', 'Sample Text')
        .click({ force: true })

      // Verify the text is displayed in the TextAnnotation component's display mode
      cy.get('[data-cy="text-display-container"]').should('be.visible')
      cy.get('[data-cy="text-display-title"]').should('contain', 'Text Display')
      cy.get('[data-cy="text-display-content"]')
        .should('be.visible')
        .should('contain', 'This is a sample text content.')
    })

    it('should upload a text file and display its content', () => {
      // Read the test file content first to compare later
      cy.readFile('cypress/fixtures/test_texts/txts/0.txt').then((expectedContent) => {
        // Upload a text file from the fixtures directory
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

        // Verify the uploaded file appears in the list
        cy.get('[data-cy="text-card"]')
          .should('be.visible')
          .should('contain', '0.txt')
          .click({ force: true })

        // Verify the text is displayed in the TextAnnotation component's display mode
        cy.get('[data-cy="text-display-container"]').should('be.visible')
        cy.get('[data-cy="text-display-title"]').should('contain', 'Text Display')
        cy.get('[data-cy="text-display-content"]')
          .should('be.visible')
          .should('contain', expectedContent)
      })
    })

    it('should upload multiple text files and display their content', () => {
      // Read the test file content first to compare later
      cy.readFile('cypress/fixtures/test_texts/txts/0.txt').then((expectedContent) => {
        // Upload multiple files from the fixtures directory
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

        cy.get('[data-cy="file-input"]').attachFile([
          {
            filePath: 'test_texts/txts/0.txt',
            fileName: '0.txt',
            mimeType: 'text/plain'
          },
          {
            filePath: 'test_texts/txts/0.txt', // Using same file with different name
            fileName: '1.txt',
            mimeType: 'text/plain'
          }
        ])

        // Verify both files appear in the list
        cy.get('[data-cy="text-card"]').should('have.length', 2)
        
        // Check first file content
        cy.get('[data-cy="text-card"]').first()
          .should('contain', '0.txt')
          .click({ force: true })

        // Verify first text is displayed in the TextAnnotation component's display mode
        cy.get('[data-cy="text-display-container"]').should('be.visible')
        cy.get('[data-cy="text-display-title"]').should('contain', 'Text Display')
        cy.get('[data-cy="text-display-content"]')
          .should('be.visible')
          .should('contain', expectedContent)
        
        // Check second file content
        cy.get('[data-cy="text-card"]').eq(1)
          .should('contain', '1.txt')
          .click({ force: true })

        // Verify second text is displayed in the TextAnnotation component's display mode
        cy.get('[data-cy="text-display-container"]').should('be.visible')
        cy.get('[data-cy="text-display-title"]').should('contain', 'Text Display')
        cy.get('[data-cy="text-display-content"]')
          .should('be.visible')
          .should('contain', expectedContent)
      })
    })

    it('should delete a text', () => {
      // First add a text
      cy.get('[data-cy="upload-texts-btn"]')
        .should('be.visible')
        .click({ force: true })
      
      cy.get('[data-cy="upload-dropdown-content"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-cy="single-text-option"]')
            .should('be.visible')
            .click({ force: true })
        })

      cy.get('[data-cy="single-text-filename-input"]')
        .should('be.visible')
        .wait(500)
        .type('Text to Delete')
      cy.get('[data-cy="single-text-content-input"]')
        .should('be.visible')
        .type('This text will be deleted')
      cy.get('[data-cy="add-single-text-btn"]').click()

      // Verify text exists
      cy.get('[data-cy="text-card"]')
        .should('contain', 'Text to Delete')

      // Delete the text using the delete button in the card header
      cy.get('[data-cy="text-card"]')
        .should('contain', 'Text to Delete')
        .find('[data-cy="delete-text-btn"]')
        .click({ force: true })

      // Verify text is removed
      cy.get('[data-cy="text-card"]')
        .should('not.exist')
    })
  })

  context('Table Uploads', () => {
    beforeEach(() => {
      // Clear IndexedDB (Dexie) before each test
      indexedDB.deleteDatabase('myDatabase')
      // Start from the homepage
      cy.visit('http://localhost:3000/dataPointExtraction')
      // Click the text upload tab
      cy.get('[data-cy="text-upload-tab"]').click()
      
      // Create a test dataset
      cy.get('[data-cy="add-dataset-button"]').click()
      cy.get('[data-cy="entity-name-input"]').type('Test Dataset')
      cy.get('[data-cy="entity-description-input"]').type('This is a test dataset')
      cy.get('[data-cy="entity-save-button"]').click()
    })

    it('should upload Excel file and import texts', () => {
      // First read the Excel file to get the expected row count
      cy.task('readExcelRowCount', 'cypress/fixtures/test_texts/claude-echos.xlsx').then((rowCount) => {
        // Upload Excel file
        cy.get('[data-cy="upload-texts-btn"]')
          .should('be.visible')
          .click({ force: true })
        
        cy.get('[data-cy="upload-dropdown-content"]')
          .should('be.visible')
          .within(() => {
            cy.get('[data-cy="upload-table-option"]')
              .should('be.visible')
              .click({ force: true })
          })

        cy.get('[data-cy="table-file-input"]').attachFile({
          filePath: 'test_texts/claude-echos.xlsx',
          fileName: 'claude-echos.xlsx',
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })

        // Add a small wait to ensure the table has time to initialize
        cy.wait(1000)
        
        // Verify table is displayed
        cy.get('[data-cy="table-grid"]').should('be.visible')

        // Select index column by clicking on the header
        cy.get('[data-cy="select-index-column-btn"]').click()
        cy.get('[data-cy="table-grid"]')
          .find('.ag-header-cell[col-id="Index"]')
          .click()

        // Select text column by clicking on the header  
        cy.get('[data-cy="select-text-column-btn"]').click()
        cy.get('[data-cy="table-grid"]')
          .find('.ag-header-cell[col-id="Text"]')
          .click()

        // Import texts
        cy.get('[data-cy="import-texts-btn"]').click()

        // Verify the number of imported texts matches the Excel row count
        cy.get('[data-cy="text-card"]')
          .should('have.length', rowCount)
          .then(() => {
            cy.log(`Successfully imported ${rowCount} texts`)
          })

        // Verify content of first text
        cy.get('[data-cy="text-card"]').first().click({ force: true })
        cy.get('[data-cy="text-display-container"]').should('be.visible')
        cy.get('[data-cy="text-display-title"]').should('contain', 'Text Display')
        cy.get('[data-cy="text-display-content"]').should('not.be.empty')
      })
    })
  })
})