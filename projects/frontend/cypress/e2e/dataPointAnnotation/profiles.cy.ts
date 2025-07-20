describe('Profiles page', () => {
  beforeEach(() => {
    // Clear IndexedDB (Dexie) before each test
    indexedDB.deleteDatabase('myDatabase')
    
    // Start from the homepage before each test
    cy.visit('http://localhost:3000/dataPointExtraction')
  })

  it('should navigate to profiles page and show all components', () => {
    // Click on the Profiles tab
    cy.get('[data-cy="profiles-tab"]')
      .should('be.visible')
      .click()
    
    // Add a small wait to ensure tab switch completes
    cy.wait(500)
    
    // Verify the profiles page components are present
    cy.get('[data-cy="profile-select-trigger"]').should('be.visible')
    cy.get('[data-cy="add-profile-button"]').should('be.visible')
  })

  it('should create a new profile and select it', () => {
    const profileName = 'Test Profile'
    const profileDescription = 'Test Profile Description'

    // Navigate to profiles page
    cy.get('[data-cy="profiles-tab"]').click()
    
    // Click add profile button
    cy.get('[data-cy="add-profile-button"]').click()
    
    // Fill out the form
    cy.get('[data-cy="entity-name-input"]')
      .should('be.visible')
      .type(profileName)
    
    cy.get('[data-cy="entity-description-input"]')
      .should('be.visible')
      .type(profileDescription)
    
    // Save the profile
    cy.get('[data-cy="entity-save-button"]').click()
    
    // Wait for the profile to be created and verify it appears in the select
    cy.get('[data-cy="profile-select-trigger"]')
      .should('be.visible')
      .click()
    
    cy.get('[data-cy="profile-select-content"]')
      .should('be.visible')
      .contains(profileName)
      .click()
      
    // Verify the profile is selected
    cy.get('[data-cy="profile-select-trigger"]')
      .should('contain', profileName)
  })

  it('should create a new data point', () => {
    const profileName = 'Test Profile'
    const profileDescription = 'Test Profile Description'
    const datapointName = 'Test Data Point'
    const datapointExplanation = 'Test Data Point Explanation'
    const synonym = 'Test Synonym'

    // Navigate to profiles page and create a profile first
    cy.get('[data-cy="profiles-tab"]').click()
    cy.get('[data-cy="add-profile-button"]').click()
    cy.get('[data-cy="entity-name-input"]').type(profileName)
    cy.get('[data-cy="entity-description-input"]').type(profileDescription)
    cy.get('[data-cy="entity-save-button"]').click()

    // Select the created profile
    cy.get('[data-cy="profile-select-trigger"]').click()
    cy.get('[data-cy="profile-select-content"]')
      .contains(profileName)
      .click()

    // Create a new data point
    cy.get('[data-cy="new-datapoint-button"]')
      .should('be.visible')
      .click()

    // Fill out the data point form
    cy.get('[data-cy="datapoint-name-input"]')
      .should('be.visible')
      .type(datapointName)

    cy.get('[data-cy="datapoint-explanation-input"]')
      .should('be.visible')
      .type(datapointExplanation)

    // Add a synonym
    cy.get('[data-cy="synonym-input"]')
      .should('be.visible')
      .type(synonym)
    cy.get('[data-cy="add-synonym-button"]').click()
    
    // Verify synonym appears in badge
    cy.get('[data-cy="synonym-badge-0"]')
      .should('be.visible')
      .should('contain', synonym)

    // Select datatype
    cy.get('[data-cy="datatype-trigger"]').click()
    cy.get('[data-cy="datatype-text"]').click()

    // Save the data point (using first() and scrollIntoView to handle visibility)
    cy.get('[data-cy="save-datapoint-button"]')
      .first()
      .scrollIntoView()
      .should('exist')
      .click()

    // Verify the data point appears in the list
    cy.get('[data-cy="datapoints-container"]')
      .should('be.visible')
      .find('[data-cy="datapoint-card"]')
      .should('contain', datapointName)
      .click()

    // Verify all the content after clicking
    cy.get('[data-cy="datapoint-name-input"]')
      .should('have.value', datapointName)

    cy.get('[data-cy="datapoint-explanation-input"]')
      .should('have.value', datapointExplanation)

    cy.get('[data-cy="synonym-badge-0"]')
      .should('contain', synonym)

    cy.get('[data-cy="datatype-trigger"]')
      .should('contain', 'Text')
  })


})

