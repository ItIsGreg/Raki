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
      cy.get('[data-cy="entity-name-input"]').type('Test Dataset')
      cy.get('[data-cy="entity-description-input"]').type('This is a test dataset')
      cy.get('[data-cy="entity-save-button"]').click()
    })

    it('should add a single text through the UI', () => {
      // Click on the dataset to make it active
      cy.get('[data-cy="dataset-card"]').click()

      // Open single text input dialog
      cy.get('[data-cy="single-text-btn"]').click()

      // Fill in the text details
      cy.get('[data-cy="single-text-filename-input"]').type('Sample Text')
      cy.get('[data-cy="single-text-content-input"]').type('This is a sample text content.')

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
      cy.readFile('cypress/fixtures/test_texts/txts/0.txt').then((expectedContent) => {
        // Upload a text file from the fixtures directory
        cy.get('[data-cy="upload-texts-btn"]').click()
        cy.get('[data-cy="file-input"]').attachFile({
          filePath: 'test_texts/txts/0.txt',
          fileName: '0.txt',
          mimeType: 'text/plain'
        })

        // Verify the uploaded file appears in the list
        cy.get('[data-cy="text-card"]')
          .should('be.visible')
          .should('contain', '0.txt')
          .click()

        // Verify the file content is displayed correctly
        cy.get('[data-cy="text-display-filename"]').should('contain', '0.txt')
        cy.get('[data-cy="text-display-content"]').should('contain', expectedContent)
      })
    })

    it('should upload multiple text files and display their content', () => {
      // Click on the dataset to make it active
      cy.get('[data-cy="dataset-card"]').click()

      // Read the test file content first to compare later
      cy.readFile('cypress/fixtures/test_texts/txts/0.txt').then((expectedContent) => {
        // Upload multiple files from the fixtures directory
        cy.get('[data-cy="upload-texts-btn"]').click()
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
        cy.get('[data-cy="text-card"]').first().should('contain', '0.txt').click()
        cy.get('[data-cy="text-display-filename"]').should('contain', '0.txt')
        cy.get('[data-cy="text-display-content"]').should('contain', expectedContent)
        
        // Check second file content
        cy.get('[data-cy="text-card"]').eq(1).should('contain', '1.txt').click()
        cy.get('[data-cy="text-display-filename"]').should('contain', '1.txt')
        cy.get('[data-cy="text-display-content"]').should('contain', expectedContent)
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

  context('Table Uploads', () => {
    beforeEach(() => {
      // Clear IndexedDB (Dexie) before each test
      indexedDB.deleteDatabase('myDatabase')
      // Start from the homepage
      cy.visit('http://localhost:3000/dataPointExtraction')
      
      // Navigate to datasets page and create a test dataset
      cy.get('[data-cy="datasets-card"]').click()
      cy.get('[data-cy="add-dataset-button"]').click()
      cy.get('[data-cy="entity-name-input"]').type('Test Dataset')
      cy.get('[data-cy="entity-description-input"]').type('This is a test dataset')
      cy.get('[data-cy="entity-save-button"]').click()
    })

    it('should upload Excel file and import texts', () => {
      // First read the Excel file to get the expected row count
      cy.task('readExcelRowCount', 'cypress/fixtures/test_texts/claude-echos.xlsx').then((rowCount) => {
        // Click on the dataset to make it active
        cy.get('[data-cy="dataset-card"]').click()
        
        // Upload Excel file
        cy.get('[data-cy="upload-table-btn"]').click()
        cy.get('[data-cy="table-file-input"]').attachFile({
          filePath: 'test_texts/claude-echos.xlsx',
          fileName: 'claude-echos.xlsx',
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })

        // Add a small wait to ensure the table has time to initialize
        cy.wait(1000)
        
        // Verify table is displayed
        cy.get('[data-cy="table-grid"]').should('be.visible')

        // Select index and text columns
        cy.get('[data-cy="index-column-select"]').click()
        cy.get('[data-cy="index-column-option-Index"]').click()

        cy.get('[data-cy="text-column-select"]').click()
        cy.get('[data-cy="text-column-option-Text"]').click()

        // Import texts
        cy.get('[data-cy="import-texts-btn"]').click()

        // Verify the number of imported texts matches the Excel row count
        cy.get('[data-cy="text-card"]')
          .should('have.length', rowCount)
          .then(() => {
            cy.log(`Successfully imported ${rowCount} texts`)
          })

        // Verify content of first text
        cy.get('[data-cy="text-card"]').first().click()
        cy.get('[data-cy="text-display-content"]').should('not.be.empty')
      })
    })
  })
})