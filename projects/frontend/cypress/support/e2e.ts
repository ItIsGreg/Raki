// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Pre-acknowledge the disclaimer gate before the app's JS runs, on every page load.
// Cypress test isolation clears localStorage before each test, so without this the
// gate's full-screen overlay reappears and blocks interactions. `window:before:load`
// fires after the window exists but before app scripts run — the same timing as
// cy.visit's onBeforeLoad — so the gate's mount effect sees the acknowledged key.
// Keep the key in sync with DisclaimerGate.tsx (ACKNOWLEDGED_KEY).
Cypress.on('window:before:load', (win) => {
  win.localStorage.setItem('raki-disclaimer-acknowledged-v1', 'true')
})