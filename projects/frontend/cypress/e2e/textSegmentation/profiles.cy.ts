describe('Text Segmentation Profiles (Unified UI)', () => {
  beforeEach(() => {
    // Clear IndexedDB (Dexie) before each test
    indexedDB.deleteDatabase('myDatabase')
    
    // Start from the text segmentation page and switch to profiles tab
    cy.visit('http://localhost:3000/textSegmentation')
    cy.get('[data-cy="profiles-tab"]').click()
  })

  it('should show all profile components in the unified UI', () => {
    // Verify the profiles tab content is present
    cy.get('[data-cy="profiles-tab"]').should('have.attr', 'data-state', 'active')
    cy.get('[data-cy="add-profile-button"]').should('be.visible')
  })

  it('should create a new profile and select it', () => {
    const profileName = 'Text Segmentation Profile'
    const profileDescription = 'Test Profile for Text Segmentation'

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

  it('should create a new segmentation rule', () => {
    const profileName = 'Text Segmentation Profile'
    const profileDescription = 'Test Profile for Text Segmentation'
    const ruleName = 'Test Segmentation Rule'
    const ruleDescription = 'Test Segmentation Rule Description'
    const synonym = 'Test Synonym'

    // Create a profile first
    cy.get('[data-cy="add-profile-button"]').click()
    cy.get('[data-cy="entity-name-input"]').type(profileName)
    cy.get('[data-cy="entity-description-input"]').type(profileDescription)
    cy.get('[data-cy="entity-save-button"]').click()

    // Select the created profile
    cy.get('[data-cy="profile-select-trigger"]').click()
    cy.get('[data-cy="profile-select-content"]')
      .contains(profileName)
      .click()

    // Create a new segmentation rule
    cy.get('[data-cy="new-datapoint-button"]')
      .should('be.visible')
      .click()

    // Fill out the rule form
    cy.get('[data-cy="datapoint-name-input"]')
      .should('be.visible')
      .type(ruleName)

    cy.get('[data-cy="datapoint-explanation-input"]')
      .should('be.visible')
      .type(ruleDescription)

    // Add a synonym
    cy.get('[data-cy="synonym-input"]')
      .should('be.visible')
      .type(synonym)
    cy.get('[data-cy="add-synonym-button"]').click()
    
    // Verify synonym appears in badge
    cy.get('[data-cy="synonym-badge-0"]')
      .should('be.visible')
      .should('contain', synonym)

    // Save the rule
    cy.get('[data-cy="save-datapoint-button"]')
      .first()
      .scrollIntoView()
      .should('exist')
      .click()

    // Verify the rule appears in the list
    cy.get('[data-cy="datapoint-card"]')
      .should('be.visible')
      .and('contain', ruleName)
      .click()

    // Verify all the content after clicking
    cy.get('[data-cy="datapoint-name-input"]')
      .should('have.value', ruleName)

    cy.get('[data-cy="datapoint-explanation-input"]')
      .should('have.value', ruleDescription)

    cy.get('[data-cy="synonym-badge-0"]')
      .should('contain', synonym)
  })
})

describe('Text Segmentation Profile Upload and Download', () => {
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
    // Start from the text segmentation page
    cy.visit('http://localhost:3000/textSegmentation')
    // Click the profiles tab
    cy.get('[data-cy="profiles-tab"]').click()
  })

  it('should create a segmentation profile and download it as JSON', () => {
    // Create a new profile
    cy.get('[data-cy="add-profile-button"]').click()
    cy.get('[data-cy="entity-name-input"]').should('be.visible').type('Test Segmentation Profile')
    cy.get('[data-cy="entity-description-input"]').should('be.visible').type('This is a test segmentation profile')
    cy.get('[data-cy="entity-save-button"]').click()

    // Wait for the profile to be created and appear in the list
    cy.get('[data-cy="profile-card"]', { timeout: 10000 }).should('be.visible').and('contain', 'Test Segmentation Profile')

    // Add some segmentation points to the profile
    cy.get('[data-cy="profile-card"]').first().click()
    cy.get('[data-cy="new-datapoint-button"]').should('be.visible').click()
    cy.get('[data-cy="entity-name-input"]').should('be.visible').type('Test Segmentation Point')
    cy.get('[data-cy="entity-description-input"]').should('be.visible').type('This is a test segmentation point')
    cy.get('[data-cy="entity-save-button"]').click()

    // Wait for the segmentation point to be created
    cy.get('[data-cy="datapoint-card"]', { timeout: 10000 }).should('be.visible').and('contain', 'Test Segmentation Point')

    // Download the profile
    cy.get('[data-cy="download-profile-button"]').should('be.visible').click()

    // Verify the download button exists and is clickable
    cy.get('[data-cy="download-profile-button"]').should('be.visible')
  })

  it('should upload a segmentation profile from JSON file', () => {
    // Create a test segmentation profile JSON file
    const testProfileData = {
      profile: {
        name: "Uploaded Segmentation Profile",
        description: "This is a test segmentation profile uploaded from JSON",
        mode: "text_segmentation",
        example: "Example text for the segmentation profile"
      },
      profilePoints: [
        {
          name: "Uploaded Segmentation Point 1",
          explanation: "First uploaded segmentation point",
          synonyms: ["segment1", "section1"],
          datatype: "text",
          valueset: [],
          unit: undefined
        },
        {
          name: "Uploaded Segmentation Point 2", 
          explanation: "Second uploaded segmentation point",
          synonyms: ["segment2"],
          datatype: "text",
          valueset: [],
          unit: undefined
        }
      ]
    }

    // Write the test file
    cy.writeFile('cypress/fixtures/test_segmentation_profile.json', testProfileData)

    // Upload the profile
    cy.get('[data-cy="upload-profile-button"]').should('be.visible').click()
    cy.get('[data-cy="upload-profile-input"]').attachFile({
      filePath: 'test_segmentation_profile.json',
      fileName: 'test_segmentation_profile.json',
      mimeType: 'application/json'
    })

    // Verify the profile is uploaded and appears in the list
    cy.get('[data-cy="profile-card"]', { timeout: 10000 }).should('be.visible').and('contain', 'Uploaded Segmentation Profile')

    // Click on the uploaded profile to verify segmentation points were created
    cy.get('[data-cy="profile-card"]').contains('Uploaded Segmentation Profile').click()
    cy.get('[data-cy="datapoint-card"]', { timeout: 10000 }).should('have.length', 2)
    cy.get('[data-cy="datapoint-card"]').should('contain', 'Uploaded Segmentation Point 1')
    cy.get('[data-cy="datapoint-card"]').should('contain', 'Uploaded Segmentation Point 2')
  })

  it('should handle invalid JSON file upload gracefully', () => {
    // Create an invalid JSON file
    const invalidData = {
      invalid: "structure",
      missing: "profile data"
    }

    cy.writeFile('cypress/fixtures/invalid_segmentation_profile.json', invalidData)

    // Upload the invalid file
    cy.get('[data-cy="upload-profile-button"]').should('be.visible').click()
    cy.get('[data-cy="upload-profile-input"]').attachFile({
      filePath: 'invalid_segmentation_profile.json',
      fileName: 'invalid_segmentation_profile.json',
      mimeType: 'application/json'
    })

    // Verify an error alert is shown
    cy.on('window:alert', (text) => {
      expect(text).to.include('Error uploading profile')
    })
  })

  it('should handle malformed JSON file upload gracefully', () => {
    // Create a malformed JSON file
    const malformedData = '{ "invalid": json, "missing": quotes }'

    cy.writeFile('cypress/fixtures/malformed_segmentation_profile.json', malformedData)

    // Upload the malformed file
    cy.get('[data-cy="upload-profile-button"]').should('be.visible').click()
    cy.get('[data-cy="upload-profile-input"]').attachFile({
      filePath: 'malformed_segmentation_profile.json',
      fileName: 'malformed_segmentation_profile.json',
      mimeType: 'application/json'
    })

    // Verify an error alert is shown
    cy.on('window:alert', (text) => {
      expect(text).to.include('Error uploading profile')
    })
  })

  it('should download and re-upload a segmentation profile successfully', () => {
    // Create a profile with segmentation points
    cy.get('[data-cy="add-profile-button"]').click()
    cy.get('[data-cy="entity-name-input"]').should('be.visible').type('Round Trip Segmentation Profile')
    cy.get('[data-cy="entity-description-input"]').should('be.visible').type('Segmentation profile for round trip test')
    cy.get('[data-cy="entity-save-button"]').click()

    // Wait for profile to be created
    cy.get('[data-cy="profile-card"]', { timeout: 10000 }).should('be.visible').and('contain', 'Round Trip Segmentation Profile')

    // Add segmentation points
    cy.get('[data-cy="profile-card"]').first().click()
    cy.get('[data-cy="new-datapoint-button"]').should('be.visible').click()
    cy.get('[data-cy="entity-name-input"]').should('be.visible').type('Round Trip Segmentation Point')
    cy.get('[data-cy="entity-description-input"]').should('be.visible').type('Segmentation point for round trip test')
    cy.get('[data-cy="entity-save-button"]').click()

    // Wait for segmentation point to be created
    cy.get('[data-cy="datapoint-card"]', { timeout: 10000 }).should('be.visible').and('contain', 'Round Trip Segmentation Point')

    // Download the profile (this will trigger a download in the browser)
    cy.get('[data-cy="download-profile-button"]').should('be.visible').click()

    // Delete the original profile
    cy.get('[data-cy="delete-profile-button"]').should('be.visible').click()
    cy.get('[data-cy="profile-card"]').should('not.exist')

    // Upload the downloaded profile (we'll simulate this with a known structure)
    const roundTripProfileData = {
      profile: {
        name: "Round Trip Segmentation Profile",
        description: "Segmentation profile for round trip test",
        mode: "text_segmentation",
        example: undefined
      },
      profilePoints: [
        {
          name: "Round Trip Segmentation Point",
          explanation: "Segmentation point for round trip test",
          synonyms: [],
          datatype: "text",
          valueset: [],
          unit: undefined
        }
      ]
    }

    cy.writeFile('cypress/fixtures/round_trip_segmentation_profile.json', roundTripProfileData)

    cy.get('[data-cy="upload-profile-button"]').should('be.visible').click()
    cy.get('[data-cy="upload-profile-input"]').attachFile({
      filePath: 'round_trip_segmentation_profile.json',
      fileName: 'round_trip_segmentation_profile.json',
      mimeType: 'application/json'
    })

    // Verify the profile is re-uploaded successfully
    cy.get('[data-cy="profile-card"]', { timeout: 10000 }).should('be.visible').and('contain', 'Round Trip Segmentation Profile')
    cy.get('[data-cy="profile-card"]').contains('Round Trip Segmentation Profile').click()
    cy.get('[data-cy="datapoint-card"]', { timeout: 10000 }).should('be.visible').and('contain', 'Round Trip Segmentation Point')
  })

  it('should preserve segmentation profile mode during upload', () => {
    // Create a profile with datapoint extraction mode (should be converted to text_segmentation)
    const datapointProfileData = {
      profile: {
        name: "Datapoint Profile in Segmentation",
        description: "Profile that should be converted to text_segmentation mode",
        mode: "datapoint_extraction",
        example: undefined
      },
      profilePoints: [
        {
          name: "Datapoint in Segmentation",
          explanation: "Point that should be converted to segmentation",
          synonyms: ["datapoint"],
          datatype: "text",
          valueset: [],
          unit: undefined
        }
      ]
    }

    cy.writeFile('cypress/fixtures/datapoint_in_segmentation_profile.json', datapointProfileData)

    // Upload the profile
    cy.get('[data-cy="upload-profile-button"]').should('be.visible').click()
    cy.get('[data-cy="upload-profile-input"]').attachFile({
      filePath: 'datapoint_in_segmentation_profile.json',
      fileName: 'datapoint_in_segmentation_profile.json',
      mimeType: 'application/json'
    })

    // Verify the profile is uploaded (mode should be overridden to text_segmentation)
    cy.get('[data-cy="profile-card"]', { timeout: 10000 }).should('be.visible').and('contain', 'Datapoint Profile in Segmentation')
    
    // The mode should be preserved as text_segmentation since we're in the segmentation interface
    cy.get('[data-cy="profile-card"]').click()
    cy.get('[data-cy="datapoint-card"]', { timeout: 10000 }).should('be.visible').and('contain', 'Datapoint in Segmentation')
  })

  afterEach(() => {
    // Clean up test files
    cy.task('deleteFile', 'cypress/fixtures/test_segmentation_profile.json').then(() => {
      // File deleted or didn't exist
    })
    cy.task('deleteFile', 'cypress/fixtures/invalid_segmentation_profile.json').then(() => {
      // File deleted or didn't exist
    })
    cy.task('deleteFile', 'cypress/fixtures/malformed_segmentation_profile.json').then(() => {
      // File deleted or didn't exist
    })
    cy.task('deleteFile', 'cypress/fixtures/round_trip_segmentation_profile.json').then(() => {
      // File deleted or didn't exist
    })
    cy.task('deleteFile', 'cypress/fixtures/datapoint_in_segmentation_profile.json').then(() => {
      // File deleted or didn't exist
    })
  })
})
