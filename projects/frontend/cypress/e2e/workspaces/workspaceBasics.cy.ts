describe('Workspace Badge Basic Test', () => {
  beforeEach(() => {
    // Clear everything before each test
    indexedDB.deleteDatabase('myDatabase');
    cy.window().then((win) => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    });
    cy.viewport(1280, 720);
  });

  it('should show workspace badge, open dropdown on click, and close when clicking elsewhere on dataPointExtraction page', () => {
    cy.visit('http://localhost:3000/dataPointExtraction');
    cy.wait(1500);
    
    // 1. Check that workspace badge is visible
    cy.get('[data-cy="workspace-selector"]').should('be.visible');
    
    // 2. Click the workspace badge to open dropdown
    cy.get('[data-cy="workspace-selector"]').click({ force: true });
    cy.wait(500);
    
    // 3. Verify the dropdown/tooltip is open
    cy.get('[role="menu"], [role="listbox"]').should('be.visible');
    
    // 4. Close the dropdown by clicking somewhere else
    cy.get('body').click({ force: true });
    cy.wait(300);
    
    // 5. Verify the dropdown is closed
    cy.get('[role="menu"], [role="listbox"]').should('not.exist');
  });

  it('should show workspace badge, open dropdown on click, and close when clicking elsewhere on textSegmentation page', () => {
    cy.visit('http://localhost:3000/textSegmentation');
    cy.wait(1500);
    
    // 1. Check that workspace badge is visible
    cy.get('[data-cy="workspace-selector"]').should('be.visible');
    
    // 2. Click the workspace badge to open dropdown
    cy.get('[data-cy="workspace-selector"]').click({ force: true });
    cy.wait(500);
    
    // 3. Verify the dropdown/tooltip is open
    cy.get('[role="menu"], [role="listbox"]').should('be.visible');
    
    // 4. Close the dropdown by clicking somewhere else
    cy.get('body').click({ force: true });
    cy.wait(300);
    
    // 5. Verify the dropdown is closed
    cy.get('[role="menu"], [role="listbox"]').should('not.exist');
  });

  it('should show workspace badge, open dropdown on click, and close when clicking elsewhere on home page', () => {
    cy.visit('http://localhost:3000/');
    cy.wait(1500);
    
    // 1. Check that workspace badge is visible
    cy.get('[data-cy="workspace-selector"]').should('be.visible');
    
    // 2. Click the workspace badge to open dropdown
    cy.get('[data-cy="workspace-selector"]').click({ force: true });
    cy.wait(500);
    
    // 3. Verify the dropdown/tooltip is open
    cy.get('[role="menu"], [role="listbox"]').should('be.visible');
    
    // 4. Close the dropdown by clicking somewhere else
    cy.get('body').click({ force: true });
    cy.wait(300);
    
    // 5. Verify the dropdown is closed
    cy.get('[role="menu"], [role="listbox"]').should('not.exist');
  });
}); 