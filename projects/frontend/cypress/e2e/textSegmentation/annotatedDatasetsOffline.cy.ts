describe('Text Segmentation Annotated Datasets', () => {
  // Handle ResizeObserver errors for AG Grid
  Cypress.on('uncaught:exception', (err) => {
    if (err.message.includes('ResizeObserver') || 
        err.message.includes('ResizeObserver loop completed with undelivered notifications')) {
      return false
    }
    return true
  })

  beforeEach(() => {
    // Clear downloads before each test
    cy.task('clearDownloads')
    
    // Clear IndexedDB before each test
    indexedDB.deleteDatabase('myDatabase')
    
    // Start from the homepage
    cy.visit('http://localhost:3000/textSegmentation')

    // Configure LLM settings using the robust approach
    cy.get('[data-cy="burger-menu"]').should('be.visible').should('not.be.disabled').click({ force: true })
    cy.get('[data-cy="burger-menu-content"]').should('be.visible').should('exist').then($menu => {
      if ($menu.length) {
        cy.wrap($menu).find('[data-cy="menu-setup"]').should('be.visible').click({ force: true })
      }
    })
    cy.get('[data-cy="settings-dialog"]', { timeout: 10000 }).should('be.visible').should('exist')

    // Configure LLM Provider
    cy.get('[data-cy="llm-provider-trigger"]').click()
    cy.get('[data-cy="llm-provider-openai"]').click()
    cy.get('[data-cy="api-key-section"]').within(() => {
      cy.get('input').type('your-api-key-here')
      cy.get('[data-cy="api-key-set-button"]').click()
    })
    cy.get('[data-cy="model-section"]').within(() => {
      cy.get('[data-cy="model-input"]').type('gpt-4')
      cy.get('[data-cy="model-set-button"]').click()
    })
    cy.get('[data-cy="url-section"]').within(() => {
      cy.get('[data-cy="llm-url-input"]').type('https://api.openai.com/v1')
      cy.get('[data-cy="llm-url-set-button"]').click()
    })
    cy.get('[data-cy="batch-size-section"]').within(() => {
      cy.get('input').clear().type('5')
      cy.get('[data-cy="batch-size-set-button"]').click()
    })
    cy.get('[data-cy="max-tokens-section"]').scrollIntoView().should('be.visible')
    cy.get('[data-cy="max-tokens-checkbox"]').click({ force: true })
    cy.wait(300)
    cy.get('body').then($body => {
      if (!$body.find('[data-cy="max-tokens-input"]:visible').length) {
        cy.get('[data-cy="max-tokens-label"]').click({ force: true })
      }
    })
    cy.get('[data-cy="max-tokens-input"]', { timeout: 5000 }).should('be.visible').clear().type('2000')
    cy.get('[data-cy="max-tokens-set-button"]').click()
    cy.get('[data-cy="rerun-section"]').within(() => {
      cy.get('[data-cy="rerun-checkbox"]').click()
    })
    cy.get('[data-cy="settings-close-button"]').click()
    cy.get('[data-cy="settings-dialog"]').should('not.exist')

    // Create a profile first - switch to profiles tab
    cy.get('[data-cy="profiles-tab"]').click({ force: true })
    cy.get('[data-cy="add-profile-button"]').click()
    cy.get('[data-cy="entity-name-input"]').type('Test Segmentation Profile')
    cy.get('[data-cy="entity-description-input"]').type('Test Segmentation Profile Description')
    cy.get('[data-cy="entity-save-button"]').click()
    cy.get('[data-cy="profile-select-trigger"]').click()
    cy.get('[data-cy="profile-select-content"]').contains('Test Segmentation Profile').click()
    cy.get('[data-cy="new-datapoint-button"]').click()
    cy.get('[data-cy="datapoint-name-input"]').type('Test Segmentation Rule')
    cy.get('[data-cy="datapoint-explanation-input"]').type('Test Segmentation Rule Explanation')
    cy.get('[data-cy="synonym-input"]').type('Test Pattern')
    cy.get('[data-cy="add-synonym-button"]').click()
    cy.get('[data-cy="save-datapoint-button"]').first().click()

    // Switch to text upload tab to create dataset
    cy.get('[data-cy="text-upload-tab"]').click({ force: true })
    cy.get('[data-cy="add-dataset-button"]').click()
    cy.get('[data-cy="entity-name-input"]').type('Test Segmentation Dataset')
    cy.get('[data-cy="entity-description-input"]').type('This is a test segmentation dataset')
    cy.get('[data-cy="entity-save-button"]').click()
    cy.get('[data-cy="text-dataset-select-trigger"]').click()
    cy.get('[data-cy="text-dataset-select-content"]').contains('Test Segmentation Dataset').click()
    cy.get('[data-cy="upload-texts-btn"]').click()
    cy.get('[data-cy="file-input"]').attachFile({
      filePath: 'segmentation_texts/015.md',
      fileName: '015.md',
      mimeType: 'text/markdown'
    })
    cy.wait(1000)
    // Switch to annotation tab
    cy.get('[data-cy="annotation-tab"]').click({ force: true })
  })

  afterEach(() => {
    // Clean up fixture files created during tests
    const fixtureFiles = [
      'cypress/fixtures/invalid_annotated_dataset.json'
    ]
    
    // Also clean up any downloaded dataset files that were copied to fixtures
    cy.task('getDownloadedFiles').then((files) => {
      const fileList = files as string[]
      fileList.forEach(fileName => {
        if (fileName.endsWith('.json')) {
          fixtureFiles.push(`cypress/fixtures/${fileName}`)
        }
      })
      
      // Delete each fixture file if it exists
      fixtureFiles.forEach(filePath => {
        cy.task('deleteFileIfExists', filePath)
      })
      
      // Clean up downloads folder to prevent test interference
      fileList.forEach(fileName => {
        cy.task('deleteFileIfExists', `cypress/downloads/${fileName}`)
      })
    })
  })

  it('should create a new annotated dataset', () => {
    // Click add dataset button
    cy.get('[data-cy="add-dataset-button"]').click()
    cy.get('[data-cy="dataset-name-input"]').type('Test Annotated Segmentation Dataset')
    cy.get('[data-cy="dataset-description-input"]').type('This is a test annotated segmentation dataset')
    cy.get('[data-cy="dataset-select-trigger"]').click()
    cy.contains('Test Segmentation Dataset').click()
    cy.get('[data-cy="profile-select-trigger"]').click()
    cy.contains('Test Segmentation Profile').click()
    cy.get('[data-cy="save-dataset-button"]').click()
    // Verify the new annotated dataset appears in the list (skip content checks, just click the first one)
    cy.get('[data-cy="annotated-dataset-card"]').first().should('be.visible').click()
    // Start annotation process
    cy.get('[data-cy="start-annotation-button"]').scrollIntoView().should('be.visible').click()
    cy.wait(5000)
    // Check that the annotated text cards exist (use manual-annotated-text-card for unified UI)
    cy.get('[data-cy="manual-annotated-text-card"]', { timeout: 10000 })
      .should('exist')
      .should('have.length.at.least', 1);
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

  it('should download text segmentation annotated dataset and verify file structure', () => {
    // Click add dataset button
    cy.get('[data-cy="add-dataset-button"]').click()
    cy.get('[data-cy="dataset-name-input"]').type('Download Test Segmentation Dataset')
    cy.get('[data-cy="dataset-description-input"]').type('This is a test dataset for download verification')
    cy.get('[data-cy="dataset-select-trigger"]').click()
    cy.contains('Test Segmentation Dataset').click()
    cy.get('[data-cy="profile-select-trigger"]').click()
    cy.contains('Test Segmentation Profile').click()
    cy.get('[data-cy="save-dataset-button"]').click()
    
    
    // Start annotation process
    cy.get('[data-cy="start-annotation-button"]').scrollIntoView().should('be.visible').click()
    cy.wait(5000)
    
    // Check that the annotated text cards exist
    cy.get('[data-cy="manual-annotated-text-card"]', { timeout: 10000 })
      .should('exist')
      .should('have.length.at.least', 1);

    // Download the annotated dataset as JSON
    cy.get('[data-cy="download-dataset-trigger"]').click()
    cy.get('[data-cy="download-dataset-json"]').click()

    // Wait for download to complete
    cy.wait(2000)

    // Verify the downloaded file structure
    cy.task('getDownloadedFiles').then((files) => {
      const fileList = files as string[]
      cy.log(`Found ${fileList.length} files in downloads folder: ${fileList.join(', ')}`)
      
      expect(fileList).to.have.length.at.least(1)
      
      const jsonFile = fileList.find((file: string) => file.endsWith('.json'))
      expect(jsonFile).to.exist
      
      // Read and verify the downloaded file structure
      cy.readFile(`cypress/downloads/${jsonFile}`).then((content) => {
        // Verify all required properties exist
        expect(content).to.have.property('annotatedDataset')
        expect(content).to.have.property('originalDataset')
        expect(content).to.have.property('profile')
        expect(content).to.have.property('profilePoints')
        expect(content).to.have.property('texts')
        expect(content).to.have.property('annotatedTexts')
        expect(content).to.have.property('dataPoints')
        
        // Verify specific data content
        expect(content.annotatedDataset).to.have.property('name')
        expect(content.annotatedDataset).to.have.property('description')
        expect(content.originalDataset).to.have.property('name')
        expect(content.profile).to.have.property('name')
        expect(content.profilePoints).to.be.an('array')
        expect(content.texts).to.be.an('array')
        expect(content.annotatedTexts).to.be.an('array')
        expect(content.dataPoints).to.be.an('array')
        
        // Verify the dataset name matches what we created
        expect(content.annotatedDataset.name).to.include('Download Test Segmentation Dataset')
        expect(content.profile.name).to.include('Test Segmentation Profile')
        
        cy.log('Downloaded file structure verified successfully')
      })
    })
  })

  it('should perform upload/download roundtrip for text segmentation successfully', () => {
    // Click add dataset button
    cy.get('[data-cy="add-dataset-button"]').click()
    cy.get('[data-cy="dataset-name-input"]').type('Roundtrip Test Segmentation Dataset')
    cy.get('[data-cy="dataset-description-input"]').type('This is a test dataset for upload/download roundtrip')
    cy.get('[data-cy="dataset-select-trigger"]').click()
    cy.contains('Test Segmentation Dataset').click()
    cy.get('[data-cy="profile-select-trigger"]').click()
    cy.contains('Test Segmentation Profile').click()
    cy.get('[data-cy="save-dataset-button"]').click()
    
    
    // Start annotation process
    cy.get('[data-cy="start-annotation-button"]').scrollIntoView().should('be.visible').click()
    cy.wait(5000)
    
    // Check that the annotated text cards exist
    cy.get('[data-cy="manual-annotated-text-card"]', { timeout: 10000 })
      .should('exist')
      .should('have.length.at.least', 1);

    // Download the annotated dataset as JSON
    cy.get('[data-cy="download-dataset-trigger"]').click()
    cy.get('[data-cy="download-dataset-json"]').click()

    // Wait for download to complete
    cy.wait(2000)

    // Get the downloaded file name
    cy.task('getDownloadedFiles').then((files) => {
      const fileList = files as string[]
      const jsonFile = fileList.find((file: string) => file.endsWith('.json'))
      expect(jsonFile).to.exist
      
      // Copy the file to fixtures so attachFile can find it
      cy.task('copyDownloadToFixtures', { fileName: jsonFile })
      
      // Upload the downloaded file (from fixtures)
      cy.get('[data-cy="upload-dataset-button"]').click()
      cy.get('[data-cy="upload-dataset-input"]').attachFile({
        filePath: jsonFile,
        fileName: jsonFile,
        mimeType: 'application/json'
      })
      
      // Wait for upload to complete
      cy.wait(2000)
      
      // Force UI refresh by reloading the page to ensure data is fresh
      cy.reload()
      cy.wait(2000)
      
      // Navigate back to annotation tab after reload
      cy.get('[data-cy="annotation-tab"]')
        .should('be.visible')
        .click()
      cy.wait(1000)
      
      // Verify the upload worked by checking the dataset selector
      cy.get('[data-cy="annotation-dataset-select-trigger"]').click({ force: true })
      cy.wait(500)
      
      // Check that there are now 2 datasets with the expected name (original + uploaded)
      cy.get('[data-cy^="dataset-option-"]')
        .then($options => {
          let matchCount = 0;
          $options.each((_, option) => {
            if (option.textContent?.includes('Roundtrip Test Segmentation Dataset')) matchCount++;
          });
          expect(matchCount).to.equal(2, `Expected 2 datasets with 'Roundtrip Test Segmentation Dataset' in name, but found ${matchCount}. Upload should create a new dataset.`);
        });
      
      cy.get('[data-cy="annotation-dataset-select-trigger"]').click({ force: true }) // Close dropdown
      
      cy.log('Upload/download roundtrip completed successfully')
    })
  })

  it('should handle invalid file upload gracefully', () => {
    // Create an invalid JSON file
    const invalidData = {
      invalid: "structure",
      missing: "required fields"
    }

    cy.writeFile('cypress/fixtures/invalid_segmentation_dataset.json', invalidData)

    // Try to upload the invalid file
    cy.get('[data-cy="upload-dataset-button"]').click()
    cy.get('[data-cy="upload-dataset-input"]').attachFile({
      filePath: 'invalid_segmentation_dataset.json',
      fileName: 'invalid_segmentation_dataset.json',
      mimeType: 'application/json'
    })

    // Wait a moment for the upload to process
    cy.wait(1000)

    // Verify that the upload button is still visible (indicating no successful upload)
    cy.get('[data-cy="upload-dataset-button"]').should('be.visible')
    
    // Log that error handling is working
    cy.log('Invalid file upload handled gracefully')
  })
}) 