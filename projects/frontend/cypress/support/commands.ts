import 'cypress-file-upload';

/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

declare global {
  namespace Cypress {
    interface Chainable {
      dragTo(target: string): Chainable<JQuery<HTMLElement>>
      clearIndexedDB(): Chainable<void>
      openFeedbackDrawer(): Chainable<void>
      submitFeedback(title: string, message: string): Chainable<void>
      mockFeedbackAPI(success: boolean, statusCode?: number): Chainable<void>
    }
  }
}

// Add clearIndexedDB command
Cypress.Commands.add('clearIndexedDB', () => {
  cy.window().then((win) => {
    return new Cypress.Promise<void>((resolve) => {
      const request = win.indexedDB.deleteDatabase('myDatabase')
      request.onsuccess = () => resolve()
      request.onerror = () => resolve()
    })
  })
})

// Add feedback drawer commands
Cypress.Commands.add('openFeedbackDrawer', () => {
  cy.get('[data-cy="feedback-drawer"] button').click()
  cy.get('.feedback-drawer-content').should('be.visible')
})

Cypress.Commands.add('submitFeedback', (title: string, message: string) => {
  cy.get('#feedback-title').clear().type(title)
  cy.get('#feedback-text').clear().type(message)
  cy.get('[data-cy="feedback-drawer"] button:contains("Send")').click()
})

Cypress.Commands.add('mockFeedbackAPI', (success: boolean, statusCode = 200) => {
  const responseBody = success 
    ? { success: true, message: 'Email sent successfully to support team' }
    : { success: false, message: 'Failed to send email' }
  
  cy.intercept('POST', '**/support/email/send', {
    statusCode,
    body: responseBody
  }).as('sendFeedbackEmail')
})