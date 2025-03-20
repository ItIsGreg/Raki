declare namespace Cypress {
  interface Chainable {
    attachFile(fileDetails: string | any): Chainable<Element>;
  }
}
