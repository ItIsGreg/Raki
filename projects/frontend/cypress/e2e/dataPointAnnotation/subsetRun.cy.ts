// Deterministic offline test of subset annotation ("Run ▾" options), mocked backend.
describe('Subset annotation (datapoint, mocked backend)', () => {
  Cypress.on('uncaught:exception', (err) =>
    err.message.includes('ResizeObserver') ? false : true
  );

  // Return the sorted filenames of all annotated texts (join AnnotatedTexts -> Texts).
  const annotatedFilenames = () =>
    cy.window().then((win) =>
      new Cypress.Promise<string[]>((resolve, reject) => {
        const req = win.indexedDB.open('myDatabase');
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction(['AnnotatedTexts', 'Texts'], 'readonly');
          const atReq = tx.objectStore('AnnotatedTexts').getAll();
          const tReq = tx.objectStore('Texts').getAll();
          tx.oncomplete = () => {
            const nameById: Record<string, string> = {};
            (tReq.result as any[]).forEach((t) => { nameById[t.id] = t.filename; });
            resolve((atReq.result as any[]).map((at) => nameById[at.textId]).sort());
          };
          tx.onerror = () => reject(tx.error);
        };
        req.onerror = () => reject(req.error);
      })
    );

  const settleAt = (count: number, tries = 0): any =>
    annotatedFilenames().then((names) =>
      names.length >= count || tries > 40 ? names : cy.wait(500).then(() => settleAt(count, tries + 1))
    );

  beforeEach(() => {
    Cypress.config('defaultCommandTimeout', 15000);
    indexedDB.deleteDatabase('myDatabase');
    cy.visit('http://localhost:3000/dataPointExtraction');
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
      cy.get('input').clear().type('4');
      cy.get('[data-cy="batch-size-set-button"]').click();
    });
    cy.get('[data-cy="settings-close-button"]').click();
    cy.get('[data-cy="settings-dialog"]').should('not.exist');

    cy.get('[data-cy="upload-dataset-button"]', { timeout: 15000 }).should('be.visible').click();
    cy.get('[data-cy="upload-dataset-input"]').selectFile('cypress/fixtures/stopResume/datapoint_dataset.json', { force: true });
    cy.get('[data-cy="annotated-dataset-card"]', { timeout: 30000 }).should('be.visible');
    cy.wait(1500);
    cy.get('[data-cy="add-dataset-button"]').click();
    cy.get('[data-cy="dataset-name-input"]').should('be.visible').type('Run');
    cy.get('[data-cy="dataset-description-input"]').should('be.visible').type('subset run');
    cy.get('[data-cy="dataset-select-trigger"]').should('be.visible').click();
    cy.get('[data-cy="dataset-select-content"]').should('be.visible').contains('SR Dataset').click();
    cy.get('[data-cy="profile-select-trigger"]').should('be.visible').click();
    cy.get('[data-cy="profile-select-content"]').should('be.visible').contains('SR Profile').click();
    cy.get('[data-cy="save-dataset-button"]').click();
    cy.get('[data-cy="annotated-dataset-card"]').contains('subset run').click();

    cy.intercept('POST', '**/datapoint-extraction/pipeline/pipeline', { statusCode: 200, body: [] }).as('pipe');
  });

  it('First N annotates exactly the first N; a later Run-all completes the rest without duplicates', () => {
    cy.get('[data-cy="run-subset-button"]').should('be.visible').click();
    cy.get('[data-cy="run-subset-dialog"]').should('be.visible');
    // default mode is First N; set N = 3
    cy.get('[data-cy="run-subset-n"]').clear().type('3');
    cy.get('[data-cy="run-subset-count"]').should('contain', 'Will annotate 3 of 8');
    cy.get('[data-cy="run-subset-confirm"]').click();

    settleAt(3).then((names: string[]) => {
      expect(names).to.deep.eq(['1.txt', '2.txt', '3.txt']); // first 3 by filename
    });

    // now Run all remaining via the primary button
    cy.get('[data-cy="start-annotation-button"]').should('be.visible').click({ force: true });
    settleAt(8).then((names: string[]) => {
      expect(names.length, 'no duplicates, all 8 present').to.eq(8);
      expect(new Set(names).size).to.eq(8);
    });
  });

  it('Select-from-list annotates exactly the checked texts', () => {
    cy.get('[data-cy="run-subset-button"]').should('be.visible').click();
    cy.get('[data-cy="run-subset-dialog"]').should('be.visible');
    cy.get('[data-cy="run-subset-mode-trigger"]').click();
    cy.get('[data-cy="run-subset-mode-select"]').click();
    cy.get('[data-cy="run-subset-checklist"]').should('be.visible');
    cy.get('[data-cy="run-subset-check-3.txt"]').click();
    cy.get('[data-cy="run-subset-check-7.txt"]').click();
    cy.get('[data-cy="run-subset-count"]').should('contain', 'Will annotate 2 of 8');
    cy.get('[data-cy="run-subset-confirm"]').click();

    settleAt(2).then((names: string[]) => {
      expect(names).to.deep.eq(['3.txt', '7.txt']);
    });
  });

  it('Paste list annotates exactly the named texts', () => {
    cy.get('[data-cy="run-subset-button"]').should('be.visible').click();
    cy.get('[data-cy="run-subset-dialog"]').should('be.visible');
    cy.get('[data-cy="run-subset-mode-trigger"]').click();
    cy.get('[data-cy="run-subset-mode-list"]').click();
    cy.get('[data-cy="run-subset-list"]').type('5.txt\n2.txt\nnope.txt');
    cy.get('[data-cy="run-subset-count"]').should('contain', 'Will annotate 2 of 8');
    cy.get('[data-cy="run-subset-count"]').should('contain', "didn't match");
    cy.get('[data-cy="run-subset-confirm"]').click();

    settleAt(2).then((names: string[]) => {
      expect(names).to.deep.eq(['2.txt', '5.txt']);
    });
  });
});
