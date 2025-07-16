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