describe('Profile Upload and Download', () => {
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
    // Click the profiles tab
    cy.get('[data-cy="profiles-tab"]').click()
  })

  it('should upload a profile from JSON file', () => {
    // Create a test profile JSON file
    const testProfileData = {
      profile: {
        name: "Uploaded Test Profile",
        description: "This is a test profile uploaded from JSON",
        mode: "datapoint_extraction",
        example: "Example text for the profile"
      },
      profilePoints: [
        {
          name: "Uploaded Data Point 1",
          explanation: "First uploaded data point",
          synonyms: ["synonym1", "synonym2"],
          datatype: "text",
          valueset: [],
          unit: undefined
        },
        {
          name: "Uploaded Data Point 2", 
          explanation: "Second uploaded data point",
          synonyms: ["synonym3"],
          datatype: "number",
          valueset: [],
          unit: "mm"
        }
      ]
    }

    // Write the test file
    cy.writeFile('cypress/fixtures/test_profile.json', testProfileData)

    // Upload the profile
    cy.get('[data-cy="upload-profile-button"]').should('be.visible').click()
    cy.get('[data-cy="upload-profile-input"]').attachFile({
      filePath: 'test_profile.json',
      fileName: 'test_profile.json',
      mimeType: 'application/json'
    })

    // Verify the profile is uploaded and appears in the select dropdown
    cy.get('[data-cy="profile-select-trigger"]', { timeout: 10000 }).should('be.visible').click()
    cy.get('[data-cy="profile-select-content"]').should('be.visible').and('contain', 'Uploaded Test Profile')

    // Select the uploaded profile to verify data points were created
    cy.get('[data-cy="profile-select-content"]').contains('Uploaded Test Profile').click()
    cy.get('[data-cy="datapoint-card"]', { timeout: 10000 }).should('have.length', 2)
    cy.get('[data-cy="datapoint-card"]').should('contain', 'Uploaded Data Point 1')
    cy.get('[data-cy="datapoint-card"]').should('contain', 'Uploaded Data Point 2')
  })

  it('should handle invalid JSON file upload gracefully', () => {
    // Create an invalid JSON file
    const invalidData = {
      invalid: "structure",
      missing: "profile data"
    }

    cy.writeFile('cypress/fixtures/invalid_profile.json', invalidData)

    // Upload the invalid file
    cy.get('[data-cy="upload-profile-button"]').should('be.visible').click()
    cy.get('[data-cy="upload-profile-input"]').attachFile({
      filePath: 'invalid_profile.json',
      fileName: 'invalid_profile.json',
      mimeType: 'application/json'
    })

    // Verify an error alert is shown
    cy.on('window:alert', (text) => {
      expect(text).to.include('Error uploading profile')
    })
  })

  it('should handle malformed JSON file upload gracefully', () => {
    // Create a malformed JSON file
    const malformedData = '{ "invalid": "json", "missing": "quotes" }'

    cy.writeFile('cypress/fixtures/malformed_profile.json', malformedData)

    // Upload the malformed file
    cy.get('[data-cy="upload-profile-button"]').should('be.visible').click()
    cy.get('[data-cy="upload-profile-input"]').attachFile({
      filePath: 'malformed_profile.json',
      fileName: 'malformed_profile.json',
      mimeType: 'application/json'
    })

    // Verify an error alert is shown
    cy.on('window:alert', (text) => {
      expect(text).to.include('Error uploading profile')
    })
  })

  afterEach(() => {
    // Clean up test files
    cy.task('deleteFile', 'cypress/fixtures/test_profile.json').then(() => {
      // File deleted or didn't exist
    })
    cy.task('deleteFile', 'cypress/fixtures/invalid_profile.json').then(() => {
      // File deleted or didn't exist
    })
    cy.task('deleteFile', 'cypress/fixtures/malformed_profile.json').then(() => {
      // File deleted or didn't exist
    })
  })
})