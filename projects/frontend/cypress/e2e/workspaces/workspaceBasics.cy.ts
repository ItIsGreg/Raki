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

  it('should create a new workspace and then delete it', () => {
    cy.visit('http://localhost:3000/dataPointExtraction');
    cy.wait(1500);
    
    // 1. Open workspace dropdown
    cy.get('[data-cy="workspace-selector"]').click({ force: true });
    cy.wait(500);
    
    // 2. Click "Create New Workspace" button
    cy.get('[data-cy="create-workspace-button"]').click({ force: true });
    cy.wait(500);
    
    // 3. Fill in workspace details
    cy.get('[data-cy="workspace-name-input"]').type('Test Workspace');
    cy.get('[data-cy="workspace-description-input"]').type('A test workspace for Cypress testing');
    
    // 4. Create the workspace
    cy.get('[data-cy="create-workspace-submit"]').click({ force: true });
    cy.wait(1000);
    
    // 5. Verify new workspace is active (should show in the badge)
    cy.get('[data-cy="workspace-selector"]').should('contain.text', 'Test Workspace');
    
    // 6. Open dropdown again to access delete option
    cy.get('[data-cy="workspace-selector"]').click({ force: true });
    cy.wait(500);
    
    // 7. Find and click delete button for the test workspace
    // Note: We need to switch back to default workspace first, then delete the test workspace
    // Look for the default workspace (should contain "My Local Workspace")
    cy.get('[data-cy*="workspace-option-"]').contains('My Local Workspace').click({ force: true });
    cy.wait(1000);
    
    // 8. Open dropdown again and find delete button for test workspace
    cy.get('[data-cy="workspace-selector"]').click({ force: true });
    cy.wait(500);
    
    // 9. Click delete button (should be visible since we're not on the test workspace anymore)
    cy.get('[data-cy*="delete-workspace-"]').first().click({ force: true });
    cy.wait(500);
    
    // 10. Confirm deletion in the dialog
    cy.get('[data-cy="delete-workspace-confirm"]').click({ force: true });
    cy.wait(1000);
    
    // 11. Verify workspace is deleted (should only see default workspace now)
    cy.get('[data-cy="workspace-selector"]').click({ force: true });
    cy.wait(500);
    
    // Should not see the test workspace in the dropdown anymore
    cy.get('body').should('not.contain.text', 'Test Workspace');
    
    // Close dropdown
    cy.get('body').click({ force: true });
  });
}); 