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

  it('should handle profile points upload', () => {
    const profileName = 'Upload Test Profile'
    const profileDescription = 'Profile for testing upload functionality'
    const fixtureFilePath = 'cypress/fixtures/upload_test/uploadProfilePoints.json'

    // Read the fixture file first to get the expected count
    cy.readFile(fixtureFilePath).then((dataPoints) => {
      const expectedCount = dataPoints.length

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
      
      // Select the created profile
      cy.get('[data-cy="profile-select-trigger"]').click()
      cy.get('[data-cy="profile-select-content"]')
        .contains(profileName)
        .click()

      // Click the three dot menu and then the upload button
      cy.get('[data-cy="datapoints-container"]').should('be.visible')
      cy.get('[data-cy="more-options-button"]')
        .should('be.visible')
        .click()
      cy.get('[data-cy="upload-datapoints-button"]').click()
      
      // Use the selectFile command to upload the JSON file
      cy.get('[data-cy="upload-datapoints-input"]')
        .selectFile('cypress/fixtures/upload_test/uploadProfilePoints.json', { force: true })
      
      // Verify the data points container is visible and contains uploaded points
      cy.get('[data-cy="datapoints-container"]')
        .should('be.visible')
        .find('[data-cy="datapoint-card"]')
        .should('exist')

      // Verify the exact number of data points were created
      cy.get('[data-cy="datapoints-container"]')
        .find('[data-cy="datapoint-card"]')
        .should('have.length', expectedCount)
    })
  })
})