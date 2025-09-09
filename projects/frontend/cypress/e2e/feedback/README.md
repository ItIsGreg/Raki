# Feedback Drawer Test

Simple Cypress test for the FeedbackDrawer component.

## Test File

- `feedbackDrawer.cy.ts` - Tests opening drawer and sending feedback message

## Test Coverage

- Opens feedback drawer
- Fills form with title and message
- Submits feedback via API
- Verifies success state and API data

## Running

```bash
npx cypress run --spec "cypress/e2e/feedback/feedbackDrawer.cy.ts"
```
