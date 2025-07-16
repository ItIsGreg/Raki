describe('Text Segmentation Datasets Debug', () => {
  beforeEach(() => {
    indexedDB.deleteDatabase('myDatabase')
    cy.visit('http://localhost:3000/textSegmentation')
  })

  it('should load the page and switch to text upload tab', () => {
    cy.get('[data-cy="text-upload-tab"]').should('be.visible')
    cy.get('[data-cy="text-upload-tab"]').click()
    cy.get('[data-cy="text-upload-tab"]').should('have.attr', 'data-state', 'active')
  })

  it('should create a new dataset', () => {
    cy.get('[data-cy="text-upload-tab"]').click()
    cy.get('[data-cy="add-dataset-button"]').click()
    cy.get('[data-cy="entity-name-input"]').should('be.visible').type('Test Dataset')
    cy.get('[data-cy="entity-description-input"]').should('be.visible').type('Test description')
    cy.get('[data-cy="entity-save-button"]').click()
    cy.get('[data-cy="text-dataset-select-trigger"]').should('contain', 'Test Dataset')
  })
}) 