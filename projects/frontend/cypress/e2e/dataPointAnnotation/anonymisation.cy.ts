describe('Anonymisation Tests', () => {
  beforeEach(() => {
    // Clear IndexedDB (Dexie) before each test
    indexedDB.deleteDatabase('myDatabase')
    // Start from the homepage
    cy.visit('http://localhost:3000/dataPointExtraction')
    // Click the text upload tab
    cy.get('[data-cy="text-upload-tab"]').click()
    
    // Create a test dataset
    cy.get('[data-cy="add-dataset-button"]').click()
    cy.get('[data-cy="entity-name-input"]').type('Anonymisation Test Dataset')
    cy.get('[data-cy="entity-description-input"]').type('Dataset for testing anonymisation functionality')
    cy.get('[data-cy="entity-save-button"]').click()
  })

  context('Basic Anonymisation Workflow', () => {
    it('should enter anonymisation mode and select columns', () => {
      // Upload Excel file with sensitive data
      cy.get('[data-cy="upload-texts-btn"]').click()
      cy.get('[data-cy="upload-dropdown-content"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-cy="upload-table-option"]').click()
        })

      cy.get('[data-cy="table-file-input"]').attachFile({
        filePath: '../../public/example-echos-with-names-dobs.xlsx',
        fileName: 'example-echos-with-names-dobs.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })

      // Wait for table to load
      cy.wait(1000)
      cy.get('[data-cy="table-grid"]').should('be.visible')

      // Enter anonymisation mode
      cy.get('[data-cy="start-anonymisation-btn"]')
        .should('be.visible')
        .click()

      // Verify anonymisation mode is active
      cy.get('[data-cy="start-anonymisation-btn"]')
        .should('contain', 'Exit Anonymisation')

      // Select columns for anonymisation
      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="first_name"]')
        .click()

      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="last_name"]')
        .click()

      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="dob"]')
        .click()

      // Verify selected columns are highlighted
      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="first_name"]')
        .should('have.class', 'anonymisation-selected')

      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="last_name"]')
        .should('have.class', 'anonymisation-selected')

      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="dob"]')
        .should('have.class', 'anonymisation-selected')

      // Verify selection count is displayed
      cy.get('[data-cy="proceed-anonymisation-btn"]')
        .should('contain', 'Proceed with Anonymisation (3 columns)')
    })

    it('should apply anonymisation during text import', () => {
      // Upload Excel file
      cy.get('[data-cy="upload-texts-btn"]').click()
      cy.get('[data-cy="upload-dropdown-content"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-cy="upload-table-option"]').click()
        })

      cy.get('[data-cy="table-file-input"]').attachFile({
        filePath: '../../public/example-echos-with-names-dobs.xlsx',
        fileName: 'example-echos-with-names-dobs.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })

      cy.wait(1000)
      cy.get('[data-cy="table-grid"]').should('be.visible')

      // Select index and text columns
      cy.get('[data-cy="select-index-column-btn"]').click()
      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="Index"]')
        .click()

      cy.get('[data-cy="select-text-column-btn"]').click()
      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="Text"]')
        .click()

      // Enter anonymisation mode and select sensitive columns
      cy.get('[data-cy="start-anonymisation-btn"]').click()
      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="first_name"]')
        .click()
      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="last_name"]')
        .click()
      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="dob"]')
        .click()

      // Import texts with anonymisation
      cy.get('[data-cy="import-texts-btn"]').click()

      // Verify texts were imported
      cy.get('[data-cy="text-card"]').should('have.length', 20)

      // Check that sensitive data is redacted in the first text
      cy.get('[data-cy="text-card"]').first().click()
      cy.get('[data-cy="text-display-container"]').should('be.visible')
      cy.get('[data-cy="text-display-content"]')
        .should('contain', '[REDACTED]')
        .and('not.contain', 'Cameron')
        .and('not.contain', 'Hill')
        .and('not.contain', '06/09/1955')
    })

    it('should exit anonymisation mode correctly', () => {
      // Upload Excel file
      cy.get('[data-cy="upload-texts-btn"]').click()
      cy.get('[data-cy="upload-dropdown-content"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-cy="upload-table-option"]').click()
        })

      cy.get('[data-cy="table-file-input"]').attachFile({
        filePath: '../../public/example-echos-with-names-dobs.xlsx',
        fileName: 'example-echos-with-names-dobs.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })

      cy.wait(1000)
      cy.get('[data-cy="table-grid"]').should('be.visible')

      // Enter anonymisation mode
      cy.get('[data-cy="start-anonymisation-btn"]').click()

      // Select a column
      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="first_name"]')
        .click()

      // Exit anonymisation mode
      cy.get('[data-cy="start-anonymisation-btn"]').click()

      // Verify mode is exited
      cy.get('[data-cy="start-anonymisation-btn"]')
        .should('contain', 'Start Anonymisation')

      // Verify selection is cleared
      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="first_name"]')
        .should('not.have.class', 'anonymisation-selected')
    })
  })

  context('Anonymisation Data Verification', () => {
    it('should redact first names correctly', () => {
      // Upload and setup anonymisation
      cy.get('[data-cy="upload-texts-btn"]').click()
      cy.get('[data-cy="upload-dropdown-content"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-cy="upload-table-option"]').click()
        })

      cy.get('[data-cy="table-file-input"]').attachFile({
        filePath: '../../public/example-echos-with-names-dobs.xlsx',
        fileName: 'example-echos-with-names-dobs.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })

      cy.wait(1000)

      // Select columns
      cy.get('[data-cy="select-index-column-btn"]').click()
      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="Index"]')
        .click()

      cy.get('[data-cy="select-text-column-btn"]').click()
      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="Text"]')
        .click()

      // Select only first_name for anonymisation
      cy.get('[data-cy="start-anonymisation-btn"]').click()
      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="first_name"]')
        .click()

      // Import texts
      cy.get('[data-cy="import-texts-btn"]').click()

      // Check first text - should have first name redacted but last name and DOB visible
      cy.get('[data-cy="text-card"]').first().click()
      cy.get('[data-cy="text-display-content"]')
        .should('contain', '[REDACTED]') // First name should be redacted
        .and('contain', 'Hill') // Last name should still be visible
        .and('contain', '06/09/1955') // DOB should still be visible
    })

    it('should redact last names correctly', () => {
      // Upload and setup anonymisation
      cy.get('[data-cy="upload-texts-btn"]').click()
      cy.get('[data-cy="upload-dropdown-content"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-cy="upload-table-option"]').click()
        })

      cy.get('[data-cy="table-file-input"]').attachFile({
        filePath: '../../public/example-echos-with-names-dobs.xlsx',
        fileName: 'example-echos-with-names-dobs.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })

      cy.wait(1000)

      // Select columns
      cy.get('[data-cy="select-index-column-btn"]').click()
      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="Index"]')
        .click()

      cy.get('[data-cy="select-text-column-btn"]').click()
      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="Text"]')
        .click()

      // Select only last_name for anonymisation
      cy.get('[data-cy="start-anonymisation-btn"]').click()
      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="last_name"]')
        .click()

      // Import texts
      cy.get('[data-cy="import-texts-btn"]').click()

      // Check first text - should have last name redacted but first name and DOB visible
      cy.get('[data-cy="text-card"]').first().click()
      cy.get('[data-cy="text-display-content"]')
        .should('contain', '[REDACTED]') // Last name should be redacted
        .and('contain', 'Cameron') // First name should still be visible
        .and('contain', '06/09/1955') // DOB should still be visible
    })

    it('should redact dates of birth correctly', () => {
      // Upload and setup anonymisation
      cy.get('[data-cy="upload-texts-btn"]').click()
      cy.get('[data-cy="upload-dropdown-content"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-cy="upload-table-option"]').click()
        })

      cy.get('[data-cy="table-file-input"]').attachFile({
        filePath: '../../public/example-echos-with-names-dobs.xlsx',
        fileName: 'example-echos-with-names-dobs.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })

      cy.wait(1000)

      // Select columns
      cy.get('[data-cy="select-index-column-btn"]').click()
      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="Index"]')
        .click()

      cy.get('[data-cy="select-text-column-btn"]').click()
      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="Text"]')
        .click()

      // Select only dob for anonymisation
      cy.get('[data-cy="start-anonymisation-btn"]').click()
      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="dob"]')
        .click()

      // Import texts
      cy.get('[data-cy="import-texts-btn"]').click()

      // Check first text - should have DOB redacted but names visible
      cy.get('[data-cy="text-card"]').first().click()
      cy.get('[data-cy="text-display-content"]')
        .should('contain', '[REDACTED]') // DOB should be redacted
        .and('contain', 'Cameron') // First name should still be visible
        .and('contain', 'Hill') // Last name should still be visible
    })

    it('should handle multiple sensitive columns simultaneously', () => {
      // Upload and setup anonymisation
      cy.get('[data-cy="upload-texts-btn"]').click()
      cy.get('[data-cy="upload-dropdown-content"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-cy="upload-table-option"]').click()
        })

      cy.get('[data-cy="table-file-input"]').attachFile({
        filePath: '../../public/example-echos-with-names-dobs.xlsx',
        fileName: 'example-echos-with-names-dobs.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })

      cy.wait(1000)

      // Select columns
      cy.get('[data-cy="select-index-column-btn"]').click()
      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="Index"]')
        .click()

      cy.get('[data-cy="select-text-column-btn"]').click()
      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="Text"]')
        .click()

      // Select all sensitive columns
      cy.get('[data-cy="start-anonymisation-btn"]').click()
      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="first_name"]')
        .click()
      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="last_name"]')
        .click()
      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="dob"]')
        .click()

      // Import texts
      cy.get('[data-cy="import-texts-btn"]').click()

      // Check first text - should have all sensitive data redacted
      cy.get('[data-cy="text-card"]').first().click()
      cy.get('[data-cy="text-display-content"]')
        .should('contain', '[REDACTED]')
        .and('not.contain', 'Cameron')
        .and('not.contain', 'Hill')
        .and('not.contain', '06/09/1955')

      // Check second text to verify consistency
      cy.get('[data-cy="text-card"]').eq(1).click()
      cy.get('[data-cy="text-display-content"]')
        .should('contain', '[REDACTED]')
        .and('not.contain', 'Matthew')
        .and('not.contain', 'Garcia')
        .and('not.contain', '10/16/2003')
    })
  })

  context('Edge Cases and Error Handling', () => {
    it('should handle empty anonymisation columns gracefully', () => {
      // Upload and setup anonymisation
      cy.get('[data-cy="upload-texts-btn"]').click()
      cy.get('[data-cy="upload-dropdown-content"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-cy="upload-table-option"]').click()
        })

      cy.get('[data-cy="table-file-input"]').attachFile({
        filePath: '../../public/example-echos-with-names-dobs.xlsx',
        fileName: 'example-echos-with-names-dobs.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })

      cy.wait(1000)

      // Select columns
      cy.get('[data-cy="select-index-column-btn"]').click()
      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="Index"]')
        .click()

      cy.get('[data-cy="select-text-column-btn"]').click()
      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="Text"]')
        .click()

      // Enter anonymisation mode but don't select any columns
      cy.get('[data-cy="start-anonymisation-btn"]').click()

      // Try to import - should work without anonymisation
      cy.get('[data-cy="import-texts-btn"]').click()

      // Verify texts were imported normally
      cy.get('[data-cy="text-card"]').should('have.length', 20)

      // Check that original data is preserved (no redaction)
      cy.get('[data-cy="text-card"]').first().click()
      cy.get('[data-cy="text-display-content"]')
        .should('contain', 'Cameron')
        .and('contain', 'Hill')
        .and('contain', '06/09/1955')
        .and('not.contain', '[REDACTED]')
    })

    it('should handle special characters in sensitive data', () => {
      // This test would require a custom Excel file with special characters
      // For now, we'll test that the anonymisation process doesn't break
      cy.get('[data-cy="upload-texts-btn"]').click()
      cy.get('[data-cy="upload-dropdown-content"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-cy="upload-table-option"]').click()
        })

      cy.get('[data-cy="table-file-input"]').attachFile({
        filePath: '../../public/example-echos-with-names-dobs.xlsx',
        fileName: 'example-echos-with-names-dobs.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })

      cy.wait(1000)

      // Select columns
      cy.get('[data-cy="select-index-column-btn"]').click()
      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="Index"]')
        .click()

      cy.get('[data-cy="select-text-column-btn"]').click()
      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="Text"]')
        .click()

      // Select all sensitive columns
      cy.get('[data-cy="start-anonymisation-btn"]').click()
      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="first_name"]')
        .click()
      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="last_name"]')
        .click()
      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="dob"]')
        .click()

      // Import should complete successfully
      cy.get('[data-cy="import-texts-btn"]').click()
      cy.get('[data-cy="text-card"]').should('have.length', 20)
    })

    it('should maintain data integrity when no anonymisation is applied', () => {
      // Upload and setup without anonymisation
      cy.get('[data-cy="upload-texts-btn"]').click()
      cy.get('[data-cy="upload-dropdown-content"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-cy="upload-table-option"]').click()
        })

      cy.get('[data-cy="table-file-input"]').attachFile({
        filePath: '../../public/example-echos-with-names-dobs.xlsx',
        fileName: 'example-echos-with-names-dobs.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })

      cy.wait(1000)

      // Select columns without entering anonymisation mode
      cy.get('[data-cy="select-index-column-btn"]').click()
      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="Index"]')
        .click()

      cy.get('[data-cy="select-text-column-btn"]').click()
      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="Text"]')
        .click()

      // Import without anonymisation
      cy.get('[data-cy="import-texts-btn"]').click()

      // Verify original data is preserved
      cy.get('[data-cy="text-card"]').should('have.length', 20)
      cy.get('[data-cy="text-card"]').first().click()
      cy.get('[data-cy="text-display-content"]')
        .should('contain', 'Cameron')
        .and('contain', 'Hill')
        .and('contain', '06/09/1955')
        .and('not.contain', '[REDACTED]')
    })
  })

  context('UI/UX Testing', () => {
    it('should provide clear visual feedback during anonymisation mode', () => {
      // Upload Excel file
      cy.get('[data-cy="upload-texts-btn"]').click()
      cy.get('[data-cy="upload-dropdown-content"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-cy="upload-table-option"]').click()
        })

      cy.get('[data-cy="table-file-input"]').attachFile({
        filePath: '../../public/example-echos-with-names-dobs.xlsx',
        fileName: 'example-echos-with-names-dobs.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })

      cy.wait(1000)
      cy.get('[data-cy="table-grid"]').should('be.visible')

      // Check initial state
      cy.get('[data-cy="start-anonymisation-btn"]')
        .should('contain', 'Start Anonymisation')
        .and('not.have.class', 'bg-primary')

      // Enter anonymisation mode
      cy.get('[data-cy="start-anonymisation-btn"]').click()

      // Check active state
      cy.get('[data-cy="start-anonymisation-btn"]')
        .should('contain', 'Exit Anonymisation')
        .and('have.class', 'bg-primary')

      // Verify instruction panel is visible
      cy.contains('Anonymisation Mode Active').should('be.visible')
      cy.contains('Click on column headers to select which columns to anonymise.').should('be.visible')

      // Select a column and verify feedback
      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="first_name"]')
        .click()

      // Verify selected columns are displayed
      cy.contains('Selected columns for anonymisation:').should('be.visible')
      cy.contains('first_name').should('be.visible')

      // Verify proceed button is enabled
      cy.get('[data-cy="proceed-anonymisation-btn"]')
        .should('contain', 'Proceed with Anonymisation (1 columns)')
        .and('not.be.disabled')
    })

    it('should handle column selection and deselection correctly', () => {
      // Upload Excel file
      cy.get('[data-cy="upload-texts-btn"]').click()
      cy.get('[data-cy="upload-dropdown-content"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-cy="upload-table-option"]').click()
        })

      cy.get('[data-cy="table-file-input"]').attachFile({
        filePath: '../../public/example-echos-with-names-dobs.xlsx',
        fileName: 'example-echos-with-names-dobs.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })

      cy.wait(1000)

      // Enter anonymisation mode
      cy.get('[data-cy="start-anonymisation-btn"]').click()

      // Select first column
      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="first_name"]')
        .click()

      cy.get('[data-cy="proceed-anonymisation-btn"]')
        .should('contain', 'Proceed with Anonymisation (1 columns)')

      // Select second column
      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="last_name"]')
        .click()

      cy.get('[data-cy="proceed-anonymisation-btn"]')
        .should('contain', 'Proceed with Anonymisation (2 columns)')

      // Deselect first column
      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="first_name"]')
        .click()

      cy.get('[data-cy="proceed-anonymisation-btn"]')
        .should('contain', 'Proceed with Anonymisation (1 columns)')

      // Verify only last_name is selected
      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="first_name"]')
        .should('not.have.class', 'anonymisation-selected')

      cy.get('[data-cy="table-grid"]')
        .find('.ag-header-cell[col-id="last_name"]')
        .should('have.class', 'anonymisation-selected')
    })
  })
}) 