describe('Simple Authentication Debug Test', () => {
  beforeEach(() => {
    indexedDB.deleteDatabase('myDatabase');
    cy.window().then((win) => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    });
    cy.viewport(1280, 720);
  });

  it('should debug what happens when clicking sign up', () => {
    cy.visit('http://localhost:3000/cloud-test');
    cy.wait(3000);
    
    // Take initial screenshot
    cy.screenshot('01-initial-page');
    
    // Check what's in the header
    cy.get('header').should('be.visible');
    cy.get('header').within(() => {
      cy.screenshot('02-header-content');
      cy.get('button').should('exist');
      
      // Find and click the sign up button
      cy.contains('Sign up').should('be.visible').click();
    });
    
    cy.wait(2000);
    cy.screenshot('03-after-signup-click');
    
    // Check if a modal/dialog opened
    cy.get('body').then(($body) => {
      if ($body.find('[role="dialog"]').length > 0) {
        cy.log('✅ Dialog found');
        cy.get('[role="dialog"]').should('be.visible');
        cy.screenshot('04-dialog-found');
        
        // Log all inputs in the dialog
        cy.get('[role="dialog"]').within(() => {
          cy.get('input').each(($input, index) => {
            cy.log(`Input ${index}: type=${$input.attr('type')}, id=${$input.attr('id')}, name=${$input.attr('name')}`);
          });
          
          // Take screenshot of dialog content
          cy.screenshot('05-dialog-content');
          
          // Count password inputs
          cy.get('input[type="password"]').then(($passwordInputs) => {
            cy.log(`Found ${$passwordInputs.length} password inputs`);
            expect($passwordInputs.length).to.be.greaterThan(0);
          });
        });
      } else {
        cy.log('❌ No dialog found');
        cy.screenshot('04-no-dialog');
        
        // Check if there's any other modal or popup
        cy.get('body').within(() => {
          cy.get('*').each(($el) => {
            if ($el.css('z-index') && parseInt($el.css('z-index')) > 100) {
              cy.log(`High z-index element: ${$el.prop('tagName')} with z-index ${$el.css('z-index')}`);
            }
          });
        });
      }
    });
  });

  it('should test basic page structure', () => {
    cy.visit('http://localhost:3000/cloud-test');
    cy.wait(3000);
    
    // Check basic page structure
    cy.get('header').should('exist');
    cy.contains('Not signed in - Using local storage').should('be.visible');
    
    // Check header buttons
    cy.get('header').within(() => {
      cy.get('button').should('have.length.at.least', 1);
      cy.contains('Sign up').should('exist');
      cy.contains('Sign in').should('exist');
    });
    
    cy.log('✅ Basic page structure looks correct');
  });

  it('should test clicking without specific selectors', () => {
    cy.visit('http://localhost:3000/cloud-test');
    cy.wait(3000);
    
    // Find any button that says "Sign up" anywhere on the page
    cy.contains('button', 'Sign up').click();
    cy.wait(2000);
    
    // Look for any form elements that appeared
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    
    // Try to fill the form without using IDs
    cy.get('input[type="email"]').first().type('test@example.com');
    cy.get('input[type="password"]').first().type('password123');
    
    // Check if there's a second password field
    cy.get('input[type="password"]').then(($passwords) => {
      if ($passwords.length > 1) {
        cy.log('✅ Found second password field');
        cy.get('input[type="password"]').last().type('password123');
      } else {
        cy.log('❌ Only one password field found');
      }
    });
    
    // Look for submit button
    cy.get('button[type="submit"]').should('exist').click();
    
    cy.wait(5000);
    cy.screenshot('after-form-submit');
    
    // Check if authentication succeeded
    cy.get('body').then(($body) => {
      if ($body.text().includes('Signed in - Using cloud storage')) {
        cy.log('✅ Authentication succeeded!');
      } else {
        cy.log('❌ Authentication failed or still in progress');
      }
    });
  });
}); 