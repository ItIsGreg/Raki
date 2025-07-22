describe('Authentication Tests', () => {
  beforeEach(() => {
    // Clear everything before each test
    indexedDB.deleteDatabase('myDatabase');
    cy.window().then((win) => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    });
    cy.viewport(1280, 720);
  });

  it('should display sign in/sign up buttons and local storage badge in header', () => {
    cy.visit('http://localhost:3000/dataPointExtraction');
    cy.wait(3000);
    
    // Verify header contains sign in and sign up buttons
    cy.get('header').within(() => {
      cy.get('button').contains('Sign in').should('be.visible');
      cy.get('button').contains('Sign up').should('be.visible');
    });
    
    // Verify local storage badge is visible (using the correct text and data-cy)
    cy.get('[data-cy="storage-status"]').should('be.visible').and('contain', 'Local Storage');
  });
}); 