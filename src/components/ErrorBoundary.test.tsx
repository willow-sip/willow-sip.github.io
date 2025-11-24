import { render } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

const pushMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

test('relocates to /page-not-found when finds an error', () => {
  const ThrowError = () => {
    throw new Error('Something went wrong (test)');
  };

  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );
});
