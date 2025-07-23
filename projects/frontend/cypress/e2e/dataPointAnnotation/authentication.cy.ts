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

  it('should display workspace selector in header with default local workspace', () => {
    cy.visit('http://localhost:3000/dataPointExtraction');
    cy.wait(3000);
    
    // Verify workspace selector is visible in header
    cy.get('header').within(() => {
      cy.get('[data-cy="workspace-selector"]').should('be.visible');
      
      // Should show default local workspace name
      cy.get('[data-cy="workspace-selector"]').should('contain', 'My Local Workspace');
      cy.get('[data-cy="workspace-selector"]').should('contain', 'local');
    });
    
    // Click workspace selector to open dropdown
    cy.get('[data-cy="workspace-selector"]').click();
    cy.wait(500);
    
    // Should show create workspace button
    cy.get('[data-cy="create-workspace-button"]').should('be.visible');
  });

  it('should allow creating a new local workspace', () => {
    cy.visit('http://localhost:3000/dataPointExtraction');
    cy.wait(3000);
    
    // Open workspace selector dropdown
    cy.get('[data-cy="workspace-selector"]').click();
    cy.wait(500);
    
    // Click create workspace
    cy.get('[data-cy="create-workspace-button"]').click();
    cy.wait(1000);
    
    // Should open create workspace modal
    cy.get('[role="dialog"]').should('be.visible').within(() => {
      cy.contains('Create New Workspace').should('be.visible');
      
      // Fill workspace details
      cy.get('[data-cy="workspace-name-input"]').type('My Test Workspace');
      cy.get('[data-cy="workspace-description-input"]').type('Test workspace for UI testing');
      
      // Verify local storage is selected (should be default)
      cy.get('[data-cy="storage-type-select"]').should('contain', 'Local Storage');
      
      // Submit the form
      cy.get('[data-cy="create-workspace-submit"]').click();
    });
    
    cy.wait(2000);
    
    // Modal should close
    cy.get('[role="dialog"]').should('not.exist');
    
    // Workspace selector should now show the new workspace name
    cy.get('[data-cy="workspace-selector"]').should('contain', 'My Test Workspace');
  });

  it('should open register form when clicking sign up and login form when clicking sign in', () => {
    cy.visit('http://localhost:3000/dataPointExtraction');
    cy.wait(3000);
    
    // Test Sign Up button opens register form
    cy.get('header').within(() => {
      cy.get('button').contains('Sign up').click();
    });
    cy.wait(1000);
    
    // Should show register form (2 password fields)
    cy.get('[role="dialog"]').should('be.visible').within(() => {
      cy.contains('Create account').should('be.visible');
      cy.get('input[type="password"]').should('have.length', 2); // Register form has 2 password fields
      cy.get('input[type="email"]').should('be.visible');
    });
    
    // Close modal
    cy.get('body').type('{esc}');
    cy.wait(500);
    cy.get('[role="dialog"]').should('not.exist');
    
    // Test Sign In button opens login form
    cy.get('header').within(() => {
      cy.get('button').contains('Sign in').click();
    });
    cy.wait(1000);
    
    // Should show login form (1 password field)
    cy.get('[role="dialog"]').should('be.visible').within(() => {
      cy.contains('Sign in').should('be.visible');
      cy.get('input[type="password"]').should('have.length', 1); // Login form has 1 password field
      cy.get('input[type="email"]').should('be.visible');
    });
    
    // Close modal
    cy.get('body').type('{esc}');
    cy.wait(500);
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('should successfully register a new user', () => {
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    cy.visit('http://localhost:3000/dataPointExtraction');
    cy.wait(3000);
    
    // Verify initial unauthenticated state
    cy.get('[data-cy="storage-status"]').should('contain', 'Local Storage');
    cy.get('header').within(() => {
      cy.get('button').contains('Sign up').should('be.visible');
      cy.get('button').contains('Sign in').should('be.visible');
    });
    
    // Click sign up button
    cy.get('header').within(() => {
      cy.get('button').contains('Sign up').click();
    });
    cy.wait(1000);
    
    // Fill registration form
    cy.get('[role="dialog"]').should('be.visible').within(() => {
      cy.get('input[type="email"]').first().type(testEmail);
      cy.get('input[type="password"]').first().type(testPassword);
      
      // Handle second password field
      cy.get('input[type="password"]').then(($passwords) => {
        if ($passwords.length > 1) {
          cy.get('input[type="password"]').last().type(testPassword);
        }
      });
      
      // Submit registration
      cy.get('button[type="submit"]').click();
    });
    
    // Wait for registration to complete
    cy.wait(5000);
    
    // Verify modal is closed (registration succeeded)
    cy.get('[role="dialog"]').should('not.exist');
    
    // Verify authenticated state in header
    cy.get('header').within(() => {
      // Sign up/sign in buttons should be gone
      cy.get('button').contains('Sign up').should('not.exist');
      cy.get('button').contains('Sign in').should('not.exist');
      
      // Should show user avatar button with first letter of email
      cy.get('button').contains(testEmail.charAt(0).toUpperCase()).should('be.visible');
    });
    
    // Verify storage status changed to cloud
    cy.get('[data-cy="storage-status"]').should('contain', 'Cloud Storage');
    
    // Verify auth token is stored
    cy.window().then((win) => {
      const token = win.localStorage.getItem('auth_token');
      expect(token).to.not.be.null;
      expect(token).to.be.a('string');
      expect(token!.length).to.be.greaterThan(10);
    });
  });

  it('should successfully sign in with existing credentials', () => {
    const testEmail = `signin-test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    cy.visit('http://localhost:3000/dataPointExtraction');
    cy.wait(3000);
    
    // First, create an account
    cy.get('header button').contains('Sign up').click();
    cy.wait(1000);
    
    cy.get('[role="dialog"]').within(() => {
      cy.get('input[type="email"]').first().type(testEmail);
      cy.get('input[type="password"]').first().type(testPassword);
      cy.get('input[type="password"]').then(($passwords) => {
        if ($passwords.length > 1) {
          cy.get('input[type="password"]').last().type(testPassword);
        }
      });
      cy.get('button[type="submit"]').click();
    });
    
    cy.wait(5000);
    cy.get('[role="dialog"]').should('not.exist');
    
    // Sign out
    cy.get('header').within(() => {
      cy.get('button').contains(testEmail.charAt(0).toUpperCase()).click();
    });
    cy.wait(500);
    cy.get('[role="menuitem"]').contains('Sign out').click();
    cy.wait(2000);
    
    // Verify signed out state
    cy.get('[data-cy="storage-status"]').should('contain', 'Local Storage');
    cy.get('header').within(() => {
      cy.get('button').contains('Sign up').should('be.visible');
      cy.get('button').contains('Sign in').should('be.visible');
    });
    
    // Now sign back in
    cy.get('header button').contains('Sign in').click();
    cy.wait(1000);
    
    cy.get('[role="dialog"]').within(() => {
      // Login form should have only 1 password field
      cy.get('input[type="password"]').should('have.length', 1);
      
      cy.get('input[type="email"]').type(testEmail);
      cy.get('input[type="password"]').type(testPassword);
      cy.get('button[type="submit"]').click();
    });
    
    cy.wait(5000);
    cy.get('[role="dialog"]').should('not.exist');
    
    // Verify signed in again
    cy.get('[data-cy="storage-status"]').should('contain', 'Cloud Storage');
    cy.get('header').within(() => {
      cy.get('button').contains(testEmail.charAt(0).toUpperCase()).should('be.visible');
    });
  });

  it('should handle registration validation errors', () => {
    cy.visit('http://localhost:3000/dataPointExtraction');
    cy.wait(3000);
    
    cy.get('header button').contains('Sign up').click();
    cy.wait(1000);
    
    cy.get('[role="dialog"]').within(() => {
      // Test password mismatch
      cy.get('input[type="email"]').first().type('test@example.com');
      cy.get('input[type="password"]').first().type('password123');
      cy.get('input[type="password"]').then(($passwords) => {
        if ($passwords.length > 1) {
          cy.get('input[type="password"]').last().type('different456');
        }
      });
      cy.get('button[type="submit"]').click();
      
      // Should show error message
      cy.contains('Passwords do not match').should('be.visible');
      
      // Form should still be visible (validation failed)
      cy.get('input[type="email"]').should('be.visible');
    });
    
    // Should still be unauthenticated
    cy.get('[data-cy="storage-status"]').should('contain', 'Local Storage');
  });

  it('should handle login with invalid credentials', () => {
    cy.visit('http://localhost:3000/dataPointExtraction');
    cy.wait(3000);
    
    cy.get('header button').contains('Sign in').click();
    cy.wait(1000);
    
    cy.get('[role="dialog"]').within(() => {
      cy.get('input[type="email"]').type('nonexistent@example.com');
      cy.get('input[type="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();
      
      // Wait for request to complete
      cy.wait(3000);
      
      // Form should still be visible (login failed)
      cy.get('input[type="email"]').should('be.visible');
    });
    
    // Should still be unauthenticated
    cy.get('[data-cy="storage-status"]').should('contain', 'Local Storage');
  });

  it('should persist authentication across page reloads', () => {
    const testEmail = `persist-test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    cy.visit('http://localhost:3000/dataPointExtraction');
    cy.wait(3000);
    
    // Register and sign in
    cy.get('header button').contains('Sign up').click();
    cy.wait(1000);
    
    cy.get('[role="dialog"]').within(() => {
      cy.get('input[type="email"]').first().type(testEmail);
      cy.get('input[type="password"]').first().type(testPassword);
      cy.get('input[type="password"]').then(($passwords) => {
        if ($passwords.length > 1) {
          cy.get('input[type="password"]').last().type(testPassword);
        }
      });
      cy.get('button[type="submit"]').click();
    });
    
    cy.wait(5000);
    cy.get('[data-cy="storage-status"]').should('contain', 'Cloud Storage');
    
    // Reload page
    cy.reload();
    cy.wait(3000);
    
    // Should still be authenticated
    cy.get('[data-cy="storage-status"]').should('contain', 'Cloud Storage');
    cy.get('header').within(() => {
      cy.get('button').contains(testEmail.charAt(0).toUpperCase()).should('be.visible');
      cy.get('button').contains('Sign up').should('not.exist');
      cy.get('button').contains('Sign in').should('not.exist');
    });
  });
}); 