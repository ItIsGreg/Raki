// Deterministic offline test of annotation Stop/Resume: the backend is mocked
// (cy.intercept with a delay) so we can reliably stop mid-run and assert the
// cancellation invariants — no live LLM involved.
describe('Annotation Stop/Resume (datapoint, mocked backend)', () => {
  Cypress.on('uncaught:exception', (err) =>
    err.message.includes('ResizeObserver') ? false : true
  );

  // Snapshot of AnnotatedTexts: total rows, distinct textIds, and any duplicates.
  const readAnnotatedTexts = () =>
    cy.window().then((win) =>
      new Cypress.Promise<{ total: number; distinct: number; duplicates: any[] }>((resolve, reject) => {
        const req = win.indexedDB.open('myDatabase');
        req.onsuccess = () => {
          const store = req.result
            .transaction('AnnotatedTexts', 'readonly')
            .objectStore('AnnotatedTexts')
            .getAll();
          store.onsuccess = () => {
            const rows = store.result as any[];
            const byText: Record<string, number> = {};
            rows.forEach((r) => { byText[r.textId] = (byText[r.textId] || 0) + 1; });
            resolve({
              total: rows.length,
              distinct: Object.keys(byText).length,
              duplicates: Object.entries(byText).filter(([, c]) => (c as number) > 1),
            });
          };
          store.onerror = () => reject(store.error);
        };
        req.onerror = () => reject(req.error);
      })
    );

  const waitForCount = (target: number, tries = 0): any =>
    readAnnotatedTexts().then((s) =>
      s.total >= target || tries > 40 ? s : cy.wait(500).then(() => waitForCount(target, tries + 1))
    );

  it('Stop halts the run; Resume re-annotates without duplicates or gaps', () => {
    Cypress.config('defaultCommandTimeout', 15000);
    indexedDB.deleteDatabase('myDatabase');
    cy.visit('http://localhost:3000/dataPointExtraction');

    // --- minimal settings: provider + model + low concurrency (backend mocked) ---
    cy.get('[data-cy="burger-menu"]').should('be.visible').click({ force: true });
    cy.get('[data-cy="burger-menu-content"]').should('be.visible').find('[data-cy="menu-setup"]').click({ force: true });
    cy.get('[data-cy="settings-dialog"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-cy="llm-provider-trigger"]').click();
    cy.get('[data-cy="llm-provider-openai"]').click();
    cy.get('[data-cy="model-section"]').within(() => {
      cy.get('[data-cy="model-input"]').type('mock-model');
      cy.get('[data-cy="model-set-button"]').click();
    });
    cy.get('[data-cy="batch-size-section"]').within(() => {
      cy.get('input').clear().type('2');
      cy.get('[data-cy="batch-size-set-button"]').click();
    });
    cy.get('[data-cy="settings-close-button"]').click();
    cy.get('[data-cy="settings-dialog"]').should('not.exist');

    // --- seed profile + dataset + 8 texts via the annotated-dataset upload ---
    cy.get('[data-cy="upload-dataset-button"]', { timeout: 15000 }).should('be.visible').click();
    cy.get('[data-cy="upload-dataset-input"]').selectFile('cypress/fixtures/stopResume/datapoint_dataset.json', { force: true });
    cy.get('[data-cy="annotated-dataset-card"]', { timeout: 30000 }).should('be.visible');
    cy.wait(1500); // let the (tiny) import settle

    // --- fresh annotated dataset from the seeded dataset + profile ---
    cy.get('[data-cy="add-dataset-button"]').click();
    cy.get('[data-cy="dataset-name-input"]').should('be.visible').type('Run');
    cy.get('[data-cy="dataset-description-input"]').should('be.visible').type('stopresume run');
    cy.get('[data-cy="dataset-select-trigger"]').should('be.visible').click();
    cy.get('[data-cy="dataset-select-content"]').should('be.visible').contains('SR Dataset').click();
    cy.get('[data-cy="profile-select-trigger"]').should('be.visible').click();
    cy.get('[data-cy="profile-select-content"]').should('be.visible').contains('SR Profile').click();
    cy.get('[data-cy="save-dataset-button"]').click();
    cy.get('[data-cy="annotated-dataset-card"]').contains('stopresume run').click();

    // --- mock the pipeline with a delay so we can stop mid-run ---
    cy.intercept('POST', '**/datapoint-extraction/pipeline/pipeline', { statusCode: 200, body: [], delay: 1500 }).as('pipe');

    // START, let 2 complete, then STOP
    cy.get('[data-cy="start-annotation-button"]').scrollIntoView().should('be.visible').click({ force: true });
    waitForCount(2).then((atStop: any) => {
      expect(atStop.total, 'some texts annotated before stop').to.be.gte(2);
      cy.get('[data-cy="stop-annotation-button"]').should('be.visible').click({ force: true });

      // The run must actually settle: Start button returns and the count stops climbing.
      cy.get('[data-cy="start-annotation-button"]', { timeout: 20000 }).should('be.visible');
      cy.wait(6000); // longer than a full remaining run would take at this delay
      readAnnotatedTexts().then((afterStop) => {
        expect(afterStop.total, 'Stop halts the run (does not annotate all 8)').to.be.lessThan(8);

        // RESUME to completion
        cy.get('[data-cy="start-annotation-button"]').should('be.visible').click({ force: true });
        const settle = (prev = -1, tries = 0): any =>
          readAnnotatedTexts().then((s) =>
            (s.distinct >= 8 && s.total === prev) || tries > 40
              ? s
              : cy.wait(1000).then(() => settle(s.total, tries + 1))
          );
        settle().then((afterResume: any) => {
          expect(afterResume.distinct, 'every text annotated').to.eq(8);
          expect(afterResume.duplicates.length, 'no duplicate annotations').to.eq(0);
          expect(afterResume.total, 'exactly one annotation per text').to.eq(8);
        });
      });
    });
  });
});
