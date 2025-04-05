describe('Text Segmentation Profiles page', () => {
  beforeEach(() => {
    // Clear IndexedDB (Dexie) before each test
    indexedDB.deleteDatabase('myDatabase')
    
    // Start from the homepage before each test
    cy.visit('http://localhost:3000/textSegmentation')
  })

  it('should navigate to profiles page and show all components', () => {
    // Check if profiles card exists and is visible
    cy.get('[data-cy="profiles-card"]')
      .should('be.visible')
      .should('contain', 'Profiles')
      
    // Click on the profiles card and wait for navigation
    cy.get('[data-cy="profiles-card"]').click()
    
    // Add a small wait to ensure navigation completes
    cy.wait(500)
    
    // Verify the profiles page components are present
    cy.get('[data-cy="profiles-page"]').should('be.visible')
    cy.get('[data-cy="profile-list-container"]').should('be.visible')
  })

  it('should create a new profile and select it', () => {
    const profileName = 'Text Segmentation Profile'
    const profileDescription = 'Test Profile for Text Segmentation'

    // Navigate to profiles page
    cy.get('[data-cy="profiles-card"]').click()
    
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
    
    // Wait for the profile to be created and verify it appears in the list
    cy.get('[data-cy="profile-card"]')
      .should('be.visible')
      .click()
      
    // Verify the profile is selected
    cy.get('[data-cy="profile-card"]')
      .should('have.class', 'bg-gray-100')
  })

  it('should create a new segmentation rule', () => {
    const profileName = 'Text Segmentation Profile'
    const profileDescription = 'Test Profile for Text Segmentation'
    const ruleName = 'Test Segmentation Rule'
    const ruleDescription = 'Test Segmentation Rule Description'
    const synonym = 'Test Synonym'

    // Navigate to profiles page and create a profile first
    cy.get('[data-cy="profiles-card"]').click()
    cy.get('[data-cy="add-profile-button"]').click()
    cy.get('[data-cy="entity-name-input"]').type(profileName)
    cy.get('[data-cy="entity-description-input"]').type(profileDescription)
    cy.get('[data-cy="entity-save-button"]').click()

    // Select the created profile
    cy.get('[data-cy="profile-card"]')
      .should('be.visible')
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
