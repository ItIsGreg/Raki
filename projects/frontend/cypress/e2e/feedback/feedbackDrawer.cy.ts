/// <reference types="cypress" />

describe('FeedbackDrawer - Core Functionality', () => {
  beforeEach(() => {
    // Mock the backend API for email sending
    cy.intercept('POST', '**/support/email/send', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Email sent successfully to support team'
      }
    }).as('sendFeedbackEmail');

    // Visit a page that contains the FeedbackDrawer
    cy.visit('http://localhost:3000/dataPointExtraction');
  });

  it('should open drawer and send feedback message', () => {
    // Open the feedback drawer
    cy.get('[data-cy="feedback-drawer"] button[type="button"]:has(svg)').should('be.visible');
    cy.get('[data-cy="feedback-drawer"] button[type="button"]:has(svg)').click();
    
    // Check if drawer content is visible
    cy.get('.feedback-drawer-content').should('be.visible');
    cy.get('#feedback-title').should('be.visible');
    cy.get('#feedback-email').should('be.visible');
    cy.get('#feedback-text').should('be.visible');
    
    // Fill out the feedback form
    cy.get('#feedback-title').type('Test Feedback Title');
    cy.get('#feedback-email').type('test@example.com');
    cy.get('#feedback-text').type('This is a test feedback message');
    
    // Submit the feedback
    cy.get('#feedback-submit-button').should('not.be.disabled');
    cy.get('#feedback-submit-button').click();
    
    // Wait for API call and verify success
    cy.wait('@sendFeedbackEmail');
    cy.get('#feedback-submit-button').should('contain', 'Sent Successfully!');
    
    // Verify the API was called with correct data
    cy.get('@sendFeedbackEmail').then((interception: any) => {
      expect(interception.request.body).to.deep.equal({
        subject: 'Feedback: Test Feedback Title',
        message: 'From: test@example.com\n\nThis is a test feedback message'
      });
    });
  });
});