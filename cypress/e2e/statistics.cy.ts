describe('end-to-end tests for statistics page', () => {
  const mockToken =
    'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc2Mzk5NTA4MywiZXhwIjoxNzY0MDAyMjgzfQ.2FbzC8dPTei1oROkA1iRq8iyI2dJRj2KoEb7TCpkZ6w';

  beforeEach(() => {
    cy.viewport(1600, 1080);
    cy.visit('http://localhost:3000/statistics', {
      onBeforeLoad(window) {
        Object.defineProperty(window.navigator, 'language', {
          value: 'en',
          configurable: true,
        });
        window.localStorage.setItem('currentUser', JSON.stringify({ id: 1, username: 'helenahills' }));
        window.localStorage.setItem('authToken', mockToken);
        window.localStorage.setItem('expiresAt', (Date.now() + 1000 * 60 * 60).toString());
        window.localStorage.setItem('i18nextLng', 'en');
      },
    });
  });

  it('renders general stats at the top of the page', () => {
    cy.get('[data-testid="stat"]').should('have.length', 3);
    cy.contains('Total Views').should('exist');
    cy.contains('45678').should('exist');

    cy.screenshot('statistics-general-stats');
  });

  it('renders table stats when first loaded', () => {
    cy.get('[data-testid="table-stats"]').should('exist');

    cy.screenshot('statistics-table-view');
  });

  it('switches between table and chart stats', () => {
    cy.get('[data-testid="view-toggle"]').siblings('.slider').click();
    cy.get('[data-testid="chart-stats"]').should('exist');

    cy.screenshot('statistics-chart-view');

    cy.get('[data-testid="view-toggle"]').siblings('.slider').click();
    cy.get('[data-testid="table-stats"]').should('exist');

    cy.screenshot('statistics-table-view-after-toggle');
  });

  it('switches to profile page', () => {
    cy.get('[data-testid="profile-link"]').click();
    cy.url().should('include', '/profile');
  });
});